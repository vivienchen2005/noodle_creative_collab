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
// @input AssignableType frameComponent {"hint":"The Frame component for this node"}
// @input string nodeType = "Base" {"hint":"Type identifier for this node (Image, Text, AI, 3D, etc.)"}
// @input string nodeId {"hint":"Unique ID for this node (auto-generated if not set)"}
// @input SceneObject inConnectionPoint {"hint":"The 'in' connection point SceneObject"}
// @input SceneObject outConnectionPoint {"hint":"The 'out' connection point SceneObject"}
// @input bool hasInPoint = true {"hint":"Whether this node has an 'in' connection point"}
// @input bool hasOutPoint = true {"hint":"Whether this node has an 'out' connection point"}
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
    checkUndefined("frameComponent", []);
    checkUndefined("nodeType", []);
    checkUndefined("nodeId", []);
    checkUndefined("inConnectionPoint", []);
    checkUndefined("outConnectionPoint", []);
    checkUndefined("hasInPoint", []);
    checkUndefined("hasOutPoint", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
