import { BaseButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/BaseButton"

/**
 * VoiceToText
 * A simple voice-to-text component using ASR (Automatic Speech Recognition)
 * Use a button to toggle start/stop transcription
 * Get the transcribed text via getTranscribedText() to use as a prompt
 * 
 * Works with any button type: RectangleButton, RoundButton, CapsuleButton, etc.
 */
@component
export class VoiceToText extends BaseScriptComponent {
    @ui.separator
    @ui.label("Voice to Text (ASR)")
    @ui.separator

    @ui.group_start("Controls")
    @input
    @hint("Button to toggle start/stop voice transcription (works with RectangleButton, RoundButton, CapsuleButton, etc.)")
    private toggleButton: BaseButton

    @input
    @hint("Whether to auto-stop after silence (milliseconds). Set to 0 to disable auto-stop.")
    private silenceUntilTerminationMs: number = 2000
    @ui.group_end

    @ui.separator
    @ui.group_start("Display")
    @input
    @hint("Optional: Text component to display transcribed text in real-time")
    @allowUndefined
    private transcriptionText: Text

    @input
    @hint("Optional: Text component to show status (listening, processing, etc.)")
    @allowUndefined
    private statusText: Text
    @ui.group_end

    @ui.separator

    private asrModule = require('LensStudio:AsrModule')
    private isTranscribing: boolean = false
    private accumulatedText: string = ''
    private currentInterimText: string = ''
    private finalTranscribedText: string = ''  // Last final transcription
    private onTranscriptionStoppedCallbacks: (() => void)[] = []  // Callbacks to call when transcription stops

    onAwake(): void {
        // Wait for OnStartEvent to ensure everything is initialized
        this.createEvent("OnStartEvent").bind(() => {
            this.setupButton()
        })

        this.updateStatus("Ready - Press button to start listening")
    }

    private setupButton(): void {
        // Set up toggle button handler (using BaseButton - toggle on each press)
        if (this.toggleButton) {
            if (this.toggleButton.onTriggerUp) {
                this.toggleButton.onTriggerUp.add(() => {
                    print("VoiceToText: Button pressed, current state: " + (this.isTranscribing ? "transcribing" : "idle"))
                    // Toggle: if transcribing, stop; if not, start
                    if (this.isTranscribing) {
                        this.stopTranscribing()
                    } else {
                        this.startTranscribing()
                    }
                })
                print("VoiceToText: Toggle button connected successfully")
            } else {
                print("VoiceToText: Error - Button onTriggerUp is not available. Make sure the button is properly initialized.")
            }
        } else {
            print("VoiceToText: Warning - Toggle button not assigned")
        }

        // Debug: Check if text component is assigned
        if (this.transcriptionText) {
            print("VoiceToText: Transcription text component is assigned")
        } else {
            print("VoiceToText: Warning - Transcription text component not assigned. Text will be tracked but not displayed.")
        }
    }

    /**
     * Start voice transcription
     */
    private startTranscribing(): void {
        if (this.isTranscribing) {
            print('VoiceToText: Already transcribing, ignoring start request')
            return
        }

        // Clear accumulated text when starting a new transcription session
        this.accumulatedText = ''
        this.currentInterimText = ''
        this.finalTranscribedText = ''
        if (this.transcriptionText) {
            this.transcriptionText.text = ''
        }

        const options = AsrModule.AsrTranscriptionOptions.create()
        options.silenceUntilTerminationMs = this.silenceUntilTerminationMs
        options.mode = AsrModule.AsrMode.HighAccuracy
        options.onTranscriptionUpdateEvent.add((eventArgs) =>
            this.onTranscriptionUpdate(eventArgs)
        )
        options.onTranscriptionErrorEvent.add((eventArgs) =>
            this.onTranscriptionError(eventArgs)
        )

        try {
            this.asrModule.startTranscribing(options)
            this.isTranscribing = true
            this.updateStatus("Listening...")
            print('VoiceToText: Started transcribing successfully')

            // Debug: Show initial state
            if (this.transcriptionText) {
                this.transcriptionText.text = "Listening..."
            }
        } catch (error) {
            print('VoiceToText: Error starting transcription: ' + error)
            this.updateStatus("Error: " + error)
            this.isTranscribing = false
        }
    }

    /**
     * Stop voice transcription
     */
    private stopTranscribing(): void {
        if (!this.isTranscribing) {
            print('VoiceToText: Not transcribing, ignoring stop request')
            return
        }

        this.asrModule.stopTranscribing()
        this.isTranscribing = false

        // Finalize the text
        if (this.currentInterimText) {
            if (this.accumulatedText.length > 0) {
                this.accumulatedText += ' ' + this.currentInterimText
            } else {
                this.accumulatedText = this.currentInterimText
            }
            this.currentInterimText = ''
        }
        this.finalTranscribedText = this.accumulatedText

        if (this.transcriptionText) {
            this.transcriptionText.text = this.accumulatedText
        }

        this.updateStatus("Stopped - Text ready")
        print('VoiceToText: Stopped transcribing. Final text: ' + this.finalTranscribedText)

        // Call all registered callbacks
        for (const callback of this.onTranscriptionStoppedCallbacks) {
            try {
                callback()
            } catch (error) {
                print("VoiceToText: Error in transcription stopped callback: " + error)
            }
        }
    }

    /**
     * Handle transcription updates
     */
    private onTranscriptionUpdate(eventArgs: AsrModule.TranscriptionUpdateEvent): void {
        const transcribedText = eventArgs.text
        const isFinal = eventArgs.isFinal

        print(`VoiceToText: Transcription update - text="${transcribedText}", isFinal=${isFinal}`)

        // Always track the text internally
        if (isFinal) {
            // Add final transcription to accumulated text
            if (this.accumulatedText.length > 0) {
                this.accumulatedText += ' ' + transcribedText
            } else {
                this.accumulatedText = transcribedText
            }
            this.currentInterimText = ''
            this.finalTranscribedText = this.accumulatedText
            print(`VoiceToText: Final text accumulated: "${this.accumulatedText}"`)
        } else {
            // Show interim text as preview
            this.currentInterimText = transcribedText
            print(`VoiceToText: Interim text: "${transcribedText}"`)
        }

        // Update the text component if it exists
        if (this.transcriptionText) {
            try {
                if (isFinal) {
                    // Display accumulated text
                    this.transcriptionText.text = this.accumulatedText
                    print(`VoiceToText: Updated transcriptionText with final: "${this.accumulatedText}"`)
                    this.updateStatus("Got final text")
                } else {
                    // Show interim text as preview (accumulated + current interim)
                    const displayText = this.accumulatedText.length > 0
                        ? this.accumulatedText + ' ' + this.currentInterimText
                        : this.currentInterimText
                    this.transcriptionText.text = displayText
                    print(`VoiceToText: Updated transcriptionText with interim: "${displayText}"`)
                    this.updateStatus("Listening...")
                }
            } catch (error) {
                print(`VoiceToText: Error updating text component: ${error}`)
            }
        } else {
            print("VoiceToText: Warning - transcriptionText component not assigned, text is being tracked but not displayed")
        }
    }

    /**
     * Handle transcription errors
     */
    private onTranscriptionError(eventArgs: AsrModule.AsrStatusCode): void {
        print(`VoiceToText: Transcription error - errorCode: ${eventArgs}`)
        switch (eventArgs) {
            case AsrModule.AsrStatusCode.InternalError:
                print('VoiceToText: Internal Error')
                this.updateStatus("Error: Internal Error")
                this.stopTranscribing()
                break
            case AsrModule.AsrStatusCode.Unauthenticated:
                print('VoiceToText: Unauthenticated')
                this.updateStatus("Error: Unauthenticated")
                this.stopTranscribing()
                break
            case AsrModule.AsrStatusCode.NoInternet:
                print('VoiceToText: No Internet')
                this.updateStatus("Error: No Internet")
                this.stopTranscribing()
                break
        }

        // Note: Button state is managed by isTranscribing flag
        // The button will work as a toggle on next press
    }

    /**
     * Get the final transcribed text (use this as prompt)
     * @returns The final transcribed text, or empty string if nothing transcribed yet
     */
    public getTranscribedText(): string {
        // Return final text if available, otherwise return accumulated + interim
        if (this.finalTranscribedText) {
            return this.finalTranscribedText
        }
        if (this.accumulatedText) {
            return this.accumulatedText + (this.currentInterimText ? ' ' + this.currentInterimText : '')
        }
        return this.currentInterimText || ''
    }

    /**
     * Get the accumulated text (all final transcriptions so far)
     * @returns The accumulated final text
     */
    public getAccumulatedText(): string {
        return this.accumulatedText
    }

    /**
     * Clear the transcribed text
     */
    public clearText(): void {
        this.accumulatedText = ''
        this.currentInterimText = ''
        this.finalTranscribedText = ''
        if (this.transcriptionText) {
            this.transcriptionText.text = ''
        }
        print('VoiceToText: Text cleared')
    }

    /**
     * Check if currently transcribing
     * @returns True if transcription is active
     */
    public isCurrentlyTranscribing(): boolean {
        return this.isTranscribing
    }

    /**
     * Register a callback to be called when transcription stops
     * @param callback Function to call when transcription stops
     */
    public onTranscriptionStopped(callback: () => void): void {
        this.onTranscriptionStoppedCallbacks.push(callback)
    }

    private updateStatus(message: string): void {
        if (this.statusText) {
            this.statusText.text = message
        }
    }
}
