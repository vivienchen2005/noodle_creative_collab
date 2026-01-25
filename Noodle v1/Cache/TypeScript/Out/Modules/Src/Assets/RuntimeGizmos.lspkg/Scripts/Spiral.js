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
exports.Spiral = void 0;
var __selfType = requireType("./Spiral");
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
 * This class provides visual representation for a spiral. It allows customization of the spiral's material, color, width,
 * radius amplitude, length, loops, and visual style. The spiral will follow the center object if it moves.
 */
let Spiral = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var Spiral = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.centerObject = this.centerObject;
            this.startRadiusAmplitude = this.startRadiusAmplitude;
            this.endRadiusAmplitude = this.endRadiusAmplitude;
            this.axisLength = this.axisLength;
            this.loops = this.loops;
            this.followRotation = this.followRotation;
            this.axisDirection = this.axisDirection;
            this.lineMaterial = this.lineMaterial;
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this.totalSegments = this.totalSegments;
            this.spiralType = this.spiralType;
            this._enabled = true;
            this.lineSegments = [];
            this.lastCenterPosition = vec3.zero();
            this.lastCenterRotation = new quat(0, 0, 0, 1);
        }
        __initialize() {
            super.__initialize();
            this.centerObject = this.centerObject;
            this.startRadiusAmplitude = this.startRadiusAmplitude;
            this.endRadiusAmplitude = this.endRadiusAmplitude;
            this.axisLength = this.axisLength;
            this.loops = this.loops;
            this.followRotation = this.followRotation;
            this.axisDirection = this.axisDirection;
            this.lineMaterial = this.lineMaterial;
            this._color = this._color;
            this.lineWidth = this.lineWidth;
            this.lineStyle = this.lineStyle;
            this.totalSegments = this.totalSegments;
            this.spiralType = this.spiralType;
            this._enabled = true;
            this.lineSegments = [];
            this.lastCenterPosition = vec3.zero();
            this.lastCenterRotation = new quat(0, 0, 0, 1);
        }
        /**
         * Sets whether the visual can be shown.
         */
        set isEnabled(isEnabled) {
            this._enabled = isEnabled;
            this.lineSegments.forEach(line => {
                if (line && line.getSceneObject()) {
                    line.getSceneObject().enabled = isEnabled;
                }
            });
        }
        /**
         * Gets whether the visual is active.
         */
        get isEnabled() {
            return this._enabled;
        }
        /**
         * Sets the color of the spiral.
         */
        set color(color) {
            this._color = color;
            const colorWithAlpha = (0, color_1.withAlpha)(color, 1);
            this.lineSegments.forEach(line => {
                if (line) {
                    line.startColor = colorWithAlpha;
                    line.endColor = colorWithAlpha;
                }
            });
        }
        /**
         * Gets the color of the spiral.
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
            this.lastCenterRotation = this.centerTransform.getWorldRotation();
            // Create the spiral visualization
            this.createSpiral();
            // Set up update event to track center movement
            this.createEvent("UpdateEvent").bind(() => {
                this.update();
            });
        }
        /**
         * Updates the spiral position and rotation if the center has moved or rotated
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
                // Refresh the spiral
                this.refreshSpiral();
            }
        }
        /**
         * Regenerates the spiral and updates the visual
         */
        refreshSpiral() {
            this.cleanupLines();
            this.createSpiral();
        }
        /**
         * Cleans up existing line renderers
         */
        cleanupLines() {
            this.lineSegments.forEach(line => {
                if (line) {
                    line.destroy();
                }
            });
            this.lineSegments = [];
        }
        /**
         * Creates the spiral visual using multiple line segments
         */
        createSpiral() {
            // Generate all points for the spiral
            const points = this.generateSpiralPoints();
            // Build line segments from the points
            if (points.length < 2) {
                print("Error: Not enough points to create spiral!");
                return;
            }
            // Split the spiral into multiple line segments for better visual quality
            const maxPointsPerSegment = 30; // Limit points per segment for better performance
            for (let i = 0; i < points.length - 1; i += maxPointsPerSegment - 1) {
                // Calculate points for this segment (with overlap for smooth transitions)
                const segmentPoints = [];
                for (let j = 0; j < maxPointsPerSegment && i + j < points.length; j++) {
                    segmentPoints.push(points[i + j]);
                }
                if (segmentPoints.length < 2)
                    continue;
                // Create line renderer for this segment
                const line = new InteractorLineRenderer_1.default({
                    material: this.lineMaterial,
                    points: segmentPoints,
                    startColor: (0, color_1.withAlpha)(this._color, 1),
                    endColor: (0, color_1.withAlpha)(this._color, 1),
                    startWidth: this.lineWidth,
                    endWidth: this.lineWidth,
                });
                line.getSceneObject().setParent(this.sceneObject);
                line.visualStyle = this.lineStyle;
                line.getSceneObject().enabled = this._enabled;
                this.lineSegments.push(line);
            }
        }
        /**
         * Generates all points for the spiral based on current parameters
         */
        generateSpiralPoints() {
            const centerPos = this.centerTransform.getWorldPosition();
            const centerRot = this.followRotation ? this.centerTransform.getWorldRotation() : new quat(0, 0, 0, 1);
            const points = [];
            // Add extra points in tight areas for smoother curves
            // For the inner part of spiral, we need more points
            const segments = Math.max(80, this.totalSegments);
            // Include a starting point at the center
            let localPoint = new vec3(0, 0, 0);
            let worldPoint = centerPos.add(centerRot.multiplyVec3(localPoint));
            points.push(this.transform.getInvertedWorldTransform().multiplyPoint(worldPoint));
            // Generate points along the spiral path
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const angle = t * this.loops * Math.PI * 2;
                // Calculate position along primary axis (based on axisLength)
                const axisPos = t * this.axisLength;
                // Calculate radius based on spiral type
                let radius;
                switch (this.spiralType) {
                    case 1: // Exponential
                        radius = this.startRadiusAmplitude * Math.pow(this.endRadiusAmplitude / this.startRadiusAmplitude, t);
                        break;
                    case 2: // Logarithmic
                        radius = this.startRadiusAmplitude * (1 + Math.log(1 + t * 9) / Math.log(10)) *
                            (1 + t * (this.endRadiusAmplitude / this.startRadiusAmplitude - 1));
                        break;
                    case 3: // Helix (constant radius)
                        radius = this.startRadiusAmplitude;
                        break;
                    default: // Linear
                        radius = this.startRadiusAmplitude + t * (this.endRadiusAmplitude - this.startRadiusAmplitude);
                }
                // If start and end radius are equal and not a helix, ensure a proper spiral
                if (this.startRadiusAmplitude === this.endRadiusAmplitude && this.spiralType !== 3) {
                    // Add a small variation to avoid perfectly circular slices
                    radius *= (1 + t * 0.05);
                }
                // Create point in local space based on axis direction
                switch (this.axisDirection) {
                    case 0: // X axis as primary
                        localPoint = new vec3(axisPos, radius * Math.cos(angle), radius * Math.sin(angle));
                        break;
                    case 1: // Y axis as primary (default)
                        localPoint = new vec3(radius * Math.cos(angle), axisPos, radius * Math.sin(angle));
                        break;
                    case 2: // Z axis as primary
                        localPoint = new vec3(radius * Math.cos(angle), radius * Math.sin(angle), axisPos);
                        break;
                }
                // Apply center object's rotation if enabled
                if (this.followRotation) {
                    worldPoint = centerPos.add(centerRot.multiplyVec3(localPoint));
                }
                else {
                    worldPoint = centerPos.add(localPoint);
                }
                // Convert to local space for the line renderer
                points.push(this.transform.getInvertedWorldTransform().multiplyPoint(worldPoint));
                // Add extra points near the start for smoother curves
                if (i < segments * 0.2 && i > 0 && i % 2 === 0) {
                    const midT = (i - 0.5) / segments;
                    const midAngle = midT * this.loops * Math.PI * 2;
                    const midAxisPos = midT * this.axisLength;
                    // Mid-point radius
                    let midRadius;
                    switch (this.spiralType) {
                        case 1: // Exponential
                            midRadius = this.startRadiusAmplitude * Math.pow(this.endRadiusAmplitude / this.startRadiusAmplitude, midT);
                            break;
                        case 2: // Logarithmic
                            midRadius = this.startRadiusAmplitude * (1 + Math.log(1 + midT * 9) / Math.log(10)) *
                                (1 + midT * (this.endRadiusAmplitude / this.startRadiusAmplitude - 1));
                            break;
                        case 3: // Helix (constant radius)
                            midRadius = this.startRadiusAmplitude;
                            break;
                        default: // Linear
                            midRadius = this.startRadiusAmplitude + midT * (this.endRadiusAmplitude - this.startRadiusAmplitude);
                    }
                    let midLocalPoint;
                    switch (this.axisDirection) {
                        case 0: // X axis as primary
                            midLocalPoint = new vec3(midAxisPos, midRadius * Math.cos(midAngle), midRadius * Math.sin(midAngle));
                            break;
                        case 1: // Y axis as primary (default)
                            midLocalPoint = new vec3(midRadius * Math.cos(midAngle), midAxisPos, midRadius * Math.sin(midAngle));
                            break;
                        case 2: // Z axis as primary
                            midLocalPoint = new vec3(midRadius * Math.cos(midAngle), midRadius * Math.sin(midAngle), midAxisPos);
                            break;
                    }
                    let midWorldPoint;
                    if (this.followRotation) {
                        midWorldPoint = centerPos.add(centerRot.multiplyVec3(midLocalPoint));
                    }
                    else {
                        midWorldPoint = centerPos.add(midLocalPoint);
                    }
                    // Insert midpoint at the correct position (between i-1 and i)
                    points.splice(points.length - 1, 0, this.transform.getInvertedWorldTransform().multiplyPoint(midWorldPoint));
                }
            }
            return points;
        }
        /**
         * Sets new radius amplitude values for the spiral
         */
        setRadiusAmplitudes(startAmplitude, endAmplitude) {
            this.startRadiusAmplitude = Math.max(0.01, startAmplitude);
            this.endRadiusAmplitude = Math.max(0.01, endAmplitude);
            this.refreshSpiral();
        }
        /**
         * Sets the length of the spiral along its axis
         */
        setAxisLength(length) {
            this.axisLength = Math.max(0.01, length);
            this.refreshSpiral();
        }
        /**
         * Sets the number of loops in the spiral
         */
        setLoops(loops) {
            if (loops > 0) {
                this.loops = loops;
                this.refreshSpiral();
            }
        }
        /**
         * Sets the total number of segments used to approximate the spiral
         */
        setTotalSegments(segments) {
            if (segments >= 20) {
                this.totalSegments = segments;
                this.refreshSpiral();
            }
        }
        /**
         * Sets the axis along which the spiral expands
         */
        setAxisDirection(axis) {
            if (axis >= 0 && axis <= 2) {
                this.axisDirection = axis;
                this.refreshSpiral();
            }
        }
        /**
         * Sets whether the spiral should follow the center object's rotation
         */
        setFollowRotation(follow) {
            this.followRotation = follow;
            this.refreshSpiral();
        }
        /**
         * Sets the type of spiral
         */
        setSpiralType(type) {
            if (type >= 0 && type <= 3) {
                this.spiralType = type;
                this.refreshSpiral();
            }
        }
        onDestroy() {
            this.cleanupLines();
        }
    };
    __setFunctionName(_classThis, "Spiral");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Spiral = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Spiral = _classThis;
})();
exports.Spiral = Spiral;
//# sourceMappingURL=Spiral.js.map