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
const CapsuleButton_1 = require("SpectaclesUIKit.lspkg/Scripts/Components/Button/CapsuleButton");
const NodeConnectionController_1 = require("./NodeConnectionController");
const PictureBehavior_1 = require("../../Crop Circle.lspkg/Scripts/PictureBehavior");
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
            this.cropCircleObject = this.cropCircleObject;
            this.captureButton = this.captureButton;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._imageContainerObject = null;
            this._onStartCalled = false;
            this._captureButtonObject = null;
            this._isCapturing = false; // Track if this InputNodeImage is currently capturing
            // Reference to cloned material for external access
            this._clonedMaterial = null;
            // Track connected child nodes (nodes this connects to) - can have multiple
            this._connectedChildNodes = [];
            // Unique ID for the output button
            this._outputButtonId = "";
        }
        __initialize() {
            super.__initialize();
            this.baseNode = this.baseNode;
            this.titleText = this.titleText;
            this.outputButton = this.outputButton;
            this.imageComponent = this.imageComponent;
            this.cameraService = this.cameraService;
            this.imageContainer = this.imageContainer;
            this.cropCircleObject = this.cropCircleObject;
            this.captureButton = this.captureButton;
            this._initialized = false;
            this._titleTextObject = null;
            this._outputButtonObject = null;
            this._contentObject = null;
            this._imageContainerObject = null;
            this._onStartCalled = false;
            this._captureButtonObject = null;
            this._isCapturing = false; // Track if this InputNodeImage is currently capturing
            // Reference to cloned material for external access
            this._clonedMaterial = null;
            // Track connected child nodes (nodes this connects to) - can have multiple
            this._connectedChildNodes = [];
            // Unique ID for the output button
            this._outputButtonId = "";
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
            // Create capture button
            this.setupCaptureButton();
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
         * Generates a unique button ID
         */
        generateButtonId() {
            return `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        /**
         * Sets up the capture button for crop circle capture
         */
        setupCaptureButton() {
            // If button already exists, just set up click tracking
            if (this.captureButton) {
                this.setupCaptureButtonClick();
                return;
            }
            // Create capture button object
            this._captureButtonObject = global.scene.createSceneObject("InputNodeImage_CaptureButton");
            this._captureButtonObject.setParent(this.sceneObject);
            // Create CapsuleButton component
            this.captureButton = this._captureButtonObject.createComponent(CapsuleButton_1.CapsuleButton.getTypeName());
            if (this.captureButton) {
                // CapsuleButton uses size property (vec3) - width, height, depth in cm
                this.captureButton.size = new vec3(6, 3, 1); // Width, Height, Depth
                // Position below the image content
                const transform = this._captureButtonObject.getTransform();
                if (this.baseNode) {
                    const frameSize = this.baseNode.frameSize;
                    transform.setLocalPosition(new vec3(0, -frameSize.y / 200 - 0.5, 0));
                }
                else {
                    transform.setLocalPosition(new vec3(0, -2, 0));
                }
                // Set up button click tracking
                this.setupCaptureButtonClick();
                print("InputNodeImage: Created capture button (CapsuleButton)");
            }
        }
        /**
         * Sets up capture button click tracking
         */
        setupCaptureButtonClick() {
            if (!this.captureButton) {
                return;
            }
            if (this.captureButton.onTriggerUp) {
                this.captureButton.onTriggerUp.add(() => {
                    this.onCaptureButtonClicked();
                });
                print("InputNodeImage: Capture button click tracking set up");
            }
        }
        /**
         * Called when capture button is clicked
         * Supports re-capture: can be clicked multiple times to capture new images
         */
        onCaptureButtonClicked() {
            print(`InputNodeImage: Capture button clicked - unhiding crop circle for ${this.sceneObject.name}`);
            // Check if we're already capturing
            if (this._isCapturing) {
                print(`InputNodeImage: Already capturing for ${this.sceneObject.name}`);
                return;
            }
            // Check if we have a crop circle object
            if (!this.cropCircleObject) {
                print("InputNodeImage: ERROR - Crop Circle SceneObject not assigned! Please assign the Crop Circle object from the scene.");
                return;
            }
            // Clean up any old completed scanners (from previous captures)
            // This ensures we find the new scanner, not the old one
            this.cleanupOldScanners();
            // Unhide the crop circle object (it's already in the scene)
            this.cropCircleObject.enabled = true;
            this._isCapturing = true;
            print(`InputNodeImage: Crop circle unhidden for ${this.sceneObject.name} - ready for RE-CAPTURE`);
            // Set up listener for when capture completes
            this.setupCaptureListener();
        }
        /**
         * Cleans up old completed scanners to prepare for re-capture
         * This ensures the new scanner is found, not the old one
         */
        cleanupOldScanners() {
            if (!this.cropCircleObject)
                return;
            // Find and destroy any old PictureBehavior objects that are complete
            const childCount = this.cropCircleObject.getChildrenCount();
            const objectsToDestroy = [];
            for (let i = 0; i < childCount; i++) {
                const child = this.cropCircleObject.getChild(i);
                const pictureBehavior = this.findPictureBehaviorInHierarchy(child);
                if (pictureBehavior && pictureBehavior.isCaptureComplete()) {
                    // This scanner is complete, mark for destruction
                    objectsToDestroy.push(child);
                }
            }
            // Destroy the old scanners
            for (const obj of objectsToDestroy) {
                print(`InputNodeImage: Cleaning up old completed scanner: ${obj.name}`);
                obj.destroy();
            }
            if (objectsToDestroy.length > 0) {
                print(`InputNodeImage: Cleaned up ${objectsToDestroy.length} old scanner(s) for re-capture`);
            }
        }
        /**
         * Sets up listener to detect when capture is complete
         * PictureBehavior is created dynamically when user pinches, so we need to wait for it
         */
        setupCaptureListener() {
            if (!this.cropCircleObject || !this._isCapturing) {
                return;
            }
            // PictureBehavior is created dynamically when user pinches down (via PictureController)
            // So we need to poll for it to appear
            let searchCount = 0;
            const maxSearchFrames = 300; // Wait up to 5 seconds for PictureBehavior to be created
            let listenerSetup = false;
            this.createEvent("UpdateEvent").bind(() => {
                if (listenerSetup || !this._isCapturing || !this.cropCircleObject || isNull(this.cropCircleObject)) {
                    return;
                }
                searchCount++;
                if (searchCount > maxSearchFrames) {
                    print(`InputNodeImage: Timeout waiting for PictureBehavior to be created for ${this.sceneObject.name}`);
                    this._isCapturing = false;
                    if (this.cropCircleObject) {
                        this.cropCircleObject.enabled = false;
                    }
                    return;
                }
                // Try to find PictureBehavior (it's created when user pinches down)
                const pictureBehavior = this.findPictureBehaviorInHierarchy(this.cropCircleObject);
                if (pictureBehavior) {
                    listenerSetup = true;
                    print(`InputNodeImage: PictureBehavior found for ${this.sceneObject.name}, setting up capture listener...`);
                    this.setupCapturePolling(pictureBehavior);
                }
            });
        }
        /**
         * Sets up polling to detect when capture is complete
         * This is called once PictureBehavior is found
         */
        setupCapturePolling(pictureBehavior) {
            if (!this._isCapturing) {
                return;
            }
            // Poll for capture completion using PictureBehavior's API
            let checkCount = 0;
            const maxChecks = 600; // 10 seconds at 60fps
            let callbackExecuted = false;
            this.createEvent("UpdateEvent").bind(() => {
                if (callbackExecuted)
                    return; // Only execute once
                if (!this._isCapturing || !this.cropCircleObject || isNull(this.cropCircleObject)) {
                    callbackExecuted = true;
                    return; // Not capturing anymore or crop circle was destroyed
                }
                checkCount++;
                if (checkCount > maxChecks) {
                    print(`InputNodeImage: Capture timeout for ${this.sceneObject.name} - hiding crop circle`);
                    if (this.cropCircleObject) {
                        this.cropCircleObject.enabled = false;
                    }
                    this._isCapturing = false;
                    callbackExecuted = true;
                    return;
                }
                // Check if capture is complete using PictureBehavior's API
                try {
                    // Use the new cleaner API
                    if (pictureBehavior.isCaptureComplete()) {
                        print(`InputNodeImage: Capture complete detected for ${this.sceneObject.name}!`);
                        // Get the captured texture
                        let capturedTexture = pictureBehavior.getCapturedTexture();
                        // Fallback to getCaptureImage if getCapturedTexture returns null
                        if (!capturedTexture) {
                            const captureImage = pictureBehavior.getCaptureImage();
                            if (captureImage) {
                                capturedTexture = captureImage;
                                print(`InputNodeImage: Using getCaptureImage() as texture`);
                            }
                        }
                        else {
                            print(`InputNodeImage: Using getCapturedTexture() as texture`);
                        }
                        if (capturedTexture) {
                            callbackExecuted = true;
                            this._isCapturing = false;
                            // Pass the captured texture to InputNodeImage
                            this.onCaptureComplete(capturedTexture);
                            // Hide crop circle after capture (don't destroy, just hide)
                            if (this.cropCircleObject) {
                                this.cropCircleObject.enabled = false;
                                print(`InputNodeImage: Crop circle hidden after capture for ${this.sceneObject.name}`);
                            }
                        }
                        else {
                            print(`InputNodeImage: ERROR - Capture complete but no texture available`);
                            callbackExecuted = true;
                            this._isCapturing = false;
                        }
                    }
                }
                catch (e) {
                    // Property might not be accessible, keep checking
                    if (checkCount % 60 == 0) { // Log every second
                        print(`InputNodeImage: Error checking capture status: ${e}`);
                    }
                }
            });
        }
        /**
         * Recursively finds PictureBehavior component in hierarchy
         */
        findPictureBehaviorInHierarchy(obj) {
            if (!obj || isNull(obj)) {
                return null;
            }
            // Check current object
            const pictureBehavior = obj.getComponent(PictureBehavior_1.PictureBehavior.getTypeName());
            if (pictureBehavior) {
                return pictureBehavior;
            }
            // Check children recursively
            const childCount = obj.getChildrenCount();
            for (let i = 0; i < childCount; i++) {
                const child = obj.getChild(i);
                const found = this.findPictureBehaviorInHierarchy(child);
                if (found) {
                    return found;
                }
            }
            return null;
        }
        /**
         * Called when capture is complete - displays the captured cropped image
         * Ensures material is cloned before displaying
         */
        onCaptureComplete(croppedTexture) {
            print(`InputNodeImage: Processing captured cropped image for ${this.sceneObject.name}...`);
            try {
                if (!croppedTexture) {
                    print("InputNodeImage: ERROR - Cropped texture is null");
                    return;
                }
                // Verify texture is valid
                try {
                    const colorspace = croppedTexture.getColorspace();
                    print(`InputNodeImage: Cropped texture colorspace: ${colorspace}`);
                }
                catch (e) {
                    print(`InputNodeImage: WARNING - Could not verify texture colorspace: ${e}`);
                }
                // Ensure image component exists
                if (!this.imageComponent) {
                    print("InputNodeImage: ERROR - Image component not found, cannot display captured image");
                    return;
                }
                // Ensure material is cloned ONCE per node (not per crop)
                // If we already have a cloned material, just update the texture
                if (this._clonedMaterial) {
                    // Material already cloned - just update texture
                    print(`InputNodeImage: Using existing cloned material for ${this.sceneObject.name}, updating texture...`);
                    this.setImageTexture(croppedTexture);
                    print(`InputNodeImage: Cropped texture updated in ${this.sceneObject.name}`);
                    return;
                }
                // Material not cloned yet - clone it first, then set texture
                // Wait for material to be available, then clone and set texture
                let frameCount = 0;
                let callbackExecuted = false;
                const maxFrames = 120; // Wait up to 2 seconds for material
                this.createEvent("UpdateEvent").bind(() => {
                    if (callbackExecuted)
                        return; // Only execute once
                    frameCount++;
                    // Check if image component still exists
                    if (!this.imageComponent) {
                        print("InputNodeImage: ERROR - Image component lost during capture processing");
                        callbackExecuted = true;
                        return;
                    }
                    // Check if mainPass exists
                    if (!this.imageComponent.mainPass) {
                        if (frameCount >= maxFrames) {
                            print("InputNodeImage: ERROR - Image component has no mainPass after waiting");
                            callbackExecuted = true;
                            return;
                        }
                        return; // Keep waiting
                    }
                    // Try to clone material (will succeed once material is assigned)
                    this.cloneAndStoreMaterial();
                    // If we have a cloned material, we can set the texture
                    if (this._clonedMaterial) {
                        callbackExecuted = true;
                        // Set the cropped texture on the image component
                        this.setImageTexture(croppedTexture);
                        print(`InputNodeImage: Cropped texture displayed in ${this.sceneObject.name} with newly cloned material`);
                        return;
                    }
                    // Check if material exists but wasn't cloned yet
                    const hasMaterial = this.imageComponent.mainPass.material;
                    if (hasMaterial && frameCount >= 5) {
                        // Material exists but cloning failed - try again
                        print("InputNodeImage: Material exists but not cloned, retrying clone...");
                        this.cloneAndStoreMaterial();
                    }
                    // If material still not available after max frames, try to set texture anyway
                    if (frameCount >= maxFrames) {
                        callbackExecuted = true;
                        print("InputNodeImage: WARNING - Material not available after waiting, setting texture directly...");
                        // Try to set texture directly (might work if material gets assigned later)
                        try {
                            if (this.imageComponent.mainPass) {
                                // Clone material one more time before setting texture
                                this.cloneAndStoreMaterial();
                                // Set texture
                                this.imageComponent.mainPass.baseTex = croppedTexture;
                                print(`InputNodeImage: Texture set directly (material: ${this._clonedMaterial ? "cloned" : "original"})`);
                            }
                        }
                        catch (e) {
                            print(`InputNodeImage: ERROR - Could not set texture: ${e}`);
                        }
                    }
                });
            }
            catch (e) {
                print(`InputNodeImage: ERROR - Failed to process captured cropped image: ${e}`);
            }
        }
        /**
         * Sets up the output button (round button at connection point)
         */
        setupOutputButton() {
            // Generate unique ID for this button
            if (!this._outputButtonId) {
                this._outputButtonId = this.generateButtonId();
            }
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
            // If imageComponent already exists, try to clone its material
            if (this.imageComponent) {
                this.cloneAndStoreMaterial();
                // Set up periodic check for material (in case it's assigned later)
                // Only check every 30 frames to reduce log spam
                let materialCheckFrame = 0;
                this.createEvent("UpdateEvent").bind(() => {
                    materialCheckFrame++;
                    if (materialCheckFrame % 30 === 0) { // Check every 30 frames (~0.5 seconds)
                        this.checkAndCloneMaterial();
                    }
                });
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
                // Try to clone material (if it exists)
                this.cloneAndStoreMaterial();
                // Set up periodic check for material (in case it's assigned later)
                // Only check every 30 frames to reduce log spam
                let materialCheckFrame = 0;
                this.createEvent("UpdateEvent").bind(() => {
                    materialCheckFrame++;
                    if (materialCheckFrame % 30 === 0) { // Check every 30 frames (~0.5 seconds)
                        this.checkAndCloneMaterial();
                    }
                });
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
         * This ensures the material is independent and won't affect other nodes
         */
        cloneAndStoreMaterial() {
            if (!this.imageComponent) {
                return; // Will retry when material is assigned
            }
            try {
                // Get the main pass material
                const mainPass = this.imageComponent.mainPass;
                if (!mainPass) {
                    return; // Will retry when material is assigned
                }
                // Get the original material
                const originalMaterial = mainPass.material;
                if (!originalMaterial) {
                    return; // Material not assigned yet, will check periodically
                }
                // If we already have a cloned material, check if it's still the one being used
                if (this._clonedMaterial && mainPass.material === this._clonedMaterial) {
                    // Already using cloned material, no need to clone again
                    return;
                }
                // Clone the material to create an independent copy
                this._clonedMaterial = originalMaterial.clone();
                // Apply the cloned material to the image component
                // This ensures we're using the cloned version, not the original
                mainPass.material = this._clonedMaterial;
                print(`InputNodeImage: Material cloned and stored (independent copy created)`);
            }
            catch (error) {
                print(`InputNodeImage: Failed to clone material: ${error} (will retry when material is assigned)`);
            }
        }
        /**
         * Checks and clones material if it becomes available later
         */
        checkAndCloneMaterial() {
            if (!this._clonedMaterial && this.imageComponent) {
                // Only log once per check, not every frame
                const hasMaterial = this.imageComponent.mainPass && this.imageComponent.mainPass.material;
                if (hasMaterial) {
                    this.cloneAndStoreMaterial();
                }
                // Don't log if material is still missing - it's expected
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
            print(`InputNodeImage: Output button clicked (ID: ${this._outputButtonId}) - Has texture: ${!!texture}, Has material: ${!!this._clonedMaterial}`);
            // Notify connection controller to start pending connection
            const controller = NodeConnectionController_1.NodeConnectionController.getInstance();
            if (controller) {
                controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
            }
            else {
                print(`InputNodeImage: WARNING - NodeConnectionController not found! Attempting to find or create...`);
                // Try to find NodeConnectionController in scene
                this.findOrCreateConnectionController();
            }
        }
        /**
         * Finds or creates NodeConnectionController in the scene
         */
        findOrCreateConnectionController() {
            // First check singleton instance
            let controller = NodeConnectionController_1.NodeConnectionController.getInstance();
            if (controller) {
                print(`InputNodeImage: Found NodeConnectionController (singleton)`);
                controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
                return;
            }
            // Try to find existing controller in scene
            const rootObjects = global.scene.getRootObjectsCount();
            for (let i = 0; i < rootObjects; i++) {
                const rootObject = global.scene.getRootObject(i);
                controller = rootObject.getComponent(NodeConnectionController_1.NodeConnectionController.getTypeName());
                if (controller) {
                    print(`InputNodeImage: Found NodeConnectionController in scene`);
                    controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
                    return;
                }
            }
            // If not found, create one (material is optional, so it won't error)
            print(`InputNodeImage: Creating NodeConnectionController in scene...`);
            const controllerObject = global.scene.createSceneObject("NodeConnectionController");
            controller = controllerObject.createComponent(NodeConnectionController_1.NodeConnectionController.getTypeName());
            if (controller) {
                print(`InputNodeImage: NodeConnectionController created (material can be assigned later)`);
                // Wait a frame for component to initialize
                this.createEvent("UpdateEvent").bind(() => {
                    controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
                });
            }
            else {
                print(`InputNodeImage: ERROR - Failed to create NodeConnectionController component`);
            }
        }
        /**
         * Adds a connected child node (called when connection is made)
         * Input nodes can connect to multiple process nodes
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
         * Gets the output button ID
         */
        getOutputButtonId() {
            return this._outputButtonId;
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
         * Uses cloned material if available to ensure independence
         */
        setImageTexture(texture) {
            if (!this.imageComponent || !this.imageComponent.mainPass) {
                print("InputNodeImage: WARNING - Cannot set texture, image component or mainPass is null");
                return;
            }
            // Ensure we're using the cloned material (not original)
            if (this._clonedMaterial) {
                this.imageComponent.mainPass.material = this._clonedMaterial;
            }
            else {
                // Clone material if not already cloned
                this.cloneAndStoreMaterial();
            }
            // Set the texture on the cloned material
            this.imageComponent.mainPass.baseTex = texture;
            print(`InputNodeImage: Texture set on ${this.sceneObject.name} (using ${this._clonedMaterial ? "cloned" : "original"} material)`);
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
         * Returns the cloned material to ensure nodes don't share materials
         */
        getOutputData() {
            // Ensure material is cloned before returning
            if (!this._clonedMaterial && this.imageComponent) {
                this.cloneAndStoreMaterial();
            }
            return {
                texture: this.getImageTexture(),
                material: this.getClonedMaterial(), // Always return cloned material, never original
                imageComponent: this.getImageComponent(),
                outputButtonPosition: this.getOutputButtonLocalPosition(),
                outputButtonWorldPosition: this.getOutputButtonWorldPosition(),
                outputButtonObject: this.getOutputButtonObject()
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