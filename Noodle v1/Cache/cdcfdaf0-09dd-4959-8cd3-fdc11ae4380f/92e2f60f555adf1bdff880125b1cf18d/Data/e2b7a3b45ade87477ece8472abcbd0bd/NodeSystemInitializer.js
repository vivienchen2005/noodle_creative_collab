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
exports.NodeSystemInitializer = void 0;
var __selfType = requireType("./NodeSystemInitializer");
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
const NodeTypeRegistry_1 = require("./NodeTypeRegistry");
const NodeManager_1 = require("./NodeManager");
const SceneObjectUtils_1 = require("SpectaclesInteractionKit.lspkg/Utils/SceneObjectUtils");
/**
 * Helper script to initialize the Node System.
 * Attach this to a SceneObject in your scene to auto-setup the system.
 */
let NodeSystemInitializer = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var NodeSystemInitializer = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.nodePrefabs = this.nodePrefabs;
            this.nodeTypeNames = this.nodeTypeNames;
            this.nodeManager = this.nodeManager;
        }
        __initialize() {
            super.__initialize();
            this.nodePrefabs = this.nodePrefabs;
            this.nodeTypeNames = this.nodeTypeNames;
            this.nodeManager = this.nodeManager;
        }
        onAwake() {
            print("NodeSystemInitializer: Starting initialization...");
            // Find NodeManager if not set
            if (!this.nodeManager) {
                const managerObj = (0, SceneObjectUtils_1.findSceneObjectByName)(null, "NodeManager");
                if (managerObj) {
                    this.nodeManager = managerObj.getComponent(NodeManager_1.NodeManager.getTypeName());
                }
            }
            // Register node types
            this.registerNodeTypes();
            print("NodeSystemInitializer: Initialization complete!");
        }
        /**
         * Registers all node types with the registry
         */
        registerNodeTypes() {
            const registry = (0, NodeTypeRegistry_1.getNodeTypeRegistry)();
            if (this.nodePrefabs.length !== this.nodeTypeNames.length) {
                print("NodeSystemInitializer: Warning - nodePrefabs and nodeTypeNames arrays must have the same length!");
                return;
            }
            for (let i = 0; i < this.nodePrefabs.length; i++) {
                const prefab = this.nodePrefabs[i];
                const typeName = this.nodeTypeNames[i];
                if (prefab && typeName) {
                    registry.registerNodeType(typeName, prefab);
                    print(`NodeSystemInitializer: Registered node type "${typeName}"`);
                }
            }
        }
    };
    __setFunctionName(_classThis, "NodeSystemInitializer");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NodeSystemInitializer = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NodeSystemInitializer = _classThis;
})();
exports.NodeSystemInitializer = NodeSystemInitializer;
//# sourceMappingURL=NodeSystemInitializer.js.map