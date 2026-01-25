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
exports.NodeManager = void 0;
var __selfType = requireType("./NodeManager");
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
const BaseNode_1 = require("./BaseNode");
const ConnectionLine_1 = require("./ConnectionLine");
/**
 * Central manager for all nodes, connections, and persistence.
 * Handles node registration, connection creation, and provides shared resources like materials.
 */
let NodeManager = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var NodeManager = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.connectionMaterial = this.connectionMaterial;
            this.defaultCurveHeight = this.defaultCurveHeight;
            this.nodesParent = this.nodesParent;
            this.connectionsParent = this.connectionsParent;
            this.nodes = new Map(); // Track nodes by ID
            this.connections = new Map(); // Track connections by ID
            this.nodeComponents = new Map(); // Track BaseNode components
        }
        __initialize() {
            super.__initialize();
            this.connectionMaterial = this.connectionMaterial;
            this.defaultCurveHeight = this.defaultCurveHeight;
            this.nodesParent = this.nodesParent;
            this.connectionsParent = this.connectionsParent;
            this.nodes = new Map(); // Track nodes by ID
            this.connections = new Map(); // Track connections by ID
            this.nodeComponents = new Map(); // Track BaseNode components
        }
        onAwake() {
            if (!NodeManager.instance) {
                NodeManager.instance = this;
                print("NodeManager: Initialized");
            }
            else {
                print("NodeManager: WARNING - Multiple instances detected! Only one should exist.");
            }
            // Auto-register existing nodes in the scene
            this.autoRegisterNodes();
        }
        onStart() {
            // Check if material is set
            if (!this.connectionMaterial) {
                print("NodeManager: WARNING - No connection material set! Connections will not be visible.");
            }
            else {
                print(`NodeManager: Connection material ready`);
            }
        }
        /**
         * Gets the singleton instance
         */
        static getInstance() {
            return NodeManager.instance;
        }
        /**
         * Auto-registers all nodes with BaseNode components in the scene
         */
        autoRegisterNodes() {
            const rootObjects = global.scene.getRootObjectsCount();
            let registeredCount = 0;
            for (let i = 0; i < rootObjects; i++) {
                const rootObject = global.scene.getRootObject(i);
                const baseNode = rootObject.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (baseNode) {
                    this.registerNode(rootObject, baseNode);
                    registeredCount++;
                }
            }
            print(`NodeManager: Auto-registered ${registeredCount} nodes`);
        }
        /**
         * Registers a node with the manager
         */
        registerNode(nodeObject, baseNode) {
            const nodeId = baseNode.getNodeId();
            if (this.nodes.has(nodeId)) {
                print(`NodeManager: Node ${nodeId} already registered`);
                return;
            }
            this.nodes.set(nodeId, nodeObject);
            this.nodeComponents.set(nodeId, baseNode);
            // Set parent if specified
            if (this.nodesParent) {
                nodeObject.setParent(this.nodesParent);
            }
            print(`NodeManager: Registered node ${nodeId} (${baseNode.getNodeType()})`);
        }
        /**
         * Unregisters a node
         */
        unregisterNode(nodeId) {
            if (this.nodes.has(nodeId)) {
                this.nodes.delete(nodeId);
                this.nodeComponents.delete(nodeId);
                print(`NodeManager: Unregistered node ${nodeId}`);
            }
        }
        /**
         * Creates a connection between two nodes
         */
        createConnection(sourceNodeId, targetNodeId) {
            const sourceNode = this.nodes.get(sourceNodeId);
            const targetNode = this.nodes.get(targetNodeId);
            if (!sourceNode || !targetNode) {
                print(`NodeManager: Cannot create connection - nodes not found. Source: ${sourceNodeId}, Target: ${targetNodeId}`);
                return null;
            }
            if (sourceNode === targetNode) {
                print(`NodeManager: Cannot connect node to itself`);
                return null;
            }
            // Check if connection already exists
            const connectionId = `${sourceNodeId}->${targetNodeId}`;
            if (this.connections.has(connectionId)) {
                print(`NodeManager: Connection ${connectionId} already exists`);
                return this.connections.get(connectionId) || null;
            }
            // Create connection object
            const connectionObject = global.scene.createSceneObject(`Connection_${connectionId}`);
            if (this.connectionsParent) {
                connectionObject.setParent(this.connectionsParent);
            }
            const connection = connectionObject.createComponent(ConnectionLine_1.ConnectionLine.getTypeName());
            if (!connection) {
                print(`NodeManager: ERROR - Failed to create ConnectionLine component`);
                connectionObject.destroy();
                return null;
            }
            // Configure connection
            connection.sourceNode = sourceNode;
            connection.targetNode = targetNode;
            connection.lineMaterial = this.connectionMaterial;
            connection.curveHeight = this.defaultCurveHeight;
            // Store connection
            this.connections.set(connectionId, connection);
            print(`NodeManager: Created connection ${connectionId}`);
            print(`NodeManager: Connection details - source: ${sourceNode.name}, target: ${targetNode.name}, material: ${this.connectionMaterial ? 'SET' : 'MISSING'}`);
            return connection;
        }
        /**
         * Removes a connection
         */
        removeConnection(sourceNodeId, targetNodeId) {
            const connectionId = `${sourceNodeId}->${targetNodeId}`;
            const connection = this.connections.get(connectionId);
            if (connection) {
                this.connections.delete(connectionId);
                connection.sceneObject.destroy();
                print(`NodeManager: Removed connection ${connectionId}`);
            }
            else {
                print(`NodeManager: Connection ${connectionId} not found`);
            }
        }
        /**
         * Gets a node by ID
         */
        getNode(nodeId) {
            return this.nodes.get(nodeId) || null;
        }
        /**
         * Gets a BaseNode component by ID
         */
        getBaseNode(nodeId) {
            return this.nodeComponents.get(nodeId) || null;
        }
        /**
         * Gets all registered nodes
         */
        getAllNodes() {
            return Array.from(this.nodes.values());
        }
        /**
         * Gets all connections
         */
        getAllConnections() {
            return Array.from(this.connections.values());
        }
        /**
         * Gets connections for a specific node (both incoming and outgoing)
         */
        getNodeConnections(nodeId) {
            const incoming = [];
            const outgoing = [];
            this.connections.forEach((connection, connectionId) => {
                const sourceNode = connection.getSourceNode();
                const targetNode = connection.getTargetNode();
                if (sourceNode) {
                    const sourceBaseNode = sourceNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                    if (sourceBaseNode && sourceBaseNode.getNodeId() === nodeId) {
                        outgoing.push(connection);
                    }
                }
                if (targetNode) {
                    const targetBaseNode = targetNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                    if (targetBaseNode && targetBaseNode.getNodeId() === nodeId) {
                        incoming.push(connection);
                    }
                }
            });
            return { incoming, outgoing };
        }
        /**
         * Deletes a node and all its connections
         */
        deleteNode(nodeId) {
            // Remove all connections involving this node
            const nodeConnections = this.getNodeConnections(nodeId);
            nodeConnections.incoming.forEach(conn => {
                const sourceNode = conn.getSourceNode();
                if (sourceNode) {
                    const sourceBaseNode = sourceNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                    if (sourceBaseNode) {
                        this.removeConnection(sourceBaseNode.getNodeId(), nodeId);
                    }
                }
            });
            nodeConnections.outgoing.forEach(conn => {
                const targetNode = conn.getTargetNode();
                if (targetNode) {
                    const targetBaseNode = targetNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                    if (targetBaseNode) {
                        this.removeConnection(nodeId, targetBaseNode.getNodeId());
                    }
                }
            });
            // Remove node
            const node = this.nodes.get(nodeId);
            if (node) {
                this.unregisterNode(nodeId);
                node.destroy();
                print(`NodeManager: Deleted node ${nodeId}`);
            }
        }
        onDestroy() {
            if (NodeManager.instance === this) {
                NodeManager.instance = null;
            }
        }
    };
    __setFunctionName(_classThis, "NodeManager");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NodeManager = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.instance = null;
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NodeManager = _classThis;
})();
exports.NodeManager = NodeManager;
//# sourceMappingURL=NodeManager.js.map