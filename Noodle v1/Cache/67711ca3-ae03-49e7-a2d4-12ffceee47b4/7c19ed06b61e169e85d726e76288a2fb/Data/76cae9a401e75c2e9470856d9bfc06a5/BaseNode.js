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
const Frame_1 = require("../../SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame");
/**
 * Base node component - a Frame with fixed size that has "in" and "out" connection points.
 * Connection points are positioned at the left center (in) and right center (out) of the frame.
 * These are reference positions for connections, not visible objects.
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
            this.frameSize = this.frameSize;
            this.nodeType = this.nodeType;
            this.nodeId = this.nodeId;
            this._frameComponent = null;
            this._initialized = false;
        }
        __initialize() {
            super.__initialize();
            this.frameSize = this.frameSize;
            this.nodeType = this.nodeType;
            this.nodeId = this.nodeId;
            this._frameComponent = null;
            this._initialized = false;
        }
        onAwake() {
            // Generate unique ID if not set
            if (!this.nodeId || this.nodeId === "") {
                this.nodeId = this.generateNodeId();
            }
            // Ensure sceneObject is enabled
            this.sceneObject.enabled = true;
            // Get or create Frame component from sceneObject
            this._frameComponent = this.sceneObject.getComponent(Frame_1.Frame.getTypeName());
            if (!this._frameComponent) {
                // Auto-create Frame component if it doesn't exist
                this._frameComponent = this.sceneObject.createComponent(Frame_1.Frame.getTypeName());
                print(`BaseNode: Created Frame component automatically on ${this.sceneObject.name}`);
            }
            else {
                print(`BaseNode: Found existing Frame component on ${this.sceneObject.name}`);
            }
            // Disable auto show/hide so frame is always visible
            // Note: We'll set innerSize in onStart after Frame initializes
            this._frameComponent.autoShowHide = false;
            print(`BaseNode: Frame component ready - will configure size after initialization`);
        }
        onStart() {
            // Frame initializes on Start, so we wait for it then configure and show it
            if (this._frameComponent && !this._initialized) {
                // Wait for Frame to initialize (it uses OnStartEvent)
                let frameCheckCount = 0;
                this.createEvent("UpdateEvent").bind(() => {
                    if (this._frameComponent && !this._initialized) {
                        frameCheckCount++;
                        // Check if frame is initialized (has roundedRectangle)
                        if (this._frameComponent.roundedRectangle) {
                            // Now it's safe to set innerSize
                            this._frameComponent.innerSize = this.frameSize;
                            print(`BaseNode: Frame initialized, set size to ${this.frameSize.x}x${this.frameSize.y}`);
                            this.makeFrameVisible();
                        }
                        else if (frameCheckCount > 10) {
                            // After 10 frames, try to set size anyway
                            print(`BaseNode: Frame not fully initialized after 10 frames, attempting to set size anyway`);
                            try {
                                this._frameComponent.innerSize = this.frameSize;
                                this.makeFrameVisible();
                            }
                            catch (e) {
                                print(`BaseNode: Error setting frame size: ${e}`);
                            }
                        }
                    }
                });
            }
        }
        /**
         * Makes the frame visible
         */
        makeFrameVisible() {
            if (this._frameComponent && !this._initialized) {
                // Make sure frame is visible
                if (typeof this._frameComponent.showVisual === 'function') {
                    this._frameComponent.showVisual();
                }
                // Also set opacity directly to ensure visibility
                this._frameComponent.opacity = 1.0;
                this._initialized = true;
                print(`BaseNode: Frame made visible for node ${this.nodeId}`);
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
         * Gets the "in" connection point position (left center of frame)
         * Returns world position
         */
        getInConnectionPosition() {
            if (!this._frameComponent) {
                return this.sceneObject.getTransform().getWorldPosition();
            }
            const transform = this.sceneObject.getTransform();
            const frameSize = this._frameComponent.innerSize;
            // Left center position in local space
            const localInPos = new vec3(-frameSize.x / 2, 0, 0);
            // Convert to world position
            return transform.getWorldTransform().multiplyPoint(localInPos);
        }
        /**
         * Gets the "out" connection point position (right center of frame)
         * Returns world position
         */
        getOutConnectionPosition() {
            if (!this._frameComponent) {
                return this.sceneObject.getTransform().getWorldPosition();
            }
            const transform = this.sceneObject.getTransform();
            const frameSize = this._frameComponent.innerSize;
            // Right center position in local space
            const localOutPos = new vec3(frameSize.x / 2, 0, 0);
            // Convert to world position
            return transform.getWorldTransform().multiplyPoint(localOutPos);
        }
        /**
         * Gets the frame component
         */
        getFrame() {
            return this._frameComponent;
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