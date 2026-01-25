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
const CapsuleButton_1 = require("SpectaclesUIKit.lspkg/Scripts/Components/Button/CapsuleButton");
const BezierCurve_1 = require("../../RuntimeGizmos.lspkg/Scripts/BezierCurve");
const InputNodePrompt_1 = require("./InputNodePrompt");
const InputNodeImage_1 = require("./InputNodeImage");
const NodeConnectionController_1 = require("./NodeConnectionController");
const Snap3D_1 = require("RemoteServiceGateway.lspkg/HostedSnap/Snap3D");
const Gemini_1 = require("RemoteServiceGateway.lspkg/HostedExternal/Gemini");
const Interactable_1 = require("SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable");
const InteractableStateMachine_1 = require("SpectaclesUIKit.lspkg/Scripts/Utility/InteractableStateMachine");
const InteractableManipulation_1 = require("SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation");
const Interactor_1 = require("SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor");
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
            this.refineMesh = this.refineMesh;
            this.useVertexColor = this.useVertexColor;
            this.modelScale = this.modelScale;
            this.makeInteractable = this.makeInteractable;
            this.modelRoot = this.modelRoot;
            this.modelMaterial = this.modelMaterial;
            this.statusText = this.statusText;
            this.loadingIndicator = this.loadingIndicator;
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
            this._textInputButtonId = "";
            this._imageInputButtonId = "";
            this._initialized = false;
            this._onStartCalled = false;
            // Track connections - can have multiple connections to same input type
            this._textConnections = new Map();
            this._imageConnections = new Map();
            // Generation state
            this._isGenerating = false;
            this._currentModel = null;
            this._tempModel = null; // Temporary base mesh model
            this._generatedModels = []; // Array to store all generated models
        }
        __initialize() {
            super.__initialize();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.generateButton = this.generateButton;
            this.connectionMaterial = this.connectionMaterial;
            this.textInputSection = this.textInputSection;
            this.imageInputSection = this.imageInputSection;
            this.refineMesh = this.refineMesh;
            this.useVertexColor = this.useVertexColor;
            this.modelScale = this.modelScale;
            this.makeInteractable = this.makeInteractable;
            this.modelRoot = this.modelRoot;
            this.modelMaterial = this.modelMaterial;
            this.statusText = this.statusText;
            this.loadingIndicator = this.loadingIndicator;
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
            this._textInputButtonId = "";
            this._imageInputButtonId = "";
            this._initialized = false;
            this._onStartCalled = false;
            // Track connections - can have multiple connections to same input type
            this._textConnections = new Map();
            this._imageConnections = new Map();
            // Generation state
            this._isGenerating = false;
            this._currentModel = null;
            this._tempModel = null; // Temporary base mesh model
            this._generatedModels = []; // Array to store all generated models
        }
        onAwake() {
            print(`Process3DNode: onAwake called`);
            // Ensure modelRoot exists
            if (!this.modelRoot) {
                print("Process3DNode: Creating default model root");
                this.modelRoot = global.scene.createSceneObject("3DModelRoot");
                this.modelRoot.setParent(this.sceneObject);
                const transform = this.modelRoot.getTransform();
                transform.setLocalPosition(new vec3(0, -3, 0));
            }
            this.updateStatus("Ready. Connect inputs and generate.");
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
                this.updateGenerateButtonState();
                return;
            }
            this._generateButtonObject = global.scene.createSceneObject("Process3D_GenerateButton");
            this._generateButtonObject.setParent(this.sceneObject);
            this.generateButton = this._generateButtonObject.createComponent(CapsuleButton_1.CapsuleButton.getTypeName());
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
        updateGenerateButtonState() {
            if (!this.generateButton)
                return;
            const canGen = this.canGenerate();
            print(`Process3DNode: Generate button state - Can generate: ${canGen}`);
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
         * Generates a unique button ID
         */
        generateButtonId() {
            return `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        /**
         * Sets up clickable buttons on input sections for connection handling
         */
        setupInputSectionButtons() {
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
            print(`Process3DNode: Text input section clicked (Button ID: ${this._textInputButtonId})`);
            let controller = NodeConnectionController_1.NodeConnectionController.getInstance();
            // If not found, try to find in scene
            if (!controller) {
                const rootObjects = global.scene.getRootObjectsCount();
                for (let i = 0; i < rootObjects; i++) {
                    const rootObject = global.scene.getRootObject(i);
                    controller = rootObject.getComponent(NodeConnectionController_1.NodeConnectionController.getTypeName());
                    if (controller) {
                        break;
                    }
                }
            }
            if (controller) {
                controller.onProcessNodeInputClicked(this.sceneObject, "text", this._textInputButtonId);
            }
            else {
                print(`Process3DNode: WARNING - NodeConnectionController not found! Connection cannot be made.`);
            }
        }
        /**
         * Called when image input section is clicked
         */
        onImageInputSectionClicked() {
            print(`Process3DNode: Image input section clicked (Button ID: ${this._imageInputButtonId})`);
            let controller = NodeConnectionController_1.NodeConnectionController.getInstance();
            // If not found, try to find in scene
            if (!controller) {
                const rootObjects = global.scene.getRootObjectsCount();
                for (let i = 0; i < rootObjects; i++) {
                    const rootObject = global.scene.getRootObject(i);
                    controller = rootObject.getComponent(NodeConnectionController_1.NodeConnectionController.getTypeName());
                    if (controller) {
                        break;
                    }
                }
            }
            if (controller) {
                controller.onProcessNodeInputClicked(this.sceneObject, "image", this._imageInputButtonId);
            }
            else {
                print(`Process3DNode: WARNING - NodeConnectionController not found! Connection cannot be made.`);
            }
        }
        /**
         * Connects a text input node to this process node
         * Can have multiple text connections
         */
        connectTextInput(sourceNode, sourceButtonId = "") {
            const promptNode = sourceNode.getComponent(InputNodePrompt_1.InputNodePrompt.getTypeName());
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
        connectImageInput(sourceNode, sourceButtonId = "") {
            const imageNode = sourceNode.getComponent(InputNodeImage_1.InputNodeImage.getTypeName());
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
        createTextConnection(sourceNode, promptNode, connectionId) {
            if (!this._textInputSectionObject) {
                print(`Process3DNode: Cannot create text connection - missing input section`);
                return null;
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
            // Create connection object with unique ID
            const connectionObject = global.scene.createSceneObject(`Process3D_TextConnection_${connectionId}`);
            connectionObject.setParent(this.sceneObject);
            // Create start point at source node's output button
            const startPoint = global.scene.createSceneObject("TextConnection_Start");
            const startPos = promptNode.getOutputButtonWorldPosition();
            if (startPos) {
                startPoint.getTransform().setWorldPosition(startPos);
            }
            else {
                // Fallback to source node position if button position not available
                startPoint.getTransform().setWorldPosition(sourceNode.getTransform().getWorldPosition());
            }
            startPoint.setParent(connectionObject);
            // Create end point at text input section
            const endPoint = global.scene.createSceneObject("TextConnection_End");
            endPoint.getTransform().setWorldPosition(this._textInputSectionObject.getTransform().getWorldPosition());
            endPoint.setParent(connectionObject);
            // Wait a frame to ensure SceneObjects are fully initialized before creating BezierCurve
            // This prevents the "startPoint was not provided" error
            this.createEvent("UpdateEvent").bind(() => {
                // Create BezierCurve after objects are initialized
                const bezierCurve = connectionObject.createComponent(BezierCurve_1.BezierCurve.getTypeName());
                if (bezierCurve) {
                    bezierCurve.startPoint = startPoint;
                    bezierCurve.endPoint = endPoint;
                    if (material) {
                        bezierCurve.lineMaterial = material;
                    }
                    bezierCurve.curveHeight = 0.2;
                    bezierCurve.interpolationPoints = 20;
                    print(`Process3DNode: Text connection curve created (ID: ${connectionId})`);
                    // Store the connection
                    this._textConnections.set(connectionId, { sourceNode: sourceNode, curve: bezierCurve, connectionId: connectionId });
                }
            });
            // Return null for now, the curve will be created in the next frame
            // The connection is still tracked via the Map
            return null;
        }
        createImageConnection(sourceNode, imageNode, connectionId) {
            if (!this._imageInputSectionObject) {
                print(`Process3DNode: Cannot create image connection - missing input section`);
                return null;
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
            // Create connection object with unique ID
            const connectionObject = global.scene.createSceneObject(`Process3D_ImageConnection_${connectionId}`);
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
                if (material) {
                    bezierCurve.lineMaterial = material;
                }
                bezierCurve.curveHeight = 0.2;
                bezierCurve.interpolationPoints = 20;
                print(`Process3DNode: Image connection curve created (ID: ${connectionId})`);
                return bezierCurve;
            }
            return null;
        }
        /**
         * Checks if generation can be performed (validation)
         * 3D generation accepts: Text OR Image OR Both
         */
        canGenerate() {
            const hasText = this._textConnections.size > 0;
            const hasImage = this._imageConnections.size > 0;
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
         * Performs the actual 3D generation using Snap3D API
         */
        performGeneration(textData, imageData) {
            if (this._isGenerating) {
                print(`Process3DNode: Already generating, please wait...`);
                this.updateStatus("Already generating...");
                return;
            }
            const hasText = textData && textData.promptText && textData.promptText.trim() !== "";
            const hasImage = imageData && imageData.texture;
            if (!hasText && !hasImage) {
                print(`Process3DNode: ERROR - No input provided (need text or image)`);
                this.updateStatus("Error: Text or image input required");
                return;
            }
            if (!this.modelMaterial) {
                print(`Process3DNode: ERROR - Material is required for 3D generation`);
                this.updateStatus("Error: Material is required. Please assign a material in the inspector.");
                return;
            }
            this._isGenerating = true;
            this.setLoading(true);
            this.updateStatus("Preparing generation...");
            print(`Process3DNode: Starting 3D generation`);
            print(`  Text: ${hasText ? textData.promptText : "none"}`);
            print(`  Image: ${hasImage ? "present" : "none"}`);
            // Get or generate prompt
            let promptToUse = null;
            if (hasText) {
                promptToUse = textData.promptText.trim();
            }
            else if (hasImage) {
                // Use Gemini to describe the image
                this.updateStatus("Describing image...");
                this.describeImageWithGemini(imageData.texture)
                    .then((description) => {
                    print("Process3DNode: Image described as: " + description);
                    this.generate3DWithPrompt(description);
                })
                    .catch((error) => {
                    print("Process3DNode: Error describing image: " + error);
                    this.updateStatus("Error describing image: " + error);
                    this._isGenerating = false;
                    this.setLoading(false);
                });
                return;
            }
            if (promptToUse) {
                this.generate3DWithPrompt(promptToUse);
            }
        }
        /**
         * Use Gemini to describe the image
         */
        describeImageWithGemini(imageTexture) {
            return new Promise((resolve, reject) => {
                Base64.encodeTextureAsync(imageTexture, (base64Data) => {
                    const request = {
                        model: "gemini-2.0-flash-exp",
                        type: "generateContent",
                        body: {
                            contents: [
                                {
                                    parts: [
                                        {
                                            inlineData: {
                                                mimeType: "image/png",
                                                data: base64Data
                                            }
                                        },
                                        {
                                            text: "Describe this image in detail in one sentence. Focus on the main subject, style, and key visual elements. This description will be used to generate a 3D model."
                                        }
                                    ],
                                    role: "user"
                                }
                            ]
                        }
                    };
                    print("Process3DNode: Asking Gemini to describe image...");
                    Gemini_1.Gemini.models(request)
                        .then((response) => {
                        if (!response.candidates || response.candidates.length === 0) {
                            reject("No response from Gemini");
                            return;
                        }
                        const textParts = response.candidates[0].content.parts
                            .filter((part) => part.text)
                            .map((part) => part.text);
                        if (textParts.length === 0) {
                            reject("No text description in Gemini response");
                            return;
                        }
                        const description = textParts.join(" ").trim();
                        resolve(description);
                    })
                        .catch((error) => {
                        let errorMessage = "Unknown error";
                        if (error) {
                            if (typeof error === "string") {
                                errorMessage = error;
                            }
                            else if (error.message) {
                                errorMessage = error.message;
                            }
                            else {
                                errorMessage = JSON.stringify(error);
                            }
                        }
                        reject("Error describing image: " + errorMessage);
                    });
                }, () => {
                    reject("Failed to encode image texture");
                }, CompressionQuality.LowQuality, EncodingType.Png);
            });
        }
        /**
         * Generate 3D model using Snap3D with the given prompt
         */
        generate3DWithPrompt(prompt) {
            this.updateStatus("Generating 3D model...");
            print("Process3DNode: Generating 3D model with prompt: " + prompt);
            // Clean up temporary model (base mesh) if exists
            if (this._tempModel) {
                this._tempModel.destroy();
                this._tempModel = null;
            }
            Snap3D_1.Snap3D.submitAndGetStatus({
                prompt: prompt,
                format: "glb",
                refine: this.refineMesh,
                use_vertex_color: this.useVertexColor
            })
                .then((submitGetStatusResults) => {
                print("Process3DNode: 3D generation started, task ID: " + submitGetStatusResults.task_id);
                submitGetStatusResults.event.add(([value, assetOrError]) => {
                    if (value === "image") {
                        print("Process3DNode: Preview image received");
                        // Preview image received, but we'll wait for the mesh
                    }
                    else if (value === "base_mesh") {
                        print("Process3DNode: Base mesh received");
                        const gltfAssetData = assetOrError;
                        this.instantiateModel(gltfAssetData.gltfAsset, false, false);
                    }
                    else if (value === "refined_mesh") {
                        print("Process3DNode: Refined mesh received");
                        const gltfAssetData = assetOrError;
                        // Clean up temp model when refined mesh arrives
                        if (this._tempModel) {
                            this._tempModel.destroy();
                            this._tempModel = null;
                        }
                        this.instantiateModel(gltfAssetData.gltfAsset, true, true);
                    }
                    else if (value === "failed") {
                        const error = assetOrError;
                        print("Process3DNode: Generation failed: " + error.errorMsg + " (Code: " + error.errorCode + ")");
                        this.updateStatus("Error: " + error.errorMsg);
                        this._isGenerating = false;
                        this.setLoading(false);
                    }
                });
            })
                .catch((error) => {
                print("Process3DNode: Error submitting 3D generation: " + error);
                this.updateStatus("Error: " + error);
                this._isGenerating = false;
                this.setLoading(false);
            });
        }
        /**
         * Instantiate the 3D model in the scene with interactivity support
         */
        instantiateModel(gltfAsset, isRefined, isFinal) {
            // Ensure modelRoot exists
            if (!this.modelRoot) {
                print("Process3DNode: Warning - No model root assigned, creating default");
                this.modelRoot = global.scene.createSceneObject("3DModelRoot");
                this.modelRoot.setParent(this.sceneObject);
            }
            // Validate material (required for instantiation)
            if (!this.modelMaterial) {
                print("Process3DNode: Error - Material is required for instantiation");
                this.updateStatus("Error: Material is required. Please assign a material in the inspector.");
                this._isGenerating = false;
                this.setLoading(false);
                return;
            }
            // Use async instantiation
            gltfAsset.tryInstantiateAsync(this.modelRoot, this.modelMaterial, (sceneObject) => {
                // Success callback
                if (sceneObject) {
                    print("Process3DNode: 3D model instantiated successfully (" + (isRefined ? "refined" : "base") + " mesh)");
                    // Apply scaling
                    const sizeVec = vec3.one().uniformScale(this.modelScale);
                    sceneObject.getTransform().setLocalScale(sizeVec);
                    // Make interactable if enabled
                    let finalModelObject = sceneObject;
                    if (this.makeInteractable && isFinal) {
                        finalModelObject = this.makeModelInteractable(sceneObject);
                        if (!finalModelObject) {
                            finalModelObject = sceneObject;
                        }
                    }
                    // Store the model
                    if (isFinal) {
                        this._currentModel = finalModelObject;
                        this._generatedModels.push(finalModelObject);
                        print("Process3DNode: Model added to generated models list (total: " + this._generatedModels.length + ")");
                    }
                    else {
                        this._tempModel = sceneObject;
                    }
                    if (isRefined && isFinal) {
                        // Refined mesh is complete
                        this.updateStatus("3D model generated successfully! (Total: " + this._generatedModels.length + ")");
                        this._isGenerating = false;
                        this.setLoading(false);
                    }
                    else if (!isRefined) {
                        // Base mesh loaded, waiting for refined mesh
                        this.updateStatus("Base mesh loaded, refining...");
                    }
                }
                else {
                    print("Process3DNode: Warning - Instantiation callback returned null");
                    this.updateStatus("Warning: Model instantiation returned null");
                    if (isRefined && isFinal) {
                        this._isGenerating = false;
                        this.setLoading(false);
                    }
                }
            }, (error) => {
                // Failure callback
                print("Process3DNode: Error instantiating model: " + error);
                this.updateStatus("Error instantiating model: " + error);
                this._isGenerating = false;
                this.setLoading(false);
            }, (progress) => {
                // Progress callback
                print("Process3DNode: Instantiation progress: " + (progress * 100).toFixed(0) + "%");
            });
        }
        /**
         * Make a model interactable (draggable) by adding necessary components
         */
        makeModelInteractable(model) {
            try {
                // Create a wrapper SceneObject for the model
                const wrapper = global.scene.createSceneObject("InteractableModel_" + this._generatedModels.length);
                // Move model to be a child of the wrapper
                const modelTransform = model.getTransform();
                const localPos = modelTransform.getLocalPosition();
                const localRot = modelTransform.getLocalRotation();
                const localScale = modelTransform.getLocalScale();
                model.setParent(wrapper);
                // Restore transform
                modelTransform.setLocalPosition(localPos);
                modelTransform.setLocalRotation(localRot);
                modelTransform.setLocalScale(localScale);
                // Add Interactable component
                const interactable = wrapper.createComponent(Interactable_1.Interactable.getTypeName());
                interactable.targetingMode = Interactor_1.TargetingMode.All;
                interactable.enableInstantDrag = true;
                // Add InteractableStateMachine
                const stateMachine = wrapper.createComponent(InteractableStateMachine_1.InteractableStateMachine.getTypeName());
                stateMachine.initialize();
                stateMachine.isDraggable = true;
                // Add InteractableManipulation
                const manipulation = wrapper.createComponent(InteractableManipulation_1.InteractableManipulation.getTypeName());
                manipulation.enabled = true;
                // Add ColliderComponent
                const colliderObj = global.scene.createSceneObject("Collider");
                colliderObj.setParent(wrapper);
                const collider = colliderObj.createComponent("ColliderComponent");
                collider.fitVisual = false;
                // Create a box shape for the collider
                const colliderShape = Shape.createBoxShape();
                colliderShape.size = vec3.one().uniformScale(this.modelScale * 1.2);
                collider.shape = colliderShape;
                collider.enabled = true;
                print("Process3DNode: Model made interactable (draggable)");
                return wrapper;
            }
            catch (error) {
                print("Process3DNode: Warning - Could not make model interactable: " + error);
                return null;
            }
        }
        /**
         * Update status text
         */
        updateStatus(message) {
            if (this.statusText) {
                this.statusText.text = message;
            }
        }
        /**
         * Set loading indicator visibility
         */
        setLoading(loading) {
            if (this.loadingIndicator) {
                this.loadingIndicator.enabled = loading;
            }
        }
        /**
         * Get all generated models
         */
        getGeneratedModels() {
            return this._generatedModels.slice();
        }
        /**
         * Clear all generated models from the scene
         */
        clearAllModels() {
            for (const model of this._generatedModels) {
                if (model && !isNull(model)) {
                    model.destroy();
                }
            }
            this._generatedModels = [];
            this._currentModel = null;
            this._tempModel = null;
            print("Process3DNode: All models cleared");
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