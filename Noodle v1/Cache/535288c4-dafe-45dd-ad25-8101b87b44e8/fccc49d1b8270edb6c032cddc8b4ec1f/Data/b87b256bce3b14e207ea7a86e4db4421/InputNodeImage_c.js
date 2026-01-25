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
// @input AssignableType baseNode {"hint":"BaseNode component (required)"}
// @input Component.Text titleText {"hint":"Title text component (optional - will be created if not set)"}
// @input AssignableType_1 outputButton {"hint":"Round button for output connection (will be created if not set)"}
// @input Component.Image imageComponent {"hint":"Image component (will be created if not set)"}
// @input Component.ScriptComponent cameraService {"hint":"Camera service for image capture"}
// @input SceneObject imageContainer {"hint":"Parent object for all image-related UI (image display, etc.)"}
// @input Asset.ObjectPrefab cropCirclePrefab {"hint":"Crop Circle prefab (Scanner.prefab from Crop Circle.lspkg) - each InputNodeImage gets its own instance"}
// @input AssignableType_2 captureButton {"hint":"Capture button (CapsuleButton - will be created if not set)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/InputNodeImage");
Object.setPrototypeOf(script, Module.InputNodeImage.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("baseNode", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
