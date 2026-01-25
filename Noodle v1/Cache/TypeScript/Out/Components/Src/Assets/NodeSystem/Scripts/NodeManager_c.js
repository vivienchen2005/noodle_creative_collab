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
// @input Asset.Material connectionMaterial {"hint":"Material for connection lines - REQUIRED for connections to be visible"}
// @input float defaultCurveHeight = 0.1 {"hint":"Default curve height for connections"}
// @input SceneObject nodesParent {"hint":"Parent object for all nodes (optional - for organization)"}
// @input SceneObject connectionsParent {"hint":"Parent object for all connections (optional - for organization)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/NodeManager");
Object.setPrototypeOf(script, Module.NodeManager.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("connectionMaterial", []);
    checkUndefined("defaultCurveHeight", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
