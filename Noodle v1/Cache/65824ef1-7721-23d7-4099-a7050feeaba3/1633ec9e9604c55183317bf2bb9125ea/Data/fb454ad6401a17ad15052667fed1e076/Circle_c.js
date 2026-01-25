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
// @input SceneObject centerObject {"hint":"The center point of the circle"}
// @input float radius = 1 {"hint":"The radius of the circle"}
// @input bool followRotation = true {"hint":"Whether the circle should follow the center object's rotation"}
// @input Asset.Material lineMaterial
// @input vec3 _color = "{1, 1, 0}" {"widget":"color"}
// @input float lineWidth = 0.5
// @input float lineStyle {"widget":"combobox", "values":[{"label":"Full", "value":0}, {"label":"Split", "value":1}, {"label":"FadedEnd", "value":2}]}
// @input float segments = 32 {"hint":"Number of segments used to approximate the circle (higher = smoother)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Packages/RuntimeGizmos.lspkg/Scripts/Circle");
Object.setPrototypeOf(script, Module.Circle.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("centerObject", []);
    checkUndefined("radius", []);
    checkUndefined("followRotation", []);
    checkUndefined("lineMaterial", []);
    checkUndefined("_color", []);
    checkUndefined("lineWidth", []);
    checkUndefined("lineStyle", []);
    checkUndefined("segments", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
