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
exports.BezierCurve = void 0;
var __selfType = requireType("./BezierCurve");
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
 * A simplified spline component that takes only two points (start and finish)
 * and automatically generates a middle control point to create a smooth bezier curve.
 */
let BezierCurve = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var BezierCurve = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.startPoint = this.startPoint;
            this.endPoint = this.endPoint;
            this.interpolationPoints = this.interpolationPoints;
            this.curveHeight = this.curveHeight;
            this.curveDirection = this.curveDirection;
            this.lineMaterial = this.lineMaterial;
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this._enabled = true;
            this.lastStartPosition = new vec3(0, 0, 0);
            this.lastEndPosition = new vec3(0, 0, 0);
            this.splinePoints = [];
            this.middleControlPoint = new vec3(0, 0, 0);
        }
        __initialize() {
            super.__initialize();
            this.startPoint = this.startPoint;
            this.endPoint = this.endPoint;
            this.interpolationPoints = this.interpolationPoints;
            this.curveHeight = this.curveHeight;
            this.curveDirection = this.curveDirection;
            this.lineMaterial = this.lineMaterial;
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this._enabled = true;
            this.lastStartPosition = new vec3(0, 0, 0);
            this.lastEndPosition = new vec3(0, 0, 0);
            this.splinePoints = [];
            this.middleControlPoint = new vec3(0, 0, 0);
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
         * Sets the color of the curve.
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
         * Gets the color of the curve.
         */
        get color() {
            return this._color;
        }
        onAwake() {
            if (!this.startPoint || !this.endPoint) {
                print("Error: Both start and end points are required!");
                return;
            }
            this.transform = this.sceneObject.getTransform();
            // Initialize last positions
            this.lastStartPosition = this.startPoint.getTransform().getWorldPosition();
            this.lastEndPosition = this.endPoint.getTransform().getWorldPosition();
            // Generate the curve points
            this.generateCurvePoints();
            // Create the line renderer
            this.createCurve();
            // Set up update event to track point movements
            this.createEvent("UpdateEvent").bind(() => {
                this.update();
            });
        }
        /**
         * Updates the curve if the start or end points have moved
         */
        update() {
            if (!this.startPoint || !this.endPoint)
                return;
            const currentStartPos = this.startPoint.getTransform().getWorldPosition();
            const currentEndPos = this.endPoint.getTransform().getWorldPosition();
            let hasChanged = false;
            // Check if start point has moved
            if (!currentStartPos.equal(this.lastStartPosition)) {
                hasChanged = true;
                this.lastStartPosition = currentStartPos;
            }
            // Check if end point has moved
            if (!currentEndPos.equal(this.lastEndPosition)) {
                hasChanged = true;
                this.lastEndPosition = currentEndPos;
            }
            // If any point has moved, refresh the curve
            if (hasChanged) {
                this.refreshCurve();
            }
        }
        /**
         * Regenerates the curve points and updates the visual
         */
        refreshCurve() {
            this.generateCurvePoints();
            this.updateCurveVisual();
        }
        /**
         * Updates the curve's visual representation
         */
        updateCurveVisual() {
            if (this.line) {
                this.line.destroy();
            }
            this.createCurve();
        }
        /**
         * Creates the curve visual using InteractorLineRenderer
         */
        createCurve() {
            if (this.splinePoints.length < 2) {
                print("Error: Not enough points to create a curve!");
                return;
            }
            this.line = new InteractorLineRenderer_1.default({
                material: this.lineMaterial,
                points: this.splinePoints,
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
         * Generates points along a quadratic bezier curve from start to end
         */
        generateCurvePoints() {
            this.splinePoints = [];
            if (!this.startPoint || !this.endPoint) {
                return;
            }
            // Get world positions
            const startPos = this.startPoint.getTransform().getWorldPosition();
            const endPos = this.endPoint.getTransform().getWorldPosition();
            // Calculate the middle control point
            this.calculateMiddleControlPoint(startPos, endPos);
            // Convert to local space
            const startLocal = this.transform.getInvertedWorldTransform().multiplyPoint(startPos);
            const middleLocal = this.transform.getInvertedWorldTransform().multiplyPoint(this.middleControlPoint);
            const endLocal = this.transform.getInvertedWorldTransform().multiplyPoint(endPos);
            // Generate bezier curve points
            for (let i = 0; i <= this.interpolationPoints; i++) {
                const t = i / this.interpolationPoints;
                const point = this.quadraticBezier(startLocal, middleLocal, endLocal, t);
                this.splinePoints.push(point);
            }
        }
        /**
         * Calculates the middle control point for the bezier curve
         * This creates a nice arching curve between start and end points
         */
        calculateMiddleControlPoint(start, end) {
            // Calculate the midpoint
            const midpoint = new vec3((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2);
            // Calculate the direction vector from start to end
            const direction = end.sub(start);
            const distance = direction.length;
            // Normalize the direction
            const normalizedDir = direction.normalize();
            // Calculate perpendicular vector based on curve direction
            let perpendicular;
            const up = new vec3(0, 1, 0);
            switch (this.curveDirection) {
                case 0: // Up
                    // Use cross product to get a perpendicular vector, then cross again to get upward component
                    const right = normalizedDir.cross(up).normalize();
                    if (right.length < 0.1) {
                        // If direction is parallel to up, use forward
                        perpendicular = new vec3(0, 0, 1);
                    }
                    else {
                        perpendicular = right.cross(normalizedDir).normalize();
                    }
                    break;
                case 1: // Right
                    perpendicular = normalizedDir.cross(up).normalize();
                    if (perpendicular.length < 0.1) {
                        perpendicular = new vec3(1, 0, 0);
                    }
                    break;
                case 2: // Forward
                    perpendicular = normalizedDir;
                    break;
                default:
                    perpendicular = up;
            }
            // Calculate the offset distance based on curve height and distance
            // The curve height is scaled by the distance to maintain proportions
            const offsetDistance = this.curveHeight * (0.5 + distance * 0.1);
            // Calculate the control point by offsetting the midpoint
            const offset = perpendicular.uniformScale(offsetDistance);
            this.middleControlPoint = midpoint.add(offset);
        }
        /**
         * Performs quadratic bezier interpolation
         * @param p0 Start point
         * @param p1 Control point (middle)
         * @param p2 End point
         * @param t Interpolation parameter (0 to 1)
         */
        quadraticBezier(p0, p1, p2, t) {
            const oneMinusT = 1 - t;
            const oneMinusTSquared = oneMinusT * oneMinusT;
            const tSquared = t * t;
            // Quadratic bezier formula: (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
            const x = oneMinusTSquared * p0.x + 2 * oneMinusT * t * p1.x + tSquared * p2.x;
            const y = oneMinusTSquared * p0.y + 2 * oneMinusT * t * p1.y + tSquared * p2.y;
            const z = oneMinusTSquared * p0.z + 2 * oneMinusT * t * p1.z + tSquared * p2.z;
            return new vec3(x, y, z);
        }
        /**
         * Sets a new interpolation level for the curve
         */
        setInterpolationPoints(points) {
            if (points >= 2) {
                this.interpolationPoints = points;
                this.refreshCurve();
            }
        }
        /**
         * Sets a new curve height
         */
        setCurveHeight(height) {
            this.curveHeight = height;
            this.refreshCurve();
        }
        /**
         * Sets the curve direction
         */
        setCurveDirection(direction) {
            if (direction >= 0 && direction <= 2) {
                this.curveDirection = direction;
                this.refreshCurve();
            }
        }
        /**
         * Gets the calculated middle control point position
         */
        getMiddleControlPoint() {
            return this.middleControlPoint;
        }
        onDestroy() {
            if (this.line) {
                this.line.destroy();
            }
        }
    };
    __setFunctionName(_classThis, "BezierCurve");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BezierCurve = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BezierCurve = _classThis;
})();
exports.BezierCurve = BezierCurve;
//# sourceMappingURL=BezierCurve.js.map