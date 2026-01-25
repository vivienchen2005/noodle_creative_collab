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
exports.ConnectionPoint = void 0;
var __selfType = requireType("./ConnectionPoint");
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
 * Component for connection points ("in" and "out") on nodes.
 * Tracks connections and provides position for bezier curves.
 */
let ConnectionPoint = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var ConnectionPoint = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.pointType = this.pointType;
            this.parentNode = this.parentNode;
            this.visualIndicator = this.visualIndicator;
            this.connections = [];
        }
        __initialize() {
            super.__initialize();
            this.pointType = this.pointType;
            this.parentNode = this.parentNode;
            this.visualIndicator = this.visualIndicator;
            this.connections = [];
        }
        onAwake() {
            // Create a simple visual indicator if none provided
            if (!this.visualIndicator) {
                this.createVisualIndicator();
            }
        }
        /**
         * Creates a simple visual indicator for the connection point
         */
        createVisualIndicator() {
            // This would typically be a small sphere or circle
            // For now, we'll just ensure the SceneObject exists
            // Visual can be added via prefab or manually
        }
        /**
         * Gets the type of this connection point
         */
        getPointType() {
            return this.pointType;
        }
        /**
         * Gets the world position of this connection point
         */
        getWorldPosition() {
            return this.sceneObject.getTransform().getWorldPosition();
        }
        /**
         * Adds a connection to this point
         */
        addConnection(connection) {
            if (this.connections.indexOf(connection) === -1) {
                this.connections.push(connection);
            }
        }
        /**
         * Removes a connection from this point
         */
        removeConnection(connection) {
            const index = this.connections.indexOf(connection);
            if (index !== -1) {
                this.connections.splice(index, 1);
            }
        }
        /**
         * Gets all connections attached to this point
         */
        getConnections() {
            return [...this.connections];
        }
        /**
         * Gets the number of connections
         */
        getConnectionCount() {
            return this.connections.length;
        }
        /**
         * Checks if this point can accept more connections
         * "in" points can typically have multiple, "out" points usually have one
         */
        canAcceptConnection() {
            if (this.pointType === "out") {
                return this.connections.length === 0;
            }
            return true; // "in" points can have multiple connections
        }
    };
    __setFunctionName(_classThis, "ConnectionPoint");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConnectionPoint = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConnectionPoint = _classThis;
})();
exports.ConnectionPoint = ConnectionPoint;
//# sourceMappingURL=ConnectionPoint.js.map