import { BaseNode } from "./BaseNode";
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton";
import { CapsuleButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/CapsuleButton";
import { ConnectionLine } from "./ConnectionLine";
import { InputNodePrompt } from "./InputNodePrompt";
import { InputNodeImage } from "./InputNodeImage";
import { ProcessImageGenNode } from "./ProcessImageGenNode";
import { NodeConnectionController } from "./NodeConnectionController";
import { Snap3D } from "RemoteServiceGateway.lspkg/HostedSnap/Snap3D";
import { Snap3DTypes } from "RemoteServiceGateway.lspkg/HostedSnap/Snap3DTypes";
import { Gemini } from "RemoteServiceGateway.lspkg/HostedExternal/Gemini";
import { GeminiTypes } from "RemoteServiceGateway.lspkg/HostedExternal/GeminiTypes";
import { RemoteServiceGatewayCredentials } from "RemoteServiceGateway.lspkg/RemoteServiceGatewayCredentials";
import { AvaliableApiTypes } from "RemoteServiceGateway.lspkg/RemoteServiceGatewayCredentials";
import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { InteractableStateMachine } from "SpectaclesUIKit.lspkg/Scripts/Utility/InteractableStateMachine";
import { InteractableManipulation } from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";
import { TargetingMode } from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import { TextureLibraryNode } from "./TextureLibraryNode";

/**
 * Process3DNode - A process node for 3D generation
 * Accepts: Text prompt OR Image OR Both (any combination is valid)
 * 
 * REQUIRES: RemoteServiceGatewayCredentials component in the scene with:
 *   - Snap Token (for Snap3D 3D generation)
 *   - Google Token (for Gemini image description, if using image input)
 * Setup: Add RemoteServiceGatewayCredentials to a SceneObject and configure your tokens
 */
@component
export class Process3DNode extends BaseScriptComponent {
    @input
    @hint("BaseNode component (required)")
    public baseNode: BaseNode | null = null;

    @input
    @hint("Title text component (optional - will be created if not set)")
    @allowUndefined
    public titleText: Text | null = null;

    @input
    @hint("Generate button (will be created if not set)")
    @allowUndefined
    public generateButton: CapsuleButton | null = null;

    @input
    @hint("Material for connection lines")
    public connectionMaterial: Material | null = null;

    @input
    @hint("Text input section SceneObject (where text connections attach)")
    @allowUndefined
    public textInputSection: SceneObject | null = null;

    @input
    @hint("Image input section SceneObject (where image connections attach)")
    @allowUndefined
    public imageInputSection: SceneObject | null = null;

    @ui.separator
    @ui.group_start("3D Generation Settings")
    @input
    @hint("Whether to refine the mesh (higher quality, takes longer)")
    private refineMesh: boolean = true;

    @input
    @hint("Whether to use vertex colors")
    private useVertexColor: boolean = false;

    @input
    @hint("Scale factor for generated models (default: 20)")
    private modelScale: number = 20;

    @input
    @hint("Whether to make models draggable/interactable (enables movement)")
    private makeInteractable: boolean = true;
    @ui.group_end

    @ui.separator
    @ui.group_start("Output")
    @input
    @hint("SceneObject root where the 3D model will be instantiated")
    @allowUndefined
    private modelRoot: SceneObject;

    @input
    @hint("Material to apply to the 3D model (required for instantiation)")
    @allowUndefined
    private modelMaterial: Material;

    @input
    @hint("Optional: Text component to show status/error messages")
    @allowUndefined
    private statusText: Text;

    @input
    @hint("Optional: SceneObject to show/hide as loading indicator")
    @allowUndefined
    private loadingIndicator: SceneObject;
    @ui.group_end

    // Connected input nodes
    private _connectedTextNode: SceneObject | null = null;
    private _connectedImageNode: SceneObject | null = null;
    private _textConnectionCurve: ConnectionLine | null = null;
    private _imageConnectionCurve: ConnectionLine | null = null;

    // UI elements
    private _titleTextObject: SceneObject | null = null;
    private _generateButtonObject: SceneObject | null = null;
    private _textInputSectionObject: SceneObject | null = null;
    private _imageInputSectionObject: SceneObject | null = null;
    private _textInputButton: RoundButton | null = null;
    private _imageInputButton: RoundButton | null = null;
    private _textInputButtonId: string = "";
    private _imageInputButtonId: string = "";
    private _initialized: boolean = false;
    private _onStartCalled: boolean = false;

    // Track connections - can have multiple connections to same input type
    private _textConnections: Map<string, { sourceNode: SceneObject; curve: ConnectionLine; connectionId: string }> = new Map();
    private _imageConnections: Map<string, { sourceNode: SceneObject; curve: ConnectionLine; connectionId: string }> = new Map();

    // Generation state
    private _isGenerating: boolean = false;
    private _currentModel: SceneObject | null = null;
    private _tempModel: SceneObject | null = null;  // Temporary base mesh model
    private _generatedModels: SceneObject[] = [];  // Array to store all generated models

    onAwake() {
        print(`Process3DNode: onAwake called`);

        // Ensure modelRoot exists
        if (!this.modelRoot) {
            print("Process3DNode: Creating default model root");
            this.modelRoot = global.scene.createSceneObject("3DModelRoot");
            this.modelRoot.setParent(this.sceneObject);
            const transform = this.modelRoot.getTransform();
            transform.setLocalPosition(new vec3(0, -3, 0));
        }

        this.updateStatus("Ready. Connect inputs and generate.");

        // Ensure BaseNode is set
        if (!this.baseNode) {
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print("Process3DNode: ERROR - BaseNode component not found!");
                return;
            }
        }

        if (this.baseNode) {
            this.baseNode.nodeType = "3d";
        }

        // Fallback for onStart
        let fallbackAttempts = 0;
        this.createEvent("UpdateEvent").bind(() => {
            if (!this._onStartCalled && fallbackAttempts > 5) {
                this._onStartCalled = true;
                this.onStart();
            }
            fallbackAttempts++;
        });
    }

    onStart() {
        this._onStartCalled = true;
        print(`Process3DNode: onStart called`);

        if (!this.baseNode) {
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print(`Process3DNode: ERROR - BaseNode not found`);
                return;
            }
        }

        const frame = this.baseNode.getFrame();
        if (frame) {
            this.createEvent("UpdateEvent").bind(() => {
                if (!this._initialized) {
                    this.setupNode();
                    this._initialized = true;
                }
            });
            return;
        }

        let frameCheckAttempts = 0;
        this.createEvent("UpdateEvent").bind(() => {
            if (!this._initialized && this.baseNode) {
                const frame = this.baseNode.getFrame();
                frameCheckAttempts++;

                if (frame) {
                    const frameReady = frame.roundedRectangle !== undefined || frameCheckAttempts > 5;
                    if (frameReady) {
                        this.setupNode();
                        this._initialized = true;
                        return;
                    }
                }

                if (frameCheckAttempts >= 120 && !this._initialized) {
                    this.setupNode();
                    this._initialized = true;
                }
            }
        });
    }

    private setupNode(): void {
        print(`Process3DNode: setupNode() called`);

        this.setupTitle();
        this.setupGenerateButton();
        this.setupInputSections();
    }

    private setupTitle(): void {
        if (this.titleText) {
            return;
        }

        this._titleTextObject = global.scene.createSceneObject("Process3D_Title");
        this._titleTextObject.setParent(this.sceneObject);
        this._titleTextObject.enabled = true;

        this.titleText = this._titleTextObject.createComponent("Component.Text") as Text;
        if (this.titleText) {
            this.titleText.text = "3D Generation";
            this.titleText.horizontalAlignment = HorizontalAlignment.Center;
            this.titleText.verticalAlignment = VerticalAlignment.Center;

            const transform = this._titleTextObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                transform.setLocalPosition(new vec3(0, frameSize.y / 200 + 0.05, 0.01));
            }
        }
    }

    private setupGenerateButton(): void {
        if (this.generateButton) {
            this.setupGenerateButtonClick();
            this.updateGenerateButtonState();
            return;
        }

        this._generateButtonObject = global.scene.createSceneObject("Process3D_GenerateButton");
        this._generateButtonObject.setParent(this.sceneObject);

        this.generateButton = this._generateButtonObject.createComponent(CapsuleButton.getTypeName() as any) as CapsuleButton;
        if (this.generateButton) {
            // CapsuleButton uses size property (vec3) - width, height, depth in cm
            this.generateButton.size = new vec3(8, 3, 1); // Width, Height, Depth
            const transform = this._generateButtonObject.getTransform();
            transform.setLocalPosition(new vec3(0, -3, 0));
            this.setupGenerateButtonClick();
            this.updateGenerateButtonState();
        }
    }

    /**
     * Updates generate button state based on whether generation is possible
     */
    private updateGenerateButtonState(): void {
        if (!this.generateButton) return;

        const canGen = this.canGenerate();
        print(`Process3DNode: Generate button state - Can generate: ${canGen}`);
    }

    private setupGenerateButtonClick(): void {
        if (!this.generateButton) return;

        if (this.generateButton.onTriggerUp) {
            this.generateButton.onTriggerUp.add(() => {
                this.onGenerateClicked();
            });
        }
    }

    private onGenerateClicked(): void {
        print(`Process3DNode: Generate button clicked`);

        // Validate inputs
        if (!this.canGenerate()) {
            print(`Process3DNode: Cannot generate - missing required inputs`);
            return;
        }

        // Get input data
        const textData = this.getTextInputData();
        const imageData = this.getImageInputData();

        print(`Process3DNode: Generating with text: "${textData?.promptText || "none"}", image: ${!!imageData?.texture}`);

        // TODO: Call 3D generation API
        this.performGeneration(textData, imageData);
    }

    private setupInputSections(): void {
        // Create text input section
        if (!this.textInputSection) {
            this._textInputSectionObject = global.scene.createSceneObject("Process3D_TextInputSection");
            this._textInputSectionObject.setParent(this.sceneObject);
            const transform = this._textInputSectionObject.getTransform();
            transform.setLocalPosition(new vec3(-2, -1, 0));
            this.textInputSection = this._textInputSectionObject;
        } else {
            this._textInputSectionObject = this.textInputSection;
        }

        // Create image input section
        if (!this.imageInputSection) {
            this._imageInputSectionObject = global.scene.createSceneObject("Process3D_ImageInputSection");
            this._imageInputSectionObject.setParent(this.sceneObject);
            const transform = this._imageInputSectionObject.getTransform();
            transform.setLocalPosition(new vec3(2, -1, 0));
            this.imageInputSection = this._imageInputSectionObject;
        } else {
            this._imageInputSectionObject = this.imageInputSection;
        }

        // Add clickable buttons to input sections
        this.setupInputSectionButtons();
    }

    /**
     * Generates a unique button ID
     */
    private generateButtonId(): string {
        return `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Sets up clickable buttons on input sections for connection handling
     */
    private setupInputSectionButtons(): void {
        // Generate unique IDs for input buttons
        if (!this._textInputButtonId) {
            this._textInputButtonId = this.generateButtonId();
        }
        if (!this._imageInputButtonId) {
            this._imageInputButtonId = this.generateButtonId();
        }

        // Text input section button
        if (this._textInputSectionObject) {
            const textButtonObj = global.scene.createSceneObject("Process3D_TextInputButton");
            textButtonObj.setParent(this._textInputSectionObject);
            this._textInputButton = textButtonObj.createComponent(RoundButton.getTypeName() as any) as RoundButton;
            if (this._textInputButton) {
                this._textInputButton.width = 2;
                if (this._textInputButton.onTriggerUp) {
                    this._textInputButton.onTriggerUp.add(() => {
                        this.onTextInputSectionClicked();
                    });
                }
            }
        }

        // Image input section button
        if (this._imageInputSectionObject) {
            const imageButtonObj = global.scene.createSceneObject("Process3D_ImageInputButton");
            imageButtonObj.setParent(this._imageInputSectionObject);
            this._imageInputButton = imageButtonObj.createComponent(RoundButton.getTypeName() as any) as RoundButton;
            if (this._imageInputButton) {
                this._imageInputButton.width = 2;
                if (this._imageInputButton.onTriggerUp) {
                    this._imageInputButton.onTriggerUp.add(() => {
                        this.onImageInputSectionClicked();
                    });
                }
            }
        }
    }

    /**
     * Called when text input section is clicked
     */
    private onTextInputSectionClicked(): void {
        print(`Process3DNode: Text input section clicked (Button ID: ${this._textInputButtonId})`);
        let controller = NodeConnectionController.getInstance();

        // If not found, try to find in scene
        if (!controller) {
            const rootObjects = global.scene.getRootObjectsCount();
            for (let i = 0; i < rootObjects; i++) {
                const rootObject = global.scene.getRootObject(i);
                controller = rootObject.getComponent(NodeConnectionController.getTypeName() as any) as NodeConnectionController | null;
                if (controller) {
                    break;
                }
            }
        }

        if (controller) {
            controller.onProcessNodeInputClicked(this.sceneObject, "text", this._textInputButtonId);
        } else {
            print(`Process3DNode: WARNING - NodeConnectionController not found! Connection cannot be made.`);
        }
    }

    /**
     * Called when image input section is clicked
     */
    private onImageInputSectionClicked(): void {
        print(`Process3DNode: Image input section clicked (Button ID: ${this._imageInputButtonId})`);
        let controller = NodeConnectionController.getInstance();

        // If not found, try to find in scene
        if (!controller) {
            const rootObjects = global.scene.getRootObjectsCount();
            for (let i = 0; i < rootObjects; i++) {
                const rootObject = global.scene.getRootObject(i);
                controller = rootObject.getComponent(NodeConnectionController.getTypeName() as any) as NodeConnectionController | null;
                if (controller) {
                    break;
                }
            }
        }

        if (controller) {
            controller.onProcessNodeInputClicked(this.sceneObject, "image", this._imageInputButtonId);
        } else {
            print(`Process3DNode: WARNING - NodeConnectionController not found! Connection cannot be made.`);
        }
    }

    /**
     * Connects a text input node to this process node
     * Can have multiple text connections
     */
    public connectTextInput(sourceNode: SceneObject, sourceButtonId: string = ""): boolean {
        const promptNode = sourceNode.getComponent(InputNodePrompt.getTypeName() as any) as InputNodePrompt;
        if (!promptNode) {
            print(`Process3DNode: Source node is not an InputNodePrompt`);
            return false;
        }

        // Generate unique connection ID
        const connectionId = `text_${sourceButtonId || promptNode.getOutputButtonId()}_${this._textInputButtonId}_${Date.now()}`;

        // Check if this exact connection already exists
        if (this._textConnections.has(connectionId)) {
            print(`Process3DNode: Text connection already exists: ${connectionId}`);
            return false;
        }

        // Add to child nodes (input node tracks this)
        promptNode.addChildNode(this.sceneObject);

        // Store connection info immediately (curve will be created in next frame)
        this._textConnections.set(connectionId, {
            sourceNode: sourceNode,
            curve: null as any, // Will be set when BezierCurve is created
            connectionId: connectionId
        });

        // Create BezierCurve connection (will be created in next frame)
        this.createTextConnection(sourceNode, promptNode, connectionId);

        // Set first connected node for data access (can be any of them)
        if (!this._connectedTextNode) {
            this._connectedTextNode = sourceNode;
        }

        // Update generate button state
        this.updateGenerateButtonState();

        print(`Process3DNode: Text input connected from ${sourceNode.name} (Connection ID: ${connectionId}, Total: ${this._textConnections.size})`);
        return true;
    }

    /**
     * Connects an image input node to this process node
     * Can have multiple image connections
     * Supports InputNodeImage OR ProcessImageGenNode (chained image generation)
     */
    public connectImageInput(sourceNode: SceneObject, sourceButtonId: string = ""): boolean {
        // Check if source is InputNodeImage
        const imageInputNode = sourceNode.getComponent(InputNodeImage.getTypeName() as any) as InputNodeImage;

        // Check if source is TextureLibraryNode
        const textureLibraryNode = sourceNode.getComponent(TextureLibraryNode.getTypeName() as any) as TextureLibraryNode;

        // Check if source is ProcessImageGenNode (chained from image generation)
        const imageGenNode = sourceNode.getComponent(ProcessImageGenNode.getTypeName() as any) as ProcessImageGenNode;

        // Determine source type and get necessary info
        let outputButtonId = "";
        let outputButtonObject: SceneObject | null = null;
        let sourceType = "";

        if (imageInputNode) {
            outputButtonId = imageInputNode.getOutputButtonId();
            outputButtonObject = imageInputNode.getOutputButtonObject();
            sourceType = "InputNodeImage";
            imageInputNode.addChildNode(this.sceneObject);
        } else if (textureLibraryNode) {
            outputButtonId = textureLibraryNode.getOutputButtonId();
            outputButtonObject = textureLibraryNode.getOutputButtonObject();
            sourceType = "TextureLibraryNode";
            textureLibraryNode.addChildNode(this.sceneObject);
        } else if (imageGenNode) {
            // Check if the source ProcessImageGenNode has a generated image
            if (!imageGenNode.hasGeneratedImage()) {
                print(`Process3DNode: Source ProcessImageGenNode has no generated image yet - generate first!`);
                return false;
            }
            outputButtonId = imageGenNode.getOutputButtonId();
            outputButtonObject = imageGenNode.getOutputButtonObject();
            sourceType = "ProcessImageGenNode (chained)";
            imageGenNode.addChildNode(this.sceneObject);
        } else {
            print(`Process3DNode: Source node is not an InputNodeImage, TextureLibraryNode, or ProcessImageGenNode`);
            return false;
        }

        this.clearExistingImageConnections();

        // Generate unique connection ID
        const connectionId = `image_${sourceButtonId || outputButtonId}_${this._imageInputButtonId}_${Date.now()}`;

        // Check if this exact connection already exists
        if (this._imageConnections.has(connectionId)) {
            print(`Process3DNode: Image connection already exists: ${connectionId}`);
            return false;
        }

        // Store connection info immediately (curve will be created in next frame)
        this._imageConnections.set(connectionId, {
            sourceNode: sourceNode,
            curve: null as any, // Will be set when ConnectionLine is created
            connectionId: connectionId
        });

        // Create ConnectionLine connection
        if (outputButtonObject) {
            this.createImageConnectionFromButton(sourceNode, outputButtonObject, connectionId);
        }

        // Set first connected node for data access (can be any of them)
        if (!this._connectedImageNode) {
            this._connectedImageNode = sourceNode;
        }

        // Update generate button state
        this.updateGenerateButtonState();

        print(`Process3DNode: Image input connected from ${sourceNode.name} (${sourceType}) (Connection ID: ${connectionId}, Total: ${this._imageConnections.size})`);
        return true;
    }

    /**
     * Creates an image connection using output button SceneObject directly
     * Works for both InputNodeImage and ProcessImageGenNode sources
     */
    private createImageConnectionFromButton(sourceNode: SceneObject, outputButtonObj: SceneObject, connectionId: string): ConnectionLine | null {
        if (!this._imageInputSectionObject) {
            print(`Process3DNode: Cannot create image connection - missing input section`);
            return null;
        }

        // Get connection material
        let material = this.connectionMaterial;
        if (!material) {
            const controller = NodeConnectionController.getInstance();
            if (controller) {
                material = controller.connectionMaterial;
            }
        }

        // Create connection object
        const connectionObject = global.scene.createSceneObject(`Process3D_ImageConnection_${connectionId}`);
        connectionObject.setParent(this.sceneObject);

        try {
            const connectionLine = connectionObject.createComponent(ConnectionLine.getTypeName() as any) as ConnectionLine;
            if (connectionLine) {
                connectionLine.startPoint = outputButtonObj;
                connectionLine.endPoint = this._imageInputSectionObject;
                connectionLine.lineMaterial = material;
                connectionLine.sourceNode = sourceNode;
                connectionLine.targetNode = this.sceneObject;

                // Update the connection map with the curve
                const connectionInfo = this._imageConnections.get(connectionId);
                if (connectionInfo) {
                    connectionInfo.curve = connectionLine;
                }

                print(`Process3DNode: Image ConnectionLine created for ${connectionId}`);
                return connectionLine;
            }
        } catch (error) {
            print(`Process3DNode: ERROR - Failed to create image ConnectionLine: ${error}`);
        }
        return null;
    }

    private createTextConnection(sourceNode: SceneObject, promptNode: InputNodePrompt, connectionId: string): ConnectionLine | null {
        if (!this._textInputSectionObject) {
            print(`Process3DNode: Cannot create text connection - missing input section`);
            return null;
        }

        // Get connection material from controller if not set
        let material = this.connectionMaterial;
        if (!material) {
            const controller = NodeConnectionController.getInstance();
            if (controller) {
                material = controller.connectionMaterial;
            }
        }

        if (!material) {
            print(`Process3DNode: WARNING - No connection material available, connection will not be visible`);
        }

        // Create connection object with unique ID
        const connectionObject = global.scene.createSceneObject(`Process3D_TextConnection_${connectionId}`);
        connectionObject.setParent(this.sceneObject);

        // Get the actual output button object from the input node (start point)
        let startPoint = promptNode.getOutputButtonObject();
        if (!startPoint) {
            // Fallback: try to get from the button component directly
            const button = promptNode.getOutputButton();
            if (button && button.sceneObject) {
                startPoint = button.sceneObject;
            }
        }

        if (!startPoint) {
            print(`Process3DNode: ERROR - Cannot get output button object from prompt node`);
            return null;
        }

        // Use the text input section object as the end point
        const endPoint = this._textInputSectionObject;
        if (!endPoint) {
            print(`Process3DNode: ERROR - Text input section object is null`);
            return null;
        }

        // Verify both objects are valid SceneObjects with transforms
        try {
            const startTransform = startPoint.getTransform();
            const endTransform = endPoint.getTransform();
            if (!startTransform || !endTransform) {
                print(`Process3DNode: ERROR - startPoint or endPoint missing Transform`);
                return null;
            }
        } catch (e) {
            print(`Process3DNode: ERROR - Cannot access transforms: ${e}`);
            return null;
        }

        // Use ConnectionLine wrapper instead of BezierCurve directly
        // ConnectionLine allows setting start/end points after creation
        try {
            const connectionLine = connectionObject.createComponent(ConnectionLine.getTypeName()) as ConnectionLine;
            if (connectionLine) {
                // Set the start and end points (ConnectionLine will initialize BezierCurve when both are set)
                connectionLine.startPoint = startPoint;
                connectionLine.endPoint = endPoint;

                // Set other properties
                if (material) {
                    connectionLine.lineMaterial = material;
                }
                connectionLine.curveHeight = 0.2;
                connectionLine.interpolationPoints = 20;

                print(`Process3DNode: Text connection curve created (ID: ${connectionId})`);

                // Store the connection
                this._textConnections.set(connectionId, { sourceNode: sourceNode, curve: connectionLine, connectionId: connectionId });

                return connectionLine;
            }
        } catch (error) {
            print(`Process3DNode: ERROR - Failed to create ConnectionLine: ${error}`);
        }

        return null;
    }

    private createImageConnection(sourceNode: SceneObject, imageNode: InputNodeImage, connectionId: string): ConnectionLine | null {
        if (!this._imageInputSectionObject) {
            print(`Process3DNode: Cannot create image connection - missing input section`);
            return null;
        }

        // Get connection material from controller if not set
        let material = this.connectionMaterial;
        if (!material) {
            const controller = NodeConnectionController.getInstance();
            if (controller) {
                material = controller.connectionMaterial;
            }
        }

        if (!material) {
            print(`Process3DNode: WARNING - No connection material available, connection will not be visible`);
        }

        // Create connection object with unique ID
        const connectionObject = global.scene.createSceneObject(`Process3D_ImageConnection_${connectionId}`);
        connectionObject.setParent(this.sceneObject);

        // Get the actual output button object from the input node (start point)
        let startPoint = imageNode.getOutputButtonObject();
        if (!startPoint) {
            // Fallback: try to get from the button component directly
            const button = imageNode.getOutputButton();
            if (button && button.sceneObject) {
                startPoint = button.sceneObject;
            }
        }

        if (!startPoint) {
            print(`Process3DNode: ERROR - Cannot get output button object from image node`);
            return null;
        }

        // Use the image input section object as the end point
        const endPoint = this._imageInputSectionObject;
        if (!endPoint) {
            print(`Process3DNode: ERROR - Image input section object is null`);
            return null;
        }

        // Verify both objects are valid SceneObjects with transforms
        try {
            const startTransform = startPoint.getTransform();
            const endTransform = endPoint.getTransform();
            if (!startTransform || !endTransform) {
                print(`Process3DNode: ERROR - startPoint or endPoint missing Transform`);
                return null;
            }
        } catch (e) {
            print(`Process3DNode: ERROR - Cannot access transforms: ${e}`);
            return null;
        }

        // Use ConnectionLine wrapper instead of BezierCurve directly
        // ConnectionLine allows setting start/end points after creation
        try {
            const connectionLine = connectionObject.createComponent(ConnectionLine.getTypeName()) as ConnectionLine;
            if (connectionLine) {
                // Set the start and end points (ConnectionLine will initialize BezierCurve when both are set)
                connectionLine.startPoint = startPoint;
                connectionLine.endPoint = endPoint;

                // Set other properties
                if (material) {
                    connectionLine.lineMaterial = material;
                }
                connectionLine.curveHeight = 0.2;
                connectionLine.interpolationPoints = 20;

                print(`Process3DNode: Image connection curve created (ID: ${connectionId})`);

                // Store the connection
                this._imageConnections.set(connectionId, { sourceNode: sourceNode, curve: connectionLine, connectionId: connectionId });

                return connectionLine;
            }
        } catch (error) {
            print(`Process3DNode: ERROR - Failed to create ConnectionLine: ${error}`);
        }

        return null;
    }

    /**
     * Checks if generation can be performed (validation)
     * 3D generation accepts: Text OR Image OR Both
     */
    public canGenerate(): boolean {
        const hasText = this._textConnections.size > 0;
        const hasImage = this._imageConnections.size > 0;

        // At least one input is required
        return hasText || hasImage;
    }

    /**
     * Gets text input data from connected node
     */
    public getTextInputData(): { promptText: string; textComponent: Text | null } | null {
        if (!this._connectedTextNode) {
            return null;
        }

        const promptNode = this._connectedTextNode.getComponent(InputNodePrompt.getTypeName() as any) as InputNodePrompt;
        if (promptNode) {
            return promptNode.getOutputData();
        }

        return null;
    }

    /**
     * Gets image input data from connected node
     * Supports both InputNodeImage and ProcessImageGenNode (chained) sources
     */
    public getImageInputData(): { texture: Texture | null; material: Material | null; imageComponent: Image | null } | null {
        if (!this._connectedImageNode) {
            return null;
        }

        // Check if source is InputNodeImage
        const imageInputNode = this._connectedImageNode.getComponent(InputNodeImage.getTypeName() as any) as InputNodeImage;
        if (imageInputNode) {
            const data = imageInputNode.getOutputData();
            return {
                texture: data.texture,
                material: data.material,
                imageComponent: data.imageComponent
            };
        }

        // Check if source is TextureLibraryNode
        const textureLibraryNode = this._connectedImageNode.getComponent(TextureLibraryNode.getTypeName() as any) as TextureLibraryNode;
        if (textureLibraryNode) {
            const data = textureLibraryNode.getOutputData();
            return {
                texture: data.texture,
                material: data.material,
                imageComponent: data.imageComponent
            };
        }

        // Check if source is ProcessImageGenNode
        const imageGenNode = this._connectedImageNode.getComponent(ProcessImageGenNode.getTypeName() as any) as ProcessImageGenNode;
        if (imageGenNode) {
            const data = imageGenNode.getOutputData();
            return {
                texture: data.texture,
                material: data.material,
                imageComponent: data.imageComponent
            };
        }

        return null;
    }

    /**
     * Performs the actual 3D generation using Snap3D API
     */
    private performGeneration(textData: { promptText: string; textComponent: Text | null } | null, imageData: { texture: Texture | null; material: Material | null; imageComponent: Image | null } | null): void {
        if (this._isGenerating) {
            print(`Process3DNode: Already generating, please wait...`);
            this.updateStatus("Already generating...");
            return;
        }

        const hasText = textData && textData.promptText && textData.promptText.trim() !== "";
        const hasImage = imageData && imageData.texture;

        if (!hasText && !hasImage) {
            print(`Process3DNode: ERROR - No input provided (need text or image)`);
            this.updateStatus("Error: Text or image input required");
            return;
        }

        if (!this.modelMaterial) {
            print(`Process3DNode: ERROR - Material is required for 3D generation. Please assign a material to the 'modelMaterial' input in the inspector.`);
            this.updateStatus("Error: Material required. Assign a material in the inspector.");
            this._isGenerating = false;
            this.setLoading(false);
            return;
        }

        this._isGenerating = true;
        this.setLoading(true);
        this.updateStatus("Preparing generation...");

        print(`Process3DNode: Starting 3D generation`);
        print(`  Text: ${hasText ? textData.promptText : "none"}`);
        print(`  Image: ${hasImage ? "present" : "none"}`);

        // Get or generate prompt
        let promptToUse: string | null = null;

        if (hasText) {
            promptToUse = textData.promptText.trim();
        } else if (hasImage) {
            // Use Gemini to describe the image
            this.updateStatus("Describing image...");
            this.describeImageWithGemini(imageData.texture)
                .then((description) => {
                    print("Process3DNode: Image described as: " + description);
                    this.generate3DWithPrompt(description);
                })
                .catch((error) => {
                    print("Process3DNode: Error describing image: " + error);
                    this.updateStatus("Error describing image: " + error);
                    this._isGenerating = false;
                    this.setLoading(false);
                });
            return;
        }

        if (promptToUse) {
            this.generate3DWithPrompt(promptToUse);
        }
    }

    private applyMaterialEverywhere(root: SceneObject, mat: Material) {
        const stack: SceneObject[] = [root];
        while (stack.length > 0) {
            const so = stack.pop();

            const rmv = so.getComponent("Component.RenderMeshVisual") as RenderMeshVisual;
            if (rmv) {
                rmv.mainMaterial = mat;
            }

            const n = so.getChildrenCount();
            for (let i = 0; i < n; i++) {
                stack.push(so.getChild(i));
            }
        }
    }

    /**
     * Check if Remote Service Gateway credentials are configured
     */
    private checkCredentials(needsGoogle: boolean = false, needsSnap: boolean = false): boolean {
        if (needsGoogle) {
            const googleToken = RemoteServiceGatewayCredentials.getApiToken(AvaliableApiTypes.Google);
            if (!googleToken || googleToken === "[INSERT GOOGLE TOKEN HERE]" || googleToken.trim() === "") {
                print("Process3DNode: WARNING - Google/Gemini token not configured!");
                print("Process3DNode: Please add RemoteServiceGatewayCredentials component to a SceneObject and configure your Google token");
                this.updateStatus("Error: Google API credentials not configured.");
                return false;
            }
        }
        if (needsSnap) {
            const snapToken = RemoteServiceGatewayCredentials.getApiToken(AvaliableApiTypes.Snap);
            if (!snapToken || snapToken === "[INSERT SNAP TOKEN HERE]" || snapToken.trim() === "") {
                print("Process3DNode: WARNING - Snap token not configured!");
                print("Process3DNode: Please add RemoteServiceGatewayCredentials component to a SceneObject and configure your Snap token");
                this.updateStatus("Error: Snap API credentials not configured.");
                return false;
            }
        }
        return true;
    }

    /**
     * Use Gemini to describe the image
     */
    private describeImageWithGemini(imageTexture: Texture): Promise<string> {
        // Check credentials before making API call
        if (!this.checkCredentials(true, false)) {
            return Promise.reject("Google API credentials not configured");
        }

        return new Promise((resolve, reject) => {
            Base64.encodeTextureAsync(
                imageTexture,
                (base64Data) => {
                    const request: GeminiTypes.Models.GenerateContentRequest = {
                        model: "gemini-2.0-flash-exp",
                        type: "generateContent",
                        body: {
                            contents: [
                                {
                                    parts: [
                                        {
                                            inlineData: {
                                                mimeType: "image/png",
                                                data: base64Data
                                            }
                                        },
                                        {
                                            text: "Describe this image in detail in one sentence. Focus on the main subject, style, and key visual elements. This description will be used to generate a 3D model."
                                        }
                                    ],
                                    role: "user"
                                }
                            ]
                        }
                    };

                    print("Process3DNode: Asking Gemini to describe image...");
                    Gemini.models(request)
                        .then((response) => {
                            if (!response.candidates || response.candidates.length === 0) {
                                reject("No response from Gemini");
                                return;
                            }

                            const textParts = response.candidates[0].content.parts
                                .filter((part) => part.text)
                                .map((part) => part.text);

                            if (textParts.length === 0) {
                                reject("No text description in Gemini response");
                                return;
                            }

                            const description = textParts.join(" ").trim();
                            resolve(description);
                        })
                        .catch((error) => {
                            let errorMessage = "Unknown error";
                            if (error) {
                                if (typeof error === "string") {
                                    errorMessage = error;
                                } else if (error.message) {
                                    errorMessage = error.message;
                                } else {
                                    errorMessage = JSON.stringify(error);
                                }
                            }
                            reject("Error describing image: " + errorMessage);
                        });
                },
                () => {
                    reject("Failed to encode image texture");
                },
                CompressionQuality.LowQuality,
                EncodingType.Png
            );
        });
    }

    private clearExistingImageConnections(): void {
        this._imageConnections.forEach((connectionInfo) => {
            if (connectionInfo.curve && connectionInfo.curve.sceneObject) {
                connectionInfo.curve.sceneObject.destroy();
            }

            const imageInputNode = connectionInfo.sourceNode.getComponent(InputNodeImage.getTypeName() as any) as InputNodeImage;
            if (imageInputNode) {
                imageInputNode.removeChildNode(this.sceneObject);
            }

            const textureLibraryNode = connectionInfo.sourceNode.getComponent(TextureLibraryNode.getTypeName() as any) as TextureLibraryNode;
            if (textureLibraryNode) {
                textureLibraryNode.removeChildNode(this.sceneObject);
            }

            const imageGenNode = connectionInfo.sourceNode.getComponent(ProcessImageGenNode.getTypeName() as any) as ProcessImageGenNode;
            if (imageGenNode) {
                imageGenNode.removeChildNode(this.sceneObject);
            }
        });

        this._imageConnections.clear();
        this._connectedImageNode = null;

        print("Process3DNode: Cleared existing image connections");
    }

    /**
     * Generate 3D model using Snap3D with the given prompt
     */
    private generate3DWithPrompt(prompt: string): void {
        // Check credentials before making API call
        if (!this.checkCredentials(false, true)) {
            this._isGenerating = false;
            this.setLoading(false);
            return;
        }

        this.updateStatus("Generating 3D model...");

        print("Process3DNode: Generating 3D model with prompt: " + prompt);

        // Clean up temporary model (base mesh) if exists
        if (this._tempModel) {
            this._tempModel.destroy();
            this._tempModel = null;
        }

        Snap3D.submitAndGetStatus({
            prompt: prompt,
            format: "glb",
            refine: this.refineMesh,
            use_vertex_color: this.useVertexColor
        })
            .then((submitGetStatusResults) => {
                print("Process3DNode: 3D generation started, task ID: " + submitGetStatusResults.task_id);

                submitGetStatusResults.event.add(([value, assetOrError]) => {
                    if (value === "image") {
                        print("Process3DNode: Preview image received");
                        // Preview image received, but we'll wait for the mesh
                    } else if (value === "base_mesh") {
                        print("Process3DNode: Base mesh received");
                        const gltfAssetData = assetOrError as Snap3DTypes.GltfAssetData;
                        this.instantiateModel(gltfAssetData.gltfAsset, false, false);
                    } else if (value === "refined_mesh") {
                        print("Process3DNode: Refined mesh received");
                        const gltfAssetData = assetOrError as Snap3DTypes.GltfAssetData;
                        // Clean up temp model when refined mesh arrives
                        if (this._tempModel) {
                            this._tempModel.destroy();
                            this._tempModel = null;
                        }
                
                        this.instantiateModel(gltfAssetData.gltfAsset, true, true);
                    } else if (value === "failed") {
                        const error = assetOrError as Snap3DTypes.ErrorData;
                        print("Process3DNode: Generation failed: " + error.errorMsg + " (Code: " + error.errorCode + ")");
                        this.updateStatus("Error: " + error.errorMsg);
                        this._isGenerating = false;
                        this.setLoading(false);
                    }
                });
            })
            .catch((error) => {
                print("Process3DNode: Error submitting 3D generation: " + error);
                this.updateStatus("Error: " + error);
                this._isGenerating = false;
                this.setLoading(false);
            });
    }

    /**
     * Instantiate the 3D model in the scene with interactivity support
     */
    private instantiateModel(gltfAsset: GltfAsset, isRefined: boolean, isFinal: boolean): void {
        // Ensure modelRoot exists
        if (!this.modelRoot) {
            print("Process3DNode: Warning - No model root assigned, creating default");
            this.modelRoot = global.scene.createSceneObject("3DModelRoot");
            this.modelRoot.setParent(this.sceneObject);
        }

        // Validate material (required for instantiation)
        if (!this.modelMaterial) {
            print("Process3DNode: Error - Material is required for instantiation");
            this.updateStatus("Error: Material is required. Please assign a material in the inspector.");
            this._isGenerating = false;
            this.setLoading(false);
            return;
        }

        // Use async instantiation
        gltfAsset.tryInstantiateAsync(
            this.modelRoot,
            this.modelMaterial,
            (sceneObject: SceneObject) => {
                // Success callback
                if (sceneObject) {
                    print("Process3DNode: 3D model instantiated successfully (" + (isRefined ? "refined" : "base") + " mesh)");

                    // Position the model at modelRoot's location (local position 0,0,0)
                    // Since it's already a child of modelRoot, set local position to origin
                    const modelTransform = sceneObject.getTransform();
                    modelTransform.setLocalPosition(vec3.zero());
                    print(`Process3DNode: Model positioned at modelRoot location (local: 0,0,0)`);

                    // Apply scaling
                    const sizeVec = vec3.one().uniformScale(this.modelScale);
                    modelTransform.setLocalScale(sizeVec);

                    const imgData = this.getImageInputData();
                    
                    // Clone the material so each generated model gets its own copy
                    const modelMatInstance = this.modelMaterial.clone();

                    if (imgData && imgData.texture) {
                        modelMatInstance.mainPass.baseTex = imgData.texture;
                    }

                    this.applyMaterialEverywhere(sceneObject, modelMatInstance);

                    // Make interactable if enabled
                    let finalModelObject: SceneObject = sceneObject;
                    if (this.makeInteractable && isFinal) {
                        finalModelObject = this.makeModelInteractable(sceneObject);
                        if (!finalModelObject) {
                            finalModelObject = sceneObject;
                        }
                    }

                    // Store the model
                    if (isFinal) {

                        this._currentModel = finalModelObject;
                        this._generatedModels.push(finalModelObject);
                        print("Process3DNode: Model added to generated models list (total: " + this._generatedModels.length + ")");
                    } else {
                        this._tempModel = sceneObject;
                    }

                    if (isRefined && isFinal) {
                        this.spinObjectOnce(finalModelObject, 0.8);
                        // Refined mesh is complete
                        this.updateStatus("3D model generated successfully! (Total: " + this._generatedModels.length + ")");
                        this._isGenerating = false;
                        this.setLoading(false);
                    } else if (!isRefined) {
                        // Base mesh loaded, waiting for refined mesh
                        this.updateStatus("Base mesh loaded, refining...");
                    }
                } else {
                    print("Process3DNode: Warning - Instantiation callback returned null");
                    this.updateStatus("Warning: Model instantiation returned null");
                    if (isRefined && isFinal) {
                        this._isGenerating = false;
                        this.setLoading(false);
                    }
                }
            },
            (error: string) => {
                // Failure callback
                print("Process3DNode: Error instantiating model: " + error);
                this.updateStatus("Error instantiating model: " + error);
                this._isGenerating = false;
                this.setLoading(false);
            },
            (progress: number) => {
                // Progress callback
                print("Process3DNode: Instantiation progress: " + (progress * 100).toFixed(0) + "%");
            }
        );

        // sceneObject is the instantiated model root returned by tryInstantiateAsync
        // const cloned = this.modelMaterial.clone();   // important: don't edit shared asset
        // const img = this.getImageInputData();        // get texture from your connected image node

        // if (img?.texture) {
        //     cloned.mainPass.baseTex = img.texture;   // set texture
        // }
        // this.applyMaterialEverywhere(this.sceneObject, cloned);
    }

    /**
     * Make a model interactable (draggable) by adding necessary components
     */
    private makeModelInteractable(model: SceneObject): SceneObject | null {
        try {
            // Create a wrapper SceneObject for the model
            // Parent it to modelRoot so it starts at the correct location
            const wrapper = global.scene.createSceneObject("InteractableModel_" + this._generatedModels.length);
            wrapper.setParent(this.modelRoot);

            // Position wrapper at modelRoot's location (local position 0,0,0)
            wrapper.getTransform().setLocalPosition(vec3.zero());

            // Move model to be a child of the wrapper
            const modelTransform = model.getTransform();
            const localPos = modelTransform.getLocalPosition();
            const localRot = modelTransform.getLocalRotation();
            const localScale = modelTransform.getLocalScale();

            model.setParent(wrapper);

            // Restore transform (model should be at local 0,0,0 relative to wrapper)
            modelTransform.setLocalPosition(localPos);
            modelTransform.setLocalRotation(localRot);
            modelTransform.setLocalScale(localScale);

            // Add Interactable component
            const interactable = wrapper.createComponent(Interactable.getTypeName()) as Interactable;
            interactable.targetingMode = TargetingMode.All;
            interactable.enableInstantDrag = true;

            // Add InteractableStateMachine
            const stateMachine = wrapper.createComponent(InteractableStateMachine.getTypeName()) as InteractableStateMachine;
            stateMachine.initialize();
            stateMachine.isDraggable = true;

            // Add InteractableManipulation
            const manipulation = wrapper.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;
            manipulation.enabled = true;

            // Add ColliderComponent
            const colliderObj = global.scene.createSceneObject("Collider");
            colliderObj.setParent(wrapper);
            const collider = colliderObj.createComponent("ColliderComponent") as ColliderComponent;
            collider.fitVisual = false;

            // Create a box shape for the collider
            const colliderShape = Shape.createBoxShape();
            colliderShape.size = vec3.one().uniformScale(this.modelScale * 1.2);
            collider.shape = colliderShape;
            collider.enabled = true;

            print("Process3DNode: Model made interactable (draggable)");
            return wrapper;
        } catch (error) {
            print("Process3DNode: Warning - Could not make model interactable: " + error);
            return null;
        }
    }

    private spinObjectOnce(target: SceneObject, duration: number = 0.8): void {
        if (!target) return;

        const transform = target.getTransform();
        const startRot = transform.getLocalRotation();

        let elapsed = 0;

        const updateEvent = this.createEvent("UpdateEvent");
        updateEvent.bind(() => {
            if (!target || isNull(target)) {
                updateEvent.enabled = false;
                return;
            }

            const dt = getDeltaTime();
            elapsed += dt;

            const t = Math.min(elapsed / duration, 1);

            // 360 degrees around Y
            const angle = Math.PI * 2 * t;
            const spinRot = quat.angleAxis(angle, vec3.up());

            transform.setLocalRotation(startRot.multiply(spinRot));

            if (t >= 1) {
                // Snap exactly back to original orientation after full rotation
                transform.setLocalRotation(startRot);
                updateEvent.enabled = false;
            }
        });
    }

    /**
     * Update status text
     */
    private updateStatus(message: string): void {
        if (this.statusText) {
            this.statusText.text = message;
        }
    }

    /**
     * Set loading indicator visibility
     */
    private setLoading(loading: boolean): void {
        if (this.loadingIndicator) {
            this.loadingIndicator.enabled = loading;
        }
    }

    /**
     * Get all generated models
     */
    public getGeneratedModels(): SceneObject[] {
        return this._generatedModels.slice();
    }

    /**
     * Clear all generated models from the scene
     */
    public clearAllModels(): void {
        for (const model of this._generatedModels) {
            if (model && !isNull(model)) {
                model.destroy();
            }
        }
        this._generatedModels = [];
        this._currentModel = null;
        this._tempModel = null;
        print("Process3DNode: All models cleared");
    }

    /**
     * Gets the generate button
     */
    public getGenerateButton(): CapsuleButton | null {
        return this.generateButton;
    }

    /**
     * Gets input section positions for connection targeting
     */
    public getTextInputSectionPosition(): vec3 | null {
        if (this._textInputSectionObject) {
            return this._textInputSectionObject.getTransform().getWorldPosition();
        }
        return null;
    }

    public getImageInputSectionPosition(): vec3 | null {
        if (this._imageInputSectionObject) {
            return this._imageInputSectionObject.getTransform().getWorldPosition();
        }
        return null;
    }
}
