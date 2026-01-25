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
// @input SceneObject[] circleObjs
// @input SceneObject editorCamObj
// @input SceneObject picAnchorObj
// @input SceneObject loadingObj
// @input Component.RenderMeshVisual captureRendMesh
// @input Asset.Texture screenCropTexture
// @input AssignableType cropRegion
// @input SceneObject pinchVisualIndicator {"hint":"Optional: SceneObject to show at pinch location for visual feedback. Will be positioned between thumb and index tip when pinching."}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/Crop Circle.lspkg/Scripts/PictureBehavior");
Object.setPrototypeOf(script, Module.PictureBehavior.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("circleObjs", []);
    checkUndefined("editorCamObj", []);
    checkUndefined("picAnchorObj", []);
    checkUndefined("loadingObj", []);
    checkUndefined("captureRendMesh", []);
    checkUndefined("screenCropTexture", []);
    checkUndefined("cropRegion", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
