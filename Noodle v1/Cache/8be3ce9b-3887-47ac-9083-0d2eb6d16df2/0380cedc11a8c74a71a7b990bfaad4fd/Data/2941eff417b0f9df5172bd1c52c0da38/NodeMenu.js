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
exports.NodeMenu = void 0;
var __selfType = requireType("./NodeMenu");
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
const Event_1 = require("SpectaclesInteractionKit.lspkg/Utils/Event");
/**
 * UI component that appears when releasing a dragged connection.
 * Shows available node types and allows user to select one to create.
 */
let NodeMenu = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var NodeMenu = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.menuFrame = this.menuFrame;
            this.menuPosition = this.menuPosition;
            this.menuDistance = this.menuDistance;
            this.nodeTypeRegistry = (0, NodeTypeRegistry_1.getNodeTypeRegistry)();
            this.selectedNodeType = null;
            this.isVisible = false;
            // Event callbacks
            this.onNodeTypeSelected = new Event_1.default();
        }
        __initialize() {
            super.__initialize();
            this.menuFrame = this.menuFrame;
            this.menuPosition = this.menuPosition;
            this.menuDistance = this.menuDistance;
            this.nodeTypeRegistry = (0, NodeTypeRegistry_1.getNodeTypeRegistry)();
            this.selectedNodeType = null;
            this.isVisible = false;
            // Event callbacks
            this.onNodeTypeSelected = new Event_1.default();
        }
        onAwake() {
            // Initialize menu as hidden
            if (this.menuFrame) {
                this.menuFrame.sceneObject.enabled = false;
            }
        }
        /**
         * Shows the menu at the specified position
         */
        showMenu(position) {
            this.menuPosition = position;
            if (this.menuFrame) {
                const transform = this.menuFrame.sceneObject.getTransform();
                transform.setWorldPosition(position);
                this.menuFrame.sceneObject.enabled = true;
                this.isVisible = true;
            }
            // TODO: Populate menu with available node types
            // This would typically create UI buttons for each node type
            this.populateMenuOptions();
            print(`NodeMenu: Showing menu at position ${position}`);
        }
        /**
         * Hides the menu
         */
        hideMenu() {
            if (this.menuFrame) {
                this.menuFrame.sceneObject.enabled = false;
            }
            this.isVisible = false;
            this.selectedNodeType = null;
            print("NodeMenu: Hiding menu");
        }
        /**
         * Populates the menu with available node type options
         */
        populateMenuOptions() {
            const availableTypes = this.nodeTypeRegistry.getAvailableNodeTypes();
            print(`NodeMenu: Available node types: ${availableTypes.join(", ")}`);
            // TODO: Create UI buttons for each node type
            // This would typically:
            // 1. Create button SceneObjects for each type
            // 2. Set up click/tap handlers
            // 3. Call selectNodeType() when clicked
        }
        /**
         * Selects a node type and triggers creation
         */
        selectNodeType(nodeType) {
            if (!this.nodeTypeRegistry.isNodeTypeRegistered(nodeType)) {
                print(`NodeMenu: Node type "${nodeType}" is not registered`);
                return;
            }
            this.selectedNodeType = nodeType;
            this.onNodeTypeSelected.invoke(nodeType);
            this.hideMenu();
            print(`NodeMenu: Selected node type "${nodeType}"`);
        }
        /**
         * Gets the selected node type
         */
        getSelectedNodeType() {
            return this.selectedNodeType;
        }
        /**
         * Checks if the menu is visible
         */
        isMenuVisible() {
            return this.isVisible;
        }
        /**
         * Gets the menu position
         */
        getMenuPosition() {
            return this.menuPosition;
        }
    };
    __setFunctionName(_classThis, "NodeMenu");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NodeMenu = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NodeMenu = _classThis;
})();
exports.NodeMenu = NodeMenu;
//# sourceMappingURL=NodeMenu.js.map