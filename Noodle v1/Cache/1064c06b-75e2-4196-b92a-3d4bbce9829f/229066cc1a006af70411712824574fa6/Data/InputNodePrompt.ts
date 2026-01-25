import { BaseNode } from "./BaseNode";
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton";
import { VoiceToText } from "./VoiceToText";
import { BaseButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/BaseButton";

/**
 * InputNodePrompt - A specialized node for prompt/text input with voice-to-text
 * Extends BaseNode functionality with prompt content and output button
 */
@component
export class InputNodePrompt extends BaseScriptComponent {
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
    @hint("Text component for displaying prompt text (will be created if not set)")
    @allowUndefined
    public promptText: Text | null = null;

    @input
    @hint("Voice to text component (will be created if not set)")
    @allowUndefined
    public voiceToTextComponent: VoiceToText | null = null;

    @input
    @hint("Button for voice-to-text (will be created if not set)")
    @allowUndefined
    public voiceButton: BaseButton | null = null;

    @input
    @hint("Parent object for all voice-related UI (voice button, text display, etc.)")
    @allowUndefined
    public voiceContainer: SceneObject | null = null;

    private _initialized: boolean = false;
    private _titleTextObject: SceneObject | null = null;
    private _outputButtonObject: SceneObject | null = null;
    private _contentObject: SceneObject | null = null;
    private _voiceButtonObject: SceneObject | null = null;
    private _voiceContainerObject: SceneObject | null = null;
    private _onStartCalled: boolean = false;
    
    // Reference to prompt text for external access
    private _promptTextReference: Text | null = null;

    onAwake() {
        print(`InputNodePrompt: onAwake called`);

        // Ensure BaseNode is set
        if (!this.baseNode) {
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print("InputNodePrompt: ERROR - BaseNode component not found! Please add BaseNode component to this SceneObject.");
                return;
            }
            print(`InputNodePrompt: Found BaseNode component`);
        } else {
            print(`InputNodePrompt: BaseNode already assigned`);
        }

        // Set node type to "text" for prompt input
        if (this.baseNode) {
            this.baseNode.nodeType = "text";
            print(`InputNodePrompt: Set BaseNode type to: text`);
        }

        print(`InputNodePrompt: onAwake complete`);
        
        // Fallback: If onStart doesn't get called, try to initialize in UpdateEvent
        let fallbackAttempts = 0;
        this.createEvent("UpdateEvent").bind(() => {
            if (!this._onStartCalled && fallbackAttempts > 5) {
                print(`InputNodePrompt: WARNING - onStart not called after ${fallbackAttempts} frames, calling manually...`);
                this._onStartCalled = true;
                this.onStart();
            }
            fallbackAttempts++;
        });
    }

    onStart() {
        this._onStartCalled = true;
        print(`InputNodePrompt: onStart called, baseNode exists=${!!this.baseNode}`);

        // Check if baseNode is available
        if (!this.baseNode) {
            print(`InputNodePrompt: ERROR - baseNode is null in onStart, trying to find it...`);
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print(`InputNodePrompt: ERROR - Still cannot find BaseNode, setup will fail`);
                return;
            }
        }

        // Try immediate setup if frame is already available
        const frame = this.baseNode.getFrame();
        if (frame) {
            print(`InputNodePrompt: Frame is already available, attempting immediate setup...`);
            this.createEvent("UpdateEvent").bind(() => {
                if (!this._initialized) {
                    this.setupNode();
                    this._initialized = true;
                }
            });
            return;
        }

        // Wait for BaseNode frame to initialize
        let frameCheckAttempts = 0;
        const maxFrameCheckAttempts = 120;
        
        this.createEvent("UpdateEvent").bind(() => {
            if (!this._initialized && this.baseNode) {
                const frame = this.baseNode.getFrame();
                frameCheckAttempts++;
                
                if (frameCheckAttempts % 20 === 0) {
                    print(`InputNodePrompt: Frame check attempt ${frameCheckAttempts}/${maxFrameCheckAttempts}, frame exists=${!!frame}`);
                }
                
                if (frame) {
                    const frameReady = frame.roundedRectangle !== undefined || frameCheckAttempts > 5;
                    
                    if (frameReady) {
                        print(`InputNodePrompt: Frame is ready (attempt ${frameCheckAttempts}), setting up node...`);
                        this.setupNode();
                        this._initialized = true;
                        print(`InputNodePrompt: Node setup complete!`);
                        return;
                    }
                }
                
                if (frameCheckAttempts >= maxFrameCheckAttempts && !this._initialized) {
                    print(`InputNodePrompt: WARNING - Frame check timeout, attempting setup anyway...`);
                    this.setupNode();
                    this._initialized = true;
                }
            }
        });
    }

    /**
     * Sets up the node UI
     */
    private setupNode(): void {
        print(`InputNodePrompt: setupNode() called`);
        
        if (!this.baseNode) {
            print(`InputNodePrompt: ERROR - baseNode is null, cannot setup node`);
            return;
        }

        const frame = this.baseNode.getFrame();
        if (!frame) {
            print(`InputNodePrompt: ERROR - Frame is null, cannot setup node`);
            return;
        }

        print(`InputNodePrompt: BaseNode and Frame are ready, starting UI setup...`);

        // Create title
        this.setupTitle();

        // Create output button
        this.setupOutputButton();

        // Create prompt content
        this.setupPromptContent();

        print(`InputNodePrompt: setupNode() complete!`);
    }

    /**
     * Sets up the title text component
     */
    private setupTitle(): void {
        if (this.titleText) {
            this.updateTitle();
            return;
        }

        // Create title text object
        this._titleTextObject = global.scene.createSceneObject("InputNodePrompt_Title");
        this._titleTextObject.setParent(this.sceneObject);
        this._titleTextObject.enabled = true;

        // Create Text component
        this.titleText = this._titleTextObject.createComponent("Component.Text") as Text;
        if (this.titleText) {
            this.titleText.text = "Prompt Input";
            this.titleText.horizontalAlignment = HorizontalAlignment.Center;
            this.titleText.verticalAlignment = VerticalAlignment.Center;
            
            // Position at top of frame
            const transform = this._titleTextObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                transform.setLocalPosition(new vec3(0, frameSize.y / 200 + 0.05, 0.01));
            } else {
                transform.setLocalPosition(new vec3(0, 0.05, 0.01));
            }

            print(`InputNodePrompt: Created title text component`);
        }
    }

    /**
     * Updates the title text
     */
    private updateTitle(): void {
        if (this.titleText) {
            this.titleText.text = "Prompt Input";
        }
    }

    /**
     * Sets up the output button (round button at connection point)
     */
    private setupOutputButton(): void {
        if (this.outputButton) {
            return;
        }

        // Create output button object
        this._outputButtonObject = global.scene.createSceneObject("InputNodePrompt_OutputButton");
        this._outputButtonObject.setParent(this.sceneObject);

        // Create RoundButton component
        this.outputButton = this._outputButtonObject.createComponent(RoundButton.getTypeName() as any) as RoundButton;
        if (this.outputButton) {
            this.outputButton.width = 2;
            // Position at right center (output connection point)
            const transform = this._outputButtonObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                transform.setLocalPosition(new vec3(frameSize.x / 200, 0, 0)); // Convert cm to meters
            }

            // Set up button click tracking
            this.setupButtonClickTracking();

            print("InputNodePrompt: Created output button");
        }
    }

    /**
     * Sets up prompt content (Text component + voice-to-text integration)
     */
    private setupPromptContent(): void {
        // Create voice container if not set
        this.setupVoiceContainer();

        // Ensure container is enabled
        if (this._voiceContainerObject) {
            this._voiceContainerObject.enabled = true;
        }

        if (this.promptText) {
            return; // Already set
        }

        // Create content object (prompt text) - parent to voice container
        this._contentObject = global.scene.createSceneObject("InputNodePrompt_PromptText");
        if (this._voiceContainerObject) {
            this._contentObject.setParent(this._voiceContainerObject);
        } else {
            this._contentObject.setParent(this.sceneObject);
        }

        // Create Text component for displaying prompt
        this.promptText = this._contentObject.createComponent("Component.Text") as Text;
        if (this.promptText) {
            this.promptText.text = "Tap voice button to record...";
            const transform = this._contentObject.getTransform();
            transform.setLocalPosition(new vec3(0, -1, 0));

            // Keep reference for external access
            this._promptTextReference = this.promptText;

            print("InputNodePrompt: Created prompt Text component");
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
            return;
        }

        // Create voice container object
        this._voiceContainerObject = global.scene.createSceneObject("InputNodePrompt_VoiceContainer");
        this._voiceContainerObject.setParent(this.sceneObject);
        this.voiceContainer = this._voiceContainerObject;

        const transform = this._voiceContainerObject.getTransform();
        transform.setLocalPosition(new vec3(0, -1, 0));

        print("InputNodePrompt: Created voice container");
    }

    /**
     * Sets up the voice button for triggering voice-to-text
     */
    private setupVoiceButton(): void {
        if (this.voiceButton) {
            return;
        }

        // Create voice button object - parent to voice container
        this._voiceButtonObject = global.scene.createSceneObject("InputNodePrompt_VoiceButton");
        if (this._voiceContainerObject) {
            this._voiceButtonObject.setParent(this._voiceContainerObject);
        } else {
            this._voiceButtonObject.setParent(this.sceneObject);
        }

        // Create RoundButton for voice input
        const voiceButton = this._voiceButtonObject.createComponent(RoundButton.getTypeName() as any) as RoundButton;
        if (voiceButton) {
            voiceButton.width = 3;
            const transform = this._voiceButtonObject.getTransform();
            transform.setLocalPosition(new vec3(-4, 0, 0));

            this.voiceButton = voiceButton;
            print("InputNodePrompt: Created voice button");
        }
    }

    /**
     * Sets up voice-to-text integration
     */
    private setupVoiceToText(): void {
        // If VoiceToText component is not set, try to find or create it
        if (!this.voiceToTextComponent) {
            this.voiceToTextComponent = this.sceneObject.getComponent(VoiceToText.getTypeName() as any) as VoiceToText | null;

            if (!this.voiceToTextComponent) {
                this.voiceToTextComponent = this.sceneObject.createComponent(VoiceToText.getTypeName() as any) as VoiceToText;
                print("InputNodePrompt: Created VoiceToText component");
            } else {
                print("InputNodePrompt: Found existing VoiceToText component");
            }
        }

        if (this.voiceToTextComponent && this.voiceButton && this.promptText) {
            // Connect voice button to VoiceToText
            const vtt = this.voiceToTextComponent as any;
            vtt.toggleButton = this.voiceButton;
            vtt.transcriptionText = this.promptText;

            // Set up callback to update prompt text when transcription stops
            this.voiceToTextComponent.onTranscriptionStopped(() => {
                const transcribedText = this.voiceToTextComponent?.getTranscribedText() || "";
                if (this.promptText && transcribedText) {
                    this.promptText.text = transcribedText;
                    print(`InputNodePrompt: Updated prompt text from voice: "${transcribedText}"`);
                }
            });

            print("InputNodePrompt: Voice-to-text integration complete");
        } else {
            print("InputNodePrompt: Warning - Voice-to-text setup incomplete. Missing components.");
        }
    }

    /**
     * Gets the current prompt text
     */
    public getPromptText(): string {
        if (this.promptText) {
            return this.promptText.text || "";
        }
        if (this.voiceToTextComponent) {
            return this.voiceToTextComponent.getTranscribedText();
        }
        return "";
    }

    /**
     * Sets the prompt text
     */
    public setPromptText(text: string): void {
        if (this.promptText) {
            this.promptText.text = text;
        }
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
}
