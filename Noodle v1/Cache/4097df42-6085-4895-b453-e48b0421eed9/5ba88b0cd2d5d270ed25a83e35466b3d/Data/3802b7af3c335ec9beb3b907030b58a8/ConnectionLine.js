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
const BezierCurve_1 = require("../../RuntimeGizmos.lspkg/Scripts/BezierCurve");
const BaseNode_1 = require("./BaseNode");
/**
 * Connection line component that draws a bezier curve between two nodes.
 * The line connects from one node's "out" point to another node's "in" point.
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
            this.sourceNode = this.sourceNode;
            this.targetNode = this.targetNode;
            this.lineMaterial = this.lineMaterial;
            this.curveHeight = this.curveHeight;
            this.bezierCurve = null;
            this.startPointObject = null;
            this.endPointObject = null;
            this.curveObject = null;
            this.isDragging = false;
        }
        __initialize() {
            super.__initialize();
            this.sourceNode = this.sourceNode;
            this.targetNode = this.targetNode;
            this.lineMaterial = this.lineMaterial;
            this.curveHeight = this.curveHeight;
            this.bezierCurve = null;
            this.startPointObject = null;
            this.endPointObject = null;
            this.curveObject = null;
            this.isDragging = false;
        }
        onAwake() {
            // Create SceneObjects for start and end points FIRST
            this.startPointObject = global.scene.createSceneObject("ConnectionStartPoint");
            this.endPointObject = global.scene.createSceneObject("ConnectionEndPoint");
            // Set initial positions to avoid errors
            this.startPointObject.getTransform().setWorldPosition(new vec3(0, 0, 0));
            this.endPointObject.getTransform().setWorldPosition(new vec3(0, 0, 0));
            // Create the curve object (but don't create the component yet)
            this.curveObject = global.scene.createSceneObject("BezierCurve");
            this.curveObject.setParent(this.sceneObject);
            // Store reference for later component creation
            // We'll create the BezierCurve component in onStart after everything is initialized
        }
        onStart() {
            // Create BezierCurve component - inputs are now optional, so this should work
            if (!this.bezierCurve && this.startPointObject && this.endPointObject && this.curveObject) {
                // Create BezierCurve component (inputs can be set after creation now)
                this.bezierCurve = this.curveObject.createComponent(BezierCurve_1.BezierCurve.getTypeName());
                if (this.bezierCurve) {
                    // Set required inputs
                    this.bezierCurve.startPoint = this.startPointObject;
                    this.bezierCurve.endPoint = this.endPointObject;
                    // Set material - REQUIRED for BezierCurve to work
                    if (this.lineMaterial) {
                        this.bezierCurve.lineMaterial = this.lineMaterial;
                        print(`ConnectionLine: Material set on BezierCurve`);
                    }
                    else {
                        print(`ConnectionLine: WARNING - No material provided! Connection will not be visible.`);
                    }
                    // Configure curve
                    this.bezierCurve.curveHeight = this.curveHeight;
                    this.bezierCurve.isEnabled = true;
                    print(`ConnectionLine: BezierCurve created and configured. Enabled: ${this.bezierCurve.isEnabled}`);
                }
                else {
                    print(`ConnectionLine: ERROR - Failed to create BezierCurve component`);
                }
            }
            else {
                print(`ConnectionLine: Cannot create BezierCurve - missing dependencies. startPoint: ${!!this.startPointObject}, endPoint: ${!!this.endPointObject}, curveObject: ${!!this.curveObject}`);
            }
            // Initial update of connection points
            if (this.sourceNode || this.targetNode) {
                this.updateConnectionPoints();
            }
            // Update connection points every frame
            this.createEvent("UpdateEvent").bind(() => {
                if (this.bezierCurve && (this.sourceNode || this.targetNode)) {
                    this.updateConnectionPoints();
                }
            });
        }
        /**
         * Updates the connection point positions based on source and target nodes
         */
        updateConnectionPoints() {
            if (!this.startPointObject || !this.endPointObject || !this.bezierCurve) {
                return;
            }
            // Get source node's "out" position
            if (this.sourceNode) {
                const sourceBaseNode = this.sourceNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (sourceBaseNode) {
                    const outPos = sourceBaseNode.getOutConnectionPosition();
                    this.startPointObject.getTransform().setWorldPosition(outPos);
                }
                else {
                    print(`ConnectionLine: WARNING - Source node ${this.sourceNode.name} does not have BaseNode component`);
                }
            }
            else {
                print(`ConnectionLine: WARNING - No source node set`);
            }
            // Get target node's "in" position (or use current end point if dragging)
            if (this.targetNode && !this.isDragging) {
                const targetBaseNode = this.targetNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (targetBaseNode) {
                    const inPos = targetBaseNode.getInConnectionPosition();
                    this.endPointObject.getTransform().setWorldPosition(inPos);
                }
            }
            else if (!this.isDragging) {
                // If no target node and not dragging, keep end point at start position (or hide?)
                // For now, just keep it at the start position
            }
            // If dragging, endPointObject position is updated externally
        }
        /**
         * Starts dragging the connection (when user grabs the "out" point)
         */
        startDragging(dragPosition) {
            this.isDragging = true;
            if (this.endPointObject) {
                this.endPointObject.getTransform().setWorldPosition(dragPosition);
            }
            print("ConnectionLine: Started dragging");
        }
        /**
         * Updates the drag position (while user is dragging)
         */
        updateDragPosition(position) {
            if (this.isDragging && this.endPointObject) {
                this.endPointObject.getTransform().setWorldPosition(position);
            }
        }
        /**
         * Stops dragging and connects to target node
         */
        stopDragging(targetNode) {
            this.isDragging = false;
            this.targetNode = targetNode;
            if (targetNode) {
                // Connect to target node
                const targetBaseNode = targetNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (targetBaseNode) {
                    const inPos = targetBaseNode.getInConnectionPosition();
                    if (this.endPointObject) {
                        this.endPointObject.getTransform().setWorldPosition(inPos);
                    }
                    print(`ConnectionLine: Connected to target node`);
                }
            }
            print("ConnectionLine: Stopped dragging");
        }
        /**
         * Gets the source node
         */
        getSourceNode() {
            return this.sourceNode;
        }
        /**
         * Gets the target node
         */
        getTargetNode() {
            return this.targetNode;
        }
        /**
         * Checks if currently dragging
         */
        getIsDragging() {
            return this.isDragging;
        }
        onDestroy() {
            // Clean up
            if (this.startPointObject) {
                this.startPointObject.destroy();
            }
            if (this.endPointObject) {
                this.endPointObject.destroy();
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