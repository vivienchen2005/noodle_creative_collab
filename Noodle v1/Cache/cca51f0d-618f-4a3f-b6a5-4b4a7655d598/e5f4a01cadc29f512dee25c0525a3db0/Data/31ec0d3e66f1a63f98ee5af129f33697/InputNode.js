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
            this.imageContainer = this.imageContainer;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._voiceButtonObject = null;
            this._voiceContainerObject = null;
            this._imageContainerObject = null;
            this._lastInputType = "";
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
            this.imageContainer = this.imageContainer;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._voiceButtonObject = null;
            this._voiceContainerObject = null;
            this._imageContainerObject = null;
            this._lastInputType = "";
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
            // Initialize last input type
            this._lastInputType = this.inputType;
            print(`InputNode: onStart called, inputType="${this.inputType}", baseNode exists=${!!this.baseNode}`);
            // Wait for BaseNode frame to initialize
            let frameCheckAttempts = 0;
            const maxFrameCheckAttempts = 60; // Wait up to 1 second (60 frames at 60fps)
            this.createEvent("UpdateEvent").bind(() => {
                if (!this._initialized && this.baseNode) {
                    const frame = this.baseNode.getFrame();
                    frameCheckAttempts++;
                    // More lenient check - just verify frame exists
                    // Frame.roundedRectangle might not be available immediately
                    if (frame) {
                        // Check if frame has the roundedRectangle property (Frame is ready)
                        // If not, we'll try anyway after a few frames
                        const frameReady = frame.roundedRectangle !== undefined || frameCheckAttempts > 10;
                        if (frameReady) {
                            print(`InputNode: Frame is ready (attempt ${frameCheckAttempts}), setting up node...`);
                            this.setupNode();
                            this._initialized = true;
                            print(`InputNode: Node setup complete!`);
                        }
                        else if (frameCheckAttempts % 10 === 0) {
                            print(`InputNode: Waiting for frame to be ready... (attempt ${frameCheckAttempts}/${maxFrameCheckAttempts})`);
                        }
                    }
                    else if (frameCheckAttempts % 10 === 0) {
                        print(`InputNode: Waiting for BaseNode frame... (attempt ${frameCheckAttempts}/${maxFrameCheckAttempts})`);
                    }
                    // Fallback - if we've waited too long, try to set up anyway
                    if (frameCheckAttempts >= maxFrameCheckAttempts && !this._initialized) {
                        print(`InputNode: WARNING - Frame check timeout, attempting setup anyway...`);
                        this.setupNode();
                        this._initialized = true;
                    }
                }
                // Check if input type changed (e.g., from inspector) and update title
                if (this._initialized && this.inputType !== this._lastInputType) {
                    print(`InputNode: Input type changed from "${this._lastInputType}" to "${this.inputType}"`);
                    // Use setInputType to handle all updates properly
                    this.setInputType(this.inputType);
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
                this.showVoiceUI();
                this.hideImageUI();
            }
            else if (this.inputType === "image") {
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
        setupTitle() {
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
            this.titleText = this._titleTextObject.createComponent("Component.Text");
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
                }
                else {
                    transform.setLocalPosition(new vec3(0, 0.05, 0.01)); // Default position
                }
                print(`InputNode: Created title text component with text: "${this.titleText.text}" at position: ${transform.getLocalPosition().x}, ${transform.getLocalPosition().y}, ${transform.getLocalPosition().z}`);
            }
            else {
                print("InputNode: ERROR - Failed to create Text component for title");
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
                // frameSize is in cm, convert to meters by dividing by 100
                const transform = this._outputButtonObject.getTransform();
                if (this.baseNode) {
                    const frameSize = this.baseNode.frameSize;
                    transform.setLocalPosition(new vec3(frameSize.x / 200, 0, 0)); // Convert cm to meters
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
            // Create voice container if not set
            this.setupVoiceContainer();
            // ALWAYS ensure container is enabled (even if components exist)
            if (this._voiceContainerObject) {
                this._voiceContainerObject.enabled = true;
                print(`InputNode: Voice container enabled in setupPromptContent: ${this._voiceContainerObject.enabled}`);
            }
            // If promptText already exists, ensure it's properly set up and return
            if (this.promptText) {
                print("InputNode: Prompt text already exists, ensuring it's properly configured");
                // Ensure the content object exists and is parented correctly
                if (!this._contentObject && this.promptText.sceneObject) {
                    this._contentObject = this.promptText.sceneObject;
                    // Ensure it's parented to voice container
                    if (this._voiceContainerObject && this._contentObject.getParent() !== this._voiceContainerObject) {
                        this._contentObject.setParent(this._voiceContainerObject);
                    }
                }
                return; // Already set
            }
            // Create content object (prompt text) - parent to voice container
            this._contentObject = global.scene.createSceneObject("InputNode_PromptText");
            if (this._voiceContainerObject) {
                this._contentObject.setParent(this._voiceContainerObject);
            }
            else {
                this._contentObject.setParent(this.sceneObject);
            }
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
         * Sets up the voice container (parent object for all voice-related UI)
         */
        setupVoiceContainer() {
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
        setupVoiceButton() {
            if (this.voiceButton) {
                return; // Already set
            }
            // Create voice button object - parent to voice container
            this._voiceButtonObject = global.scene.createSceneObject("InputNode_VoiceButton");
            if (this._voiceContainerObject) {
                this._voiceButtonObject.setParent(this._voiceContainerObject);
            }
            else {
                this._voiceButtonObject.setParent(this.sceneObject);
            }
            // Create RoundButton for voice input
            const voiceButton = this._voiceButtonObject.createComponent(RoundButton_1.RoundButton.getTypeName());
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
            // Create image container if not set
            this.setupImageContainer();
            // ALWAYS ensure container is enabled (even if components exist)
            if (this._imageContainerObject) {
                this._imageContainerObject.enabled = true;
                print(`InputNode: Image container enabled in setupImageContent: ${this._imageContainerObject.enabled}`);
            }
            // If imageComponent already exists, ensure it's properly set up and return
            if (this.imageComponent) {
                print("InputNode: Image component already exists, ensuring it's properly configured");
                // Ensure the content object exists and is parented correctly
                if (!this._contentObject && this.imageComponent.sceneObject) {
                    this._contentObject = this.imageComponent.sceneObject;
                    // Ensure it's parented to image container
                    if (this._imageContainerObject && this._contentObject.getParent() !== this._imageContainerObject) {
                        this._contentObject.setParent(this._imageContainerObject);
                    }
                }
                return; // Already set
            }
            // Create content object (image) - parent to image container
            this._contentObject = global.scene.createSceneObject("InputNode_ImageContent");
            if (this._imageContainerObject) {
                this._contentObject.setParent(this._imageContainerObject);
            }
            else {
                this._contentObject.setParent(this.sceneObject);
            }
            // Create Image component
            this.imageComponent = this._contentObject.createComponent("Component.Image");
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
        setupImageContainer() {
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
            const newTitle = this.getTitleText();
            print(`InputNode: updateTitle called, newTitle="${newTitle}", titleText exists=${!!this.titleText}`);
            // Ensure title exists first
            if (!this.titleText || !this._titleTextObject) {
                print(`InputNode: Title text component not found, attempting to create it...`);
                this.setupTitle();
            }
            // Now update the text
            if (this.titleText) {
                const oldText = this.titleText.text || "";
                this.titleText.text = newTitle;
                print(`InputNode: Title updated from "${oldText}" to "${newTitle}"`);
                // Force a refresh by accessing the text property again
                const currentText = this.titleText.text;
                if (currentText !== newTitle) {
                    print(`InputNode: WARNING - Title text mismatch! Expected "${newTitle}" but got "${currentText}"`);
                    // Try setting it again
                    this.titleText.text = newTitle;
                }
            }
            else {
                print(`InputNode: ERROR - Failed to create or access title text component`);
            }
            // Also ensure the title object is enabled
            if (this._titleTextObject) {
                this._titleTextObject.enabled = true;
                print(`InputNode: Title object enabled: ${this._titleTextObject.enabled}`);
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
            print(`InputNode: setInputType called with type="${type}", current type="${this.inputType}"`);
            this.inputType = type;
            this._lastInputType = type; // Update tracked type
            // Update BaseNode type
            if (this.baseNode) {
                this.baseNode.nodeType = type;
            }
            // Update title FIRST
            this.updateTitle();
            // Hide both UIs first
            this.hideVoiceUI();
            this.hideImageUI();
            // Recreate content based on new type
            // Destroy old content object if it exists
            if (this._contentObject) {
                print("InputNode: Destroying old content object");
                try {
                    this._contentObject.destroy();
                }
                catch (e) {
                    print(`InputNode: Error destroying content object: ${e}`);
                }
                this._contentObject = null;
            }
            // Clear component references
            this.promptText = null;
            this.imageComponent = null;
            // Show/hide UI containers based on type (mutually exclusive)
            if (type === "prompt") {
                print("InputNode: Setting up prompt mode");
                this.setupPromptContent();
                this.showVoiceUI();
                this.hideImageUI();
            }
            else if (type === "image") {
                print("InputNode: Setting up image mode");
                this.setupImageContent();
                this.hideVoiceUI();
                this.showImageUI();
            }
            print(`InputNode: Input type changed to ${type}, title should be: "${this.getTitleText()}"`);
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
        /**
         * Shows the voice UI container (voice button, text display, etc.)
         */
        showVoiceUI() {
            if (this._voiceContainerObject) {
                this._voiceContainerObject.enabled = true;
                print("InputNode: Voice UI shown");
            }
            else if (this.inputType === "prompt") {
                // If container doesn't exist but we're in prompt mode, set it up
                this.setupPromptContent();
            }
        }
        /**
         * Hides the voice UI container (voice button, text display, etc.)
         */
        hideVoiceUI() {
            if (this._voiceContainerObject) {
                this._voiceContainerObject.enabled = false;
                print("InputNode: Voice UI hidden");
            }
        }
        /**
         * Gets the voice container object
         */
        getVoiceContainer() {
            return this._voiceContainerObject || this.voiceContainer;
        }
        /**
         * Shows the image UI container (image display, etc.)
         */
        showImageUI() {
            print(`InputNode: showImageUI called, container exists=${!!this._imageContainerObject}`);
            if (this._imageContainerObject) {
                this._imageContainerObject.enabled = true;
                print(`InputNode: Image UI shown, enabled=${this._imageContainerObject.enabled}`);
            }
            else if (this.inputType === "image") {
                // If container doesn't exist but we're in image mode, set it up
                print("InputNode: Image container doesn't exist, creating it...");
                this.setupImageContent();
                // After setup, ensure it's enabled
                if (this._imageContainerObject) {
                    this._imageContainerObject.enabled = true;
                    print(`InputNode: Image container created and enabled: ${this._imageContainerObject.enabled}`);
                }
            }
        }
        /**
         * Hides the image UI container (image display, etc.)
         */
        hideImageUI() {
            if (this._imageContainerObject) {
                this._imageContainerObject.enabled = false;
                print("InputNode: Image UI hidden");
            }
        }
        /**
         * Gets the image container object
         */
        getImageContainer() {
            return this._imageContainerObject || this.imageContainer;
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