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
exports.InputNodePrompt = void 0;
var __selfType = requireType("./InputNodePrompt");
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
 * InputNodePrompt - A specialized node for prompt/text input with voice-to-text
 * Extends BaseNode functionality with prompt content and output button
 */
let InputNodePrompt = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var InputNodePrompt = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.outputButton = this.outputButton;
            this.promptText = this.promptText;
            this.voiceToTextComponent = this.voiceToTextComponent;
            this.voiceButton = this.voiceButton;
            this.voiceContainer = this.voiceContainer;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._voiceButtonObject = null;
            this._voiceContainerObject = null;
            this._onStartCalled = false;
            // Reference to prompt text for external access
            this._promptTextReference = null;
            // Track connected child nodes (nodes this connects to)
            this._connectedChildNodes = [];
        }
        __initialize() {
            super.__initialize();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.outputButton = this.outputButton;
            this.promptText = this.promptText;
            this.voiceToTextComponent = this.voiceToTextComponent;
            this.voiceButton = this.voiceButton;
            this.voiceContainer = this.voiceContainer;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._voiceButtonObject = null;
            this._voiceContainerObject = null;
            this._onStartCalled = false;
            // Reference to prompt text for external access
            this._promptTextReference = null;
            // Track connected child nodes (nodes this connects to)
            this._connectedChildNodes = [];
        }
        onAwake() {
            print(`InputNodePrompt: onAwake called`);
            // Ensure BaseNode is set
            if (!this.baseNode) {
                this.baseNode = this.sceneObject.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (!this.baseNode) {
                    print("InputNodePrompt: ERROR - BaseNode component not found! Please add BaseNode component to this SceneObject.");
                    return;
                }
                print(`InputNodePrompt: Found BaseNode component`);
            }
            else {
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
                this.baseNode = this.sceneObject.getComponent(BaseNode_1.BaseNode.getTypeName());
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
        setupNode() {
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
        setupTitle() {
            if (this.titleText) {
                this.updateTitle();
                return;
            }
            // Create title text object
            this._titleTextObject = global.scene.createSceneObject("InputNodePrompt_Title");
            this._titleTextObject.setParent(this.sceneObject);
            this._titleTextObject.enabled = true;
            // Create Text component
            this.titleText = this._titleTextObject.createComponent("Component.Text");
            if (this.titleText) {
                this.titleText.text = "Prompt Input";
                this.titleText.horizontalAlignment = HorizontalAlignment.Center;
                this.titleText.verticalAlignment = VerticalAlignment.Center;
                // Position at top of frame
                const transform = this._titleTextObject.getTransform();
                if (this.baseNode) {
                    const frameSize = this.baseNode.frameSize;
                    transform.setLocalPosition(new vec3(0, frameSize.y / 200 + 0.05, 0.01));
                }
                else {
                    transform.setLocalPosition(new vec3(0, 0.05, 0.01));
                }
                print(`InputNodePrompt: Created title text component`);
            }
        }
        /**
         * Updates the title text
         */
        updateTitle() {
            if (this.titleText) {
                this.titleText.text = "Prompt Input";
            }
        }
        /**
         * Sets up the output button (round button at connection point)
         */
        setupOutputButton() {
            // If button already exists, just set up tracking
            if (this.outputButton) {
                this.setupButtonClickTracking();
                return;
            }
            // Create output button object
            this._outputButtonObject = global.scene.createSceneObject("InputNodePrompt_OutputButton");
            this._outputButtonObject.setParent(this.sceneObject);
            // Create RoundButton component
            this.outputButton = this._outputButtonObject.createComponent(RoundButton_1.RoundButton.getTypeName());
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
        setupPromptContent() {
            // Create voice container if not set
            this.setupVoiceContainer();
            // Ensure container is enabled
            if (this._voiceContainerObject) {
                this._voiceContainerObject.enabled = true;
            }
            // If promptText already exists, keep reference
            if (this.promptText) {
                this._promptTextReference = this.promptText;
                // Still need to set up voice button and integration
                this.setupVoiceButton();
                this.setupVoiceToText();
                return; // Already set
            }
            // Create content object (prompt text) - parent to voice container
            this._contentObject = global.scene.createSceneObject("InputNodePrompt_PromptText");
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
        setupVoiceContainer() {
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
        setupVoiceButton() {
            if (this.voiceButton) {
                return;
            }
            // Create voice button object - parent to voice container
            this._voiceButtonObject = global.scene.createSceneObject("InputNodePrompt_VoiceButton");
            if (this._voiceContainerObject) {
                this._voiceButtonObject.setParent(this._voiceContainerObject);
            }
            else {
                this._voiceButtonObject.setParent(this.sceneObject);
            }
            // Create RoundButton for voice input
            const voiceButton = this._voiceButtonObject.createComponent(RoundButton_1.RoundButton.getTypeName());
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
        setupVoiceToText() {
            // If VoiceToText component is not set, try to find or create it
            if (!this.voiceToTextComponent) {
                this.voiceToTextComponent = this.sceneObject.getComponent(VoiceToText_1.VoiceToText.getTypeName());
                if (!this.voiceToTextComponent) {
                    this.voiceToTextComponent = this.sceneObject.createComponent(VoiceToText_1.VoiceToText.getTypeName());
                    print("InputNodePrompt: Created VoiceToText component");
                }
                else {
                    print("InputNodePrompt: Found existing VoiceToText component");
                }
            }
            if (this.voiceToTextComponent && this.voiceButton && this.promptText) {
                // Connect voice button to VoiceToText
                const vtt = this.voiceToTextComponent;
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
            }
            else {
                print("InputNodePrompt: Warning - Voice-to-text setup incomplete. Missing components.");
            }
        }
        /**
         * Sets up button click tracking for the output button
         */
        setupButtonClickTracking() {
            if (!this.outputButton) {
                return;
            }
            // Track button clicks
            if (this.outputButton.onTriggerUp) {
                this.outputButton.onTriggerUp.add(() => {
                    print(`InputNodePrompt: Output button clicked!`);
                    this.onOutputButtonClicked();
                });
                print("InputNodePrompt: Output button click tracking set up");
            }
        }
        /**
         * Called when output button is clicked
         */
        onOutputButtonClicked() {
            print(`InputNodePrompt: Output button clicked - Prompt text: "${this.getPromptText()}"`);
            // This can be extended to trigger connections or other actions
        }
        /**
         * Adds a connected child node (called when connection is made)
         */
        addChildNode(childNode) {
            if (!this._connectedChildNodes.includes(childNode)) {
                this._connectedChildNodes.push(childNode);
                print(`InputNodePrompt: Added child node: ${childNode.name} (Total: ${this._connectedChildNodes.length})`);
            }
        }
        /**
         * Removes a connected child node
         */
        removeChildNode(childNode) {
            const index = this._connectedChildNodes.indexOf(childNode);
            if (index > -1) {
                this._connectedChildNodes.splice(index, 1);
                print(`InputNodePrompt: Removed child node: ${childNode.name} (Total: ${this._connectedChildNodes.length})`);
            }
        }
        /**
         * Gets all connected child nodes
         */
        getChildNodes() {
            return this._connectedChildNodes;
        }
        /**
         * Gets the number of connected child nodes
         */
        getChildNodeCount() {
            return this._connectedChildNodes.length;
        }
        /**
         * Gets the current prompt text
         */
        getPromptText() {
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
        setPromptText(text) {
            if (this.promptText) {
                this.promptText.text = text;
            }
        }
        /**
         * Gets the prompt text component reference (for external access)
         */
        getPromptTextComponent() {
            return this._promptTextReference || this.promptText;
        }
        /**
         * Gets the output button (for connection handling)
         */
        getOutputButton() {
            return this.outputButton;
        }
        /**
         * Gets the output button's local position (relative to this node)
         */
        getOutputButtonLocalPosition() {
            if (this._outputButtonObject) {
                return this._outputButtonObject.getTransform().getLocalPosition();
            }
            if (this.outputButton && this.outputButton.sceneObject) {
                return this.outputButton.sceneObject.getTransform().getLocalPosition();
            }
            return null;
        }
        /**
         * Gets the output button's world position
         */
        getOutputButtonWorldPosition() {
            if (this._outputButtonObject) {
                return this._outputButtonObject.getTransform().getWorldPosition();
            }
            if (this.outputButton && this.outputButton.sceneObject) {
                return this.outputButton.sceneObject.getTransform().getWorldPosition();
            }
            return null;
        }
        /**
         * Gets the output button's SceneObject (for patch/connection handling)
         */
        getOutputButtonObject() {
            return this._outputButtonObject || (this.outputButton ? this.outputButton.sceneObject : null);
        }
        /**
         * Gets the BaseNode component
         */
        getBaseNode() {
            return this.baseNode;
        }
        /**
         * Gets all data that can be passed to other nodes
         */
        getOutputData() {
            return {
                promptText: this.getPromptText(),
                textComponent: this.getPromptTextComponent(),
                outputButtonPosition: this.getOutputButtonLocalPosition(),
                outputButtonWorldPosition: this.getOutputButtonWorldPosition()
            };
        }
    };
    __setFunctionName(_classThis, "InputNodePrompt");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InputNodePrompt = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InputNodePrompt = _classThis;
})();
exports.InputNodePrompt = InputNodePrompt;
//# sourceMappingURL=InputNodePrompt.js.map