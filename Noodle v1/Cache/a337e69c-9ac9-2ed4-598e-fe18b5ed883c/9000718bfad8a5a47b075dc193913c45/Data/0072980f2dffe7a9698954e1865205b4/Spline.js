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
exports.Spline = void 0;
var __selfType = requireType("./Spline");
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
 * This class provides visual representation for a spline curve through a series of control points.
 * It allows customization of the spline's material, color, width, interpolation level, and visual style.
 */
let Spline = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var Spline = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.controlPoints = this.controlPoints;
            this.interpolationPoints = this.interpolationPoints;
            this.tension = this.tension;
            this.closedLoop = this.closedLoop;
            this.lineMaterial = this.lineMaterial;
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this._enabled = true;
            this.lastControlPositions = [];
            this.splinePoints = [];
        }
        __initialize() {
            super.__initialize();
            this.controlPoints = this.controlPoints;
            this.interpolationPoints = this.interpolationPoints;
            this.tension = this.tension;
            this.closedLoop = this.closedLoop;
            this.lineMaterial = this.lineMaterial;
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this._enabled = true;
            this.lastControlPositions = [];
            this.splinePoints = [];
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
         * Sets the color of the spline.
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
         * Gets the color of the spline.
         */
        get color() {
            return this._color;
        }
        onAwake() {
            if (!this.controlPoints || this.controlPoints.length < 2) {
                print("Error: At least 2 control points are required for a spline!");
                return;
            }
            this.transform = this.sceneObject.getTransform();
            // Initialize last positions
            this.lastControlPositions = this.controlPoints.map(point => point.getTransform().getWorldPosition());
            // Generate the spline points
            this.generateSplinePoints();
            // Create the line renderer
            this.createSpline();
            // Set up update event to track control point movements
            this.createEvent("UpdateEvent").bind(() => {
                this.update();
            });
        }
        /**
         * Updates the spline if any control points have moved
         */
        update() {
            if (!this.controlPoints || this.controlPoints.length < 2)
                return;
            let hasChanged = false;
            // Check if any control point has moved
            for (let i = 0; i < this.controlPoints.length; i++) {
                const currentPos = this.controlPoints[i].getTransform().getWorldPosition();
                if (!currentPos.equal(this.lastControlPositions[i])) {
                    hasChanged = true;
                    this.lastControlPositions[i] = currentPos;
                }
            }
            // If any point has moved, refresh the spline
            if (hasChanged) {
                this.refreshSpline();
            }
        }
        /**
         * Regenerates the spline points and updates the visual
         */
        refreshSpline() {
            this.generateSplinePoints();
            this.updateSplineVisual();
        }
        /**
         * Updates the spline's visual representation
         */
        updateSplineVisual() {
            if (this.line) {
                this.line.destroy();
            }
            this.createSpline();
        }
        /**
         * Creates the spline visual using InteractorLineRenderer
         */
        createSpline() {
            if (this.splinePoints.length < 2) {
                print("Error: Not enough points to create a spline!");
                return;
            }
            // Create a closed loop if requested
            const points = this.closedLoop
                ? [...this.splinePoints, this.splinePoints[0]]
                : this.splinePoints;
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
         * Generates points along a spline curve through the control points
         */
        generateSplinePoints() {
            this.splinePoints = [];
            if (!this.controlPoints || this.controlPoints.length < 2) {
                return;
            }
            // Get world positions of all control points
            const positions = this.controlPoints.map(point => point.getTransform().getWorldPosition());
            // For a closed loop, we need to add extra points at the beginning and end
            // to ensure proper interpolation at the endpoints
            let points = [...positions];
            if (this.closedLoop && points.length > 2) {
                // Add the last point at the beginning and the first point at the end
                points = [points[points.length - 1], ...points, points[0], points[1]];
            }
            else {
                // For open curves, duplicate the first and last points
                points = [points[0], ...points, points[points.length - 1]];
            }
            // Generate the spline points
            const segmentCount = this.closedLoop ? positions.length : positions.length - 1;
            // Add the first control point
            const firstLocalPoint = this.transform.getInvertedWorldTransform().multiplyPoint(positions[0]);
            this.splinePoints.push(firstLocalPoint);
            // Generate points for each segment
            for (let i = 0; i < segmentCount; i++) {
                const p0 = i === 0 && !this.closedLoop ? points[0] : points[i];
                const p1 = points[i + 1];
                const p2 = points[i + 2];
                const p3 = i === segmentCount - 1 && !this.closedLoop ? points[points.length - 1] : points[i + 3];
                // Add interpolated points for this segment
                // Use more points for a smoother curve
                const pointsInSegment = i === segmentCount - 1 ? this.interpolationPoints + 1 : this.interpolationPoints;
                for (let j = 1; j <= pointsInSegment; j++) {
                    const t = j / (pointsInSegment + (i === segmentCount - 1 ? 0 : 1));
                    const interpolatedPoint = this.catmullRomInterpolate(p0, p1, p2, p3, t);
                    const localPoint = this.transform.getInvertedWorldTransform().multiplyPoint(interpolatedPoint);
                    this.splinePoints.push(localPoint);
                }
            }
            // For open curves, ensure the last control point is included exactly
            if (!this.closedLoop) {
                const lastLocalPoint = this.transform.getInvertedWorldTransform().multiplyPoint(positions[positions.length - 1]);
                this.splinePoints[this.splinePoints.length - 1] = lastLocalPoint;
            }
        }
        /**
         * Performs Catmull-Rom interpolation between points
         */
        catmullRomInterpolate(p0, p1, p2, p3, t) {
            const t2 = t * t;
            const t3 = t2 * t;
            // Simplified Catmull-Rom formula for each component
            const x = this.interpolateComponent(p0.x, p1.x, p2.x, p3.x, t, t2, t3);
            const y = this.interpolateComponent(p0.y, p1.y, p2.y, p3.y, t, t2, t3);
            const z = this.interpolateComponent(p0.z, p1.z, p2.z, p3.z, t, t2, t3);
            return new vec3(x, y, z);
        }
        /**
         * Interpolates a single component using Catmull-Rom formula
         */
        interpolateComponent(v0, v1, v2, v3, t, t2, t3) {
            // Catmull-Rom coefficients
            const a = 0.5 * (2 * v1);
            const b = 0.5 * (v2 - v0);
            const c = 0.5 * (2 * v0 - 5 * v1 + 4 * v2 - v3);
            const d = 0.5 * (-v0 + 3 * v1 - 3 * v2 + v3);
            // Calculate the interpolated value
            return a + b * t + c * t2 + d * t3;
        }
        /**
         * Sets a new interpolation level for the spline
         */
        setInterpolationPoints(points) {
            if (points >= 0) {
                this.interpolationPoints = points;
                this.refreshSpline();
            }
        }
        /**
         * Sets a new tension value for the spline
         */
        setTension(tension) {
            this.tension = Math.max(0, Math.min(1, tension));
            this.refreshSpline();
        }
        /**
         * Sets whether the spline should be a closed loop
         */
        setClosedLoop(closed) {
            this.closedLoop = closed;
            this.refreshSpline();
        }
        /**
         * Updates the control points for the spline
         */
        setControlPoints(points) {
            if (points.length < 2) {
                print("Error: At least 2 control points are required!");
                return;
            }
            this.controlPoints = points;
            this.lastControlPositions = points.map(point => point.getTransform().getWorldPosition());
            this.refreshSpline();
        }
        /**
         * Adds a new control point to the spline
         */
        addControlPoint(point) {
            if (!this.controlPoints) {
                this.controlPoints = [];
            }
            this.controlPoints.push(point);
            this.lastControlPositions.push(point.getTransform().getWorldPosition());
            this.refreshSpline();
        }
        /**
         * Removes a control point from the spline
         */
        removeControlPoint(index) {
            if (!this.controlPoints || index < 0 || index >= this.controlPoints.length) {
                return;
            }
            if (this.controlPoints.length <= 2) {
                print("Error: Cannot remove point. At least 2 control points are required!");
                return;
            }
            this.controlPoints.splice(index, 1);
            this.lastControlPositions.splice(index, 1);
            this.refreshSpline();
        }
        onDestroy() {
            if (this.line) {
                this.line.destroy();
            }
        }
    };
    __setFunctionName(_classThis, "Spline");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Spline = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Spline = _classThis;
})();
exports.Spline = Spline;
//# sourceMappingURL=Spline.js.map