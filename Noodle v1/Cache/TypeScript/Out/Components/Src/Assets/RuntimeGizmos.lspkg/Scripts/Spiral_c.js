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
// @input SceneObject centerObject {"hint":"The center point of the spiral"}
// @input float startRadiusAmplitude = 1 {"hint":"The starting radius amplitude of the spiral"}
// @input float endRadiusAmplitude = 1 {"hint":"The ending radius amplitude of the spiral"}
// @input float axisLength = 5 {"hint":"Length of the spiral along its axis direction"}
// @input float loops = 3 {"hint":"Number of complete loops in the spiral"}
// @input bool followRotation = true {"hint":"Whether the spiral should follow the center object's rotation"}
// @input float axisDirection = 1 {"hint":"Which axis the spiral should expand along (0=X, 1=Y, 2=Z)", "widget":"combobox", "values":[{"label":"X Axis", "value":0}, {"label":"Y Axis", "value":1}, {"label":"Z Axis", "value":2}]}
// @input Asset.Material lineMaterial
// @input vec3 _color = "{1, 0.5, 0}" {"widget":"color"}
// @input float lineWidth = 0.5
// @input float lineStyle {"widget":"combobox", "values":[{"label":"Full", "value":0}, {"label":"Split", "value":1}, {"label":"FadedEnd", "value":2}]}
// @input float totalSegments = 120 {"hint":"Total number of segments for the entire spiral (higher = smoother)"}
// @input float spiralType {"hint":"Type of spiral growth", "widget":"combobox", "values":[{"label":"Linear", "value":0}, {"label":"Exponential", "value":1}, {"label":"Logarithmic", "value":2}, {"label":"Helix", "value":3}]}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/RuntimeGizmos.lspkg/Scripts/Spiral");
Object.setPrototypeOf(script, Module.Spiral.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("centerObject", []);
    checkUndefined("startRadiusAmplitude", []);
    checkUndefined("endRadiusAmplitude", []);
    checkUndefined("axisLength", []);
    checkUndefined("loops", []);
    checkUndefined("followRotation", []);
    checkUndefined("axisDirection", []);
    checkUndefined("lineMaterial", []);
    checkUndefined("_color", []);
    checkUndefined("lineWidth", []);
    checkUndefined("lineStyle", []);
    checkUndefined("totalSegments", []);
    checkUndefined("spiralType", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
