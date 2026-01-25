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
exports.Circle = void 0;
var __selfType = requireType("./Circle");
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
const color_1 = require("SpectaclesInteractionKit.lspkg/Utils/color");
const InteractorLineRenderer_1 = require("SpectaclesInteractionKit.lspkg/Components/Interaction/InteractorLineVisual/InteractorLineRenderer");
/**
 * This class provides visual representation for a circle. It allows customization of the circle's material, color, width, radius, and visual style.
 * The circle will follow the center object if it moves.
 */
let Circle = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var Circle = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.centerObject = this.centerObject;
            this.radius = this.radius;
            this.followRotation = this.followRotation;
            this.lineMaterial = this.lineMaterial;
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this.segments = this.segments;
            this._enabled = true;
            this.lastCenterPosition = vec3.zero();
            this.lastCenterRotation = new quat(0, 0, 0, 1);
            this.circlePoints = [];
        }
        __initialize() {
            super.__initialize();
            this.centerObject = this.centerObject;
            this.radius = this.radius;
            this.followRotation = this.followRotation;
            this.lineMaterial = this.lineMaterial;
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this.segments = this.segments;
            this._enabled = true;
            this.lastCenterPosition = vec3.zero();
            this.lastCenterRotation = new quat(0, 0, 0, 1);
            this.circlePoints = [];
        }
        /**
         * Sets whether the visual can be shown.
         */
        set isEnabled(isEnabled) {
            this._enabled = isEnabled;
            if (this.line) {
                this.line.getSceneObject().enabled = isEnabled;
            }
        }
        /**
         * Gets whether the visual is active.
         */
        get isEnabled() {
            return this._enabled;
        }
        /**
         * Sets the color of the circle.
         */
        set color(color) {
            this._color = color;
            if (this.line) {
                const colorWithAlpha = (0, color_1.withAlpha)(color, 1);
                this.line.startColor = colorWithAlpha;
                this.line.endColor = colorWithAlpha;
            }
        }
        /**
         * Gets the color of the circle.
         */
        get color() {
            return this._color;
        }
        onAwake() {
            if (!this.centerObject) {
                print("Error: Center object is not assigned!");
                return;
            }
            this.transform = this.sceneObject.getTransform();
            this.centerTransform = this.centerObject.getTransform();
            this.lastCenterPosition = this.centerTransform.getWorldPosition();
            // Generate the circle points
            this.generateCirclePoints();
            // Create the line renderer
            this.createCircle();
            // Set up update event to track center movement
            this.createEvent("UpdateEvent").bind(() => {
                this.update();
            });
        }
        /**
         * Updates the circle position and rotation if the center has moved or rotated
         */
        update() {
            if (!this.centerObject)
                return;
            const currentCenterPos = this.centerTransform.getWorldPosition();
            const currentCenterRot = this.centerTransform.getWorldRotation();
            // Check if position or rotation has changed
            if (!currentCenterPos.equal(this.lastCenterPosition) ||
                (this.followRotation && !this.lastCenterRotation.equal(currentCenterRot))) {
                // Update stored position and rotation
                this.lastCenterPosition = currentCenterPos;
                this.lastCenterRotation = currentCenterRot;
                // Refresh the circle
                this.refreshCircle();
            }
        }
        /**
         * Regenerates the circle points and updates the visual
         */
        refreshCircle() {
            this.generateCirclePoints();
            this.updateCircleVisual();
        }
        /**
         * Updates the circle's visual representation
         */
        updateCircleVisual() {
            if (this.line) {
                this.line.destroy();
            }
            this.createCircle();
        }
        /**
         * Creates the circle visual using InteractorLineRenderer
         */
        createCircle() {
            // Create a closed loop by adding the first point at the end
            const points = [...this.circlePoints, this.circlePoints[0]];
            this.line = new InteractorLineRenderer_1.default({
                material: this.lineMaterial,
                points: points,
                startColor: (0, color_1.withAlpha)(this._color, 1),
                endColor: (0, color_1.withAlpha)(this._color, 1),
                startWidth: this.lineWidth,
                endWidth: this.lineWidth,
            });
            this.line.getSceneObject().setParent(this.sceneObject);
            this.line.visualStyle = this.lineStyle;
            this.line.getSceneObject().enabled = this._enabled;
        }
        /**
         * Generates points along a circle in the XY plane, respecting the center object's rotation if enabled
         */
        generateCirclePoints() {
            this.circlePoints = [];
            const centerPos = this.centerTransform.getWorldPosition();
            const centerRot = this.followRotation ? this.centerTransform.getWorldRotation() : new quat(0, 0, 0, 1);
            // Generate points for the circle in the XY plane
            for (let i = 0; i < this.segments; i++) {
                const angle = (i / this.segments) * Math.PI * 2;
                // Create point in local space (XY plane)
                const localCirclePoint = new vec3(this.radius * Math.cos(angle), this.radius * Math.sin(angle), 0);
                // Apply center object's rotation if enabled
                let worldPoint;
                if (this.followRotation) {
                    // Transform the point using the center's rotation
                    worldPoint = centerPos.add(centerRot.multiplyVec3(localCirclePoint));
                }
                else {
                    // Just offset from center position
                    worldPoint = new vec3(centerPos.x + localCirclePoint.x, centerPos.y + localCirclePoint.y, centerPos.z + localCirclePoint.z);
                }
                // Convert to local space for the line renderer
                const localPoint = this.transform.getInvertedWorldTransform().multiplyPoint(worldPoint);
                this.circlePoints.push(localPoint);
            }
        }
        /**
         * Sets a new radius for the circle
         */
        setRadius(newRadius) {
            this.radius = newRadius;
            this.refreshCircle();
        }
        /**
         * Sets whether the circle should follow the center object's rotation
         */
        setFollowRotation(follow) {
            this.followRotation = follow;
            this.refreshCircle();
        }
        /**
         * Sets the number of segments used to approximate the circle
         */
        setSegments(segments) {
            if (segments >= 3) {
                this.segments = segments;
                this.refreshCircle();
            }
        }
        onDestroy() {
            if (this.line) {
                this.line.destroy();
            }
        }
    };
    __setFunctionName(_classThis, "Circle");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Circle = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Circle = _classThis;
})();
exports.Circle = Circle;
//# sourceMappingURL=Circle.js.map