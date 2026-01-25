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
exports.PinchVisualIndicator = void 0;
var __selfType = requireType("./PinchVisualIndicator");
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
const SIK_1 = require("SpectaclesInteractionKit.lspkg/SIK");
/**
 * Simple component to show/hide a visual indicator based on right hand pinch state
 * Shows when right hand is pinching, hides when not pinching
 */
let PinchVisualIndicator = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var PinchVisualIndicator = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.indicatorObject = this.indicatorObject;
            this.rightHand = SIK_1.SIK.HandInputData.getHand("right");
            this.updateEvent = null;
            this.isPinching = false;
            this.onPinchDown = () => {
                this.isPinching = true;
                this.updateIndicator();
                print("[PinchVisualIndicator] Pinch down detected");
            };
            this.onPinchUp = () => {
                this.isPinching = false;
                this.updateIndicator();
                print("[PinchVisualIndicator] Pinch up detected");
            };
        }
        __initialize() {
            super.__initialize();
            this.indicatorObject = this.indicatorObject;
            this.rightHand = SIK_1.SIK.HandInputData.getHand("right");
            this.updateEvent = null;
            this.isPinching = false;
            this.onPinchDown = () => {
                this.isPinching = true;
                this.updateIndicator();
                print("[PinchVisualIndicator] Pinch down detected");
            };
            this.onPinchUp = () => {
                this.isPinching = false;
                this.updateIndicator();
                print("[PinchVisualIndicator] Pinch up detected");
            };
        }
        onAwake() {
            // Hide initially
            if (this.indicatorObject) {
                this.indicatorObject.enabled = false;
                print("[PinchVisualIndicator] Indicator hidden initially");
            }
            // Listen for pinch events
            this.rightHand.onPinchDown.add(this.onPinchDown);
            this.rightHand.onPinchUp.add(this.onPinchUp);
            // Create update event to continuously check pinch state
            this.updateEvent = this.createEvent("UpdateEvent");
            this.updateEvent.bind(this.update.bind(this));
        }
        onDestroy() {
            // Clean up event listeners
            if (this.updateEvent) {
                this.removeEvent(this.updateEvent);
            }
            this.rightHand.onPinchDown.remove(this.onPinchDown);
            this.rightHand.onPinchUp.remove(this.onPinchUp);
        }
        update() {
            // Also check pinch state by distance in case events are missed
            try {
                const thumbPos = this.rightHand.thumbTip.position;
                const indexPos = this.rightHand.indexTip.position;
                const distance = thumbPos.distance(indexPos);
                const currentlyPinching = distance < 3.0;
                // Update if state changed
                if (currentlyPinching !== this.isPinching) {
                    this.isPinching = currentlyPinching;
                    this.updateIndicator();
                }
            }
            catch (e) {
                // Hand tracking might not be available, ignore
            }
        }
        updateIndicator() {
            if (!this.indicatorObject) {
                return;
            }
            try {
                this.indicatorObject.enabled = this.isPinching;
                if (this.isPinching) {
                    print("[PinchVisualIndicator] Indicator shown");
                }
                else {
                    print("[PinchVisualIndicator] Indicator hidden");
                }
            }
            catch (e) {
                print("[PinchVisualIndicator] Error updating indicator: " + e);
            }
        }
    };
    __setFunctionName(_classThis, "PinchVisualIndicator");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PinchVisualIndicator = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PinchVisualIndicator = _classThis;
})();
exports.PinchVisualIndicator = PinchVisualIndicator;
//# sourceMappingURL=PinchVisualIndicator.js.map