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
exports.InteractiveBezierCurve = void 0;
var __selfType = requireType("./InteractiveBezierCurve");
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
// Import BezierCurve from RuntimeGizmos package
// Using relative path from NodeSystem to RuntimeGizmos
const BezierCurve_1 = require("../../RuntimeGizmos.lspkg/Scripts/BezierCurve");
const Event_1 = require("SpectaclesInteractionKit.lspkg/Utils/Event");
/**
 * Gesture-interactive version of BezierCurve that responds to grab/targeting gestures.
 * When grabbed, the curve follows the hand position. When released, triggers node creation menu.
 */
let InteractiveBezierCurve = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BezierCurve_1.BezierCurve;
    var InteractiveBezierCurve = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.handType = this.handType;
            this.useGrabGesture = this.useGrabGesture;
            this.tempEndPoint = this.tempEndPoint;
            this.gestureModule = require("LensStudio:GestureModule");
            this.isDragging = false;
            this.tempEndPointObject = null;
            this.originalEndPoint = null;
            // Event callbacks
            this.onDragStart = new Event_1.default();
            this.onDragEnd = new Event_1.default();
            this.onReleaseAtPosition = new Event_1.default();
        }
        __initialize() {
            super.__initialize();
            this.handType = this.handType;
            this.useGrabGesture = this.useGrabGesture;
            this.tempEndPoint = this.tempEndPoint;
            this.gestureModule = require("LensStudio:GestureModule");
            this.isDragging = false;
            this.tempEndPointObject = null;
            this.originalEndPoint = null;
            // Event callbacks
            this.onDragStart = new Event_1.default();
            this.onDragEnd = new Event_1.default();
            this.onReleaseAtPosition = new Event_1.default();
        }
        onAwake() {
            super.onAwake();
            // Create temporary end point if not provided
            if (!this.tempEndPoint) {
                this.tempEndPointObject = global.scene.createSceneObject("TempEndPoint");
                this.tempEndPointObject.setParent(this.sceneObject);
            }
            else {
                this.tempEndPointObject = this.tempEndPoint;
            }
            // Store original end point
            this.originalEndPoint = this.endPoint;
            // Set up gesture listeners
            this.setupGestureListeners();
        }
        /**
         * Sets up gesture event listeners
         */
        setupGestureListeners() {
            const hand = this.handType === 0 ? GestureModule.HandType.Right : GestureModule.HandType.Left;
            if (this.useGrabGesture) {
                // Use grab gesture
                this.gestureModule.getGrabBeginEvent(hand).add(() => {
                    this.onGrabBegin();
                });
                this.gestureModule.getGrabEndEvent(hand).add(() => {
                    this.onGrabEnd();
                });
            }
            else {
                // Use targeting gesture for continuous tracking
                this.gestureModule.getTargetingDataEvent(hand).add((targetArgs) => {
                    if (this.isDragging && targetArgs.isValid) {
                        this.updateTempEndPoint(targetArgs.rayOriginInWorld.add(targetArgs.rayDirectionInWorld.uniformScale(2)));
                    }
                });
            }
            // Also use targeting for position updates during drag
            this.gestureModule.getTargetingDataEvent(hand).add((targetArgs) => {
                if (this.isDragging && targetArgs.isValid) {
                    // Update temporary end point to follow hand
                    const targetPosition = targetArgs.rayOriginInWorld.add(targetArgs.rayDirectionInWorld.uniformScale(2));
                    this.updateTempEndPoint(targetPosition);
                }
            });
        }
        /**
         * Called when grab begins
         */
        onGrabBegin() {
            if (!this.isDragging) {
                this.startDragging();
            }
        }
        /**
         * Called when grab ends
         */
        onGrabEnd() {
            if (this.isDragging) {
                this.stopDragging();
            }
        }
        /**
         * Starts dragging the curve
         */
        startDragging() {
            if (this.isDragging)
                return;
            this.isDragging = true;
            // Switch to temporary end point
            if (this.tempEndPointObject) {
                this.endPoint = this.tempEndPointObject;
                // Position temp point at current end position
                const currentEndPos = this.originalEndPoint?.getTransform().getWorldPosition() || new vec3(0, 0, 0);
                this.tempEndPointObject.getTransform().setWorldPosition(currentEndPos);
            }
            this.onDragStart.invoke();
            print("InteractiveBezierCurve: Started dragging");
        }
        /**
         * Stops dragging the curve
         */
        stopDragging() {
            if (!this.isDragging)
                return;
            this.isDragging = false;
            // Get release position
            const releasePosition = this.tempEndPointObject?.getTransform().getWorldPosition() || new vec3(0, 0, 0);
            // Restore original end point
            if (this.originalEndPoint) {
                this.endPoint = this.originalEndPoint;
            }
            this.onDragEnd.invoke();
            this.onReleaseAtPosition.invoke(releasePosition);
            print("InteractiveBezierCurve: Stopped dragging at position: " + releasePosition);
        }
        /**
         * Updates the temporary end point position
         */
        updateTempEndPoint(position) {
            if (this.tempEndPointObject) {
                this.tempEndPointObject.getTransform().setWorldPosition(position);
            }
        }
        /**
         * Checks if currently dragging
         */
        getIsDragging() {
            return this.isDragging;
        }
        /**
         * Gets the current drag position
         */
        getDragPosition() {
            if (this.isDragging && this.tempEndPointObject) {
                return this.tempEndPointObject.getTransform().getWorldPosition();
            }
            return null;
        }
        onDestroy() {
            // Clean up temporary objects
            if (this.tempEndPointObject && this.tempEndPointObject !== this.tempEndPoint) {
                this.tempEndPointObject.destroy();
            }
            super.onDestroy();
        }
    };
    __setFunctionName(_classThis, "InteractiveBezierCurve");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InteractiveBezierCurve = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InteractiveBezierCurve = _classThis;
})();
exports.InteractiveBezierCurve = InteractiveBezierCurve;
//# sourceMappingURL=InteractiveBezierCurve.js.map