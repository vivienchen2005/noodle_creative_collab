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
// @input SceneObject sourcePoint {"hint":"Source connection point (where connection starts)"}
// @input SceneObject targetPoint {"hint":"Target connection point (where connection ends, null if not connected)"}
// @input AssignableType bezierCurve {"hint":"The InteractiveBezierCurve component for this connection"}
// @input Asset.Material lineMaterial {"hint":"Material for the connection line"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/NodeConnection");
Object.setPrototypeOf(script, Module.NodeConnection.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("sourcePoint", []);
    checkUndefined("targetPoint", []);
    checkUndefined("bezierCurve", []);
    checkUndefined("lineMaterial", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
