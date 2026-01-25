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
exports.ProcessImageGenNode = void 0;
var __selfType = requireType("./ProcessImageGenNode");
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
const Gemini_1 = require("RemoteServiceGateway.lspkg/HostedExternal/Gemini");
/**
 * ProcessImageGenNode - A process node for image generation
 * Accepts: Text prompt (required) OR Text + Image (image-to-image)
 * Does NOT accept: Image alone (that's image-to-image, not generation)
 *
 * REQUIRES: RemoteServiceGatewayCredentials component in the scene with Google Token configured
 * Setup: Add RemoteServiceGatewayCredentials to a SceneObject and configure your Google/Gemini API token
 */
let ProcessImageGenNode = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var ProcessImageGenNode = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.generateButton = this.generateButton;
            this.connectionMaterial = this.connectionMaterial;
            this.textInputSection = this.textInputSection;
            this.imageInputSection = this.imageInputSection;
            this.outputImage = this.outputImage;
            this.statusText = this.statusText;
            this.loadingIndicator = this.loadingIndicator;
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
            this._textInputButtonId = "";
            this._imageInputButtonId = "";
            this._initialized = false;
            this._onStartCalled = false;
            // Track connections - can have multiple connections to same input type
            this._textConnections = new Map();
            this._imageConnections = new Map();
            // Generation state
            this._isGenerating = false;
            this._outputImageObject = null;
        }
        __initialize() {
            super.__initialize();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.generateButton = this.generateButton;
            this.connectionMaterial = this.connectionMaterial;
            this.textInputSection = this.textInputSection;
            this.imageInputSection = this.imageInputSection;
            this.outputImage = this.outputImage;
            this.statusText = this.statusText;
            this.loadingIndicator = this.loadingIndicator;
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
            this._textInputButtonId = "";
            this._imageInputButtonId = "";
            this._initialized = false;
            this._onStartCalled = false;
            // Track connections - can have multiple connections to same input type
            this._textConnections = new Map();
            this._imageConnections = new Map();
            // Generation state
            this._isGenerating = false;
            this._outputImageObject = null;
        }
        onAwake() {
            print(`ProcessImageGenNode: onAwake called`);
            // Ensure BaseNode is set
            if (!this.baseNode) {
                this.baseNode = this.sceneObject.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (!this.baseNode) {
                    print("ProcessImageGenNode: ERROR - BaseNode component not found!");
                    return;
                }
            }
            if (this.baseNode) {
                this.baseNode.nodeType = "image";
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
            print(`ProcessImageGenNode: onStart called`);
            if (!this.baseNode) {
                this.baseNode = this.sceneObject.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (!this.baseNode) {
                    print(`ProcessImageGenNode: ERROR - BaseNode not found`);
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
            print(`ProcessImageGenNode: setupNode() called`);
            this.setupTitle();
            this.setupGenerateButton();
            this.setupInputSections();
        }
        setupTitle() {
            if (this.titleText) {
                return;
            }
            this._titleTextObject = global.scene.createSceneObject("ProcessImageGen_Title");
            this._titleTextObject.setParent(this.sceneObject);
            this._titleTextObject.enabled = true;
            this.titleText = this._titleTextObject.createComponent("Component.Text");
            if (this.titleText) {
                this.titleText.text = "Image Generation";
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
            this._generateButtonObject = global.scene.createSceneObject("ProcessImageGen_GenerateButton");
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
            // Enable/disable button based on validation
            // Note: RoundButton might not have enabled property, so we'll just track it
            print(`ProcessImageGenNode: Generate button state - Can generate: ${canGen}`);
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
            print(`ProcessImageGenNode: Generate button clicked`);
            // Validate inputs
            if (!this.canGenerate()) {
                print(`ProcessImageGenNode: Cannot generate - missing required inputs`);
                return;
            }
            // Get input data
            const textData = this.getTextInputData();
            const imageData = this.getImageInputData();
            print(`ProcessImageGenNode: Generating with text: "${textData?.promptText || "none"}", image: ${!!imageData?.texture}`);
            // TODO: Call image generation API (Gemini, etc.)
            this.performGeneration(textData, imageData);
        }
        setupInputSections() {
            // Create text input section
            if (!this.textInputSection) {
                this._textInputSectionObject = global.scene.createSceneObject("ProcessImageGen_TextInputSection");
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
                this._imageInputSectionObject = global.scene.createSceneObject("ProcessImageGen_ImageInputSection");
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
                const textButtonObj = global.scene.createSceneObject("ProcessImageGen_TextInputButton");
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
                const imageButtonObj = global.scene.createSceneObject("ProcessImageGen_ImageInputButton");
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
            print(`ProcessImageGenNode: Text input section clicked (Button ID: ${this._textInputButtonId})`);
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
                print(`ProcessImageGenNode: WARNING - NodeConnectionController not found! Connection cannot be made.`);
            }
        }
        /**
         * Called when image input section is clicked
         */
        onImageInputSectionClicked() {
            print(`ProcessImageGenNode: Image input section clicked (Button ID: ${this._imageInputButtonId})`);
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
                print(`ProcessImageGenNode: WARNING - NodeConnectionController not found! Connection cannot be made.`);
            }
        }
        /**
         * Connects a text input node to this process node
         * Can have multiple text connections
         */
        connectTextInput(sourceNode, sourceButtonId = "") {
            const promptNode = sourceNode.getComponent(InputNodePrompt_1.InputNodePrompt.getTypeName());
            if (!promptNode) {
                print(`ProcessImageGenNode: Source node is not an InputNodePrompt`);
                return false;
            }
            // Generate unique connection ID
            const connectionId = `text_${sourceButtonId || promptNode.getOutputButtonId()}_${this._textInputButtonId}_${Date.now()}`;
            // Check if this exact connection already exists
            if (this._textConnections.has(connectionId)) {
                print(`ProcessImageGenNode: Text connection already exists: ${connectionId}`);
                return false;
            }
            // Add to child nodes (input node tracks this)
            promptNode.addChildNode(this.sceneObject);
            // Store connection info immediately (curve will be created in next frame)
            this._textConnections.set(connectionId, {
                sourceNode: sourceNode,
                curve: null, // Will be set when BezierCurve is created
                connectionId: connectionId
            });
            // Create BezierCurve connection (will be created in next frame)
            this.createTextConnection(sourceNode, promptNode, connectionId);
            // Set first connected node for data access (can be any of them)
            if (!this._connectedTextNode) {
                this._connectedTextNode = sourceNode;
            }
            // Update generate button state
            this.updateGenerateButtonState();
            print(`ProcessImageGenNode: Text input connected from ${sourceNode.name} (Connection ID: ${connectionId}, Total: ${this._textConnections.size})`);
            return true;
        }
        /**
         * Connects an image input node to this process node
         * Can have multiple image connections
         */
        connectImageInput(sourceNode, sourceButtonId = "") {
            const imageNode = sourceNode.getComponent(InputNodeImage_1.InputNodeImage.getTypeName());
            if (!imageNode) {
                print(`ProcessImageGenNode: Source node is not an InputNodeImage`);
                return false;
            }
            // Generate unique connection ID
            const connectionId = `image_${sourceButtonId || imageNode.getOutputButtonId()}_${this._imageInputButtonId}_${Date.now()}`;
            // Check if this exact connection already exists
            if (this._imageConnections.has(connectionId)) {
                print(`ProcessImageGenNode: Image connection already exists: ${connectionId}`);
                return false;
            }
            // Add to child nodes (input node tracks this)
            imageNode.addChildNode(this.sceneObject);
            // Store connection info immediately (curve will be created in next frame)
            this._imageConnections.set(connectionId, {
                sourceNode: sourceNode,
                curve: null, // Will be set when BezierCurve is created
                connectionId: connectionId
            });
            // Create BezierCurve connection (will be created in next frame)
            this.createImageConnection(sourceNode, imageNode, connectionId);
            // Set first connected node for data access (can be any of them)
            if (!this._connectedImageNode) {
                this._connectedImageNode = sourceNode;
            }
            // Update generate button state
            this.updateGenerateButtonState();
            print(`ProcessImageGenNode: Image input connected from ${sourceNode.name} (Connection ID: ${connectionId}, Total: ${this._imageConnections.size})`);
            return true;
        }
        createTextConnection(sourceNode, promptNode, connectionId) {
            if (!this._textInputSectionObject) {
                print(`ProcessImageGenNode: Cannot create text connection - missing input section`);
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
                print(`ProcessImageGenNode: WARNING - No connection material available, connection will not be visible`);
            }
            // Create connection object with unique ID
            const connectionObject = global.scene.createSceneObject(`ProcessImageGen_TextConnection_${connectionId}`);
            connectionObject.setParent(this.sceneObject);
            // Get the actual output button object from the input node (start point)
            const startPoint = promptNode.getOutputButtonObject();
            if (!startPoint) {
                print(`ProcessImageGenNode: ERROR - Cannot get output button object from prompt node`);
                return null;
            }
            // Use the text input section object as the end point
            const endPoint = this._textInputSectionObject;
            if (!endPoint) {
                print(`ProcessImageGenNode: ERROR - Text input section object is null`);
                return null;
            }
            // Wait a frame to ensure SceneObjects are fully initialized before creating BezierCurve
            // This prevents the "startPoint was not provided" error
            let callbackExecuted = false;
            this.createEvent("UpdateEvent").bind(() => {
                if (callbackExecuted)
                    return; // Only execute once
                callbackExecuted = true;
                // Verify objects are still valid
                if (!startPoint || !endPoint || isNull(startPoint) || isNull(endPoint)) {
                    print(`ProcessImageGenNode: ERROR - startPoint or endPoint is null/invalid, cannot create BezierCurve`);
                    return;
                }
                // Create BezierCurve after objects are initialized
                try {
                    const bezierCurve = connectionObject.createComponent(BezierCurve_1.BezierCurve.getTypeName());
                    if (bezierCurve) {
                        // Set properties immediately after creation
                        bezierCurve.startPoint = startPoint;
                        bezierCurve.endPoint = endPoint;
                        if (material) {
                            bezierCurve.lineMaterial = material;
                        }
                        bezierCurve.curveHeight = 0.2;
                        bezierCurve.interpolationPoints = 20;
                        print(`ProcessImageGenNode: Text connection curve created (ID: ${connectionId})`);
                        // Store the connection
                        this._textConnections.set(connectionId, { sourceNode: sourceNode, curve: bezierCurve, connectionId: connectionId });
                    }
                }
                catch (error) {
                    print(`ProcessImageGenNode: ERROR - Failed to create BezierCurve: ${error}`);
                }
            });
            // Return null for now, the curve will be created in the next frame
            // The connection is still tracked via the Map
            return null;
        }
        createImageConnection(sourceNode, imageNode, connectionId) {
            if (!this._imageInputSectionObject) {
                print(`ProcessImageGenNode: Cannot create image connection - missing input section`);
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
                print(`ProcessImageGenNode: WARNING - No connection material available, connection will not be visible`);
            }
            // Create connection object with unique ID
            const connectionObject = global.scene.createSceneObject(`ProcessImageGen_ImageConnection_${connectionId}`);
            connectionObject.setParent(this.sceneObject);
            // Get the actual output button object from the input node (start point)
            const startPoint = imageNode.getOutputButtonObject();
            if (!startPoint) {
                print(`ProcessImageGenNode: ERROR - Cannot get output button object from image node`);
                return null;
            }
            // Use the image input section object as the end point
            const endPoint = this._imageInputSectionObject;
            if (!endPoint) {
                print(`ProcessImageGenNode: ERROR - Image input section object is null`);
                return null;
            }
            // Wait a frame to ensure SceneObjects are fully initialized before creating BezierCurve
            // This prevents the "startPoint was not provided" error
            let callbackExecuted = false;
            this.createEvent("UpdateEvent").bind(() => {
                if (callbackExecuted)
                    return; // Only execute once
                callbackExecuted = true;
                // Verify objects are still valid
                if (!startPoint || !endPoint || isNull(startPoint) || isNull(endPoint)) {
                    print(`ProcessImageGenNode: ERROR - startPoint or endPoint is null/invalid, cannot create BezierCurve`);
                    return;
                }
                // Create BezierCurve after objects are initialized
                try {
                    const bezierCurve = connectionObject.createComponent(BezierCurve_1.BezierCurve.getTypeName());
                    if (bezierCurve) {
                        // Set properties immediately after creation
                        bezierCurve.startPoint = startPoint;
                        bezierCurve.endPoint = endPoint;
                        if (material) {
                            bezierCurve.lineMaterial = material;
                        }
                        bezierCurve.curveHeight = 0.2;
                        bezierCurve.interpolationPoints = 20;
                        print(`ProcessImageGenNode: Image connection curve created (ID: ${connectionId})`);
                        // Store the connection
                        this._imageConnections.set(connectionId, { sourceNode: sourceNode, curve: bezierCurve, connectionId: connectionId });
                    }
                }
                catch (error) {
                    print(`ProcessImageGenNode: ERROR - Failed to create BezierCurve: ${error}`);
                }
            });
            // Return null for now, the curve will be created in the next frame
            // The connection is still tracked via the Map
            return null;
        }
        /**
         * Checks if generation can be performed (validation)
         */
        canGenerate() {
            // Image generation requires text (text alone OR text + image)
            // Image alone is NOT valid (that's image-to-image, not generation)
            const hasText = this._textConnections.size > 0;
            const hasImage = this._imageConnections.size > 0;
            if (!hasText) {
                return false; // Must have text
            }
            // Text alone is valid, text + image is valid
            return true;
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
         * Performs the actual generation using Gemini API
         */
        performGeneration(textData, imageData) {
            if (this._isGenerating) {
                print(`ProcessImageGenNode: Already generating, please wait...`);
                this.updateStatus("Already generating...");
                return;
            }
            if (!textData || !textData.promptText || textData.promptText.trim() === "") {
                print(`ProcessImageGenNode: ERROR - No text prompt provided`);
                this.updateStatus("Error: Text prompt is required");
                return;
            }
            const prompt = textData.promptText.trim();
            const sourceImage = imageData?.texture || null;
            this._isGenerating = true;
            this.setLoading(true);
            this.updateStatus("Generating image...");
            print(`ProcessImageGenNode: Starting generation`);
            print(`  Prompt: ${prompt}`);
            print(`  Source Image: ${sourceImage ? "present (image-to-image)" : "none (text-to-image)"}`);
            if (sourceImage) {
                // Image-to-image generation
                this.generateImageFromImage(prompt, sourceImage);
            }
            else {
                // Text-to-image generation
                this.generateImageFromText(prompt);
            }
        }
        /**
         * Generate image from text prompt using Gemini
         */
        generateImageFromText(prompt) {
            const request = {
                model: "gemini-2.0-flash-preview-image-generation",
                type: "generateContent",
                body: {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ],
                            role: "user"
                        }
                    ],
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                }
            };
            print("ProcessImageGenNode: Sending text-to-image request to Gemini...");
            Gemini_1.Gemini.models(request)
                .then((response) => {
                print("ProcessImageGenNode: Gemini response received");
                if (!response.candidates || response.candidates.length === 0) {
                    throw new Error("No image generated in response");
                }
                let foundImage = false;
                for (const part of response.candidates[0].content.parts) {
                    if (part?.inlineData) {
                        foundImage = true;
                        const b64Data = part.inlineData.data;
                        print("ProcessImageGenNode: Found image data in response, decoding...");
                        Base64.decodeTextureAsync(b64Data, (texture) => {
                            print("ProcessImageGenNode: Texture decoded successfully");
                            this.displayGeneratedImage(texture);
                            this._isGenerating = false;
                            this.setLoading(false);
                            this.updateStatus("Image generated successfully!");
                        }, () => {
                            throw new Error("Failed to decode texture from base64 data");
                        });
                        break;
                    }
                }
                if (!foundImage) {
                    const responseStr = JSON.stringify(response, null, 2);
                    print("ProcessImageGenNode: No image data found. Full response: " + responseStr);
                    throw new Error("No image data found in response");
                }
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
                print("ProcessImageGenNode: Gemini API error: " + errorMessage);
                this.updateStatus("Error: " + errorMessage);
                this._isGenerating = false;
                this.setLoading(false);
            });
        }
        /**
         * Generate image from image + text prompt using Gemini (image-to-image)
         */
        generateImageFromImage(prompt, sourceImage) {
            Base64.encodeTextureAsync(sourceImage, (base64Data) => {
                const request = {
                    model: "gemini-2.0-flash-preview-image-generation",
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
                                        text: prompt
                                    }
                                ],
                                role: "user"
                            }
                        ],
                        generationConfig: {
                            responseModalities: ["TEXT", "IMAGE"]
                        }
                    }
                };
                print("ProcessImageGenNode: Sending image-to-image request to Gemini...");
                Gemini_1.Gemini.models(request)
                    .then((response) => {
                    print("ProcessImageGenNode: Gemini image-to-image response received");
                    if (!response.candidates || response.candidates.length === 0) {
                        throw new Error("No image generated in response");
                    }
                    let foundImage = false;
                    for (const part of response.candidates[0].content.parts) {
                        if (part?.inlineData) {
                            foundImage = true;
                            const b64Data = part.inlineData.data;
                            print("ProcessImageGenNode: Found image data in response, decoding...");
                            Base64.decodeTextureAsync(b64Data, (texture) => {
                                print("ProcessImageGenNode: Texture decoded successfully");
                                this.displayGeneratedImage(texture);
                                this._isGenerating = false;
                                this.setLoading(false);
                                this.updateStatus("Image generated successfully!");
                            }, () => {
                                throw new Error("Failed to decode texture from base64 data");
                            });
                            break;
                        }
                    }
                    if (!foundImage) {
                        const responseStr = JSON.stringify(response, null, 2);
                        print("ProcessImageGenNode: No image data found. Full response: " + responseStr);
                        throw new Error("No image data found in response");
                    }
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
                    print("ProcessImageGenNode: Gemini API error (image-to-image): " + errorMessage);
                    this.updateStatus("Error: " + errorMessage);
                    this._isGenerating = false;
                    this.setLoading(false);
                });
            }, () => {
                print("ProcessImageGenNode: Failed to encode source image");
                this.updateStatus("Error: Failed to encode source image");
                this._isGenerating = false;
                this.setLoading(false);
            }, CompressionQuality.LowQuality, EncodingType.Png);
        }
        /**
         * Display the generated image in the output component
         */
        displayGeneratedImage(texture) {
            // Ensure output image component exists
            if (!this.outputImage) {
                // Create output image component
                if (!this._outputImageObject) {
                    this._outputImageObject = global.scene.createSceneObject("GeneratedImage");
                    this._outputImageObject.setParent(this.sceneObject);
                    const transform = this._outputImageObject.getTransform();
                    transform.setLocalPosition(new vec3(0, -2, 0));
                }
                this.outputImage = this._outputImageObject.createComponent("Image");
                if (this.outputImage) {
                    print("ProcessImageGenNode: Created output image component");
                }
            }
            if (this.outputImage && this.outputImage.mainPass) {
                // Set the texture on the image component
                this.outputImage.mainPass.baseTex = texture;
                print("ProcessImageGenNode: Generated image displayed");
            }
            else {
                print("ProcessImageGenNode: WARNING - Could not set texture on output image");
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
    __setFunctionName(_classThis, "ProcessImageGenNode");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProcessImageGenNode = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProcessImageGenNode = _classThis;
})();
exports.ProcessImageGenNode = ProcessImageGenNode;
//# sourceMappingURL=ProcessImageGenNode.js.map