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
exports.CropRegion = void 0;
var __selfType = requireType("./CropRegion");
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
let CropRegion = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var CropRegion = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.cameraService = this.cameraService;
            this.screenCropTexture = this.screenCropTexture;
            this.pointsToTrack = this.pointsToTrack;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.cropProvider = null;
            this.transformsToTrack = [];
            this.initialized = false;
        }
        __initialize() {
            super.__initialize();
            this.cameraService = this.cameraService;
            this.screenCropTexture = this.screenCropTexture;
            this.pointsToTrack = this.pointsToTrack;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.cropProvider = null;
            this.transformsToTrack = [];
            this.initialized = false;
        }
        onAwake() {
            print("[CropRegion] onAwake called");
            // Create update event that will run every frame
            const updateEvent = this.createEvent("UpdateEvent");
            updateEvent.bind(() => {
                // Initialize if not done yet
                if (!this.initialized && this.cameraService) {
                    this.initialize();
                }
                // Always call update() every frame to keep crop region updated
                this.update();
            });
        }
        initialize() {
            if (this.initialized)
                return;
            if (!this.cameraService) {
                print("[CropRegion] cameraService not set yet, waiting...");
                return;
            }
            this.cropProvider = this.screenCropTexture.control;
            for (let i = 0; i < this.pointsToTrack.length; i++) {
                this.transformsToTrack.push(this.pointsToTrack[i].getTransform());
            }
            if (this.transformsToTrack.length < 1) {
                print("[CropRegion] No points to track!");
                return;
            }
            this.initialized = true;
            print(`[CropRegion] Initialized successfully with ${this.transformsToTrack.length} points to track`);
        }
        update() {
            // Initialize if not done yet
            if (!this.initialized) {
                this.initialize();
                return;
            }
            if (!this.cameraService || !this.cropProvider) {
                return;
            }
            const imagePoints = [];
            for (let i = 0; i < this.transformsToTrack.length; i++) {
                let imagePos = vec2.zero();
                if (this.isEditor) {
                    imagePos = this.cameraService.WorldToEditorCameraSpace(this.transformsToTrack[i].getWorldPosition());
                }
                else {
                    imagePos = this.cameraService.WorldToTrackingRightCameraSpace(this.transformsToTrack[i].getWorldPosition());
                }
                const isTrackingPoint = Math.abs(imagePos.x) <= 1 && Math.abs(imagePos.y) <= 1;
                imagePoints.push(imagePos);
                if (!isTrackingPoint) {
                    // Point is out of bounds, set to full frame
                    this.cropProvider.cropRect = Rect.create(-1, 1, -1, 1);
                    return;
                }
            }
            this.OnTrackingUpdated(imagePoints);
        }
        OnTrackingUpdated(imagePoints) {
            let min_x = Infinity, max_x = -Infinity, min_y = Infinity, max_y = -Infinity;
            //find max and min points
            for (let i = 0; i < imagePoints.length; i++) {
                //in range -1 to 1
                const imagePoint = imagePoints[i];
                if (imagePoint.x < min_x)
                    min_x = imagePoint.x;
                if (imagePoint.x > max_x)
                    max_x = imagePoint.x;
                if (imagePoint.y < min_y)
                    min_y = imagePoint.y;
                if (imagePoint.y > max_y)
                    max_y = imagePoint.y;
            }
            const center = new vec2(min_x + max_x, min_y + max_y).uniformScale(0.5);
            const size = new vec2(max_x - min_x, max_y - min_y);
            // Log the calculated crop region occasionally (every 60 frames = ~1 second)
            const frameCount = getTime() * 60; // Approximate frame count
            if (Math.floor(frameCount) % 60 === 0) {
                print(`[CropRegion] Updating crop region: center=(${center.x.toFixed(2)}, ${center.y.toFixed(2)}), size=(${size.x.toFixed(2)}, ${size.y.toFixed(2)})`);
            }
            const cropRect = this.cropProvider.cropRect;
            cropRect.setCenter(center);
            cropRect.setSize(size);
            this.cropProvider.cropRect = cropRect;
        }
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }
        Remap(value, low1, high1, low2, high2) {
            return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
        }
    };
    __setFunctionName(_classThis, "CropRegion");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CropRegion = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CropRegion = _classThis;
})();
exports.CropRegion = CropRegion;
//# sourceMappingURL=CropRegion.js.map