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
exports.ConnectionManager = void 0;
var __selfType = requireType("./ConnectionManager");
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
const ConnectionLine_1 = require("./ConnectionLine");
const InputNodePrompt_1 = require("./InputNodePrompt");
const InputNodeImage_1 = require("./InputNodeImage");
/**
 * ConnectionManager - Central manager for all node connections
 *
 * Responsibilities:
 * - Creates and destroys ConnectionLine instances
 * - Tracks all active connections
 * - Validates connection rules
 * - Provides query methods for finding connections
 * - Single source of truth for connection state
 *
 * Usage:
 *   const manager = ConnectionManager.getInstance();
 *   const connection = manager.createConnection(sourceNode, "image", targetNode, "image");
 *   manager.removeConnection(connection.id);
 */
let ConnectionManager = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var ConnectionManager = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.connectionMaterial = this.connectionMaterial;
            this.curveHeight = this.curveHeight;
            this.interpolationPoints = this.interpolationPoints;
            this.lineColor = this.lineColor;
            // All active connections
            this.connections = new Map();
            // Connection counter for unique IDs
            this.connectionCounter = 0;
        }
        __initialize() {
            super.__initialize();
            this.connectionMaterial = this.connectionMaterial;
            this.curveHeight = this.curveHeight;
            this.interpolationPoints = this.interpolationPoints;
            this.lineColor = this.lineColor;
            // All active connections
            this.connections = new Map();
            // Connection counter for unique IDs
            this.connectionCounter = 0;
        }
        onAwake() {
            if (!ConnectionManager.instance) {
                ConnectionManager.instance = this;
                print("[ConnectionManager] Initialized");
            }
            else {
                print("[ConnectionManager] WARNING - Multiple instances detected!");
            }
        }
        /**
         * Get the singleton instance
         */
        static getInstance() {
            return ConnectionManager.instance;
        }
        /**
         * Generate a unique connection ID
         */
        generateConnectionId(sourceType, targetType) {
            this.connectionCounter++;
            return `conn_${sourceType}_${targetType}_${Date.now()}_${this.connectionCounter}`;
        }
        /**
         * Create a connection between two nodes
         *
         * @param sourceNode - The source node (InputNodePrompt or InputNodeImage)
         * @param sourceType - Type of source ("text" or "image")
         * @param targetNode - The target process node
         * @param targetInputType - Which input on target ("text" or "image")
         * @param startPoint - SceneObject for curve start (usually output button)
         * @param endPoint - SceneObject for curve end (usually input section)
         * @returns ConnectionData or null if creation failed
         */
        createConnection(sourceNode, sourceType, targetNode, targetInputType, startPoint, endPoint) {
            // Validate connection rules
            if (!this.validateConnection(sourceType, targetInputType)) {
                print(`[ConnectionManager] Invalid connection: ${sourceType} -> ${targetInputType}`);
                return null;
            }
            // Generate unique ID
            const connectionId = this.generateConnectionId(sourceType, targetInputType);
            // Create connection object
            const connectionObject = global.scene.createSceneObject(`Connection_${connectionId}`);
            connectionObject.setParent(this.sceneObject);
            // Create ConnectionLine component
            const connectionLine = connectionObject.createComponent(ConnectionLine_1.ConnectionLine.getTypeName());
            if (!connectionLine) {
                print(`[ConnectionManager] ERROR - Failed to create ConnectionLine`);
                connectionObject.destroy();
                return null;
            }
            // Configure the connection line
            connectionLine.startPoint = startPoint;
            connectionLine.endPoint = endPoint;
            connectionLine.sourceNode = sourceNode;
            connectionLine.targetNode = targetNode;
            if (this.connectionMaterial) {
                connectionLine.lineMaterial = this.connectionMaterial;
            }
            connectionLine.curveHeight = this.curveHeight;
            connectionLine.interpolationPoints = this.interpolationPoints;
            connectionLine.lineColor = this.lineColor;
            // Store connection data
            const connectionData = {
                id: connectionId,
                connectionLine: connectionLine,
                sourceNode: sourceNode,
                sourceType: sourceType,
                targetNode: targetNode,
                targetInputType: targetInputType,
                createdAt: Date.now()
            };
            this.connections.set(connectionId, connectionData);
            print(`[ConnectionManager] Connection created: ${connectionId} (Total: ${this.connections.size})`);
            return connectionData;
        }
        /**
         * Validate if a connection is allowed
         */
        validateConnection(sourceType, targetInputType) {
            // Image sources can only connect to image inputs
            // Text sources can only connect to text inputs
            return sourceType === targetInputType;
        }
        /**
         * Remove a connection by ID
         */
        removeConnection(connectionId) {
            const connection = this.connections.get(connectionId);
            if (!connection) {
                print(`[ConnectionManager] Connection not found: ${connectionId}`);
                return false;
            }
            // Destroy the visual
            if (connection.connectionLine && connection.connectionLine.sceneObject) {
                connection.connectionLine.sceneObject.destroy();
            }
            // Remove from tracking
            this.connections.delete(connectionId);
            print(`[ConnectionManager] Connection removed: ${connectionId} (Remaining: ${this.connections.size})`);
            return true;
        }
        /**
         * Remove all connections from a specific source node
         */
        removeConnectionsFromSource(sourceNode) {
            let removedCount = 0;
            const toRemove = [];
            this.connections.forEach((data, id) => {
                if (data.sourceNode === sourceNode) {
                    toRemove.push(id);
                }
            });
            toRemove.forEach(id => {
                if (this.removeConnection(id)) {
                    removedCount++;
                }
            });
            return removedCount;
        }
        /**
         * Remove all connections to a specific target node
         */
        removeConnectionsToTarget(targetNode) {
            let removedCount = 0;
            const toRemove = [];
            this.connections.forEach((data, id) => {
                if (data.targetNode === targetNode) {
                    toRemove.push(id);
                }
            });
            toRemove.forEach(id => {
                if (this.removeConnection(id)) {
                    removedCount++;
                }
            });
            return removedCount;
        }
        /**
         * Get all connections from a source node
         */
        getConnectionsFromSource(sourceNode) {
            const result = [];
            this.connections.forEach((data) => {
                if (data.sourceNode === sourceNode) {
                    result.push(data);
                }
            });
            return result;
        }
        /**
         * Get all connections to a target node
         */
        getConnectionsToTarget(targetNode) {
            const result = [];
            this.connections.forEach((data) => {
                if (data.targetNode === targetNode) {
                    result.push(data);
                }
            });
            return result;
        }
        /**
         * Get connections to a specific input type on a target node
         */
        getConnectionsToTargetInput(targetNode, inputType) {
            const result = [];
            this.connections.forEach((data) => {
                if (data.targetNode === targetNode && data.targetInputType === inputType) {
                    result.push(data);
                }
            });
            return result;
        }
        /**
         * Check if a connection exists between two nodes
         */
        hasConnection(sourceNode, targetNode) {
            let found = false;
            this.connections.forEach((data) => {
                if (data.sourceNode === sourceNode && data.targetNode === targetNode) {
                    found = true;
                }
            });
            return found;
        }
        /**
         * Get a connection by ID
         */
        getConnection(connectionId) {
            return this.connections.get(connectionId) || null;
        }
        /**
         * Get all connections
         */
        getAllConnections() {
            return Array.from(this.connections.values());
        }
        /**
         * Get connection count
         */
        getConnectionCount() {
            return this.connections.size;
        }
        /**
         * Clear all connections
         */
        clearAllConnections() {
            const ids = Array.from(this.connections.keys());
            ids.forEach(id => this.removeConnection(id));
            print(`[ConnectionManager] All connections cleared`);
        }
        /**
         * Check if target node has any text input connected
         */
        hasTextInputConnected(targetNode) {
            return this.getConnectionsToTargetInput(targetNode, "text").length > 0;
        }
        /**
         * Check if target node has any image input connected
         */
        hasImageInputConnected(targetNode) {
            return this.getConnectionsToTargetInput(targetNode, "image").length > 0;
        }
        /**
         * Get the first text input data from connections to a target
         */
        getTextInputFromConnections(targetNode) {
            const textConnections = this.getConnectionsToTargetInput(targetNode, "text");
            if (textConnections.length === 0) {
                return null;
            }
            const sourceNode = textConnections[0].sourceNode;
            const promptNode = sourceNode.getComponent(InputNodePrompt_1.InputNodePrompt.getTypeName());
            if (promptNode) {
                return promptNode.getOutputData();
            }
            return null;
        }
        /**
         * Get the first image input data from connections to a target
         */
        getImageInputFromConnections(targetNode) {
            const imageConnections = this.getConnectionsToTargetInput(targetNode, "image");
            if (imageConnections.length === 0) {
                return null;
            }
            const sourceNode = imageConnections[0].sourceNode;
            const imageNode = sourceNode.getComponent(InputNodeImage_1.InputNodeImage.getTypeName());
            if (imageNode) {
                return imageNode.getOutputData();
            }
            return null;
        }
    };
    __setFunctionName(_classThis, "ConnectionManager");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConnectionManager = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.instance = null;
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConnectionManager = _classThis;
})();
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=ConnectionManager.js.map