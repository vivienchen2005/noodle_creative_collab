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
// @input SceneObject[] controlPoints {"hint":"The control points for the spline curve"}
// @input float interpolationPoints = 10 {"hint":"Number of interpolation points between each control point (higher = smoother)"}
// @input float tension = 0.5 {"hint":"Tension of the curve (0 = straight lines, 1 = tight curve)"}
// @input bool closedLoop {"hint":"Whether the spline should be closed (connect last point to first)"}
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
var Module = require("../../../../../Modules/Src/Assets/RuntimeGizmos.lspkg/Scripts/Spline");
Object.setPrototypeOf(script, Module.Spline.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("controlPoints", []);
    checkUndefined("interpolationPoints", []);
    checkUndefined("tension", []);
    checkUndefined("closedLoop", []);
    checkUndefined("lineMaterial", []);
    checkUndefined("_color", []);
    checkUndefined("lineWidth", []);
    checkUndefined("lineStyle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
