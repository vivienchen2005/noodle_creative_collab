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
// @input float curveDirection {"hint":"Curve direction - offset direction for the control points (0 = up, 1 = right, 2 = forward)", "widget":"combobox", "values":[{"label":"Up", "value":0}, {"label":"Right", "value":1}, {"label":"Forward", "value":2}]}
// @input float controlPointDistance = 0.33 {"hint":"Control point distance - how far from start/end the control points extend along the path (affects curve smoothness)"}
// @input Asset.Material lineMaterial
// @input vec3 _color = "{1, 1, 0}" {"widget":"color"}
// @input float lineWidth = 0.5
// @input float lineStyle {"widget":"combobox", "values":[{"label":"Full", "value":0}, {"label":"Split", "value":1}, {"label":"FadedEnd", "value":2}]}
// @input float handType {"hint":"Hand type to use for gestures (Left or Right)", "widget":"combobox", "values":[{"label":"Right", "value":0}, {"label":"Left", "value":1}]}
// @input bool useGrabGesture = true {"hint":"Use grab gesture (true) or targeting gesture (false)"}
// @input SceneObject tempEndPoint {"hint":"Temporary end point SceneObject that follows hand during dragging"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/InteractiveBezierCurve");
Object.setPrototypeOf(script, Module.InteractiveBezierCurve.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("startPoint", []);
    checkUndefined("endPoint", []);
    checkUndefined("interpolationPoints", []);
    checkUndefined("curveHeight", []);
    checkUndefined("curveDirection", []);
    checkUndefined("controlPointDistance", []);
    checkUndefined("lineMaterial", []);
    checkUndefined("_color", []);
    checkUndefined("lineWidth", []);
    checkUndefined("lineStyle", []);
    checkUndefined("handType", []);
    checkUndefined("useGrabGesture", []);
    checkUndefined("tempEndPoint", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
