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
exports.NodeConnectionController = void 0;
var __selfType = requireType("./NodeConnectionController");
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
const ProcessImageGenNode_1 = require("./ProcessImageGenNode");
const Process3DNode_1 = require("./Process3DNode");
/**
 * NodeConnectionController - Handles button-click-based connections between nodes
 * Flow: Click input node output button -> Click process node input section -> Create connection
 */
let NodeConnectionController = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var NodeConnectionController = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.connectionMaterial = this.connectionMaterial;
            this._pendingSourceNode = null;
            this._pendingSourceType = null;
            this._pendingSourceButtonId = null;
        }
        __initialize() {
            super.__initialize();
            this.connectionMaterial = this.connectionMaterial;
            this._pendingSourceNode = null;
            this._pendingSourceType = null;
            this._pendingSourceButtonId = null;
        }
        onAwake() {
            if (!NodeConnectionController.instance) {
                NodeConnectionController.instance = this;
            }
            print("NodeConnectionController: Initialized");
        }
        /**
         * Gets the singleton instance
         */
        static getInstance() {
            return NodeConnectionController.instance;
        }
        /**
         * Called when an input node's output button is clicked
         * This starts a pending connection
         */
        onInputNodeButtonClicked(sourceNode, sourceType, buttonId = "") {
            print(`NodeConnectionController: Input node button clicked - Type: ${sourceType}, Node: ${sourceNode.name}, Button ID: ${buttonId}`);
            this._pendingSourceNode = sourceNode;
            this._pendingSourceType = sourceType;
            this._pendingSourceButtonId = buttonId;
            print(`NodeConnectionController: Pending connection started. Click a process node input section to complete.`);
        }
        /**
         * Called when a process node's input section is clicked
         * This completes the connection if there's a pending source
         */
        onProcessNodeInputClicked(targetNode, inputType) {
            if (!this._pendingSourceNode || !this._pendingSourceType) {
                print(`NodeConnectionController: No pending connection to complete`);
                return false;
            }
            // Validate connection type matches
            if (this._pendingSourceType !== inputType) {
                print(`NodeConnectionController: Connection type mismatch. Source: ${this._pendingSourceType}, Target: ${inputType}`);
                this.clearPendingConnection();
                return false;
            }
            print(`NodeConnectionController: Attempting to connect ${this._pendingSourceType} from ${this._pendingSourceNode.name} to ${targetNode.name}`);
            // Try to connect based on target node type
            let connected = false;
            // Check if target is ProcessImageGenNode
            const imageGenNode = targetNode.getComponent(ProcessImageGenNode_1.ProcessImageGenNode.getTypeName());
            if (imageGenNode) {
                if (inputType === "text") {
                    connected = imageGenNode.connectTextInput(this._pendingSourceNode);
                }
                else if (inputType === "image") {
                    connected = imageGenNode.connectImageInput(this._pendingSourceNode);
                }
            }
            // Check if target is Process3DNode
            if (!connected) {
                const process3DNode = targetNode.getComponent(Process3DNode_1.Process3DNode.getTypeName());
                if (process3DNode) {
                    if (inputType === "text") {
                        connected = process3DNode.connectTextInput(this._pendingSourceNode);
                    }
                    else if (inputType === "image") {
                        connected = process3DNode.connectImageInput(this._pendingSourceNode);
                    }
                }
            }
            if (connected) {
                print(`NodeConnectionController: Connection successful!`);
                this.clearPendingConnection();
                return true;
            }
            else {
                print(`NodeConnectionController: Connection failed - target node not found or already connected`);
                this.clearPendingConnection();
                return false;
            }
        }
        /**
         * Clears the pending connection
         */
        clearPendingConnection() {
            this._pendingSourceNode = null;
            this._pendingSourceType = null;
            this._pendingSourceButtonId = null;
        }
        /**
         * Gets the pending source node (for UI feedback)
         */
        getPendingSourceNode() {
            return this._pendingSourceNode;
        }
        /**
         * Gets the pending source type (for UI feedback)
         */
        getPendingSourceType() {
            return this._pendingSourceType;
        }
        /**
         * Checks if there's a pending connection
         */
        hasPendingConnection() {
            return this._pendingSourceNode !== null && this._pendingSourceType !== null;
        }
    };
    __setFunctionName(_classThis, "NodeConnectionController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NodeConnectionController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.instance = null;
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NodeConnectionController = _classThis;
})();
exports.NodeConnectionController = NodeConnectionController;
//# sourceMappingURL=NodeConnectionController.js.map