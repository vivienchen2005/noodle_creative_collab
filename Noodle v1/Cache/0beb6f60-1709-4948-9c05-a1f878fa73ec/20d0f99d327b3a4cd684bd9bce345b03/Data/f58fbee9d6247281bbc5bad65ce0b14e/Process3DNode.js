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
exports.Process3DNode = void 0;
var __selfType = requireType("./Process3DNode");
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
const BezierCurve_1 = require("../../RuntimeGizmos.lspkg/Scripts/BezierCurve");
const InputNodePrompt_1 = require("./InputNodePrompt");
const InputNodeImage_1 = require("./InputNodeImage");
const NodeConnectionController_1 = require("./NodeConnectionController");
/**
 * Process3DNode - A process node for 3D generation
 * Accepts: Text prompt OR Image OR Both (any combination is valid)
 */
let Process3DNode = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var Process3DNode = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.generateButton = this.generateButton;
            this.connectionMaterial = this.connectionMaterial;
            this.textInputSection = this.textInputSection;
            this.imageInputSection = this.imageInputSection;
            // Connected input nodes
            this._connectedTextNode = null;
            this._connectedImageNode = null;
            this._textConnectionCurve = null;
            this._imageConnectionCurve = null;
            // UI elements
            this._titleTextObject = null;
            this._generateButtonObject = null;
            this._textInputSectionObject = null;
            this._imageInputSectionObject = null;
            this._textInputButton = null;
            this._imageInputButton = null;
            this._initialized = false;
            this._onStartCalled = false;
        }
        __initialize() {
            super.__initialize();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.generateButton = this.generateButton;
            this.connectionMaterial = this.connectionMaterial;
            this.textInputSection = this.textInputSection;
            this.imageInputSection = this.imageInputSection;
            // Connected input nodes
            this._connectedTextNode = null;
            this._connectedImageNode = null;
            this._textConnectionCurve = null;
            this._imageConnectionCurve = null;
            // UI elements
            this._titleTextObject = null;
            this._generateButtonObject = null;
            this._textInputSectionObject = null;
            this._imageInputSectionObject = null;
            this._textInputButton = null;
            this._imageInputButton = null;
            this._initialized = false;
            this._onStartCalled = false;
        }
        onAwake() {
            print(`Process3DNode: onAwake called`);
            // Ensure BaseNode is set
            if (!this.baseNode) {
                this.baseNode = this.sceneObject.getComponent(BaseNode_1.BaseNode.getTypeName());
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
                this.baseNode = this.sceneObject.getComponent(BaseNode_1.BaseNode.getTypeName());
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
        setupNode() {
            print(`Process3DNode: setupNode() called`);
            this.setupTitle();
            this.setupGenerateButton();
            this.setupInputSections();
        }
        setupTitle() {
            if (this.titleText) {
                return;
            }
            this._titleTextObject = global.scene.createSceneObject("Process3D_Title");
            this._titleTextObject.setParent(this.sceneObject);
            this._titleTextObject.enabled = true;
            this.titleText = this._titleTextObject.createComponent("Component.Text");
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
        setupGenerateButton() {
            if (this.generateButton) {
                this.setupGenerateButtonClick();
                return;
            }
            this._generateButtonObject = global.scene.createSceneObject("Process3D_GenerateButton");
            this._generateButtonObject.setParent(this.sceneObject);
            this.generateButton = this._generateButtonObject.createComponent(RoundButton_1.RoundButton.getTypeName());
            if (this.generateButton) {
                this.generateButton.width = 3;
                const transform = this._generateButtonObject.getTransform();
                transform.setLocalPosition(new vec3(0, -3, 0));
                this.setupGenerateButtonClick();
            }
        }
        setupGenerateButtonClick() {
            if (!this.generateButton)
                return;
            if (this.generateButton.onTriggerUp) {
                this.generateButton.onTriggerUp.add(() => {
                    this.onGenerateClicked();
                });
            }
        }
        onGenerateClicked() {
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
        setupInputSections() {
            // Create text input section
            if (!this.textInputSection) {
                this._textInputSectionObject = global.scene.createSceneObject("Process3D_TextInputSection");
                this._textInputSectionObject.setParent(this.sceneObject);
                const transform = this._textInputSectionObject.getTransform();
                transform.setLocalPosition(new vec3(-2, -1, 0));
                this.textInputSection = this._textInputSectionObject;
            }
            else {
                this._textInputSectionObject = this.textInputSection;
            }
            // Create image input section
            if (!this.imageInputSection) {
                this._imageInputSectionObject = global.scene.createSceneObject("Process3D_ImageInputSection");
                this._imageInputSectionObject.setParent(this.sceneObject);
                const transform = this._imageInputSectionObject.getTransform();
                transform.setLocalPosition(new vec3(2, -1, 0));
                this.imageInputSection = this._imageInputSectionObject;
            }
            else {
                this._imageInputSectionObject = this.imageInputSection;
            }
            // Add clickable buttons to input sections
            this.setupInputSectionButtons();
        }
        /**
         * Sets up clickable buttons on input sections for connection handling
         */
        setupInputSectionButtons() {
            // Text input section button
            if (this._textInputSectionObject) {
                const textButtonObj = global.scene.createSceneObject("Process3D_TextInputButton");
                textButtonObj.setParent(this._textInputSectionObject);
                this._textInputButton = textButtonObj.createComponent(RoundButton_1.RoundButton.getTypeName());
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
                this._imageInputButton = imageButtonObj.createComponent(RoundButton_1.RoundButton.getTypeName());
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
        onTextInputSectionClicked() {
            print(`Process3DNode: Text input section clicked`);
            const controller = NodeConnectionController_1.NodeConnectionController.getInstance();
            if (controller) {
                controller.onProcessNodeInputClicked(this.sceneObject, "text");
            }
        }
        /**
         * Called when image input section is clicked
         */
        onImageInputSectionClicked() {
            print(`Process3DNode: Image input section clicked`);
            const controller = NodeConnectionController_1.NodeConnectionController.getInstance();
            if (controller) {
                controller.onProcessNodeInputClicked(this.sceneObject, "image");
            }
        }
        /**
         * Connects a text input node to this process node
         */
        connectTextInput(sourceNode) {
            if (this._connectedTextNode) {
                print(`Process3DNode: Text input already connected`);
                return false;
            }
            const promptNode = sourceNode.getComponent(InputNodePrompt_1.InputNodePrompt.getTypeName());
            if (!promptNode) {
                print(`Process3DNode: Source node is not an InputNodePrompt`);
                return false;
            }
            this._connectedTextNode = sourceNode;
            promptNode.addChildNode(this.sceneObject);
            // Create BezierCurve connection
            this.createTextConnection(sourceNode, promptNode);
            print(`Process3DNode: Text input connected from ${sourceNode.name}`);
            return true;
        }
        /**
         * Connects an image input node to this process node
         */
        connectImageInput(sourceNode) {
            if (this._connectedImageNode) {
                print(`Process3DNode: Image input already connected`);
                return false;
            }
            const imageNode = sourceNode.getComponent(InputNodeImage_1.InputNodeImage.getTypeName());
            if (!imageNode) {
                print(`Process3DNode: Source node is not an InputNodeImage`);
                return false;
            }
            this._connectedImageNode = sourceNode;
            imageNode.addChildNode(this.sceneObject);
            // Create BezierCurve connection
            this.createImageConnection(sourceNode, imageNode);
            print(`Process3DNode: Image input connected from ${sourceNode.name}`);
            return true;
        }
        createTextConnection(sourceNode, promptNode) {
            if (!this._textInputSectionObject) {
                print(`Process3DNode: Cannot create text connection - missing input section`);
                return;
            }
            // Get connection material from controller if not set
            let material = this.connectionMaterial;
            if (!material) {
                const controller = NodeConnectionController_1.NodeConnectionController.getInstance();
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
            const bezierCurve = connectionObject.createComponent(BezierCurve_1.BezierCurve.getTypeName());
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
        createImageConnection(sourceNode, imageNode) {
            if (!this.connectionMaterial || !this._imageInputSectionObject) {
                print(`Process3DNode: Cannot create image connection - missing material or input section`);
                return;
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
            const bezierCurve = connectionObject.createComponent(BezierCurve_1.BezierCurve.getTypeName());
            if (bezierCurve) {
                bezierCurve.startPoint = startPoint;
                bezierCurve.endPoint = endPoint;
                bezierCurve.lineMaterial = this.connectionMaterial;
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
        canGenerate() {
            const hasText = this._connectedTextNode !== null;
            const hasImage = this._connectedImageNode !== null;
            // At least one input is required
            return hasText || hasImage;
        }
        /**
         * Gets text input data from connected node
         */
        getTextInputData() {
            if (!this._connectedTextNode) {
                return null;
            }
            const promptNode = this._connectedTextNode.getComponent(InputNodePrompt_1.InputNodePrompt.getTypeName());
            if (promptNode) {
                return promptNode.getOutputData();
            }
            return null;
        }
        /**
         * Gets image input data from connected node
         */
        getImageInputData() {
            if (!this._connectedImageNode) {
                return null;
            }
            const imageNode = this._connectedImageNode.getComponent(InputNodeImage_1.InputNodeImage.getTypeName());
            if (imageNode) {
                return imageNode.getOutputData();
            }
            return null;
        }
        /**
         * Performs the actual generation (to be implemented with API calls)
         */
        performGeneration(textData, imageData) {
            // TODO: Implement actual 3D generation
            print(`Process3DNode: performGeneration called`);
            print(`  Text: ${textData?.promptText || "none"}`);
            print(`  Image: ${imageData?.texture ? "present" : "none"}`);
        }
        /**
         * Gets the generate button
         */
        getGenerateButton() {
            return this.generateButton;
        }
        /**
         * Gets input section positions for connection targeting
         */
        getTextInputSectionPosition() {
            if (this._textInputSectionObject) {
                return this._textInputSectionObject.getTransform().getWorldPosition();
            }
            return null;
        }
        getImageInputSectionPosition() {
            if (this._imageInputSectionObject) {
                return this._imageInputSectionObject.getTransform().getWorldPosition();
            }
            return null;
        }
    };
    __setFunctionName(_classThis, "Process3DNode");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Process3DNode = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Process3DNode = _classThis;
})();
exports.Process3DNode = Process3DNode;
//# sourceMappingURL=Process3DNode.js.map