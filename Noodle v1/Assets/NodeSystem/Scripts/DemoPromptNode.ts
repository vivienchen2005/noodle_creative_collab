import { InputNodePrompt } from "./InputNodePrompt";
import { BaseButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/BaseButton";

/**
 * DemoPromptNode - Demo mode overlay for InputNodePrompt
 * 
 * When the voice button is clicked, instead of recording,
 * it immediately shows a preset demo text.
 * 
 * Add this script to the same SceneObject as InputNodePrompt.
 * Enable/disable this component to toggle demo mode.
 */
@component
export class DemoPromptNode extends BaseScriptComponent {
    @ui.separator
    @ui.label("Demo Mode Settings")
    @ui.separator

    @input
    @hint("The preset text to show when 'recording' in demo mode")
    @widget(new TextAreaInputWidget())
    public demoText: string = "A magical forest with glowing mushrooms";

    @input
    @hint("Array of demo texts to cycle through (if multiple demos)")
    public demoTexts: string[] = [];

    @input
    @hint("Delay before showing text (simulates recording time) in seconds")
    public simulatedDelay: number = 1.5;

    @input
    @hint("Show typing animation effect")
    public typewriterEffect: boolean = true;

    @input
    @hint("Typing speed (characters per second) for typewriter effect")
    public typingSpeed: number = 30;

    @ui.separator
    @ui.label("References")
    @ui.separator

    @input
    @hint("InputNodePrompt to control (auto-found if not set)")
    @allowUndefined
    public inputNodePrompt: InputNodePrompt | null = null;

    @input
    @hint("Voice button to intercept (auto-found if not set)")
    @allowUndefined
    public voiceButton: BaseButton | null = null;

    @input
    @hint("Objects to hide during demo (e.g., recording indicator)")
    public hideOnDemo: SceneObject[] = [];

    private _currentDemoIndex: number = 0;
    private _isShowingDemo: boolean = false;
    private _originalButtonHandler: boolean = false;

    onAwake() {
        print("[DemoPromptNode] Demo mode initializing...");

        // Find InputNodePrompt if not set
        if (!this.inputNodePrompt) {
            this.inputNodePrompt = this.sceneObject.getComponent(
                InputNodePrompt.getTypeName() as any
            ) as InputNodePrompt | null;
        }

        if (!this.inputNodePrompt) {
            print("[DemoPromptNode] ERROR - InputNodePrompt not found! Add this script to the same object as InputNodePrompt.");
            return;
        }

        // Wait for InputNodePrompt to initialize, then intercept
        this.createEvent("UpdateEvent").bind(() => {
            if (!this._originalButtonHandler) {
                this.setupDemoIntercept();
            }
        });
    }

    private setupDemoIntercept(): void {
        if (!this.inputNodePrompt) return;

        // Try to get the voice button from InputNodePrompt
        const inpAny = this.inputNodePrompt as any;
        
        // Check if voiceButton exists
        if (inpAny.voiceButton) {
            this.voiceButton = inpAny.voiceButton as BaseButton;
        } else if (inpAny._voiceButtonObject) {
            // Try to get from internal object
            const btnObj = inpAny._voiceButtonObject as SceneObject;
            if (btnObj) {
                this.voiceButton = btnObj.getComponent("Component.ScriptComponent") as BaseButton | null;
            }
        }

        if (!this.voiceButton) {
            // Not ready yet, will try again next frame
            return;
        }

        print("[DemoPromptNode] Found voice button, setting up demo intercept");

        // Add our demo handler (will run before/alongside normal handler)
        if (this.voiceButton.onTriggerUp) {
            this.voiceButton.onTriggerUp.add(() => {
                if (this.enabled) {
                    this.onDemoButtonClicked();
                }
            });
            this._originalButtonHandler = true;
            print("[DemoPromptNode] Demo mode ready! Click voice button to show preset text.");
        }
    }

    /**
     * Called when voice button is clicked in demo mode
     */
    private onDemoButtonClicked(): void {
        if (this._isShowingDemo) {
            print("[DemoPromptNode] Already showing demo, ignoring click");
            return;
        }

        print("[DemoPromptNode] Demo button clicked - showing preset text");
        this._isShowingDemo = true;

        // Hide specified objects (like recording indicators)
        this.hideOnDemo.forEach(obj => {
            if (obj) obj.enabled = false;
        });

        // Get the demo text to show
        const textToShow = this.getNextDemoText();

        // Show "Recording..." briefly, then reveal text
        if (this.inputNodePrompt) {
            this.inputNodePrompt.setPromptText("Recording...");
        }

        // Simulate recording delay
        let delayEvent = this.createEvent("DelayedCallbackEvent");
        delayEvent.bind(() => {
            this.showDemoText(textToShow);
        });
        (delayEvent as any).reset(this.simulatedDelay);
    }

    /**
     * Gets the next demo text (cycles through array if multiple)
     */
    private getNextDemoText(): string {
        if (this.demoTexts && this.demoTexts.length > 0) {
            const text = this.demoTexts[this._currentDemoIndex];
            this._currentDemoIndex = (this._currentDemoIndex + 1) % this.demoTexts.length;
            return text;
        }
        return this.demoText;
    }

    /**
     * Shows the demo text with optional typewriter effect
     */
    private showDemoText(text: string): void {
        if (!this.inputNodePrompt) {
            this._isShowingDemo = false;
            return;
        }

        if (this.typewriterEffect) {
            this.typewriterAnimate(text);
        } else {
            this.inputNodePrompt.setPromptText(text);
            this._isShowingDemo = false;
            print(`[DemoPromptNode] Demo text shown: "${text}"`);
        }
    }

    /**
     * Animates text with typewriter effect
     */
    private typewriterAnimate(fullText: string): void {
        let currentIndex = 0;
        const charsPerFrame = Math.max(1, Math.floor(this.typingSpeed / 30)); // Assuming ~30fps
        
        const updateEvent = this.createEvent("UpdateEvent");
        updateEvent.bind(() => {
            if (currentIndex <= fullText.length) {
                const partialText = fullText.substring(0, currentIndex);
                if (this.inputNodePrompt) {
                    this.inputNodePrompt.setPromptText(partialText + (currentIndex < fullText.length ? "▌" : ""));
                }
                currentIndex += charsPerFrame;
            } else {
                // Animation complete
                if (this.inputNodePrompt) {
                    this.inputNodePrompt.setPromptText(fullText);
                }
                this._isShowingDemo = false;
                updateEvent.enabled = false;
                print(`[DemoPromptNode] Typewriter complete: "${fullText}"`);
            }
        });
    }

    /**
     * Manually trigger demo (can be called from other scripts)
     */
    public triggerDemo(): void {
        this.onDemoButtonClicked();
    }

    /**
     * Set custom demo text at runtime
     */
    public setDemoText(text: string): void {
        this.demoText = text;
    }

    /**
     * Set multiple demo texts to cycle through
     */
    public setDemoTexts(texts: string[]): void {
        this.demoTexts = texts;
        this._currentDemoIndex = 0;
    }

    /**
     * Reset demo index to start from first text
     */
    public resetDemoIndex(): void {
        this._currentDemoIndex = 0;
    }

    /**
     * Check if currently showing demo animation
     */
    public isShowingDemo(): boolean {
        return this._isShowingDemo;
    }
}
