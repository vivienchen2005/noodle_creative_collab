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
const NodeConnection_1 = require("./NodeConnection");
const ConnectionPoint_1 = require("./ConnectionPoint");
const NodeTypeRegistry_1 = require("./NodeTypeRegistry");
/**
 * Central manager for all nodes, connections, and persistence.
 * Singleton that tracks all nodes in the scene and manages their connections.
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
            this.nodeMenu = this.nodeMenu;
            this.connectionMaterial = this.connectionMaterial;
            this.nodesParent = this.nodesParent;
            this.nodes = new Map();
            this.connections = new Map();
            this.nodeTypeRegistry = (0, NodeTypeRegistry_1.getNodeTypeRegistry)();
            this.currentDraggingConnection = null;
        }
        __initialize() {
            super.__initialize();
            this.nodeMenu = this.nodeMenu;
            this.connectionMaterial = this.connectionMaterial;
            this.nodesParent = this.nodesParent;
            this.nodes = new Map();
            this.connections = new Map();
            this.nodeTypeRegistry = (0, NodeTypeRegistry_1.getNodeTypeRegistry)();
            this.currentDraggingConnection = null;
        }
        onAwake() {
            // Set as singleton instance
            if (!NodeManager.instance) {
                NodeManager.instance = this;
            }
            print("NodeManager: Initialized");
        }
        onStart() {
            // Set up node menu callbacks after all components are initialized
            if (this.nodeMenu && this.nodeMenu.onNodeTypeSelected) {
                this.nodeMenu.onNodeTypeSelected.add((nodeType) => {
                    this.onNodeTypeSelectedFromMenu(nodeType);
                });
                print("NodeManager: NodeMenu callbacks registered");
            }
            else {
                print("NodeManager: Warning - nodeMenu not assigned. Node creation menu will not appear.");
            }
            if (!this.connectionMaterial) {
                print("NodeManager: Warning - connectionMaterial not assigned. Connections may not render.");
            }
        }
        /**
         * Gets the singleton instance
         */
        static getInstance() {
            return NodeManager.instance;
        }
        /**
         * Creates a new node of the specified type at the given position
         */
        createNode(nodeType, position) {
            const nodeObject = this.nodeTypeRegistry.createNode(nodeType, position);
            if (nodeObject) {
                // Get BaseNode component
                const baseNode = nodeObject.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (baseNode) {
                    const nodeId = baseNode.getNodeId();
                    this.nodes.set(nodeId, nodeObject);
                    // Parent to nodes parent if specified
                    if (this.nodesParent) {
                        nodeObject.setParent(this.nodesParent);
                    }
                    print(`NodeManager: Created node "${nodeType}" with ID "${nodeId}"`);
                    return nodeObject;
                }
            }
            return null;
        }
        /**
         * Removes a node and all its connections
         */
        removeNode(nodeId) {
            const node = this.nodes.get(nodeId);
            if (!node) {
                print(`NodeManager: Node with ID "${nodeId}" not found`);
                return;
            }
            // Remove all connections involving this node
            const connectionsToRemove = [];
            this.connections.forEach((connectionObj, connectionId) => {
                const connection = connectionObj.getComponent(NodeConnection_1.NodeConnection.getTypeName());
                if (connection) {
                    const sourcePoint = connection.getSourcePoint();
                    const targetPoint = connection.getTargetPoint();
                    // Check if this connection involves the node being removed
                    const sourceNode = sourcePoint.getComponent(ConnectionPoint_1.ConnectionPoint.getTypeName())?.parentNode;
                    const targetNode = targetPoint?.getComponent(ConnectionPoint_1.ConnectionPoint.getTypeName())?.parentNode;
                    if (sourceNode === node || targetNode === node) {
                        connectionsToRemove.push(connectionId);
                    }
                }
            });
            // Remove connections
            connectionsToRemove.forEach(connectionId => {
                this.removeConnection(connectionId);
            });
            // Remove node
            this.nodes.delete(nodeId);
            node.destroy();
            print(`NodeManager: Removed node "${nodeId}"`);
        }
        /**
         * Creates a connection between two connection points
         */
        createConnection(sourcePoint, targetPoint = null) {
            // Check if source point can accept connection
            const sourcePointComp = sourcePoint.getComponent(ConnectionPoint_1.ConnectionPoint.getTypeName());
            if (!sourcePointComp) {
                print("NodeManager: Source point does not have ConnectionPoint component");
                return null;
            }
            if (!sourcePointComp.canAcceptConnection()) {
                print("NodeManager: Source point cannot accept more connections");
                return null;
            }
            // Create connection SceneObject as child of source point
            const connectionObject = global.scene.createSceneObject("Connection");
            connectionObject.setParent(sourcePoint);
            const connection = connectionObject.createComponent(NodeConnection_1.NodeConnection.getTypeName());
            if (!connection) {
                connectionObject.destroy();
                return null;
            }
            // Set up connection
            connection.setSourcePoint(sourcePoint);
            if (targetPoint) {
                connection.setTargetPoint(targetPoint);
                // Add to target point's connections
                const targetPointComp = targetPoint.getComponent(ConnectionPoint_1.ConnectionPoint.getTypeName());
                if (targetPointComp) {
                    targetPointComp.addConnection(connectionObject);
                }
            }
            // Add to source point's connections
            sourcePointComp.addConnection(connectionObject);
            // Set material if provided
            if (this.connectionMaterial && connection.bezierCurve) {
                connection.bezierCurve.lineMaterial = this.connectionMaterial;
            }
            // Store connection
            const connectionId = connection.getConnectionId();
            this.connections.set(connectionId, connectionObject);
            print(`NodeManager: Created connection "${connectionId}"`);
            return connectionObject;
        }
        /**
         * Starts dragging a connection from a connection point
         */
        startDraggingConnection(sourcePoint) {
            // Create temporary connection
            const connectionObject = this.createConnection(sourcePoint, null);
            if (connectionObject) {
                const connection = connectionObject.getComponent(NodeConnection_1.NodeConnection.getTypeName());
                if (connection) {
                    connection.startDragging();
                    this.currentDraggingConnection = connectionObject;
                    print("NodeManager: Started dragging connection");
                }
            }
            return connectionObject;
        }
        /**
         * Stops dragging the current connection
         */
        stopDraggingConnection(releasePosition) {
            if (!this.currentDraggingConnection) {
                return;
            }
            const connection = this.currentDraggingConnection.getComponent(NodeConnection_1.NodeConnection.getTypeName());
            if (connection) {
                connection.stopDragging();
            }
            // Show node menu at release position
            if (this.nodeMenu) {
                this.nodeMenu.showMenu(releasePosition);
            }
            this.currentDraggingConnection = null;
            print(`NodeManager: Stopped dragging connection at ${releasePosition}`);
        }
        /**
         * Called when a node type is selected from the menu
         */
        onNodeTypeSelectedFromMenu(nodeType) {
            if (!this.currentDraggingConnection) {
                return;
            }
            const connection = this.currentDraggingConnection.getComponent(NodeConnection_1.NodeConnection.getTypeName());
            if (!connection) {
                return;
            }
            // Get release position from menu
            const menuPosition = this.nodeMenu.getMenuPosition();
            // Create new node at that position
            const newNode = this.createNode(nodeType, menuPosition);
            if (newNode) {
                const baseNode = newNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (baseNode) {
                    const inPoint = baseNode.getInConnectionPoint();
                    if (inPoint) {
                        // Connect the dragging connection to the new node's in point
                        connection.setTargetPoint(inPoint);
                        // Add to in point's connections
                        const inPointComp = inPoint.getComponent(ConnectionPoint_1.ConnectionPoint.getTypeName());
                        if (inPointComp) {
                            inPointComp.addConnection(this.currentDraggingConnection);
                        }
                    }
                }
            }
            this.currentDraggingConnection = null;
            print(`NodeManager: Connected to new "${nodeType}" node`);
        }
        /**
         * Removes a connection
         */
        removeConnection(connectionId) {
            const connectionObject = this.connections.get(connectionId);
            if (!connectionObject) {
                return;
            }
            const connection = connectionObject.getComponent(NodeConnection_1.NodeConnection.getTypeName());
            if (connection) {
                connection.destroyConnection();
            }
            this.connections.delete(connectionId);
            print(`NodeManager: Removed connection "${connectionId}"`);
        }
        /**
         * Gets a node by ID
         */
        getNode(nodeId) {
            return this.nodes.get(nodeId) || null;
        }
        /**
         * Gets all nodes
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
         * Serializes all nodes and connections for saving
         */
        serialize() {
            const nodesData = [];
            const connectionsData = [];
            // Serialize nodes
            this.nodes.forEach((node, nodeId) => {
                const baseNode = node.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (baseNode) {
                    nodesData.push(baseNode.serialize());
                }
            });
            // Serialize connections
            this.connections.forEach((connectionObj, connectionId) => {
                const connection = connectionObj.getComponent(NodeConnection_1.NodeConnection.getTypeName());
                if (connection) {
                    connectionsData.push(connection.serialize());
                }
            });
            return {
                nodes: nodesData,
                connections: connectionsData
            };
        }
        /**
         * Deserializes and recreates nodes and connections
         */
        deserialize(data) {
            // Clear existing nodes and connections
            this.nodes.forEach((node, nodeId) => {
                this.removeNode(nodeId);
            });
            // Recreate nodes
            if (data.nodes) {
                data.nodes.forEach((nodeData) => {
                    const position = new vec3(nodeData.position.x, nodeData.position.y, nodeData.position.z);
                    const node = this.createNode(nodeData.nodeType, position);
                    if (node) {
                        const baseNode = node.getComponent(BaseNode_1.BaseNode.getTypeName());
                        if (baseNode) {
                            baseNode.deserialize(nodeData);
                        }
                    }
                });
            }
            // Recreate connections
            if (data.connections) {
                data.connections.forEach((connectionData) => {
                    const sourceNode = this.getNode(connectionData.sourceNodeId);
                    const targetNode = this.getNode(connectionData.targetNodeId);
                    if (sourceNode && targetNode) {
                        const sourceBaseNode = sourceNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                        const targetBaseNode = targetNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                        if (sourceBaseNode && targetBaseNode) {
                            const sourcePoint = connectionData.sourcePointType === "out"
                                ? sourceBaseNode.getOutConnectionPoint()
                                : sourceBaseNode.getInConnectionPoint();
                            const targetPoint = connectionData.targetPointType === "in"
                                ? targetBaseNode.getInConnectionPoint()
                                : targetBaseNode.getOutConnectionPoint();
                            if (sourcePoint && targetPoint) {
                                this.createConnection(sourcePoint, targetPoint);
                            }
                        }
                    }
                });
            }
            print("NodeManager: Deserialized and recreated nodes and connections");
        }
        /**
         * Saves the current state (to be implemented with storage solution)
         */
        save() {
            const data = this.serialize();
            // TODO: Save to LocalStorage or Supabase
            print("NodeManager: Save functionality to be implemented");
        }
        /**
         * Loads a saved state (to be implemented with storage solution)
         */
        load() {
            // TODO: Load from LocalStorage or Supabase
            print("NodeManager: Load functionality to be implemented");
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