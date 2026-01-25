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
// @input SceneObject startPoint
// @input SceneObject endPoint
// @input Asset.Material lineMaterial
// @input float curveHeight = 0.15
// @input float interpolationPoints = 100
// @input float curveDirection = 2 {"hint":"Curve style: 0=Up arc, 1=Right curve, 2=Cable droop"}
// @input vec3 lineColor = {0.498,0.925,0.984} {"widget":"color"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/ConnectionLine");
Object.setPrototypeOf(script, Module.ConnectionLine.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("curveHeight", []);
    checkUndefined("interpolationPoints", []);
    checkUndefined("curveDirection", []);
    checkUndefined("lineColor", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
