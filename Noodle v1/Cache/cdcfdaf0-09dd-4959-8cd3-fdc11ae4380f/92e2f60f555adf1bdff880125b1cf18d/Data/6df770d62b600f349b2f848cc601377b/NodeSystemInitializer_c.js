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
// @input Asset.ObjectPrefab[] nodePrefabs = {} {"hint":"Node prefabs to register (Image, Text, AI, 3D, etc.)"}
// @input string[] nodeTypeNames = {} {"hint":"Node type names corresponding to prefabs"}
// @input AssignableType nodeManager {"hint":"NodeManager component (auto-finds if not set)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/NodeSystemInitializer");
Object.setPrototypeOf(script, Module.NodeSystemInitializer.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("nodePrefabs", []);
    checkUndefined("nodeTypeNames", []);
    checkUndefined("nodeManager", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
