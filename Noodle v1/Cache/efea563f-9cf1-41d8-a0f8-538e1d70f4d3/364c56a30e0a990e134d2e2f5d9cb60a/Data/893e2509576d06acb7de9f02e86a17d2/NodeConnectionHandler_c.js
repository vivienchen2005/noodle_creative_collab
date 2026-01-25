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
// @input Asset.Material connectionMaterial {"hint":"Material for connection lines"}
// @input float handType {"hint":"Hand type to use for gestures (0 = Right, 1 = Left)", "widget":"combobox", "values":[{"label":"Right", "value":0}, {"label":"Left", "value":1}]}
// @input float connectionThreshold = 0.1 {"hint":"Distance threshold for connecting to a node (in meters)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/NodeConnectionHandler");
Object.setPrototypeOf(script, Module.NodeConnectionHandler.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("connectionMaterial", []);
    checkUndefined("handType", []);
    checkUndefined("connectionThreshold", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
