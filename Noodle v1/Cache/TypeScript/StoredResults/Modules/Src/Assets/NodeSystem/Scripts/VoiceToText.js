"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceToText = void 0;
var __selfType = requireType("./VoiceToText");
function component(target) {
    target.getTypeName = function () { return __selfType; };
    if (target.prototype.hasOwnProperty("getTypeName"))
        return;
    Object.defineProperty(target.prototype, "getTypeName", {
        value: function () { return __selfType; },
        configurable: true,
        writable: true
    });
}
/**
 * VoiceToText
 * A simple voice-to-text component using ASR (Automatic Speech Recognition)
 * Use a button to toggle start/stop transcription
 * Get the transcribed text via getTranscribedText() to use as a prompt
 *
 * Works with any button type: RectangleButton, RoundButton, CapsuleButton, etc.
 */
let VoiceToText = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var VoiceToText = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.toggleButton = this.toggleButton;
            this.silenceUntilTerminationMs = this.silenceUntilTerminationMs;
            this.transcriptionText = this.transcriptionText;
            this.statusText = this.statusText;
            this.asrModule = require('LensStudio:AsrModule');
            this.isTranscribing = false;
            this.accumulatedText = '';
            this.currentInterimText = '';
            this.finalTranscribedText = ''; // Last final transcription
            this.onTranscriptionStoppedCallbacks = []; // Callbacks to call when transcription stops
        }
        __initialize() {
            super.__initialize();
            this.toggleButton = this.toggleButton;
            this.silenceUntilTerminationMs = this.silenceUntilTerminationMs;
            this.transcriptionText = this.transcriptionText;
            this.statusText = this.statusText;
            this.asrModule = require('LensStudio:AsrModule');
            this.isTranscribing = false;
            this.accumulatedText = '';
            this.currentInterimText = '';
            this.finalTranscribedText = ''; // Last final transcription
            this.onTranscriptionStoppedCallbacks = []; // Callbacks to call when transcription stops
        }
        onAwake() {
            // Wait for OnStartEvent to ensure everything is initialized
            this.createEvent("OnStartEvent").bind(() => {
                this.setupButton();
            });
            this.updateStatus("Ready - Press button to start listening");
        }
        setupButton() {
            // Set up toggle button handler (using BaseButton - toggle on each press)
            if (this.toggleButton) {
                if (this.toggleButton.onTriggerUp) {
                    this.toggleButton.onTriggerUp.add(() => {
                        print("VoiceToText: Button pressed, current state: " + (this.isTranscribing ? "transcribing" : "idle"));
                        // Toggle: if transcribing, stop; if not, start
                        if (this.isTranscribing) {
                            this.stopTranscribing();
                        }
                        else {
                            this.startTranscribing();
                        }
                    });
                    print("VoiceToText: Toggle button connected successfully");
                }
                else {
                    print("VoiceToText: Error - Button onTriggerUp is not available. Make sure the button is properly initialized.");
                }
            }
            else {
                print("VoiceToText: Warning - Toggle button not assigned");
            }
            // Debug: Check if text component is assigned
            if (this.transcriptionText) {
                print("VoiceToText: Transcription text component is assigned");
            }
            else {
                print("VoiceToText: Warning - Transcription text component not assigned. Text will be tracked but not displayed.");
            }
        }
        /**
         * Start voice transcription
         */
        startTranscribing() {
            if (this.isTranscribing) {
                print('VoiceToText: Already transcribing, ignoring start request');
                return;
            }
            // Clear accumulated text when starting a new transcription session
            this.accumulatedText = '';
            this.currentInterimText = '';
            this.finalTranscribedText = '';
            if (this.transcriptionText) {
                this.transcriptionText.text = '';
            }
            const options = AsrModule.AsrTranscriptionOptions.create();
            options.silenceUntilTerminationMs = this.silenceUntilTerminationMs;
            options.mode = AsrModule.AsrMode.HighAccuracy;
            options.onTranscriptionUpdateEvent.add((eventArgs) => this.onTranscriptionUpdate(eventArgs));
            options.onTranscriptionErrorEvent.add((eventArgs) => this.onTranscriptionError(eventArgs));
            try {
                this.asrModule.startTranscribing(options);
                this.isTranscribing = true;
                this.updateStatus("Listening...");
                print('VoiceToText: Started transcribing successfully');
                // Debug: Show initial state
                if (this.transcriptionText) {
                    this.transcriptionText.text = "Listening...";
                }
            }
            catch (error) {
                print('VoiceToText: Error starting transcription: ' + error);
                this.updateStatus("Error: " + error);
                this.isTranscribing = false;
            }
        }
        /**
         * Stop voice transcription
         */
        stopTranscribing() {
            if (!this.isTranscribing) {
                print('VoiceToText: Not transcribing, ignoring stop request');
                return;
            }
            this.asrModule.stopTranscribing();
            this.isTranscribing = false;
            // Finalize the text
            if (this.currentInterimText) {
                if (this.accumulatedText.length > 0) {
                    this.accumulatedText += ' ' + this.currentInterimText;
                }
                else {
                    this.accumulatedText = this.currentInterimText;
                }
                this.currentInterimText = '';
            }
            this.finalTranscribedText = this.accumulatedText;
            if (this.transcriptionText) {
                this.transcriptionText.text = this.accumulatedText;
            }
            this.updateStatus("Stopped - Text ready");
            print('VoiceToText: Stopped transcribing. Final text: ' + this.finalTranscribedText);
            // Call all registered callbacks
            for (const callback of this.onTranscriptionStoppedCallbacks) {
                try {
                    callback();
                }
                catch (error) {
                    print("VoiceToText: Error in transcription stopped callback: " + error);
                }
            }
        }
        /**
         * Handle transcription updates
         */
        onTranscriptionUpdate(eventArgs) {
            const transcribedText = eventArgs.text;
            const isFinal = eventArgs.isFinal;
            print(`VoiceToText: Transcription update - text="${transcribedText}", isFinal=${isFinal}`);
            // Always track the text internally
            if (isFinal) {
                // Add final transcription to accumulated text
                if (this.accumulatedText.length > 0) {
                    this.accumulatedText += ' ' + transcribedText;
                }
                else {
                    this.accumulatedText = transcribedText;
                }
                this.currentInterimText = '';
                this.finalTranscribedText = this.accumulatedText;
                print(`VoiceToText: Final text accumulated: "${this.accumulatedText}"`);
            }
            else {
                // Show interim text as preview
                this.currentInterimText = transcribedText;
                print(`VoiceToText: Interim text: "${transcribedText}"`);
            }
            // Update the text component if it exists
            if (this.transcriptionText) {
                try {
                    if (isFinal) {
                        // Display accumulated text
                        this.transcriptionText.text = this.accumulatedText;
                        print(`VoiceToText: Updated transcriptionText with final: "${this.accumulatedText}"`);
                        this.updateStatus("Got final text");
                    }
                    else {
                        // Show interim text as preview (accumulated + current interim)
                        const displayText = this.accumulatedText.length > 0
                            ? this.accumulatedText + ' ' + this.currentInterimText
                            : this.currentInterimText;
                        this.transcriptionText.text = displayText;
                        print(`VoiceToText: Updated transcriptionText with interim: "${displayText}"`);
                        this.updateStatus("Listening...");
                    }
                }
                catch (error) {
                    print(`VoiceToText: Error updating text component: ${error}`);
                }
            }
            else {
                print("VoiceToText: Warning - transcriptionText component not assigned, text is being tracked but not displayed");
            }
        }
        /**
         * Handle transcription errors
         */
        onTranscriptionError(eventArgs) {
            print(`VoiceToText: Transcription error - errorCode: ${eventArgs}`);
            switch (eventArgs) {
                case AsrModule.AsrStatusCode.InternalError:
                    print('VoiceToText: Internal Error');
                    this.updateStatus("Error: Internal Error");
                    this.stopTranscribing();
                    break;
                case AsrModule.AsrStatusCode.Unauthenticated:
                    print('VoiceToText: Unauthenticated');
                    this.updateStatus("Error: Unauthenticated");
                    this.stopTranscribing();
                    break;
                case AsrModule.AsrStatusCode.NoInternet:
                    print('VoiceToText: No Internet');
                    this.updateStatus("Error: No Internet");
                    this.stopTranscribing();
                    break;
            }
            // Note: Button state is managed by isTranscribing flag
            // The button will work as a toggle on next press
        }
        /**
         * Get the final transcribed text (use this as prompt)
         * @returns The final transcribed text, or empty string if nothing transcribed yet
         */
        getTranscribedText() {
            // Return final text if available, otherwise return accumulated + interim
            if (this.finalTranscribedText) {
                return this.finalTranscribedText;
            }
            if (this.accumulatedText) {
                return this.accumulatedText + (this.currentInterimText ? ' ' + this.currentInterimText : '');
            }
            return this.currentInterimText || '';
        }
        /**
         * Get the accumulated text (all final transcriptions so far)
         * @returns The accumulated final text
         */
        getAccumulatedText() {
            return this.accumulatedText;
        }
        /**
         * Clear the transcribed text
         */
        clearText() {
            this.accumulatedText = '';
            this.currentInterimText = '';
            this.finalTranscribedText = '';
            if (this.transcriptionText) {
                this.transcriptionText.text = '';
            }
            print('VoiceToText: Text cleared');
        }
        /**
         * Check if currently transcribing
         * @returns True if transcription is active
         */
        isCurrentlyTranscribing() {
            return this.isTranscribing;
        }
        /**
         * Register a callback to be called when transcription stops
         * @param callback Function to call when transcription stops
         */
        onTranscriptionStopped(callback) {
            this.onTranscriptionStoppedCallbacks.push(callback);
        }
        updateStatus(message) {
            if (this.statusText) {
                this.statusText.text = message;
            }
        }
    };
    __setFunctionName(_classThis, "VoiceToText");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VoiceToText = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VoiceToText = _classThis;
})();
exports.VoiceToText = VoiceToText;
//# sourceMappingURL=VoiceToText.js.map