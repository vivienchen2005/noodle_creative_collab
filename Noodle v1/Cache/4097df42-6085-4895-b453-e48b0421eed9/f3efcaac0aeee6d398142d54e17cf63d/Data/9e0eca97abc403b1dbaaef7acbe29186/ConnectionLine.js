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
exports.ConnectionLine = void 0;
var __selfType = requireType("./ConnectionLine");
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
const BezierCurve_1 = require("RuntimeGizmos.lspkg/Scripts/BezierCurve");
/**
 * A wrapper for BezierCurve that allows setting start and end points after creation.
 * This solves the issue where BezierCurve requires startPoint and endPoint during component creation.
 * Also supports dynamic dragging for interactive connection creation.
 */
let ConnectionLine = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var ConnectionLine = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.startPoint = this.startPoint;
            this.endPoint = this.endPoint;
            this.lineMaterial = this.lineMaterial;
            this.curveHeight = this.curveHeight;
            this.interpolationPoints = this.interpolationPoints;
            this.lineColor = this.lineColor;
            // Source and target nodes for connection tracking
            this.sourceNode = null;
            this.targetNode = null;
            this.bezierCurve = null;
            this.bezierCurveObject = null;
            this.isInitialized = false;
            // For dynamic dragging
            this.isDragging = false;
            this.dragEndPoint = null;
        }
        __initialize() {
            super.__initialize();
            this.startPoint = this.startPoint;
            this.endPoint = this.endPoint;
            this.lineMaterial = this.lineMaterial;
            this.curveHeight = this.curveHeight;
            this.interpolationPoints = this.interpolationPoints;
            this.lineColor = this.lineColor;
            // Source and target nodes for connection tracking
            this.sourceNode = null;
            this.targetNode = null;
            this.bezierCurve = null;
            this.bezierCurveObject = null;
            this.isInitialized = false;
            // For dynamic dragging
            this.isDragging = false;
            this.dragEndPoint = null;
        }
        onAwake() {
            // Wait for start and end points to be set via Inspector or script
            const checkEvent = this.createEvent("UpdateEvent");
            checkEvent.bind(() => {
                if (!this.isInitialized && this.startPoint && this.endPoint) {
                    this.initializeBezierCurve();
                }
            });
        }
        initializeBezierCurve() {
            if (this.isInitialized) {
                return;
            }
            if (!this.startPoint || !this.endPoint) {
                print("[ConnectionLine] Cannot initialize - start or end point is null");
                return;
            }
            print("[ConnectionLine] Initializing BezierCurve with start and end points");
            // Create a child object for the BezierCurve
            this.bezierCurveObject = global.scene.createSceneObject("BezierCurveVisual");
            this.bezierCurveObject.setParent(this.sceneObject);
            // Create the BezierCurve component (now supports deferred initialization)
            this.bezierCurve = this.bezierCurveObject.createComponent(BezierCurve_1.BezierCurve.getTypeName());
            // Set the start and end points
            this.bezierCurve.startPoint = this.startPoint;
            this.bezierCurve.endPoint = this.endPoint;
            // Set optional properties
            if (this.lineMaterial) {
                this.bezierCurve.lineMaterial = this.lineMaterial;
            }
            this.bezierCurve.curveHeight = this.curveHeight;
            this.bezierCurve.interpolationPoints = this.interpolationPoints;
            this.bezierCurve.color = this.lineColor;
            // Initialize the curve (will create the visual)
            this.bezierCurve.initialize();
            this.isInitialized = true;
            print("[ConnectionLine] BezierCurve initialized successfully");
        }
        /**
         * Update the start point (useful for dynamic connections)
         */
        setStartPoint(point) {
            this.startPoint = point;
            if (this.bezierCurve) {
                this.bezierCurve.startPoint = point;
            }
            else if (!this.isInitialized) {
                this.initializeBezierCurve();
            }
        }
        /**
         * Update the end point (useful for dynamic connections)
         */
        setEndPoint(point) {
            this.endPoint = point;
            if (this.bezierCurve) {
                this.bezierCurve.endPoint = point;
            }
            else if (!this.isInitialized) {
                this.initializeBezierCurve();
            }
        }
        /**
         * Update the material
         */
        setMaterial(material) {
            this.lineMaterial = material;
            if (this.bezierCurve) {
                this.bezierCurve.lineMaterial = material;
            }
        }
        /**
         * Get the underlying BezierCurve component
         */
        getBezierCurve() {
            return this.bezierCurve;
        }
        /**
         * Start dragging a connection from a position
         * Creates a temporary end point that follows the drag
         */
        startDragging(startPosition) {
            this.isDragging = true;
            // Create a temporary end point for dragging
            this.dragEndPoint = global.scene.createSceneObject("DragEndPoint");
            this.dragEndPoint.setParent(this.sceneObject);
            this.dragEndPoint.getTransform().setWorldPosition(startPosition);
            // Set as end point (start point should already be set)
            this.endPoint = this.dragEndPoint;
            // Initialize if not already done
            if (!this.isInitialized) {
                this.initializeBezierCurve();
            }
            print("[ConnectionLine] Started dragging from position: " + startPosition.toString());
        }
        /**
         * Update the drag position (called while dragging)
         */
        updateDragPosition(position) {
            if (this.isDragging && this.dragEndPoint) {
                this.dragEndPoint.getTransform().setWorldPosition(position);
            }
        }
        /**
         * Stop dragging and connect to a target node
         */
        stopDragging(targetNode) {
            if (!this.isDragging) {
                return;
            }
            this.isDragging = false;
            this.targetNode = targetNode;
            // Replace drag end point with the actual target node
            if (this.dragEndPoint) {
                this.dragEndPoint.destroy();
                this.dragEndPoint = null;
            }
            // Set the target node as the end point
            this.endPoint = targetNode;
            // Update the bezier curve
            if (this.bezierCurve) {
                this.bezierCurve.endPoint = targetNode;
            }
            print("[ConnectionLine] Stopped dragging, connected to target node: " + targetNode.name);
        }
        /**
         * Get the source node
         */
        getSourceNode() {
            return this.sourceNode;
        }
        /**
         * Get the target node
         */
        getTargetNode() {
            return this.targetNode;
        }
        onDestroy() {
            if (this.dragEndPoint) {
                this.dragEndPoint.destroy();
            }
            if (this.bezierCurveObject) {
                this.bezierCurveObject.destroy();
            }
        }
    };
    __setFunctionName(_classThis, "ConnectionLine");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConnectionLine = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConnectionLine = _classThis;
})();
exports.ConnectionLine = ConnectionLine;
//# sourceMappingURL=ConnectionLine.js.map