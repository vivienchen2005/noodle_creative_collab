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
 * and automatically generates two middle control points to create a smooth cubic bezier curve.
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
            this.controlPointDistance = this.controlPointDistance;
            this.lineMaterial = this.lineMaterial;
            // Cyan color #7FECFB = RGB(127, 236, 251) = (0.498, 0.925, 0.984)
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this._enabled = true;
            this.line = null;
            this.lastStartPosition = new vec3(0, 0, 0);
            this.lastEndPosition = new vec3(0, 0, 0);
            this.splinePoints = [];
            this.controlPoint1 = new vec3(0, 0, 0);
            this.controlPoint2 = new vec3(0, 0, 0);
            this.isInitialized = false;
        }
        __initialize() {
            super.__initialize();
            this.startPoint = this.startPoint;
            this.endPoint = this.endPoint;
            this.interpolationPoints = this.interpolationPoints;
            this.curveHeight = this.curveHeight;
            this.curveDirection = this.curveDirection;
            this.controlPointDistance = this.controlPointDistance;
            this.lineMaterial = this.lineMaterial;
            // Cyan color #7FECFB = RGB(127, 236, 251) = (0.498, 0.925, 0.984)
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this._enabled = true;
            this.line = null;
            this.lastStartPosition = new vec3(0, 0, 0);
            this.lastEndPosition = new vec3(0, 0, 0);
            this.splinePoints = [];
            this.controlPoint1 = new vec3(0, 0, 0);
            this.controlPoint2 = new vec3(0, 0, 0);
            this.isInitialized = false;
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
            this.transform = this.sceneObject.getTransform();
            // Set up update event to track point movements and deferred initialization
            this.createEvent("UpdateEvent").bind(() => {
                this.update();
            });
        }
        /**
         * Initialize the curve when both points are available
         * Called automatically when points are set, or can be called manually
         */
        initialize() {
            if (this.isInitialized) {
                return true;
            }
            if (!this.startPoint || !this.endPoint) {
                // Not ready yet - wait for both points to be set
                return false;
            }
            // Initialize last positions
            this.lastStartPosition = this.startPoint.getTransform().getWorldPosition();
            this.lastEndPosition = this.endPoint.getTransform().getWorldPosition();
            // Generate the curve points
            this.generateCurvePoints();
            // Create the line renderer
            this.createCurve();
            this.isInitialized = true;
            return true;
        }
        /**
         * Updates the curve if the start or end points have moved
         */
        update() {
            // Try to initialize if not yet done
            if (!this.isInitialized) {
                this.initialize();
                return;
            }
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
            // Calculate the two middle control points
            this.calculateControlPoints(startPos, endPos);
            // Convert to local space
            const startLocal = this.transform.getInvertedWorldTransform().multiplyPoint(startPos);
            const control1Local = this.transform.getInvertedWorldTransform().multiplyPoint(this.controlPoint1);
            const control2Local = this.transform.getInvertedWorldTransform().multiplyPoint(this.controlPoint2);
            const endLocal = this.transform.getInvertedWorldTransform().multiplyPoint(endPos);
            // Generate cubic bezier curve points
            for (let i = 0; i <= this.interpolationPoints; i++) {
                const t = i / this.interpolationPoints;
                const point = this.cubicBezier(startLocal, control1Local, control2Local, endLocal, t);
                this.splinePoints.push(point);
            }
        }
        /**
         * Calculates the two control points for the cubic bezier curve
         * Creates a smooth "cable" style curve like in node editors (ComfyUI, Unreal Blueprints)
         * The curve extends outward horizontally from each point, then droops naturally
         */
        calculateControlPoints(start, end) {
            // Calculate the direction vector from start to end
            const direction = end.sub(start);
            const distance = direction.length;
            // If distance is too small, just use straight line
            if (distance < 0.001) {
                this.controlPoint1 = start;
                this.controlPoint2 = end;
                return;
            }
            // For node-editor style curves, control points extend OUTWARD from each node
            // This creates the classic "cable" look where wires flow smoothly out then connect
            // Calculate horizontal distance and vertical drop
            const horizontalDir = new vec3(direction.x, 0, direction.z);
            const horizontalDist = horizontalDir.length;
            // Determine the "outward" direction for each control point
            // Control point 1: extends in the general direction toward the end point
            // Control point 2: extends in the general direction toward the start point
            let outwardDir1;
            let outwardDir2;
            if (horizontalDist > 0.01) {
                // Use horizontal direction for more natural cable flow
                outwardDir1 = horizontalDir.normalize();
                outwardDir2 = horizontalDir.normalize().uniformScale(-1);
            }
            else {
                // Points are mostly vertical - use forward direction
                outwardDir1 = new vec3(0, 0, 1);
                outwardDir2 = new vec3(0, 0, -1);
            }
            // Control point distance scales with the connection distance
            // Longer connections need control points further out for smooth curves
            const baseDist = Math.max(distance * this.controlPointDistance, 0.1);
            // Add a droop/sag based on curveHeight (negative = droop down, positive = arc up)
            const droopAmount = this.curveHeight * distance;
            const droopVector = new vec3(0, -droopAmount, 0); // Droop downward for cable look
            // Control point 1: Start + outward direction + slight droop
            this.controlPoint1 = start.add(outwardDir1.uniformScale(baseDist)).add(droopVector.uniformScale(0.3));
            // Control point 2: End + outward direction (toward start) + slight droop  
            this.controlPoint2 = end.add(outwardDir2.uniformScale(baseDist)).add(droopVector.uniformScale(0.3));
            // Apply curve direction modifier for special cases
            if (this.curveDirection === 0) {
                // "Up" mode - make the curve arc upward instead of drooping
                const upOffset = new vec3(0, Math.abs(droopAmount), 0);
                this.controlPoint1 = start.add(outwardDir1.uniformScale(baseDist)).add(upOffset);
                this.controlPoint2 = end.add(outwardDir2.uniformScale(baseDist)).add(upOffset);
            }
            else if (this.curveDirection === 1) {
                // "Right" mode - curve extends to the right
                const rightOffset = new vec3(1, 0, 0).uniformScale(droopAmount);
                this.controlPoint1 = start.add(outwardDir1.uniformScale(baseDist)).add(rightOffset);
                this.controlPoint2 = end.add(outwardDir2.uniformScale(baseDist)).add(rightOffset);
            }
            // curveDirection === 2 (Forward) uses the default drooping behavior
        }
        /**
         * Performs cubic bezier interpolation
         * @param p0 Start point
         * @param p1 First control point
         * @param p2 Second control point
         * @param p3 End point
         * @param t Interpolation parameter (0 to 1)
         */
        cubicBezier(p0, p1, p2, p3, t) {
            const oneMinusT = 1 - t;
            const oneMinusTSquared = oneMinusT * oneMinusT;
            const oneMinusTCubed = oneMinusTSquared * oneMinusT;
            const tSquared = t * t;
            const tCubed = tSquared * t;
            // Cubic bezier formula: (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
            const x = oneMinusTCubed * p0.x + 3 * oneMinusTSquared * t * p1.x + 3 * oneMinusT * tSquared * p2.x + tCubed * p3.x;
            const y = oneMinusTCubed * p0.y + 3 * oneMinusTSquared * t * p1.y + 3 * oneMinusT * tSquared * p2.y + tCubed * p3.y;
            const z = oneMinusTCubed * p0.z + 3 * oneMinusTSquared * t * p1.z + 3 * oneMinusT * tSquared * p2.z + tCubed * p3.z;
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
         * Sets the control point distance
         */
        setControlPointDistance(distance) {
            this.controlPointDistance = Math.max(0.1, Math.min(0.5, distance));
            this.refreshCurve();
        }
        /**
         * Gets the calculated first control point position
         */
        getControlPoint1() {
            return this.controlPoint1;
        }
        /**
         * Gets the calculated second control point position
         */
        getControlPoint2() {
            return this.controlPoint2;
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