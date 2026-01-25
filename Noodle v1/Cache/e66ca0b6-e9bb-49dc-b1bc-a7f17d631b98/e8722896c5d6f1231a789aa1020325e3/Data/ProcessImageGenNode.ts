import { BaseNode } from "./BaseNode";
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton";
import { CapsuleButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/CapsuleButton";
import { ConnectionLine } from "./ConnectionLine";
import { InputNodePrompt } from "./InputNodePrompt";
import { InputNodeImage } from "./InputNodeImage";
import { NodeConnectionController } from "./NodeConnectionController";
import { Gemini } from "RemoteServiceGateway.lspkg/HostedExternal/Gemini";
import { GeminiTypes } from "RemoteServiceGateway.lspkg/HostedExternal/GeminiTypes";
import { RemoteServiceGatewayCredentials } from "RemoteServiceGateway.lspkg/RemoteServiceGatewayCredentials";
import { AvaliableApiTypes } from "RemoteServiceGateway.lspkg/RemoteServiceGatewayCredentials";

/**
 * ProcessImageGenNode - A process node for image generation
 * Accepts: Text prompt (required) OR Text + Image (image-to-image)
 * Does NOT accept: Image alone (that's image-to-image, not generation)
 * 
 * REQUIRES: RemoteServiceGatewayCredentials component in the scene with Google Token configured
 * Setup: Add RemoteServiceGatewayCredentials to a SceneObject and configure your Google/Gemini API token
 */
@component
export class ProcessImageGenNode extends BaseScriptComponent {
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

    @input
    @hint("Image component to display generated image (will be created if not set)")
    @allowUndefined
    public outputImage: Image | null = null;

    @input
    @hint("Optional: Text component to show status/error messages")
    @allowUndefined
    public statusText: Text | null = null;

    @input
    @hint("Optional: SceneObject to show/hide as loading indicator")
    @allowUndefined
    public loadingIndicator: SceneObject | null = null;

    @input
    @hint("Output button for connecting generated image to other nodes")
    @allowUndefined
    public outputButton: RoundButton | null = null;

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

    // Output button for chaining
    private _outputButtonObject: SceneObject | null = null;
    private _outputButtonId: string = "";
    private _generatedTexture: Texture | null = null;
    private _clonedOutputMaterial: Material | null = null;
    private _connectedChildNodes: SceneObject[] = [];

    // Track connections - can have multiple connections to same input type
    private _textConnections: Map<string, { sourceNode: SceneObject; curve: ConnectionLine; connectionId: string }> = new Map();
    private _imageConnections: Map<string, { sourceNode: SceneObject; curve: ConnectionLine; connectionId: string }> = new Map();

    // Generation state
    private _isGenerating: boolean = false;
    private _outputImageObject: SceneObject | null = null;

    onAwake() {
        print(`ProcessImageGenNode: onAwake called`);

        // Ensure BaseNode is set
        if (!this.baseNode) {
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print("ProcessImageGenNode: ERROR - BaseNode component not found!");
                return;
            }
        }

        if (this.baseNode) {
            this.baseNode.nodeType = "image";
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
        print(`ProcessImageGenNode: onStart called`);

        if (!this.baseNode) {
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print(`ProcessImageGenNode: ERROR - BaseNode not found`);
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
        print(`ProcessImageGenNode: setupNode() called`);

        this.setupTitle();
        this.setupGenerateButton();
        this.setupInputSections();
        this.setupOutputButton(); // Add output button for chaining
    }

    /**
     * Generates a unique button ID
     */
    private generateButtonId(): string {
        return `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Sets up the output button for connecting generated image to other nodes
     */
    private setupOutputButton(): void {
        // Generate unique ID for this button
        if (!this._outputButtonId) {
            this._outputButtonId = this.generateButtonId();
        }

        // If button already exists, just set up tracking
        if (this.outputButton) {
            this.setupOutputButtonClick();
            return;
        }

        // Create output button object
        this._outputButtonObject = global.scene.createSceneObject("ProcessImageGen_OutputButton");
        this._outputButtonObject.setParent(this.sceneObject);

        // Create RoundButton component
        this.outputButton = this._outputButtonObject.createComponent(RoundButton.getTypeName() as any) as RoundButton;
        if (this.outputButton) {
            this.outputButton.width = 2;
            // Position at right center (output connection point)
            const transform = this._outputButtonObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                transform.setLocalPosition(new vec3(frameSize.x / 200, -1, 0)); // Below generate button
            }

            this.setupOutputButtonClick();
            print("ProcessImageGenNode: Created output button for chaining");
        }
    }

    /**
     * Sets up output button click tracking
     */
    private setupOutputButtonClick(): void {
        if (!this.outputButton) {
            return;
        }

        if (this.outputButton.onTriggerUp) {
            this.outputButton.onTriggerUp.add(() => {
                this.onOutputButtonClicked();
            });
            print("ProcessImageGenNode: Output button click tracking set up");
        }
    }

    /**
     * Called when output button is clicked - starts a connection from this node's output
     */
    private onOutputButtonClicked(): void {
        // Check if we have a generated image
        if (!this._generatedTexture) {
            print("ProcessImageGenNode: No generated image yet - generate an image first!");
            this.updateStatus("Generate an image first");
            return;
        }

        print(`ProcessImageGenNode: Output button clicked (ID: ${this._outputButtonId}) - Generated image ready`);

        // Notify connection controller - this node acts like an image input
        const controller = NodeConnectionController.getInstance();
        if (controller) {
            controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
        } else {
            print("ProcessImageGenNode: WARNING - NodeConnectionController not found!");
        }
    }

    private setupTitle(): void {
        if (this.titleText) {
            return;
        }

        this._titleTextObject = global.scene.createSceneObject("ProcessImageGen_Title");
        this._titleTextObject.setParent(this.sceneObject);
        this._titleTextObject.enabled = true;

        this.titleText = this._titleTextObject.createComponent("Component.Text") as Text;
        if (this.titleText) {
            this.titleText.text = "Image Generation";
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

        this._generateButtonObject = global.scene.createSceneObject("ProcessImageGen_GenerateButton");
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
        // Enable/disable button based on validation
        // Note: RoundButton might not have enabled property, so we'll just track it
        print(`ProcessImageGenNode: Generate button state - Can generate: ${canGen}`);
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
        print(`ProcessImageGenNode: Generate button clicked`);

        // Validate inputs
        if (!this.canGenerate()) {
            print(`ProcessImageGenNode: Cannot generate - missing required inputs`);
            return;
        }

        // Get input data
        const textData = this.getTextInputData();
        const imageData = this.getImageInputData();

        print(`ProcessImageGenNode: Generating with text: "${textData?.promptText || "none"}", image: ${!!imageData?.texture}`);

        // TODO: Call image generation API (Gemini, etc.)
        this.performGeneration(textData, imageData);
    }

    private setupInputSections(): void {
        // Create text input section
        if (!this.textInputSection) {
            this._textInputSectionObject = global.scene.createSceneObject("ProcessImageGen_TextInputSection");
            this._textInputSectionObject.setParent(this.sceneObject);
            const transform = this._textInputSectionObject.getTransform();
            transform.setLocalPosition(new vec3(-2, -1, 0));
            this.textInputSection = this._textInputSectionObject;
        } else {
            this._textInputSectionObject = this.textInputSection;
        }

        // Create image input section
        if (!this.imageInputSection) {
            this._imageInputSectionObject = global.scene.createSceneObject("ProcessImageGen_ImageInputSection");
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
            const textButtonObj = global.scene.createSceneObject("ProcessImageGen_TextInputButton");
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
            const imageButtonObj = global.scene.createSceneObject("ProcessImageGen_ImageInputButton");
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
        print(`ProcessImageGenNode: Text input section clicked (Button ID: ${this._textInputButtonId})`);
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
            print(`ProcessImageGenNode: WARNING - NodeConnectionController not found! Connection cannot be made.`);
        }
    }

    /**
     * Called when image input section is clicked
     */
    private onImageInputSectionClicked(): void {
        print(`ProcessImageGenNode: Image input section clicked (Button ID: ${this._imageInputButtonId})`);
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
            print(`ProcessImageGenNode: WARNING - NodeConnectionController not found! Connection cannot be made.`);
        }
    }

    /**
     * Connects a text input node to this process node
     * Can have multiple text connections
     */
    public connectTextInput(sourceNode: SceneObject, sourceButtonId: string = ""): boolean {
        const promptNode = sourceNode.getComponent(InputNodePrompt.getTypeName() as any) as InputNodePrompt;
        if (!promptNode) {
            print(`ProcessImageGenNode: Source node is not an InputNodePrompt`);
            return false;
        }

        // Generate unique connection ID
        const connectionId = `text_${sourceButtonId || promptNode.getOutputButtonId()}_${this._textInputButtonId}_${Date.now()}`;

        // Check if this exact connection already exists
        if (this._textConnections.has(connectionId)) {
            print(`ProcessImageGenNode: Text connection already exists: ${connectionId}`);
            return false;
        }

        // Add to child nodes (input node tracks this)
        promptNode.addChildNode(this.sceneObject);

        // Store connection info immediately (curve will be created in next frame)
        this._textConnections.set(connectionId, {
            sourceNode: sourceNode,
            curve: null as any, // Will be set when ConnectionLine is created
            connectionId: connectionId
        });

        // Create ConnectionLine connection
        this.createTextConnection(sourceNode, promptNode, connectionId);

        // Set first connected node for data access (can be any of them)
        if (!this._connectedTextNode) {
            this._connectedTextNode = sourceNode;
        }

        // Update generate button state
        this.updateGenerateButtonState();

        print(`ProcessImageGenNode: Text input connected from ${sourceNode.name} (Connection ID: ${connectionId}, Total: ${this._textConnections.size})`);
        return true;
    }

    /**
     * Connects an image input node to this process node
     * Can have multiple image connections
     */
    public connectImageInput(sourceNode: SceneObject, sourceButtonId: string = ""): boolean {
        const imageNode = sourceNode.getComponent(InputNodeImage.getTypeName() as any) as InputNodeImage;
        if (!imageNode) {
            print(`ProcessImageGenNode: Source node is not an InputNodeImage`);
            return false;
        }

        // Generate unique connection ID
        const connectionId = `image_${sourceButtonId || imageNode.getOutputButtonId()}_${this._imageInputButtonId}_${Date.now()}`;

        // Check if this exact connection already exists
        if (this._imageConnections.has(connectionId)) {
            print(`ProcessImageGenNode: Image connection already exists: ${connectionId}`);
            return false;
        }

        // Add to child nodes (input node tracks this)
        imageNode.addChildNode(this.sceneObject);

        // Store connection info immediately (curve will be created in next frame)
        this._imageConnections.set(connectionId, {
            sourceNode: sourceNode,
            curve: null as any, // Will be set when ConnectionLine is created
            connectionId: connectionId
        });

        // Create ConnectionLine connection
        this.createImageConnection(sourceNode, imageNode, connectionId);

        // Set first connected node for data access (can be any of them)
        if (!this._connectedImageNode) {
            this._connectedImageNode = sourceNode;
        }

        // Update generate button state
        this.updateGenerateButtonState();

        print(`ProcessImageGenNode: Image input connected from ${sourceNode.name} (Connection ID: ${connectionId}, Total: ${this._imageConnections.size})`);
        return true;
    }

    private createTextConnection(sourceNode: SceneObject, promptNode: InputNodePrompt, connectionId: string): ConnectionLine | null {
        if (!this._textInputSectionObject) {
            print(`ProcessImageGenNode: Cannot create text connection - missing input section`);
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
            print(`ProcessImageGenNode: WARNING - No connection material available, connection will not be visible`);
        }

        // Create connection object with unique ID
        const connectionObject = global.scene.createSceneObject(`ProcessImageGen_TextConnection_${connectionId}`);
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
            print(`ProcessImageGenNode: ERROR - Cannot get output button object from prompt node`);
            return null;
        }

        // Use the text input section object as the end point
        const endPoint = this._textInputSectionObject;
        if (!endPoint) {
            print(`ProcessImageGenNode: ERROR - Text input section object is null`);
            return null;
        }

        // Verify both objects are valid SceneObjects with transforms
        try {
            const startTransform = startPoint.getTransform();
            const endTransform = endPoint.getTransform();
            if (!startTransform || !endTransform) {
                print(`ProcessImageGenNode: ERROR - startPoint or endPoint missing Transform`);
                return null;
            }
        } catch (e) {
            print(`ProcessImageGenNode: ERROR - Cannot access transforms: ${e}`);
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

                print(`ProcessImageGenNode: Text connection curve created (ID: ${connectionId})`);

                // Store the connection
                this._textConnections.set(connectionId, { sourceNode: sourceNode, curve: connectionLine, connectionId: connectionId });

                return connectionLine;
            }
        } catch (error) {
            print(`ProcessImageGenNode: ERROR - Failed to create ConnectionLine: ${error}`);
        }

        return null;
    }

    private createImageConnection(sourceNode: SceneObject, imageNode: InputNodeImage, connectionId: string): ConnectionLine | null {
        if (!this._imageInputSectionObject) {
            print(`ProcessImageGenNode: Cannot create image connection - missing input section`);
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
            print(`ProcessImageGenNode: WARNING - No connection material available, connection will not be visible`);
        }

        // Create connection object with unique ID
        const connectionObject = global.scene.createSceneObject(`ProcessImageGen_ImageConnection_${connectionId}`);
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
            print(`ProcessImageGenNode: ERROR - Cannot get output button object from image node`);
            return null;
        }

        // Use the image input section object as the end point
        const endPoint = this._imageInputSectionObject;
        if (!endPoint) {
            print(`ProcessImageGenNode: ERROR - Image input section object is null`);
            return null;
        }

        // Verify both objects are valid SceneObjects with transforms
        try {
            const startTransform = startPoint.getTransform();
            const endTransform = endPoint.getTransform();
            if (!startTransform || !endTransform) {
                print(`ProcessImageGenNode: ERROR - startPoint or endPoint missing Transform`);
                return null;
            }
        } catch (e) {
            print(`ProcessImageGenNode: ERROR - Cannot access transforms: ${e}`);
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

                print(`ProcessImageGenNode: Image connection curve created (ID: ${connectionId})`);

                // Store the connection
                this._imageConnections.set(connectionId, { sourceNode: sourceNode, curve: connectionLine, connectionId: connectionId });

                return connectionLine;
            }
        } catch (error) {
            print(`ProcessImageGenNode: ERROR - Failed to create ConnectionLine: ${error}`);
        }

        return null;
    }

    /**
     * Checks if generation can be performed (validation)
     */
    public canGenerate(): boolean {
        // Image generation requires text (text alone OR text + image)
        // Image alone is NOT valid (that's image-to-image, not generation)
        const hasText = this._textConnections.size > 0;
        const hasImage = this._imageConnections.size > 0;

        if (!hasText) {
            return false; // Must have text
        }

        // Text alone is valid, text + image is valid
        return true;
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
     */
    public getImageInputData(): { texture: Texture | null; material: Material | null; imageComponent: Image | null } | null {
        if (!this._connectedImageNode) {
            return null;
        }

        const imageNode = this._connectedImageNode.getComponent(InputNodeImage.getTypeName() as any) as InputNodeImage;
        if (imageNode) {
            return imageNode.getOutputData();
        }

        return null;
    }

    /**
     * Performs the actual generation using Gemini API
     */
    private performGeneration(textData: { promptText: string; textComponent: Text | null } | null, imageData: { texture: Texture | null; material: Material | null; imageComponent: Image | null } | null): void {
        if (this._isGenerating) {
            print(`ProcessImageGenNode: Already generating, please wait...`);
            this.updateStatus("Already generating...");
            return;
        }

        if (!textData || !textData.promptText || textData.promptText.trim() === "") {
            print(`ProcessImageGenNode: ERROR - No text prompt provided`);
            this.updateStatus("Error: Text prompt is required");
            return;
        }

        const prompt = textData.promptText.trim();
        const sourceImage = imageData?.texture || null;

        this._isGenerating = true;
        this.setLoading(true);
        this.updateStatus("Generating image...");

        print(`ProcessImageGenNode: Starting generation`);
        print(`  Prompt: ${prompt}`);
        print(`  Source Image: ${sourceImage ? "present (image-to-image)" : "none (text-to-image)"}`);

        if (sourceImage) {
            // Image-to-image generation
            this.generateImageFromImage(prompt, sourceImage);
        } else {
            // Text-to-image generation
            this.generateImageFromText(prompt);
        }
    }

    /**
     * Check if Remote Service Gateway credentials are configured
     */
    private checkCredentials(): boolean {
        const googleToken = RemoteServiceGatewayCredentials.getApiToken(AvaliableApiTypes.Google);
        if (!googleToken || googleToken === "[INSERT GOOGLE TOKEN HERE]" || googleToken.trim() === "") {
            print("ProcessImageGenNode: WARNING - Google/Gemini token not configured!");
            print("ProcessImageGenNode: Please add RemoteServiceGatewayCredentials component to a SceneObject and configure your Google token");
            this.updateStatus("Error: API credentials not configured. Please set up RemoteServiceGatewayCredentials.");
            return false;
        }
        return true;
    }

    /**
     * Generate image from text prompt using Gemini
     */
    private generateImageFromText(prompt: string): void {
        // Check credentials before making API call
        if (!this.checkCredentials()) {
            this._isGenerating = false;
            this.setLoading(false);
            return;
        }

        const request: GeminiTypes.Models.GenerateContentRequest = {
            model: "gemini-2.0-flash-preview-image-generation",
            type: "generateContent",
            body: {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ],
                        role: "user"
                    }
                ],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"]
                }
            }
        };

        print("ProcessImageGenNode: Sending text-to-image request to Gemini...");
        Gemini.models(request)
            .then((response) => {
                print("ProcessImageGenNode: Gemini response received");

                if (!response.candidates || response.candidates.length === 0) {
                    throw new Error("No image generated in response");
                }

                let foundImage = false;
                for (const part of response.candidates[0].content.parts) {
                    if (part?.inlineData) {
                        foundImage = true;
                        const b64Data = part.inlineData.data;
                        print("ProcessImageGenNode: Found image data in response, decoding...");
                        Base64.decodeTextureAsync(
                            b64Data,
                            (texture) => {
                                print("ProcessImageGenNode: Texture decoded successfully");
                                this.displayGeneratedImage(texture);
                                this._isGenerating = false;
                                this.setLoading(false);
                                this.updateStatus("Image generated successfully!");
                            },
                            () => {
                                throw new Error("Failed to decode texture from base64 data");
                            }
                        );
                        break;
                    }
                }

                if (!foundImage) {
                    const responseStr = JSON.stringify(response, null, 2);
                    print("ProcessImageGenNode: No image data found. Full response: " + responseStr);
                    throw new Error("No image data found in response");
                }
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
                print("ProcessImageGenNode: Gemini API error: " + errorMessage);
                this.updateStatus("Error: " + errorMessage);
                this._isGenerating = false;
                this.setLoading(false);
            });
    }

    /**
     * Generate image from image + text prompt using Gemini (image-to-image)
     * Uses the texture from the cloned material to ensure no material sharing
     */
    private generateImageFromImage(prompt: string, sourceImage: Texture): void {
        // Check credentials before making API call
        if (!this.checkCredentials()) {
            this._isGenerating = false;
            this.setLoading(false);
            return;
        }

        // Ensure we're using the texture from the cloned material (not original)
        // The texture is already from the cloned material via getImageInputData()
        Base64.encodeTextureAsync(
            sourceImage,
            (base64Data) => {
                const request: GeminiTypes.Models.GenerateContentRequest = {
                    model: "gemini-2.0-flash-preview-image-generation",
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
                                        text: prompt
                                    }
                                ],
                                role: "user"
                            }
                        ],
                        generationConfig: {
                            responseModalities: ["TEXT", "IMAGE"]
                        }
                    }
                };

                print("ProcessImageGenNode: Sending image-to-image request to Gemini...");
                Gemini.models(request)
                    .then((response) => {
                        print("ProcessImageGenNode: Gemini image-to-image response received");

                        if (!response.candidates || response.candidates.length === 0) {
                            throw new Error("No image generated in response");
                        }

                        let foundImage = false;
                        for (const part of response.candidates[0].content.parts) {
                            if (part?.inlineData) {
                                foundImage = true;
                                const b64Data = part.inlineData.data;
                                print("ProcessImageGenNode: Found image data in response, decoding...");
                                Base64.decodeTextureAsync(
                                    b64Data,
                                    (texture) => {
                                        print("ProcessImageGenNode: Texture decoded successfully");
                                        this.displayGeneratedImage(texture);
                                        this._isGenerating = false;
                                        this.setLoading(false);
                                        this.updateStatus("Image generated successfully!");
                                    },
                                    () => {
                                        throw new Error("Failed to decode texture from base64 data");
                                    }
                                );
                                break;
                            }
                        }

                        if (!foundImage) {
                            const responseStr = JSON.stringify(response, null, 2);
                            print("ProcessImageGenNode: No image data found. Full response: " + responseStr);
                            throw new Error("No image data found in response");
                        }
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
                        print("ProcessImageGenNode: Gemini API error (image-to-image): " + errorMessage);
                        this.updateStatus("Error: " + errorMessage);
                        this._isGenerating = false;
                        this.setLoading(false);
                    });
            },
            () => {
                print("ProcessImageGenNode: Failed to encode source image");
                this.updateStatus("Error: Failed to encode source image");
                this._isGenerating = false;
                this.setLoading(false);
            },
            CompressionQuality.LowQuality,
            EncodingType.Png
        );
    }

    /**
     * Display the generated image in the output component
     * Creates its own material to avoid sharing with input nodes
     * Also stores the texture for output connections
     */
    private displayGeneratedImage(texture: Texture): void {
        // Store the generated texture for output connections
        this._generatedTexture = texture;
        
        // Ensure output image component exists
        if (!this.outputImage) {
            // Create output image component
            if (!this._outputImageObject) {
                this._outputImageObject = global.scene.createSceneObject("GeneratedImage");
                this._outputImageObject.setParent(this.sceneObject);
                const transform = this._outputImageObject.getTransform();
                transform.setLocalPosition(new vec3(0, -2, 0));
            }

            this.outputImage = this._outputImageObject.createComponent("Image") as Image;
            if (this.outputImage) {
                print("ProcessImageGenNode: Created output image component");
            }
        }

        if (this.outputImage && this.outputImage.mainPass) {
            // Ensure we have our own material (clone if needed to avoid sharing)
            let material = this.outputImage.mainPass.material;
            if (!material) {
                // Create a default material if none exists
                // Note: In Lens Studio, you might need to assign a material in the inspector
                // For now, we'll just set the texture
            } else if (!this._clonedOutputMaterial) {
                // Clone the material ONCE to ensure independence from input nodes
                try {
                    this._clonedOutputMaterial = material.clone();
                    this.outputImage.mainPass.material = this._clonedOutputMaterial;
                    print("ProcessImageGenNode: Cloned material for output image");
                } catch (e) {
                    print("ProcessImageGenNode: Could not clone material for output, using existing");
                }
            }

            // Set the texture on the image component (using independent material)
            this.outputImage.mainPass.baseTex = texture;
            print("ProcessImageGenNode: Generated image displayed and ready for output");
        } else {
            print("ProcessImageGenNode: WARNING - Could not set texture on output image");
        }
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
