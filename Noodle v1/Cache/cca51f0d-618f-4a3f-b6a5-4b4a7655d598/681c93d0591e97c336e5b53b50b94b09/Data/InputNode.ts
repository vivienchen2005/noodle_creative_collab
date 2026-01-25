import { BaseNode } from "./BaseNode";
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton";
import { Frame } from "SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame";
import { VoiceToText } from "./VoiceToText";
import { BaseButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/BaseButton";

/**
 * InputNode - A specialized node for input types (image or prompt)
 * Extends BaseNode functionality with type-specific content and output button
 */
@component
export class InputNode extends BaseScriptComponent {
    @input
    @hint("Input type: image or prompt")
    @widget(
        new ComboBoxWidget()
            .addItem("Prompt", "prompt")
            .addItem("Image", "image")
    )
    public inputType: string = "prompt";

    @input
    @hint("BaseNode component (required)")
    public baseNode: BaseNode | null = null;

    @input
    @hint("Title text component (optional - will be created if not set)")
    @allowUndefined
    public titleText: Text | null = null;

    @input
    @hint("Round button for output connection (will be created if not set)")
    @allowUndefined
    public outputButton: RoundButton | null = null;

    @input
    @hint("Image component for image type (will be created if not set)")
    @allowUndefined
    public imageComponent: Image | null = null;

    @input
    @hint("Text component for displaying prompt text (will be created if not set)")
    @allowUndefined
    public promptText: Text | null = null;

    @input
    @hint("Voice to text component (for prompt type)")
    @allowUndefined
    public voiceToTextComponent: VoiceToText | null = null;

    @input
    @hint("Button for voice-to-text (will be created if not set)")
    @allowUndefined
    public voiceButton: BaseButton | null = null;

    @input
    @hint("Camera service for image capture (for image type)")
    @allowUndefined
    public cameraService: ScriptComponent | null = null;

    @input
    @hint("Parent object for all voice-related UI (voice button, text display, etc.)")
    @allowUndefined
    public voiceContainer: SceneObject | null = null;

    @input
    @hint("Parent object for all image-related UI (image display, etc.)")
    @allowUndefined
    public imageContainer: SceneObject | null = null;

    private _initialized: boolean = false;
    private _titleTextObject: SceneObject | null = null;
    private _outputButtonObject: SceneObject | null = null;
    private _contentObject: SceneObject | null = null;
    private _voiceButtonObject: SceneObject | null = null;
    private _voiceContainerObject: SceneObject | null = null;
    private _imageContainerObject: SceneObject | null = null;
    private _lastInputType: string = "";

    onAwake() {
        // Ensure BaseNode is set
        if (!this.baseNode) {
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print("InputNode: ERROR - BaseNode component not found! Please add BaseNode component to this SceneObject.");
                return;
            }
        }

        // Set node type based on input type
        if (this.baseNode) {
            this.baseNode.nodeType = this.inputType;
        }

        print(`InputNode: Initialized with input type: ${this.inputType}`);
    }

    onStart() {
        // Initialize last input type
        this._lastInputType = this.inputType;

        // Wait for BaseNode frame to initialize
        this.createEvent("UpdateEvent").bind(() => {
            if (!this._initialized && this.baseNode) {
                const frame = this.baseNode.getFrame();
                if (frame && frame.roundedRectangle) {
                    this.setupNode();
                    this._initialized = true;
                }
            }

            // Check if input type changed (e.g., from inspector) and update title
            if (this._initialized && this.inputType !== this._lastInputType) {
                print(`InputNode: Input type changed from "${this._lastInputType}" to "${this.inputType}"`);
                this._lastInputType = this.inputType;

                // Update BaseNode type
                if (this.baseNode) {
                    this.baseNode.nodeType = this.inputType;
                }

                // Update title immediately
                this.updateTitle();

                // Also update UI visibility
                if (this.inputType === "prompt") {
                    this.showVoiceUI();
                    this.hideImageUI();
                } else if (this.inputType === "image") {
                    this.hideVoiceUI();
                    this.showImageUI();
                }

                print(`InputNode: Title should now be: "${this.getTitleText()}"`);
            }
        });
    }

    /**
     * Sets up the node UI based on input type
     */
    private setupNode(): void {
        if (!this.baseNode) {
            return;
        }

        const frame = this.baseNode.getFrame();
        if (!frame) {
            return;
        }

        // Create title
        this.setupTitle();

        // Create output button
        this.setupOutputButton();

        // Create content based on type
        if (this.inputType === "prompt") {
            this.setupPromptContent();
            this.showVoiceUI();
            this.hideImageUI();
        } else if (this.inputType === "image") {
            this.setupImageContent();
            this.hideVoiceUI();
            this.showImageUI();
        }

        // Update title text
        this.updateTitle();
    }

    /**
     * Sets up the title text component
     */
    private setupTitle(): void {
        if (this.titleText) {
            // Title already exists, just update it
            this.updateTitle();
            return;
        }

        // Create title text object
        this._titleTextObject = global.scene.createSceneObject("InputNode_Title");
        this._titleTextObject.setParent(this.sceneObject);
        this._titleTextObject.enabled = true; // Ensure it's enabled

        // Create Text component
        this.titleText = this._titleTextObject.createComponent("Component.Text") as Text;
        if (this.titleText) {
            // Set text properties
            this.titleText.text = this.getTitleText();
            this.titleText.horizontalAlignment = HorizontalAlignment.Center;
            this.titleText.verticalAlignment = VerticalAlignment.Center;

            // Position at top of frame (relative to BaseNode frame size)
            const transform = this._titleTextObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                // Position at top center of frame (convert cm to meters: divide by 100)
                // frameSize is in cm, so divide by 100 to get meters, then add offset
                transform.setLocalPosition(new vec3(0, frameSize.y / 200 + 0.05, 0.01)); // Slightly forward to be visible
            } else {
                transform.setLocalPosition(new vec3(0, 0.05, 0.01)); // Default position
            }

            print(`InputNode: Created title text component with text: "${this.titleText.text}" at position: ${transform.getLocalPosition().x}, ${transform.getLocalPosition().y}, ${transform.getLocalPosition().z}`);
        } else {
            print("InputNode: ERROR - Failed to create Text component for title");
        }
    }

    /**
     * Sets up the output button (round button at connection point)
     */
    private setupOutputButton(): void {
        if (this.outputButton) {
            return; // Already set
        }

        // Create output button object
        this._outputButtonObject = global.scene.createSceneObject("InputNode_OutputButton");
        this._outputButtonObject.setParent(this.sceneObject);

        // Create RoundButton component
        this.outputButton = this._outputButtonObject.createComponent(RoundButton.getTypeName() as any) as RoundButton;
        if (this.outputButton) {
            this.outputButton.width = 2; // Size of the button
            // Position at right center (output connection point)
            const transform = this._outputButtonObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                transform.setLocalPosition(new vec3(frameSize.x / 2, 0, 0));
            }

            // Set button text/label if needed
            // Note: RoundButton might need additional setup for text display

            print("InputNode: Created output button");
        }
    }

    /**
     * Sets up prompt content (Text component + voice-to-text integration)
     */
    private setupPromptContent(): void {
        // Create voice container if not set
        this.setupVoiceContainer();

        if (this.promptText) {
            return; // Already set
        }

        // Create content object (prompt text) - parent to voice container
        this._contentObject = global.scene.createSceneObject("InputNode_PromptText");
        if (this._voiceContainerObject) {
            this._contentObject.setParent(this._voiceContainerObject);
        } else {
            this._contentObject.setParent(this.sceneObject);
        }

        // Create Text component for displaying prompt
        this.promptText = this._contentObject.createComponent("Component.Text") as Text;
        if (this.promptText) {
            this.promptText.text = "Tap voice button to record...";
            // Position in center of frame
            const transform = this._contentObject.getTransform();
            transform.setLocalPosition(new vec3(0, -1, 0)); // Adjust as needed

            print("InputNode: Created prompt Text component");
        }

        // Create voice button if not set
        this.setupVoiceButton();

        // Integrate with voice-to-text component
        this.setupVoiceToText();
    }

    /**
     * Sets up the voice container (parent object for all voice-related UI)
     */
    private setupVoiceContainer(): void {
        if (this.voiceContainer) {
            this._voiceContainerObject = this.voiceContainer;
            return; // Already set
        }

        // Create voice container object
        this._voiceContainerObject = global.scene.createSceneObject("InputNode_VoiceContainer");
        this._voiceContainerObject.setParent(this.sceneObject);
        this.voiceContainer = this._voiceContainerObject;

        // Position at center (children will be positioned relative to this)
        const transform = this._voiceContainerObject.getTransform();
        transform.setLocalPosition(new vec3(0, -1, 0));

        print("InputNode: Created voice container");
    }

    /**
     * Sets up the voice button for triggering voice-to-text
     */
    private setupVoiceButton(): void {
        if (this.voiceButton) {
            return; // Already set
        }

        // Create voice button object - parent to voice container
        this._voiceButtonObject = global.scene.createSceneObject("InputNode_VoiceButton");
        if (this._voiceContainerObject) {
            this._voiceButtonObject.setParent(this._voiceContainerObject);
        } else {
            this._voiceButtonObject.setParent(this.sceneObject);
        }

        // Create RoundButton for voice input
        const voiceButton = this._voiceButtonObject.createComponent(RoundButton.getTypeName() as any) as RoundButton;
        if (voiceButton) {
            voiceButton.width = 3; // Size of the button
            // Position to the left of the text (relative to voice container)
            const transform = this._voiceButtonObject.getTransform();
            transform.setLocalPosition(new vec3(-4, 0, 0)); // Adjust as needed

            this.voiceButton = voiceButton;
            print("InputNode: Created voice button");
        }
    }

    /**
     * Sets up voice-to-text integration
     */
    private setupVoiceToText(): void {
        // If VoiceToText component is not set, try to find or create it
        if (!this.voiceToTextComponent) {
            // Try to find existing VoiceToText component on this object
            this.voiceToTextComponent = this.sceneObject.getComponent(VoiceToText.getTypeName() as any) as VoiceToText | null;

            if (!this.voiceToTextComponent) {
                // Create VoiceToText component
                this.voiceToTextComponent = this.sceneObject.createComponent(VoiceToText.getTypeName() as any) as VoiceToText;
                print("InputNode: Created VoiceToText component");
            } else {
                print("InputNode: Found existing VoiceToText component");
            }
        }

        if (this.voiceToTextComponent && this.voiceButton && this.promptText) {
            // Connect voice button to VoiceToText (using type assertion to access private properties)
            // Note: These are @input properties, so they should be accessible at runtime
            const vtt = this.voiceToTextComponent as any;
            vtt.toggleButton = this.voiceButton;
            vtt.transcriptionText = this.promptText;

            // Set up callback to update prompt text when transcription stops
            this.voiceToTextComponent.onTranscriptionStopped(() => {
                const transcribedText = this.voiceToTextComponent?.getTranscribedText() || "";
                if (this.promptText && transcribedText) {
                    this.promptText.text = transcribedText;
                    print(`InputNode: Updated prompt text from voice: "${transcribedText}"`);
                }
            });

            print("InputNode: Voice-to-text integration complete");
        } else {
            print("InputNode: Warning - Voice-to-text setup incomplete. Missing components.");
        }
    }

    /**
     * Sets up image content (Image component for screen grab/clone)
     */
    private setupImageContent(): void {
        // Create image container if not set
        this.setupImageContainer();

        if (this.imageComponent) {
            return; // Already set
        }

        // Create content object (image) - parent to image container
        this._contentObject = global.scene.createSceneObject("InputNode_ImageContent");
        if (this._imageContainerObject) {
            this._contentObject.setParent(this._imageContainerObject);
        } else {
            this._contentObject.setParent(this.sceneObject);
        }

        // Create Image component
        this.imageComponent = this._contentObject.createComponent("Component.Image") as Image;
        if (this.imageComponent) {
            // Position in center of frame (relative to container)
            const transform = this._contentObject.getTransform();
            transform.setLocalPosition(new vec3(0, 0, 0)); // Adjust as needed

            // Set up image size
            const imageTransform = this.imageComponent.sceneObject.getTransform();
            imageTransform.setLocalScale(new vec3(6, 6, 1)); // Adjust size as needed

            print("InputNode: Created image component");
        }

        // TODO: Integrate with camera service for screen grab
        if (this.cameraService) {
            // Connect camera service to image component
            print("InputNode: Camera service found, will integrate for image capture");
        }
    }

    /**
     * Sets up the image container (parent object for all image-related UI)
     */
    private setupImageContainer(): void {
        if (this.imageContainer) {
            this._imageContainerObject = this.imageContainer;
            return; // Already set
        }

        // Create image container object
        this._imageContainerObject = global.scene.createSceneObject("InputNode_ImageContainer");
        this._imageContainerObject.setParent(this.sceneObject);
        this.imageContainer = this._imageContainerObject;

        // Position at center (children will be positioned relative to this)
        const transform = this._imageContainerObject.getTransform();
        transform.setLocalPosition(new vec3(0, -1, 0));

        print("InputNode: Created image container");
    }

    /**
     * Gets the title text based on input type
     */
    private getTitleText(): string {
        if (this.inputType === "prompt") {
            return "Prompt Input";
        } else if (this.inputType === "image") {
            return "Image Input";
        }
        return "Input";
    }

    /**
     * Updates the title text
     */
    private updateTitle(): void {
        const newTitle = this.getTitleText();

        if (this.titleText) {
            this.titleText.text = newTitle;
            print(`InputNode: Title updated to: "${newTitle}"`);
        } else {
            // If title doesn't exist yet, try to create it
            print(`InputNode: Title text component not found, attempting to create it...`);
            this.setupTitle();
        }

        // Also ensure the title object is enabled
        if (this._titleTextObject) {
            this._titleTextObject.enabled = true;
        }
    }

    /**
     * Gets the current prompt text (for prompt type)
     */
    public getPromptText(): string {
        if (this.inputType === "prompt" && this.promptText) {
            return this.promptText.text || "";
        }
        // Also try to get from VoiceToText if available
        if (this.inputType === "prompt" && this.voiceToTextComponent) {
            return this.voiceToTextComponent.getTranscribedText();
        }
        return "";
    }

    /**
     * Sets the prompt text (for prompt type)
     */
    public setPromptText(text: string): void {
        if (this.inputType === "prompt" && this.promptText) {
            this.promptText.text = text;
        }
    }

    /**
     * Gets the image texture (for image type)
     */
    public getImageTexture(): Texture | null {
        if (this.inputType === "image" && this.imageComponent) {
            return this.imageComponent.mainPass.baseTex;
        }
        return null;
    }

    /**
     * Sets the image texture (for image type)
     */
    public setImageTexture(texture: Texture): void {
        if (this.inputType === "image" && this.imageComponent) {
            this.imageComponent.mainPass.baseTex = texture;
        }
    }

    /**
     * Gets the input type
     */
    public getInputType(): string {
        return this.inputType;
    }

    /**
     * Sets the input type and updates UI
     */
    public setInputType(type: string): void {
        if (type !== "prompt" && type !== "image") {
            print("InputNode: Invalid input type. Must be 'prompt' or 'image'");
            return;
        }

        this.inputType = type;
        this._lastInputType = type; // Update tracked type

        // Update BaseNode type
        if (this.baseNode) {
            this.baseNode.nodeType = type;
        }

        // Update title
        this.updateTitle();

        // Recreate content based on new type
        if (this._contentObject) {
            this._contentObject.destroy();
            this._contentObject = null;
            this.promptText = null;
            this.imageComponent = null;
        }

        // Show/hide UI containers based on type (mutually exclusive)
        if (type === "prompt") {
            this.showVoiceUI();
            this.hideImageUI();
        } else if (type === "image") {
            this.hideVoiceUI();
            this.showImageUI();
        }

        if (this.inputType === "prompt") {
            this.setupPromptContent();
        } else if (this.inputType === "image") {
            this.setupImageContent();
        }

        print(`InputNode: Input type changed to ${type}`);
    }

    /**
     * Gets the output button (for connection handling)
     */
    public getOutputButton(): RoundButton | null {
        return this.outputButton;
    }

    /**
     * Gets the BaseNode component
     */
    public getBaseNode(): BaseNode | null {
        return this.baseNode;
    }

    /**
     * Shows the voice UI container (voice button, text display, etc.)
     */
    public showVoiceUI(): void {
        if (this._voiceContainerObject) {
            this._voiceContainerObject.enabled = true;
            print("InputNode: Voice UI shown");
        } else if (this.inputType === "prompt") {
            // If container doesn't exist but we're in prompt mode, set it up
            this.setupPromptContent();
        }
    }

    /**
     * Hides the voice UI container (voice button, text display, etc.)
     */
    public hideVoiceUI(): void {
        if (this._voiceContainerObject) {
            this._voiceContainerObject.enabled = false;
            print("InputNode: Voice UI hidden");
        }
    }

    /**
     * Gets the voice container object
     */
    public getVoiceContainer(): SceneObject | null {
        return this._voiceContainerObject || this.voiceContainer;
    }

    /**
     * Shows the image UI container (image display, etc.)
     */
    public showImageUI(): void {
        if (this._imageContainerObject) {
            this._imageContainerObject.enabled = true;
            print("InputNode: Image UI shown");
        } else if (this.inputType === "image") {
            // If container doesn't exist but we're in image mode, set it up
            this.setupImageContent();
        }
    }

    /**
     * Hides the image UI container (image display, etc.)
     */
    public hideImageUI(): void {
        if (this._imageContainerObject) {
            this._imageContainerObject.enabled = false;
            print("InputNode: Image UI hidden");
        }
    }

    /**
     * Gets the image container object
     */
    public getImageContainer(): SceneObject | null {
        return this._imageContainerObject || this.imageContainer;
    }
}
