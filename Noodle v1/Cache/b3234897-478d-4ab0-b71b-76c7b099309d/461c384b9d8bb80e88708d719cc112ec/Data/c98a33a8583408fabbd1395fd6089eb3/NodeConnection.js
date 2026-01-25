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
exports.NodeConnection = void 0;
var __selfType = requireType("./NodeConnection");
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
const InteractiveBezierCurve_1 = require("./InteractiveBezierCurve");
const ConnectionPoint_1 = require("./ConnectionPoint");
const BaseNode_1 = require("./BaseNode");
/**
 * Manages a connection between two nodes.
 * Contains an InteractiveBezierCurve component and tracks source/target connection points.
 */
let NodeConnection = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var NodeConnection = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.sourcePoint = this.sourcePoint;
            this.targetPoint = this.targetPoint;
            this.bezierCurve = this.bezierCurve;
            this.lineMaterial = this.lineMaterial;
            this.connectionId = "";
            this.isTemporary = false;
        }
        __initialize() {
            super.__initialize();
            this.sourcePoint = this.sourcePoint;
            this.targetPoint = this.targetPoint;
            this.bezierCurve = this.bezierCurve;
            this.lineMaterial = this.lineMaterial;
            this.connectionId = "";
            this.isTemporary = false;
        }
        onAwake() {
            // Generate unique connection ID
            this.connectionId = this.generateConnectionId();
            // Initialize bezier curve if not provided
            if (!this.bezierCurve) {
                this.initializeBezierCurve();
            }
            // Set up event listeners
            if (this.bezierCurve) {
                this.bezierCurve.onReleaseAtPosition.add((position) => {
                    this.onCurveReleased(position);
                });
            }
        }
        /**
         * Initializes the bezier curve component
         */
        initializeBezierCurve() {
            // Create a child SceneObject for the curve
            const curveObject = global.scene.createSceneObject("BezierCurve");
            curveObject.setParent(this.sceneObject);
            // Add InteractiveBezierCurve component
            this.bezierCurve = curveObject.createComponent(InteractiveBezierCurve_1.InteractiveBezierCurve.getTypeName());
            // Set up the curve
            if (this.sourcePoint) {
                this.bezierCurve.startPoint = this.sourcePoint;
            }
            // If target point exists, use it; otherwise use temporary point
            if (this.targetPoint) {
                this.bezierCurve.endPoint = this.targetPoint;
            }
            else {
                // Will be set when dragging starts
                this.isTemporary = true;
            }
            // Set material if provided
            if (this.lineMaterial) {
                this.bezierCurve.lineMaterial = this.lineMaterial;
            }
        }
        /**
         * Generates a unique connection ID
         */
        generateConnectionId() {
            return `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        /**
         * Gets the connection ID
         */
        getConnectionId() {
            return this.connectionId;
        }
        /**
         * Sets the source connection point
         */
        setSourcePoint(point) {
            this.sourcePoint = point;
            if (this.bezierCurve) {
                this.bezierCurve.startPoint = point;
            }
        }
        /**
         * Sets the target connection point
         */
        setTargetPoint(point) {
            this.targetPoint = point;
            if (this.bezierCurve && point) {
                this.bezierCurve.endPoint = point;
                this.isTemporary = false;
            }
        }
        /**
         * Gets the source connection point
         */
        getSourcePoint() {
            return this.sourcePoint;
        }
        /**
         * Gets the target connection point
         */
        getTargetPoint() {
            return this.targetPoint;
        }
        /**
         * Checks if this is a temporary connection (not yet connected to target)
         */
        isTemporaryConnection() {
            return this.isTemporary || this.targetPoint === null;
        }
        /**
         * Called when the curve is released at a position
         */
        onCurveReleased(position) {
            print(`NodeConnection: Curve released at position ${position}`);
            // This will trigger the NodeManager to show the node creation menu
            // The NodeManager will handle creating a new node and connecting it
        }
        /**
         * Starts dragging this connection
         */
        startDragging() {
            if (this.bezierCurve) {
                this.bezierCurve.startDragging();
            }
        }
        /**
         * Stops dragging this connection
         */
        stopDragging() {
            if (this.bezierCurve) {
                this.bezierCurve.stopDragging();
            }
        }
        /**
         * Serializes this connection for saving
         */
        serialize() {
            // Get connection point components to find parent nodes
            const sourcePointComp = this.sourcePoint.getComponent(ConnectionPoint_1.ConnectionPoint.getTypeName());
            const targetPointComp = this.targetPoint?.getComponent(ConnectionPoint_1.ConnectionPoint.getTypeName());
            const sourceBaseNode = sourcePointComp?.parentNode?.getComponent(BaseNode_1.BaseNode.getTypeName());
            const targetBaseNode = targetPointComp?.parentNode?.getComponent(BaseNode_1.BaseNode.getTypeName());
            return {
                connectionId: this.connectionId,
                sourceNodeId: sourceBaseNode?.getNodeId() || "",
                sourcePointType: sourcePointComp?.getPointType() || "out",
                targetNodeId: targetBaseNode?.getNodeId() || "",
                targetPointType: targetPointComp?.getPointType() || "in"
            };
        }
        /**
         * Destroys this connection
         */
        destroyConnection() {
            // Remove from connection points
            const sourcePointComp = this.sourcePoint.getComponent(ConnectionPoint_1.ConnectionPoint.getTypeName());
            const targetPointComp = this.targetPoint?.getComponent(ConnectionPoint_1.ConnectionPoint.getTypeName());
            if (sourcePointComp) {
                sourcePointComp.removeConnection(this.sceneObject);
            }
            if (targetPointComp) {
                targetPointComp.removeConnection(this.sceneObject);
            }
            // Destroy the scene object
            this.sceneObject.destroy();
        }
        onDestroy() {
            this.destroyConnection();
        }
    };
    __setFunctionName(_classThis, "NodeConnection");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NodeConnection = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NodeConnection = _classThis;
})();
exports.NodeConnection = NodeConnection;
//# sourceMappingURL=NodeConnection.js.map