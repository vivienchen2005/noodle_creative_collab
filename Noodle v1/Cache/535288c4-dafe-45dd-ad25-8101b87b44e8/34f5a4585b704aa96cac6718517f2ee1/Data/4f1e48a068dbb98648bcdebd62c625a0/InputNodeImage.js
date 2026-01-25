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
exports.InputNodeImage = void 0;
var __selfType = requireType("./InputNodeImage");
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
/**
 * InputNodeImage - A specialized node for image input
 * Extends BaseNode functionality with image content and output button
 */
let InputNodeImage = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var InputNodeImage = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.outputButton = this.outputButton;
            this.imageComponent = this.imageComponent;
            this.cameraService = this.cameraService;
            this.imageContainer = this.imageContainer;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._imageContainerObject = null;
            this._onStartCalled = false;
            // Reference to cloned material for external access
            this._clonedMaterial = null;
            // Track connected child nodes (nodes this connects to)
            this._connectedChildNodes = [];
        }
        __initialize() {
            super.__initialize();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.outputButton = this.outputButton;
            this.imageComponent = this.imageComponent;
            this.cameraService = this.cameraService;
            this.imageContainer = this.imageContainer;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._imageContainerObject = null;
            this._onStartCalled = false;
            // Reference to cloned material for external access
            this._clonedMaterial = null;
            // Track connected child nodes (nodes this connects to)
            this._connectedChildNodes = [];
        }
        onAwake() {
            print(`InputNodeImage: onAwake called`);
            // Ensure BaseNode is set
            if (!this.baseNode) {
                this.baseNode = this.sceneObject.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (!this.baseNode) {
                    print("InputNodeImage: ERROR - BaseNode component not found! Please add BaseNode component to this SceneObject.");
                    return;
                }
                print(`InputNodeImage: Found BaseNode component`);
            }
            else {
                print(`InputNodeImage: BaseNode already assigned`);
            }
            // Set node type to "image"
            if (this.baseNode) {
                this.baseNode.nodeType = "image";
                print(`InputNodeImage: Set BaseNode type to: image`);
            }
            print(`InputNodeImage: onAwake complete`);
            // Fallback: If onStart doesn't get called, try to initialize in UpdateEvent
            let fallbackAttempts = 0;
            this.createEvent("UpdateEvent").bind(() => {
                if (!this._onStartCalled && fallbackAttempts > 5) {
                    print(`InputNodeImage: WARNING - onStart not called after ${fallbackAttempts} frames, calling manually...`);
                    this._onStartCalled = true;
                    this.onStart();
                }
                fallbackAttempts++;
            });
        }
        onStart() {
            this._onStartCalled = true;
            print(`InputNodeImage: onStart called, baseNode exists=${!!this.baseNode}`);
            // Check if baseNode is available
            if (!this.baseNode) {
                print(`InputNodeImage: ERROR - baseNode is null in onStart, trying to find it...`);
                this.baseNode = this.sceneObject.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (!this.baseNode) {
                    print(`InputNodeImage: ERROR - Still cannot find BaseNode, setup will fail`);
                    return;
                }
            }
            // Try immediate setup if frame is already available
            const frame = this.baseNode.getFrame();
            if (frame) {
                print(`InputNodeImage: Frame is already available, attempting immediate setup...`);
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
                        print(`InputNodeImage: Frame check attempt ${frameCheckAttempts}/${maxFrameCheckAttempts}, frame exists=${!!frame}`);
                    }
                    if (frame) {
                        const frameReady = frame.roundedRectangle !== undefined || frameCheckAttempts > 5;
                        if (frameReady) {
                            print(`InputNodeImage: Frame is ready (attempt ${frameCheckAttempts}), setting up node...`);
                            this.setupNode();
                            this._initialized = true;
                            print(`InputNodeImage: Node setup complete!`);
                            return;
                        }
                    }
                    if (frameCheckAttempts >= maxFrameCheckAttempts && !this._initialized) {
                        print(`InputNodeImage: WARNING - Frame check timeout, attempting setup anyway...`);
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
            print(`InputNodeImage: setupNode() called`);
            if (!this.baseNode) {
                print(`InputNodeImage: ERROR - baseNode is null, cannot setup node`);
                return;
            }
            const frame = this.baseNode.getFrame();
            if (!frame) {
                print(`InputNodeImage: ERROR - Frame is null, cannot setup node`);
                return;
            }
            print(`InputNodeImage: BaseNode and Frame are ready, starting UI setup...`);
            // Create title
            this.setupTitle();
            // Create output button
            this.setupOutputButton();
            // Create image content
            this.setupImageContent();
            print(`InputNodeImage: setupNode() complete!`);
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
            this._titleTextObject = global.scene.createSceneObject("InputNodeImage_Title");
            this._titleTextObject.setParent(this.sceneObject);
            this._titleTextObject.enabled = true;
            // Create Text component
            this.titleText = this._titleTextObject.createComponent("Component.Text");
            if (this.titleText) {
                this.titleText.text = "Image Input";
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
                print(`InputNodeImage: Created title text component`);
            }
        }
        /**
         * Updates the title text
         */
        updateTitle() {
            if (this.titleText) {
                this.titleText.text = "Image Input";
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
            this._outputButtonObject = global.scene.createSceneObject("InputNodeImage_OutputButton");
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
                print("InputNodeImage: Created output button");
            }
        }
        /**
         * Sets up image content (Image component for screen grab/clone)
         */
        setupImageContent() {
            // Create image container if not set
            this.setupImageContainer();
            // Ensure container is enabled
            if (this._imageContainerObject) {
                this._imageContainerObject.enabled = true;
            }
            // If imageComponent already exists, clone its material
            if (this.imageComponent) {
                this.cloneAndStoreMaterial();
                return; // Already set
            }
            // Create content object (image) - parent to image container
            this._contentObject = global.scene.createSceneObject("InputNodeImage_ImageContent");
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
                transform.setLocalPosition(new vec3(0, 0, 0));
                // Set up image size
                const imageTransform = this.imageComponent.sceneObject.getTransform();
                imageTransform.setLocalScale(new vec3(6, 6, 1));
                // Clone the material and keep reference
                this.cloneAndStoreMaterial();
                print("InputNodeImage: Created image component");
            }
            // TODO: Integrate with camera service for screen grab
            if (this.cameraService) {
                print("InputNodeImage: Camera service found, will integrate for image capture");
            }
        }
        /**
         * Sets up the image container (parent object for all image-related UI)
         */
        setupImageContainer() {
            if (this.imageContainer) {
                this._imageContainerObject = this.imageContainer;
                return;
            }
            // Create image container object
            this._imageContainerObject = global.scene.createSceneObject("InputNodeImage_ImageContainer");
            this._imageContainerObject.setParent(this.sceneObject);
            this.imageContainer = this._imageContainerObject;
            // Position at center (children will be positioned relative to this)
            const transform = this._imageContainerObject.getTransform();
            transform.setLocalPosition(new vec3(0, -1, 0));
            print("InputNodeImage: Created image container");
        }
        /**
         * Clones the material from the image component and stores a reference
         */
        cloneAndStoreMaterial() {
            if (!this.imageComponent) {
                print("InputNodeImage: ERROR - Cannot clone material, imageComponent is null");
                return;
            }
            try {
                // Get the main pass material
                const mainPass = this.imageComponent.mainPass;
                if (!mainPass) {
                    print("InputNodeImage: ERROR - Image component has no mainPass");
                    return;
                }
                // Get the original material
                const originalMaterial = mainPass.material;
                if (!originalMaterial) {
                    print("InputNodeImage: ERROR - Image component has no material");
                    return;
                }
                // Clone the material
                this._clonedMaterial = originalMaterial.clone();
                // Apply the cloned material to the image component
                mainPass.material = this._clonedMaterial;
                print(`InputNodeImage: Material cloned and stored. Material ID: ${this._clonedMaterial.name || "unnamed"}`);
            }
            catch (error) {
                print(`InputNodeImage: ERROR - Failed to clone material: ${error}`);
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
                    print(`InputNodeImage: Output button clicked!`);
                    this.onOutputButtonClicked();
                });
                print("InputNodeImage: Output button click tracking set up");
            }
        }
        /**
         * Called when output button is clicked
         */
        onOutputButtonClicked() {
            const texture = this.getImageTexture();
            print(`InputNodeImage: Output button clicked - Has texture: ${!!texture}, Has material: ${!!this._clonedMaterial}`);
            // This can be extended to trigger connections or other actions
        }
        /**
         * Adds a connected child node (called when connection is made)
         */
        addChildNode(childNode) {
            if (!this._connectedChildNodes.includes(childNode)) {
                this._connectedChildNodes.push(childNode);
                print(`InputNodeImage: Added child node: ${childNode.name} (Total: ${this._connectedChildNodes.length})`);
            }
        }
        /**
         * Removes a connected child node
         */
        removeChildNode(childNode) {
            const index = this._connectedChildNodes.indexOf(childNode);
            if (index > -1) {
                this._connectedChildNodes.splice(index, 1);
                print(`InputNodeImage: Removed child node: ${childNode.name} (Total: ${this._connectedChildNodes.length})`);
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
         * Gets the image texture
         */
        getImageTexture() {
            if (this.imageComponent && this.imageComponent.mainPass) {
                return this.imageComponent.mainPass.baseTex;
            }
            return null;
        }
        /**
         * Sets the image texture
         */
        setImageTexture(texture) {
            if (this.imageComponent && this.imageComponent.mainPass) {
                this.imageComponent.mainPass.baseTex = texture;
            }
        }
        /**
         * Gets the cloned material reference (for external access)
         */
        getClonedMaterial() {
            return this._clonedMaterial;
        }
        /**
         * Gets the image component (for external access)
         */
        getImageComponent() {
            return this.imageComponent;
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
                texture: this.getImageTexture(),
                material: this.getClonedMaterial(),
                imageComponent: this.getImageComponent(),
                outputButtonPosition: this.getOutputButtonLocalPosition(),
                outputButtonWorldPosition: this.getOutputButtonWorldPosition()
            };
        }
    };
    __setFunctionName(_classThis, "InputNodeImage");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InputNodeImage = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InputNodeImage = _classThis;
})();
exports.InputNodeImage = InputNodeImage;
//# sourceMappingURL=InputNodeImage.js.map