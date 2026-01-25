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
// @input vec2 _frameSize = {20,20} {"hint":"Fixed size for the frame (in centimeters)"}
// @input string nodeType = "text" {"hint":"Type identifier for this node", "widget":"combobox", "values":[{"label":"Text", "value":"text"}, {"label":"Image", "value":"image"}, {"label":"3D", "value":"3d"}]}
// @input string nodeId {"hint":"Unique ID for this node (auto-generated if not set)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/BaseNode");
Object.setPrototypeOf(script, Module.BaseNode.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("_frameSize", []);
    checkUndefined("nodeType", []);
    checkUndefined("nodeId", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
