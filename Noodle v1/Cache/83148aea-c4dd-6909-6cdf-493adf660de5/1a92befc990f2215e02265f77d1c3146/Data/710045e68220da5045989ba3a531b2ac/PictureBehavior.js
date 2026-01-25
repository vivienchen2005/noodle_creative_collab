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
exports.PictureBehavior = void 0;
var __selfType = requireType("./PictureBehavior");
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
const SIK_1 = require("SpectaclesInteractionKit.lspkg/SIK");
const BOX_MIN_SIZE = 8; //min size in cm for image capture
const RECTANGLE_SHRINK_FACTOR = 0.85; // Make rectangle 15% smaller than drawn bounds
let PictureBehavior = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var PictureBehavior = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.circleObjs = this.circleObjs;
            this.editorCamObj = this.editorCamObj;
            this.picAnchorObj = this.picAnchorObj;
            this.loadingObj = this.loadingObj;
            this.captureRendMesh = this.captureRendMesh;
            this.screenCropTexture = this.screenCropTexture;
            this.cropRegion = this.cropRegion;
            // Store the static captured texture (cropped snapshot)
            this._capturedStaticTexture = null;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.rightHand = SIK_1.SIK.HandInputData.getHand("right");
            this.leftHand = SIK_1.SIK.HandInputData.getHand("left");
            this.picAnchorTrans = null;
            this.isPinching = false;
            this.trackedPositions = []; // Store all positions during pinch gesture
            this.rotMat = new mat3();
            this.updateEvent = null;
            this.rightPinchDown = () => {
                print("[PictureBehavior] RIGHT Pinch down - starting circle drawing");
                this.startTracking();
            };
            this.rightPinchUp = () => {
                print("[PictureBehavior] RIGHT Pinch up - finished circle drawing");
                print("[PictureBehavior] Total positions tracked: " + this.trackedPositions.length);
                this.isPinching = false; // Stop tracking immediately
                if (this.trackedPositions.length > 0) {
                    // Log all tracked positions
                    for (let i = 0; i < this.trackedPositions.length; i++) {
                        const pos = this.trackedPositions[i];
                        print("[PictureBehavior] Position " + i + ": x=" + pos.x.toFixed(2) + ", y=" + pos.y.toFixed(2) + ", z=" + pos.z.toFixed(2));
                    }
                    // Calculate min/max x,y from all tracked positions and show mask
                    this.calculateRectangleFromTrackedPositions();
                    // Wait a moment for hands to move away before capturing the frame
                    // This ensures hands won't be in the captured image
                    print("[PictureBehavior] Waiting for hands to move away before capturing frame...");
                    const captureDelayEvent = this.createEvent("DelayedCallbackEvent");
                    captureDelayEvent.bind(() => {
                        print("[PictureBehavior] Hands should be away now - capturing frame");
                        this.captureAndProcessImage();
                    });
                    captureDelayEvent.reset(0.5); // Wait 500ms for hands to move away
                }
                else {
                    print("[PictureBehavior] WARNING: No positions were tracked!");
                }
            };
        }
        __initialize() {
            super.__initialize();
            this.circleObjs = this.circleObjs;
            this.editorCamObj = this.editorCamObj;
            this.picAnchorObj = this.picAnchorObj;
            this.loadingObj = this.loadingObj;
            this.captureRendMesh = this.captureRendMesh;
            this.screenCropTexture = this.screenCropTexture;
            this.cropRegion = this.cropRegion;
            // Store the static captured texture (cropped snapshot)
            this._capturedStaticTexture = null;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.rightHand = SIK_1.SIK.HandInputData.getHand("right");
            this.leftHand = SIK_1.SIK.HandInputData.getHand("left");
            this.picAnchorTrans = null;
            this.isPinching = false;
            this.trackedPositions = []; // Store all positions during pinch gesture
            this.rotMat = new mat3();
            this.updateEvent = null;
            this.rightPinchDown = () => {
                print("[PictureBehavior] RIGHT Pinch down - starting circle drawing");
                this.startTracking();
            };
            this.rightPinchUp = () => {
                print("[PictureBehavior] RIGHT Pinch up - finished circle drawing");
                print("[PictureBehavior] Total positions tracked: " + this.trackedPositions.length);
                this.isPinching = false; // Stop tracking immediately
                if (this.trackedPositions.length > 0) {
                    // Log all tracked positions
                    for (let i = 0; i < this.trackedPositions.length; i++) {
                        const pos = this.trackedPositions[i];
                        print("[PictureBehavior] Position " + i + ": x=" + pos.x.toFixed(2) + ", y=" + pos.y.toFixed(2) + ", z=" + pos.z.toFixed(2));
                    }
                    // Calculate min/max x,y from all tracked positions and show mask
                    this.calculateRectangleFromTrackedPositions();
                    // Wait a moment for hands to move away before capturing the frame
                    // This ensures hands won't be in the captured image
                    print("[PictureBehavior] Waiting for hands to move away before capturing frame...");
                    const captureDelayEvent = this.createEvent("DelayedCallbackEvent");
                    captureDelayEvent.bind(() => {
                        print("[PictureBehavior] Hands should be away now - capturing frame");
                        this.captureAndProcessImage();
                    });
                    captureDelayEvent.reset(0.5); // Wait 500ms for hands to move away
                }
                else {
                    print("[PictureBehavior] WARNING: No positions were tracked!");
                }
            };
        }
        onAwake() {
            print("[PictureBehavior] onAwake called!");
            this.loadingObj.enabled = false;
            this.loadingTrans = this.loadingObj.getTransform();
            this.captureRendMesh.mainMaterial = this.captureRendMesh.mainMaterial.clone();
            this.camTrans = this.editorCamObj.getTransform();
            this.picAnchorTrans = this.picAnchorObj.getTransform();
            this.circleTrans = this.circleObjs.map((obj) => obj.getTransform());
            this.circleObjsRef = this.circleObjs; // Store reference to circle objects
            print("[PictureBehavior] Found " + this.circleTrans.length + " circle transforms");
            // Hide circles initially - they will be shown after pinch is finished
            for (let i = 0; i < this.circleObjsRef.length; i++) {
                if (this.circleObjsRef[i]) {
                    this.circleObjsRef[i].enabled = false;
                }
            }
            print("[PictureBehavior] Circles hidden initially");
            // HIDE picAnchorObj and captureRendMesh from the start - we don't want to show captured image in 3D space
            // The texture will be passed to InputNodeImage instead
            if (this.picAnchorObj) {
                this.picAnchorObj.enabled = false;
                print("[PictureBehavior] picAnchorObj hidden from start - image will not be displayed in 3D space");
            }
            if (this.captureRendMesh && this.captureRendMesh.sceneObject) {
                this.captureRendMesh.sceneObject.enabled = false;
                print("[PictureBehavior] captureRendMesh hidden from start - image will not be displayed in 3D space");
            }
            // Use only right hand for single-hand pinch gesture
            this.rightHand.onPinchUp.add(this.rightPinchUp);
            this.rightHand.onPinchDown.add(this.rightPinchDown);
            print("[PictureBehavior] Pinch event handlers registered");
            // Since scanner is created on pinch down, check if we should start tracking immediately
            // Use a small delay to ensure hand tracking is ready
            const checkPinchEvent = this.createEvent("DelayedCallbackEvent");
            checkPinchEvent.bind(() => {
                // Check if pinch is still active (scanner was just created on pinch down)
                // We can detect this by checking if thumb and index are close together
                try {
                    const thumbPos = this.rightHand.thumbTip.position;
                    const indexPos = this.rightHand.indexTip.position;
                    const pinchDistance = thumbPos.distance(indexPos);
                    if (pinchDistance < 3.0) { // If fingers are close, likely still pinching
                        print("[PictureBehavior] Detected active pinch on init (distance: " + pinchDistance.toFixed(2) + ") - starting tracking");
                        this.startTracking();
                    }
                }
                catch (e) {
                    print("[PictureBehavior] Could not check pinch state: " + e);
                }
            });
            checkPinchEvent.reset(0.05); // Check after 50ms
            if (this.isEditor) {
                //place this transform in front of camera for testing
                const trans = this.getSceneObject().getTransform();
                trans.setWorldPosition(this.camTrans.getWorldPosition().add(this.camTrans.forward.uniformScale(-60)));
                trans.setWorldRotation(quat.lookAt(this.camTrans.forward, vec3.up()));
                // Create update event for editor mode too, so we can control visibility
                this.updateEvent = this.createEvent("UpdateEvent");
                this.updateEvent.bind(this.update.bind(this));
                print("[PictureBehavior] Update event created for editor mode");
            }
            else {
                //send offscreen
                this.getSceneObject().getTransform().setWorldPosition(vec3.up().uniformScale(1000));
                this.updateEvent = this.createEvent("UpdateEvent");
                this.updateEvent.bind(this.update.bind(this));
                print("[PictureBehavior] Update event created for non-editor mode");
            }
            print("[PictureBehavior] onAwake complete, isEditor: " + this.isEditor);
        }
        startTracking() {
            // Prevent multiple calls
            if (this.isPinching) {
                print("[PictureBehavior] Already tracking, ignoring duplicate startTracking call");
                return;
            }
            print("[PictureBehavior] Starting circle drawing tracking");
            this.isPinching = true;
            this.trackedPositions = []; // Reset tracked positions
            // Hide circles during tracking
            for (let i = 0; i < this.circleObjsRef.length; i++) {
                if (this.circleObjsRef[i]) {
                    this.circleObjsRef[i].enabled = false;
                }
            }
            // Store initial position
            const initialPos = this.rightHand.thumbTip.position;
            this.trackedPositions.push(new vec3(initialPos.x, initialPos.y, initialPos.z));
            print("[PictureBehavior] Initial position tracked: x=" + initialPos.x.toFixed(2) + ", y=" + initialPos.y.toFixed(2) + ", z=" + initialPos.z.toFixed(2));
            // Make sure update loop is running (needed for both editor and non-editor modes)
            if (this.updateEvent == null) {
                this.updateEvent = this.createEvent("UpdateEvent");
                this.updateEvent.bind(this.update.bind(this));
                print("[PictureBehavior] Update event created on pinch down");
            }
        }
        captureAndProcessImage() {
            // Ensure visual elements are hidden BEFORE capture - don't show image in 3D space
            try {
                if (this.picAnchorObj && !isNull(this.picAnchorObj)) {
                    this.picAnchorObj.enabled = false;
                }
            }
            catch (e) {
                print("[PictureBehavior] Warning: Could not hide picAnchorObj: " + e);
            }
            try {
                if (this.captureRendMesh && this.captureRendMesh.sceneObject && !isNull(this.captureRendMesh.sceneObject)) {
                    this.captureRendMesh.sceneObject.enabled = false;
                }
            }
            catch (e) {
                print("[PictureBehavior] Warning: Could not hide captureRendMesh: " + e);
            }
            try {
                if (this.loadingObj && !isNull(this.loadingObj)) {
                    this.loadingObj.enabled = false;
                }
            }
            catch (e) {
                print("[PictureBehavior] Warning: Could not hide loadingObj: " + e);
            }
            // Capture the image now (after hands have moved away)
            // We need to get a static snapshot of the cropped texture
            // screenCropTexture is live, so we copy the frame from the camera and apply crop
            if (this.screenCropTexture && this.screenCropTexture.getColorspace() == 3) {
                try {
                    // Get the camera texture from screenCropTexture's control
                    const cropControl = this.screenCropTexture.control;
                    if (cropControl && cropControl.inputTexture) {
                        const camTexture = cropControl.inputTexture;
                        // Copy the frame to get a static snapshot
                        if (camTexture.copyFrame && typeof camTexture.copyFrame === 'function') {
                            const staticCamFrame = camTexture.copyFrame();
                            // Now we need to apply the crop to this static frame
                            // The screenCropTexture has the crop region, so we can use it
                            // Create a new texture with the crop applied by using screenCropTexture's control
                            // Temporarily set the input to our static frame
                            const originalInput = cropControl.inputTexture;
                            cropControl.inputTexture = staticCamFrame;
                            // Wait a frame for the crop to be applied, then copy the result
                            // Actually, we can't easily get the output from screenCropTexture
                            // So we'll store the static camera frame and the crop info
                            // InputNodeImage will need to apply the crop manually or we use a different approach
                            // For now, store the static frame - InputNodeImage will need to handle cropping
                            this._capturedStaticTexture = staticCamFrame;
                            cropControl.inputTexture = originalInput; // Restore original
                            // Set captureImage for detection purposes
                            this.captureRendMesh.mainPass.captureImage = ProceduralTextureProvider.createFromTexture(this.screenCropTexture);
                            print("[PictureBehavior] Static frame captured - stored in _capturedStaticTexture");
                        }
                        else {
                            // Can't copy frame, use screenCropTexture (will be live)
                            this._capturedStaticTexture = null;
                            this.captureRendMesh.mainPass.captureImage = ProceduralTextureProvider.createFromTexture(this.screenCropTexture);
                            print("[PictureBehavior] WARNING - Cannot copy frame, using live screenCropTexture");
                        }
                    }
                    else {
                        print("[PictureBehavior] Cannot access camera texture from screenCropTexture control");
                        return;
                    }
                }
                catch (e) {
                    print("[PictureBehavior] Error capturing frame: " + e);
                    return;
                }
            }
            else {
                print("[PictureBehavior] Screen crop texture not ready for capture");
                return;
            }
            // Now process the image
            if (this.updateEvent != null) {
                //remove all events
                this.removeEvent(this.updateEvent);
                this.updateEvent = null;
                this.rightHand.onPinchUp.remove(this.rightPinchUp);
                this.rightHand.onPinchDown.remove(this.rightPinchDown);
                //make sure image area is above threshold
                if (this.getHeight() < BOX_MIN_SIZE || this.getWidth() < BOX_MIN_SIZE) {
                    print("[PictureBehavior] Crop area too small, destroying scanner.");
                    this.getSceneObject().destroy();
                    return;
                }
                // Disable crop region
                this.cropRegion.enabled = false;
                // Ensure visual elements stay hidden - don't display captured image in 3D space
                // The texture (screenCropTexture) is available for InputNodeImage to use directly
                if (this.picAnchorObj) {
                    this.picAnchorObj.enabled = false;
                }
                if (this.captureRendMesh && this.captureRendMesh.sceneObject) {
                    this.captureRendMesh.sceneObject.enabled = false;
                }
                if (this.loadingObj) {
                    this.loadingObj.enabled = false;
                }
                // Frame is now captured - screenCropTexture contains the cropped texture
                // InputNodeImage will poll for captureImage to be set, then use screenCropTexture directly
                print("[PictureBehavior] Freeze frame captured! screenCropTexture ready for InputNodeImage. Visuals hidden.");
            }
        }
        localTopLeft() {
            return this.camTrans.getInvertedWorldTransform().multiplyPoint(this.circleTrans[0].getWorldPosition());
        }
        localBottomRight() {
            return this.camTrans.getInvertedWorldTransform().multiplyPoint(this.circleTrans[2].getWorldPosition());
        }
        getWidth() {
            return Math.abs(this.localBottomRight().x - this.localTopLeft().x);
        }
        getHeight() {
            return Math.abs(this.localBottomRight().y - this.localTopLeft().y);
        }
        update() {
            if (this.isPinching) {
                // Don't capture image during tracking - wait until after pinch is released
                // This ensures hands won't be in the captured frame
                // Track current thumb tip position
                const currentPos = this.rightHand.thumbTip.position;
                // Only add position if it's significantly different from last position (to avoid too many points)
                // Reduced threshold from 0.5 to 0.2 to capture more positions during circle drawing
                if (this.trackedPositions.length === 0 ||
                    currentPos.distance(this.trackedPositions[this.trackedPositions.length - 1]) > 0.2) {
                    this.trackedPositions.push(new vec3(currentPos.x, currentPos.y, currentPos.z));
                    if (this.trackedPositions.length % 5 === 0) { // Log every 5th position to reduce spam
                        print("[PictureBehavior] Tracking position #" + this.trackedPositions.length + ": x=" + currentPos.x.toFixed(2) + ", y=" + currentPos.y.toFixed(2) + ", z=" + currentPos.z.toFixed(2));
                    }
                }
                // Don't show mask during tracking - only show after pinch is released
                // Removed: this.calculateRectangleFromTrackedPositions()
            }
        }
        calculateRectangleFromTrackedPositions() {
            if (this.trackedPositions.length === 0) {
                print("[PictureBehavior] calculateRectangleFromTrackedPositions: No positions to calculate from");
                return;
            }
            print("[PictureBehavior] calculateRectangleFromTrackedPositions: Processing " + this.trackedPositions.length + " positions");
            // Show the circles/mask now that we're done tracking
            for (let i = 0; i < this.circleObjsRef.length; i++) {
                if (this.circleObjsRef[i]) {
                    this.circleObjsRef[i].enabled = true;
                }
            }
            print("[PictureBehavior] Circles/mask enabled - showing rectangle");
            // Ensure picAnchorObj and captureRendMesh stay hidden - don't show captured image in 3D space
            // The texture will be passed to InputNodeImage instead
            if (this.picAnchorObj) {
                this.picAnchorObj.enabled = false;
            }
            if (this.captureRendMesh && this.captureRendMesh.sceneObject) {
                this.captureRendMesh.sceneObject.enabled = false;
            }
            // Convert all tracked positions to camera local space to find min/max
            const localPositions = this.trackedPositions.map(pos => this.camTrans.getInvertedWorldTransform().multiplyPoint(pos));
            // Find min and max x, y in camera local space, and average z
            let min_x = Infinity;
            let max_x = -Infinity;
            let min_y = Infinity;
            let max_y = -Infinity;
            let avg_z = 0;
            for (let i = 0; i < localPositions.length; i++) {
                const localPos = localPositions[i];
                if (localPos.x < min_x)
                    min_x = localPos.x;
                if (localPos.x > max_x)
                    max_x = localPos.x;
                if (localPos.y < min_y)
                    min_y = localPos.y;
                if (localPos.y > max_y)
                    max_y = localPos.y;
                avg_z += localPos.z;
            }
            avg_z = avg_z / localPositions.length; // Average z depth
            // Calculate center and size
            const center_x = (min_x + max_x) * 0.5;
            const center_y = (min_y + max_y) * 0.5;
            const width = max_x - min_x;
            const height = max_y - min_y;
            // Shrink the bounds to make rectangle smaller
            const shrunk_width = width * RECTANGLE_SHRINK_FACTOR;
            const shrunk_height = height * RECTANGLE_SHRINK_FACTOR;
            // Calculate new bounds (centered, but smaller)
            const shrunk_min_x = center_x - shrunk_width * 0.5;
            const shrunk_max_x = center_x + shrunk_width * 0.5;
            const shrunk_min_y = center_y - shrunk_height * 0.5;
            const shrunk_max_y = center_y + shrunk_height * 0.5;
            print("[PictureBehavior] Original bounds - min_x: " + min_x.toFixed(2) + ", max_x: " + max_x.toFixed(2) + ", min_y: " + min_y.toFixed(2) + ", max_y: " + max_y.toFixed(2));
            print("[PictureBehavior] Shrunk bounds - min_x: " + shrunk_min_x.toFixed(2) + ", max_x: " + shrunk_max_x.toFixed(2) + ", min_y: " + shrunk_min_y.toFixed(2) + ", max_y: " + shrunk_max_y.toFixed(2) + ", avg_z: " + avg_z.toFixed(2));
            // Convert back to world space for the corners (using average z depth and shrunk bounds)
            const topLeftLocal = new vec3(shrunk_min_x, shrunk_max_y, avg_z); // Top-left in camera space
            const topRightLocal = new vec3(shrunk_max_x, shrunk_max_y, avg_z); // Top-right in camera space
            const bottomRightLocal = new vec3(shrunk_max_x, shrunk_min_y, avg_z); // Bottom-right in camera space
            const bottomLeftLocal = new vec3(shrunk_min_x, shrunk_min_y, avg_z); // Bottom-left in camera space
            // Convert to world positions
            const topLeftPos = this.camTrans.getWorldTransform().multiplyPoint(topLeftLocal);
            const topRightPos = this.camTrans.getWorldTransform().multiplyPoint(topRightLocal);
            const bottomRightPos = this.camTrans.getWorldTransform().multiplyPoint(bottomRightLocal);
            const bottomLeftPos = this.camTrans.getWorldTransform().multiplyPoint(bottomLeftLocal);
            // Set circle positions to form rectangle
            this.circleTrans[0].setWorldPosition(topLeftPos); // Top left
            this.circleTrans[1].setWorldPosition(topRightPos); // Top right
            this.circleTrans[2].setWorldPosition(bottomRightPos); // Bottom right
            this.circleTrans[3].setWorldPosition(bottomLeftPos); // Bottom left
            // Calculate center position
            const centerPos = topLeftPos.add(bottomRightPos).uniformScale(0.5);
            // Rotate the picAnchorTrans to stay aligned with the box formed by the circles
            this.picAnchorTrans.setWorldPosition(bottomRightPos);
            const worldWidth = bottomRightPos.distance(bottomLeftPos);
            const worldHeight = topRightPos.distance(bottomRightPos);
            this.picAnchorTrans.setWorldScale(new vec3(worldWidth, worldHeight, 1));
            const rectRight = topRightPos.sub(topLeftPos).normalize();
            const rectUp = topLeftPos.sub(bottomLeftPos).normalize();
            const rectForward = rectRight.cross(rectUp).normalize();
            this.rotMat.column0 = rectRight;
            this.rotMat.column1 = rectUp;
            this.rotMat.column2 = rectForward;
            const rectRotation = quat.fromRotationMat(this.rotMat);
            this.picAnchorTrans.setWorldRotation(rectRotation);
            // Set loader position to center of rectangle
            this.loadingTrans.setWorldPosition(centerPos.add(rectForward.uniformScale(0.2)));
            this.loadingTrans.setWorldRotation(rectRotation);
        }
    };
    __setFunctionName(_classThis, "PictureBehavior");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PictureBehavior = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PictureBehavior = _classThis;
})();
exports.PictureBehavior = PictureBehavior;
//# sourceMappingURL=PictureBehavior.js.map