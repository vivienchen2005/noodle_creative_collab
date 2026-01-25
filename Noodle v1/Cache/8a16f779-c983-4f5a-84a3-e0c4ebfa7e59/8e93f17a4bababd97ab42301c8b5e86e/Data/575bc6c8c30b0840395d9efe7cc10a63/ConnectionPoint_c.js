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
// @input string pointType = "out" {"hint":"Type of connection point: 'in' or 'out'", "widget":"combobox", "values":[{"label":"In", "value":"in"}, {"label":"Out", "value":"out"}]}
// @input SceneObject parentNode {"hint":"The parent node this connection point belongs to"}
// @input SceneObject visualIndicator {"hint":"Visual indicator for the connection point (optional)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/ConnectionPoint");
Object.setPrototypeOf(script, Module.ConnectionPoint.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("pointType", []);
    checkUndefined("parentNode", []);
    checkUndefined("visualIndicator", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
