if (script.onAwake) {
    script.onAwake();
    return;
}
function checkUndefined(property, showIfData) {
    for (var i = 0; i < showIfData.length; i++) {
        if (showIfData[i][0] && script[showIfData[i][0]] != showIfData[i][1]) {
            return;
        }
    }
    if (script[property] == undefined) {
        throw new Error("Input " + property + " was not provided for the object " + script.getSceneObject().name);
    }
}
// @input Component.Camera editorCamera
// @input Component.Camera specsLeftCamera
// @input Component.Camera specsRightCamera
// @input Asset.Texture screenCropTexture
// @input Asset.Texture deviceCamTexture
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/Crop Circle.lspkg/Scripts/CameraService");
Object.setPrototypeOf(script, Module.CameraService.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("editorCamera", []);
    checkUndefined("specsLeftCamera", []);
    checkUndefined("specsRightCamera", []);
    checkUndefined("screenCropTexture", []);
    checkUndefined("deviceCamTexture", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
