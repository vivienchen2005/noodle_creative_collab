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
exports.PictureController = void 0;
var __selfType = requireType("./PictureController");
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
let PictureController = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var PictureController = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.scannerPrefab = this.scannerPrefab;
            this.cameraService = this.cameraService;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.rightHand = SIK_1.SIK.HandInputData.getHand("right");
            this.leftHand = SIK_1.SIK.HandInputData.getHand("left");
            this.leftDown = false;
            this.rightDown = false;
            this.leftPinchDown = () => {
                print("LEFT Pinch down");
                this.leftDown = true;
                // Create scanner on single-hand pinch (right hand takes priority for circle drawing)
                // Only create if right hand is not already down (to avoid duplicate scanners)
                if (!this.rightDown) {
                    // Left hand can also create scanner, but we prefer right hand for circle drawing
                    // this.createScanner()
                }
            };
            this.leftPinchUp = () => {
                print("LEFT Pinch up");
                this.leftDown = false;
            };
            this.rightPinchDown = () => {
                print("RIGHT Pinch down");
                this.rightDown = true;
                // Create scanner on single-hand pinch for circle drawing
                this.createScanner();
            };
            this.rightPinchUp = () => {
                print("RIGHT Pinch up");
                this.rightDown = false;
            };
        }
        __initialize() {
            super.__initialize();
            this.scannerPrefab = this.scannerPrefab;
            this.cameraService = this.cameraService;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.rightHand = SIK_1.SIK.HandInputData.getHand("right");
            this.leftHand = SIK_1.SIK.HandInputData.getHand("left");
            this.leftDown = false;
            this.rightDown = false;
            this.leftPinchDown = () => {
                print("LEFT Pinch down");
                this.leftDown = true;
                // Create scanner on single-hand pinch (right hand takes priority for circle drawing)
                // Only create if right hand is not already down (to avoid duplicate scanners)
                if (!this.rightDown) {
                    // Left hand can also create scanner, but we prefer right hand for circle drawing
                    // this.createScanner()
                }
            };
            this.leftPinchUp = () => {
                print("LEFT Pinch up");
                this.leftDown = false;
            };
            this.rightPinchDown = () => {
                print("RIGHT Pinch down");
                this.rightDown = true;
                // Create scanner on single-hand pinch for circle drawing
                this.createScanner();
            };
            this.rightPinchUp = () => {
                print("RIGHT Pinch up");
                this.rightDown = false;
            };
        }
        onAwake() {
            this.rightHand.onPinchUp.add(this.rightPinchUp);
            this.rightHand.onPinchDown.add(this.rightPinchDown);
            this.leftHand.onPinchUp.add(this.leftPinchUp);
            this.leftHand.onPinchDown.add(this.leftPinchDown);
            if (this.isEditor) {
                this.createEvent("TouchStartEvent").bind(this.editorTest.bind(this));
            }
            else {
                const obj = this.getSceneObject();
                if (obj.getChildrenCount() > 0) {
                    obj.getChild(0).destroy();
                }
            }
        }
        editorTest() {
            print("Creating Editor Scanner...");
            this.createScanner();
        }
        isPinchClose() {
            return this.leftHand.thumbTip.position.distance(this.rightHand.thumbTip.position) < 10;
        }
        createScanner() {
            print("[PictureController] Creating scanner...");
            const scanner = this.scannerPrefab.instantiate(this.getSceneObject());
            print("[PictureController] Scanner created");
        }
    };
    __setFunctionName(_classThis, "PictureController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PictureController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PictureController = _classThis;
})();
exports.PictureController = PictureController;
//# sourceMappingURL=PictureController.js.map