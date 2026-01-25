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
// @input AssignableType_1 generateButton {"hint":"Generate button (will be created if not set)"}
// @input Asset.Material connectionMaterial {"hint":"Material for connection lines"}
// @input SceneObject textInputSection {"hint":"Text input section SceneObject (where text connections attach)"}
// @input SceneObject imageInputSection {"hint":"Image input section SceneObject (where image connections attach)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/ProcessImageGenNode");
Object.setPrototypeOf(script, Module.ProcessImageGenNode.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("baseNode", []);
    checkUndefined("connectionMaterial", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
