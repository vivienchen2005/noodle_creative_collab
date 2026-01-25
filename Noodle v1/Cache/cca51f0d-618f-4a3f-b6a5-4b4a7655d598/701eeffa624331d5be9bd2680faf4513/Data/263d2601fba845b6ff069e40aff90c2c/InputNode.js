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
exports.InputNode = void 0;
var __selfType = requireType("./InputNode");
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
const BaseNode_1 = require("./BaseNode");
const RoundButton_1 = require("SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton");
const VoiceToText_1 = require("./VoiceToText");
/**
 * InputNode - A specialized node for input types (image or prompt)
 * Extends BaseNode functionality with type-specific content and output button
 */
let InputNode = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var InputNode = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.inputType = this.inputType;
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.outputButton = this.outputButton;
            this.imageComponent = this.imageComponent;
            this.promptText = this.promptText;
            this.voiceToTextComponent = this.voiceToTextComponent;
            this.voiceButton = this.voiceButton;
            this.cameraService = this.cameraService;
            this.voiceContainer = this.voiceContainer;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._voiceButtonObject = null;
            this._voiceContainerObject = null;
        }
        __initialize() {
            super.__initialize();
            this.inputType = this.inputType;
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.outputButton = this.outputButton;
            this.imageComponent = this.imageComponent;
            this.promptText = this.promptText;
            this.voiceToTextComponent = this.voiceToTextComponent;
            this.voiceButton = this.voiceButton;
            this.cameraService = this.cameraService;
            this.voiceContainer = this.voiceContainer;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._voiceButtonObject = null;
            this._voiceContainerObject = null;
        }
        onAwake() {
            // Ensure BaseNode is set
            if (!this.baseNode) {
                this.baseNode = this.sceneObject.getComponent(BaseNode_1.BaseNode.getTypeName());
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
            // Wait for BaseNode frame to initialize
            this.createEvent("UpdateEvent").bind(() => {
                if (!this._initialized && this.baseNode) {
                    const frame = this.baseNode.getFrame();
                    if (frame && frame.roundedRectangle) {
                        this.setupNode();
                        this._initialized = true;
                    }
                }
            });
        }
        /**
         * Sets up the node UI based on input type
         */
        setupNode() {
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
            }
            else if (this.inputType === "image") {
                this.setupImageContent();
            }
            // Update title text
            this.updateTitle();
        }
        /**
         * Sets up the title text component
         */
        setupTitle() {
            if (this.titleText) {
                return; // Already set
            }
            // Create title text object
            this._titleTextObject = global.scene.createSceneObject("InputNode_Title");
            this._titleTextObject.setParent(this.sceneObject);
            // Create Text component
            this.titleText = this._titleTextObject.createComponent("Component.Text");
            if (this.titleText) {
                this.titleText.text = this.getTitleText();
                // Position at top of frame
                const transform = this._titleTextObject.getTransform();
                transform.setLocalPosition(new vec3(0, 4, 0)); // Adjust Y position as needed
                print("InputNode: Created title text component");
            }
        }
        /**
         * Sets up the output button (round button at connection point)
         */
        setupOutputButton() {
            if (this.outputButton) {
                return; // Already set
            }
            // Create output button object
            this._outputButtonObject = global.scene.createSceneObject("InputNode_OutputButton");
            this._outputButtonObject.setParent(this.sceneObject);
            // Create RoundButton component
            this.outputButton = this._outputButtonObject.createComponent(RoundButton_1.RoundButton.getTypeName());
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
        setupPromptContent() {
            if (this.promptText) {
                return; // Already set
            }
            // Create content object
            this._contentObject = global.scene.createSceneObject("InputNode_PromptContent");
            this._contentObject.setParent(this.sceneObject);
            // Create Text component for displaying prompt
            this.promptText = this._contentObject.createComponent("Component.Text");
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
         * Sets up the voice button for triggering voice-to-text
         */
        setupVoiceButton() {
            if (this.voiceButton) {
                return; // Already set
            }
            // Create voice button object
            this._voiceButtonObject = global.scene.createSceneObject("InputNode_VoiceButton");
            this._voiceButtonObject.setParent(this.sceneObject);
            // Create RoundButton for voice input
            const voiceButton = this._voiceButtonObject.createComponent(RoundButton_1.RoundButton.getTypeName());
            if (voiceButton) {
                voiceButton.width = 3; // Size of the button
                // Position to the left of the text
                const transform = this._voiceButtonObject.getTransform();
                transform.setLocalPosition(new vec3(-4, -1, 0)); // Adjust as needed
                this.voiceButton = voiceButton;
                print("InputNode: Created voice button");
            }
        }
        /**
         * Sets up voice-to-text integration
         */
        setupVoiceToText() {
            // If VoiceToText component is not set, try to find or create it
            if (!this.voiceToTextComponent) {
                // Try to find existing VoiceToText component on this object
                this.voiceToTextComponent = this.sceneObject.getComponent(VoiceToText_1.VoiceToText.getTypeName());
                if (!this.voiceToTextComponent) {
                    // Create VoiceToText component
                    this.voiceToTextComponent = this.sceneObject.createComponent(VoiceToText_1.VoiceToText.getTypeName());
                    print("InputNode: Created VoiceToText component");
                }
                else {
                    print("InputNode: Found existing VoiceToText component");
                }
            }
            if (this.voiceToTextComponent && this.voiceButton && this.promptText) {
                // Connect voice button to VoiceToText (using type assertion to access private properties)
                // Note: These are @input properties, so they should be accessible at runtime
                const vtt = this.voiceToTextComponent;
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
            }
            else {
                print("InputNode: Warning - Voice-to-text setup incomplete. Missing components.");
            }
        }
        /**
         * Sets up image content (Image component for screen grab/clone)
         */
        setupImageContent() {
            if (this.imageComponent) {
                return; // Already set
            }
            // Create content object
            this._contentObject = global.scene.createSceneObject("InputNode_ImageContent");
            this._contentObject.setParent(this.sceneObject);
            // Create Image component
            this.imageComponent = this._contentObject.createComponent("Component.Image");
            if (this.imageComponent) {
                // Position in center of frame
                const transform = this._contentObject.getTransform();
                transform.setLocalPosition(new vec3(0, -1, 0)); // Adjust as needed
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
         * Gets the title text based on input type
         */
        getTitleText() {
            if (this.inputType === "prompt") {
                return "Prompt Input";
            }
            else if (this.inputType === "image") {
                return "Image Input";
            }
            return "Input";
        }
        /**
         * Updates the title text
         */
        updateTitle() {
            if (this.titleText) {
                this.titleText.text = this.getTitleText();
            }
        }
        /**
         * Gets the current prompt text (for prompt type)
         */
        getPromptText() {
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
        setPromptText(text) {
            if (this.inputType === "prompt" && this.promptText) {
                this.promptText.text = text;
            }
        }
        /**
         * Gets the image texture (for image type)
         */
        getImageTexture() {
            if (this.inputType === "image" && this.imageComponent) {
                return this.imageComponent.mainPass.baseTex;
            }
            return null;
        }
        /**
         * Sets the image texture (for image type)
         */
        setImageTexture(texture) {
            if (this.inputType === "image" && this.imageComponent) {
                this.imageComponent.mainPass.baseTex = texture;
            }
        }
        /**
         * Gets the input type
         */
        getInputType() {
            return this.inputType;
        }
        /**
         * Sets the input type and updates UI
         */
        setInputType(type) {
            if (type !== "prompt" && type !== "image") {
                print("InputNode: Invalid input type. Must be 'prompt' or 'image'");
                return;
            }
            this.inputType = type;
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
            // Clean up voice button if switching away from prompt
            if (type !== "prompt" && this._voiceButtonObject) {
                this._voiceButtonObject.destroy();
                this._voiceButtonObject = null;
                this.voiceButton = null;
            }
            if (this.inputType === "prompt") {
                this.setupPromptContent();
            }
            else if (this.inputType === "image") {
                this.setupImageContent();
            }
            print(`InputNode: Input type changed to ${type}`);
        }
        /**
         * Gets the output button (for connection handling)
         */
        getOutputButton() {
            return this.outputButton;
        }
        /**
         * Gets the BaseNode component
         */
        getBaseNode() {
            return this.baseNode;
        }
    };
    __setFunctionName(_classThis, "InputNode");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InputNode = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InputNode = _classThis;
})();
exports.InputNode = InputNode;
//# sourceMappingURL=InputNode.js.map