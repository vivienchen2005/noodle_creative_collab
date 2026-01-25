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
exports.NodeConnectionHandler = void 0;
var __selfType = requireType("./NodeConnectionHandler");
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
 * Handles connection creation and dragging between nodes.
 * Attach this to a SceneObject in the scene to enable node connections.
 */
let NodeConnectionHandler = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var NodeConnectionHandler = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.connectionMaterial = this.connectionMaterial;
            this.handType = this.handType;
            this.connectionThreshold = this.connectionThreshold;
            this.gestureModule = require("LensStudio:GestureModule");
            this.currentConnection = null;
            this.sourceNode = null;
            this.isDragging = false;
            this.connections = [];
            this.lastHandPosition = null;
        }
        __initialize() {
            super.__initialize();
            this.connectionMaterial = this.connectionMaterial;
            this.handType = this.handType;
            this.connectionThreshold = this.connectionThreshold;
            this.gestureModule = require("LensStudio:GestureModule");
            this.currentConnection = null;
            this.sourceNode = null;
            this.isDragging = false;
            this.connections = [];
            this.lastHandPosition = null;
        }
        onAwake() {
            // Set as singleton instance
            if (!NodeConnectionHandler.instance) {
                NodeConnectionHandler.instance = this;
            }
        }
        onStart() {
            // Listen for grab gestures to start connections
            const hand = this.handType === 0 ? this.gestureModule.HandType.Right : this.gestureModule.HandType.Left;
            this.gestureModule.getGrabBeginEvent(hand).add(() => {
                this.onGrabBegin();
            });
            this.gestureModule.getGrabEndEvent(hand).add(() => {
                this.onGrabEnd();
            });
            // Listen for targeting data to update drag position and detect nodes
            this.gestureModule.getTargetingDataEvent(hand).add((targetArgs) => {
                if (targetArgs.isValid) {
                    const handPosition = targetArgs.rayOriginInWorld.add(targetArgs.rayDirectionInWorld.uniformScale(0.5));
                    this.lastHandPosition = handPosition;
                    if (this.isDragging && this.currentConnection) {
                        // Update connection end position to follow hand
                        this.currentConnection.updateDragPosition(handPosition);
                    }
                }
            });
        }
        /**
         * Gets the singleton instance
         */
        static getInstance() {
            return NodeConnectionHandler.instance;
        }
        /**
         * Called when grab begins - check if we're grabbing a node's "out" point
         */
        onGrabBegin() {
            if (this.lastHandPosition) {
                // Find node whose "out" point is near the hand
                const sourceNode = this.findNodeNearOutPoint(this.lastHandPosition);
                if (sourceNode) {
                    const baseNode = sourceNode.getComponent(BaseNode_1.BaseNode.getTypeName());
                    if (baseNode) {
                        const outPos = baseNode.getOutConnectionPosition();
                        this.startConnection(sourceNode, outPos);
                        print(`NodeConnectionHandler: Started connection from node ${baseNode.getNodeId()}`);
                    }
                }
            }
        }
        /**
         * Called when grab ends - complete or cancel the connection
         */
        onGrabEnd() {
            if (this.isDragging && this.currentConnection) {
                // Find the nearest node's "in" point
                const targetNode = this.findNearestNodeInPoint();
                if (targetNode) {
                    // Complete the connection
                    this.currentConnection.stopDragging(targetNode);
                    this.connections.push(this.currentConnection);
                    print(`NodeConnectionHandler: Connection completed to node`);
                }
                else {
                    // Cancel the connection
                    this.currentConnection.sceneObject.destroy();
                    print("NodeConnectionHandler: Connection cancelled");
                }
                this.currentConnection = null;
                this.sourceNode = null;
                this.isDragging = false;
            }
        }
        /**
         * Starts a connection from a source node
         */
        startConnection(sourceNode, startPosition) {
            if (this.isDragging) {
                // Cancel previous connection
                if (this.currentConnection) {
                    this.currentConnection.sceneObject.destroy();
                }
            }
            // Create new connection
            const connectionObject = global.scene.createSceneObject("Connection");
            const connection = connectionObject.createComponent(ConnectionLine_1.ConnectionLine.getTypeName());
            if (connection) {
                connection.sourceNode = sourceNode;
                connection.lineMaterial = this.connectionMaterial;
                connection.startDragging(startPosition);
                this.currentConnection = connection;
                this.sourceNode = sourceNode;
                this.isDragging = true;
                print(`NodeConnectionHandler: Started connection from node`);
            }
        }
        /**
         * Finds a node whose "out" point is near the given position
         */
        findNodeNearOutPoint(position) {
            let closestNode = null;
            let closestDistance = this.connectionThreshold;
            // Search all scene objects for BaseNode components
            const rootObjects = global.scene.getRootObjectsCount();
            for (let i = 0; i < rootObjects; i++) {
                const rootObject = global.scene.getRootObject(i);
                const baseNode = rootObject.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (baseNode) {
                    const distance = baseNode.getOutConnectionPosition().sub(position).length;
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestNode = rootObject;
                    }
                }
            }
            return closestNode;
        }
        /**
         * Finds the nearest node's "in" point to the current drag position
         */
        findNearestNodeInPoint() {
            if (!this.lastHandPosition) {
                return null;
            }
            let closestNode = null;
            let closestDistance = this.connectionThreshold;
            // Search all scene objects for BaseNode components
            const rootObjects = global.scene.getRootObjectsCount();
            for (let i = 0; i < rootObjects; i++) {
                const rootObject = global.scene.getRootObject(i);
                const baseNode = rootObject.getComponent(BaseNode_1.BaseNode.getTypeName());
                if (baseNode && rootObject !== this.sourceNode) {
                    // Don't connect to the same node
                    const distance = baseNode.getInConnectionPosition().sub(this.lastHandPosition).length;
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestNode = rootObject;
                    }
                }
            }
            return closestNode;
        }
        /**
         * Gets all connections
         */
        getConnections() {
            return this.connections;
        }
        /**
         * Removes a connection
         */
        removeConnection(connection) {
            const index = this.connections.indexOf(connection);
            if (index > -1) {
                this.connections.splice(index, 1);
                connection.sceneObject.destroy();
            }
        }
    };
    __setFunctionName(_classThis, "NodeConnectionHandler");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NodeConnectionHandler = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.instance = null;
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NodeConnectionHandler = _classThis;
})();
exports.NodeConnectionHandler = NodeConnectionHandler;
//# sourceMappingURL=NodeConnectionHandler.js.map