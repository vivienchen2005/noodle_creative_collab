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
// @input SceneObject startPoint {"hint":"The start point of the curve"}
// @input SceneObject endPoint {"hint":"The end point of the curve"}
// @input float interpolationPoints = 20 {"hint":"Number of interpolation points along the curve (higher = smoother)"}
// @input float curveHeight = 0.5 {"hint":"Curve height offset - how much the curve arches upward (in meters)"}
// @input float curveDirection {"hint":"Curve direction - offset direction for the control point (0 = up, 1 = right, 2 = forward)", "widget":"combobox", "values":[{"label":"Up", "value":0}, {"label":"Right", "value":1}, {"label":"Forward", "value":2}]}
// @input Asset.Material lineMaterial
// @input vec3 _color = "{1, 1, 0}" {"widget":"color"}
// @input float lineWidth = 0.5
// @input float lineStyle {"widget":"combobox", "values":[{"label":"Full", "value":0}, {"label":"Split", "value":1}, {"label":"FadedEnd", "value":2}]}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/RuntimeGizmos.lspkg/Scripts/BezierCurve");
Object.setPrototypeOf(script, Module.BezierCurve.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("startPoint", []);
    checkUndefined("endPoint", []);
    checkUndefined("interpolationPoints", []);
    checkUndefined("curveHeight", []);
    checkUndefined("curveDirection", []);
    checkUndefined("lineMaterial", []);
    checkUndefined("_color", []);
    checkUndefined("lineWidth", []);
    checkUndefined("lineStyle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
