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
// @input float interpolationPoints = 100 {"hint":"Number of interpolation points along the curve (higher = smoother)"}
// @input float curveHeight = 0.15 {"hint":"Curve sag/arc amount - positive values arc up, negative droop down (cable style)"}
// @input float curveDirection = 2 {"hint":"Curve style - Up: arc upward, Right: curve right, Forward: natural cable droop", "widget":"combobox", "values":[{"label":"Up", "value":0}, {"label":"Right", "value":1}, {"label":"Cable (Droop)", "value":2}]}
// @input float controlPointDistance = 0.4 {"hint":"Control point distance - how far from start/end the control points extend along the path (affects curve smoothness)"}
// @input Asset.Material lineMaterial
// @input vec3 _color = {0.498,0.925,0.984} {"widget":"color"}
// @input float lineWidth = 0.3
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
    checkUndefined("interpolationPoints", []);
    checkUndefined("curveHeight", []);
    checkUndefined("curveDirection", []);
    checkUndefined("controlPointDistance", []);
    checkUndefined("_color", []);
    checkUndefined("lineWidth", []);
    checkUndefined("lineStyle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
