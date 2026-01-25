import { BaseNode } from "./BaseNode";
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton";
import { CapsuleButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/CapsuleButton";
import { BezierCurve } from "../../RuntimeGizmos.lspkg/Scripts/BezierCurve";
import { InputNodePrompt } from "./InputNodePrompt";
import { InputNodeImage } from "./InputNodeImage";
import { NodeConnectionController } from "./NodeConnectionController";

/**
 * Process3DNode - A process node for 3D generation
 * Accepts: Text prompt OR Image OR Both (any combination is valid)
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

    // Connected input nodes
    private _connectedTextNode: SceneObject | null = null;
    private _connectedImageNode: SceneObject | null = null;
    private _textConnectionCurve: BezierCurve | null = null;
    private _imageConnectionCurve: BezierCurve | null = null;

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
    private _textConnections: Map<string, { sourceNode: SceneObject; curve: BezierCurve; connectionId: string }> = new Map();
    private _imageConnections: Map<string, { sourceNode: SceneObject; curve: BezierCurve; connectionId: string }> = new Map();

    onAwake() {
        print(`Process3DNode: onAwake called`);

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
        const controller = NodeConnectionController.getInstance();
        if (controller) {
            controller.onProcessNodeInputClicked(this.sceneObject, "text", this._textInputButtonId);
        } else {
            print(`Process3DNode: WARNING - NodeConnectionController not found!`);
        }
    }

    /**
     * Called when image input section is clicked
     */
    private onImageInputSectionClicked(): void {
        print(`Process3DNode: Image input section clicked (Button ID: ${this._imageInputButtonId})`);
        const controller = NodeConnectionController.getInstance();
        if (controller) {
            controller.onProcessNodeInputClicked(this.sceneObject, "image", this._imageInputButtonId);
        } else {
            print(`Process3DNode: WARNING - NodeConnectionController not found!`);
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

        // Create BezierCurve connection
        const curve = this.createTextConnection(sourceNode, promptNode, connectionId);
        if (!curve) {
            print(`Process3DNode: Failed to create text connection curve`);
            return false;
        }

        // Store connection info
        this._textConnections.set(connectionId, {
            sourceNode: sourceNode,
            curve: curve,
            connectionId: connectionId
        });

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
     */
    public connectImageInput(sourceNode: SceneObject, sourceButtonId: string = ""): boolean {
        const imageNode = sourceNode.getComponent(InputNodeImage.getTypeName() as any) as InputNodeImage;
        if (!imageNode) {
            print(`Process3DNode: Source node is not an InputNodeImage`);
            return false;
        }

        // Generate unique connection ID
        const connectionId = `image_${sourceButtonId || imageNode.getOutputButtonId()}_${this._imageInputButtonId}_${Date.now()}`;
        
        // Check if this exact connection already exists
        if (this._imageConnections.has(connectionId)) {
            print(`Process3DNode: Image connection already exists: ${connectionId}`);
            return false;
        }

        // Add to child nodes (input node tracks this)
        imageNode.addChildNode(this.sceneObject);

        // Create BezierCurve connection
        const curve = this.createImageConnection(sourceNode, imageNode, connectionId);
        if (!curve) {
            print(`Process3DNode: Failed to create image connection curve`);
            return false;
        }

        // Store connection info
        this._imageConnections.set(connectionId, {
            sourceNode: sourceNode,
            curve: curve,
            connectionId: connectionId
        });

        // Set first connected node for data access (can be any of them)
        if (!this._connectedImageNode) {
            this._connectedImageNode = sourceNode;
        }

        // Update generate button state
        this.updateGenerateButtonState();

        print(`Process3DNode: Image input connected from ${sourceNode.name} (Connection ID: ${connectionId}, Total: ${this._imageConnections.size})`);
        return true;
    }

    private createTextConnection(sourceNode: SceneObject, promptNode: InputNodePrompt, connectionId: string): BezierCurve | null {
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

        // Create connection object
        const connectionObject = global.scene.createSceneObject("Process3D_TextConnection");
        connectionObject.setParent(this.sceneObject);

        // Create start point at source node's output button
        const startPoint = global.scene.createSceneObject("TextConnection_Start");
        const startPos = promptNode.getOutputButtonWorldPosition();
        if (startPos) {
            startPoint.getTransform().setWorldPosition(startPos);
        }
        startPoint.setParent(connectionObject);

        // Create end point at text input section
        const endPoint = global.scene.createSceneObject("TextConnection_End");
        endPoint.getTransform().setWorldPosition(this._textInputSectionObject.getTransform().getWorldPosition());
        endPoint.setParent(connectionObject);

        // Create BezierCurve
        const bezierCurve = connectionObject.createComponent(BezierCurve.getTypeName() as any) as BezierCurve;
        if (bezierCurve) {
            bezierCurve.startPoint = startPoint;
            bezierCurve.endPoint = endPoint;
            if (material) {
                bezierCurve.lineMaterial = material;
            }
            bezierCurve.curveHeight = 0.2;
            bezierCurve.interpolationPoints = 20;
            this._textConnectionCurve = bezierCurve;
            print(`Process3DNode: Text connection curve created`);
        }
    }

    private createImageConnection(sourceNode: SceneObject, imageNode: InputNodeImage): void {
        if (!this._imageInputSectionObject) {
            print(`Process3DNode: Cannot create image connection - missing input section`);
            return;
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

        // Create connection object
        const connectionObject = global.scene.createSceneObject("Process3D_ImageConnection");
        connectionObject.setParent(this.sceneObject);

        // Create start point at source node's output button
        const startPoint = global.scene.createSceneObject("ImageConnection_Start");
        const startPos = imageNode.getOutputButtonWorldPosition();
        if (startPos) {
            startPoint.getTransform().setWorldPosition(startPos);
        }
        startPoint.setParent(connectionObject);

        // Create end point at image input section
        const endPoint = global.scene.createSceneObject("ImageConnection_End");
        endPoint.getTransform().setWorldPosition(this._imageInputSectionObject.getTransform().getWorldPosition());
        endPoint.setParent(connectionObject);

        // Create BezierCurve
        const bezierCurve = connectionObject.createComponent(BezierCurve.getTypeName() as any) as BezierCurve;
        if (bezierCurve) {
            bezierCurve.startPoint = startPoint;
            bezierCurve.endPoint = endPoint;
            if (material) {
                bezierCurve.lineMaterial = material;
            }
            bezierCurve.curveHeight = 0.2;
            bezierCurve.interpolationPoints = 20;
            this._imageConnectionCurve = bezierCurve;
            print(`Process3DNode: Image connection curve created`);
        }
    }

    /**
     * Checks if generation can be performed (validation)
     * 3D generation accepts: Text OR Image OR Both
     */
    public canGenerate(): boolean {
        const hasText = this._connectedTextNode !== null;
        const hasImage = this._connectedImageNode !== null;

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
     * Performs the actual generation (to be implemented with API calls)
     */
    private performGeneration(textData: { promptText: string; textComponent: Text | null } | null, imageData: { texture: Texture | null; material: Material | null; imageComponent: Image | null } | null): void {
        // TODO: Implement actual 3D generation
        print(`Process3DNode: performGeneration called`);
        print(`  Text: ${textData?.promptText || "none"}`);
        print(`  Image: ${imageData?.texture ? "present" : "none"}`);
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
