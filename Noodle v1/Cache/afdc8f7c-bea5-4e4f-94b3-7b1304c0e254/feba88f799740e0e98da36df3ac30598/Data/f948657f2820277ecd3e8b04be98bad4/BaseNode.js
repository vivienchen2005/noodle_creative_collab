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
exports.BaseNode = void 0;
var __selfType = requireType("./BaseNode");
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
/**
 * Base class for all node types in the visual programming system.
 * Each node is built on a Frame component and has "in" and "out" connection points.
 */
let BaseNode = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var BaseNode = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.frameComponent = this.frameComponent;
            this.nodeType = this.nodeType;
            this.nodeId = this.nodeId;
            this.inConnectionPoint = this.inConnectionPoint;
            this.outConnectionPoint = this.outConnectionPoint;
            this.hasInPoint = this.hasInPoint;
            this.hasOutPoint = this.hasOutPoint;
            this._initialized = false;
        }
        __initialize() {
            super.__initialize();
            this.frameComponent = this.frameComponent;
            this.nodeType = this.nodeType;
            this.nodeId = this.nodeId;
            this.inConnectionPoint = this.inConnectionPoint;
            this.outConnectionPoint = this.outConnectionPoint;
            this.hasInPoint = this.hasInPoint;
            this.hasOutPoint = this.hasOutPoint;
            this._initialized = false;
        }
        onAwake() {
            // Generate unique ID if not set
            if (!this.nodeId || this.nodeId === "") {
                this.nodeId = this.generateNodeId();
            }
            // Initialize connection points if they don't exist
            if (!this._initialized) {
                this.initializeConnectionPoints();
                this._initialized = true;
            }
        }
        /**
         * Initializes the connection point SceneObjects if they don't exist
         */
        initializeConnectionPoints() {
            if (this.hasInPoint && !this.inConnectionPoint) {
                this.inConnectionPoint = global.scene.createSceneObject("InPoint");
                this.inConnectionPoint.setParent(this.sceneObject);
                this.inConnectionPoint.getTransform().setLocalPosition(new vec3(-0.5, 0, 0));
            }
            if (this.hasOutPoint && !this.outConnectionPoint) {
                this.outConnectionPoint = global.scene.createSceneObject("OutPoint");
                this.outConnectionPoint.setParent(this.sceneObject);
                this.outConnectionPoint.getTransform().setLocalPosition(new vec3(0.5, 0, 0));
            }
        }
        /**
         * Generates a unique node ID
         */
        generateNodeId() {
            return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        /**
         * Gets the node's unique ID
         */
        getNodeId() {
            return this.nodeId;
        }
        /**
         * Gets the node type
         */
        getNodeType() {
            return this.nodeType;
        }
        /**
         * Gets the 'in' connection point
         */
        getInConnectionPoint() {
            return this.hasInPoint ? this.inConnectionPoint : null;
        }
        /**
         * Gets the 'out' connection point
         */
        getOutConnectionPoint() {
            return this.hasOutPoint ? this.outConnectionPoint : null;
        }
        /**
         * Called when a connection is added to this node
         */
        onConnectionAdded(isIncoming) {
            // Override in subclasses if needed
        }
        /**
         * Called when a connection is removed from this node
         */
        onConnectionRemoved(isIncoming) {
            // Override in subclasses if needed
        }
        /**
         * Serializes this node's data for saving
         */
        serialize() {
            const transform = this.sceneObject.getTransform();
            const position = transform.getWorldPosition();
            const rotation = transform.getWorldRotation();
            return {
                nodeId: this.nodeId,
                nodeType: this.nodeType,
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z
                },
                rotation: {
                    x: rotation.x,
                    y: rotation.y,
                    z: rotation.z,
                    w: rotation.w
                },
                hasInPoint: this.hasInPoint,
                hasOutPoint: this.hasOutPoint
            };
        }
        /**
         * Deserializes node data and applies it
         */
        deserialize(data) {
            if (data.nodeId) {
                this.nodeId = data.nodeId;
            }
            if (data.nodeType) {
                this.nodeType = data.nodeType;
            }
            if (data.position) {
                const transform = this.sceneObject.getTransform();
                transform.setWorldPosition(new vec3(data.position.x, data.position.y, data.position.z));
            }
            if (data.rotation) {
                const transform = this.sceneObject.getTransform();
                transform.setWorldRotation(new quat(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w));
            }
        }
    };
    __setFunctionName(_classThis, "BaseNode");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BaseNode = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BaseNode = _classThis;
})();
exports.BaseNode = BaseNode;
//# sourceMappingURL=BaseNode.js.map