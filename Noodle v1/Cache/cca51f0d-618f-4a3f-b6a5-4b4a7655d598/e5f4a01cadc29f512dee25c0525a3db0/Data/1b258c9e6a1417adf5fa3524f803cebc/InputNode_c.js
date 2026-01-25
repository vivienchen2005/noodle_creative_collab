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
// @input string inputType = "prompt" {"hint":"Input type: image or prompt", "widget":"combobox", "values":[{"label":"Prompt", "value":"prompt"}, {"label":"Image", "value":"image"}]}
// @input AssignableType baseNode {"hint":"BaseNode component (required)"}
// @input Component.Text titleText {"hint":"Title text component (optional - will be created if not set)"}
// @input AssignableType_1 outputButton {"hint":"Round button for output connection (will be created if not set)"}
// @input Component.Image imageComponent {"hint":"Image component for image type (will be created if not set)"}
// @input Component.Text promptText {"hint":"Text component for displaying prompt text (will be created if not set)"}
// @input AssignableType_2 voiceToTextComponent {"hint":"Voice to text component (for prompt type)"}
// @input AssignableType_3 voiceButton {"hint":"Button for voice-to-text (will be created if not set)"}
// @input Component.ScriptComponent cameraService {"hint":"Camera service for image capture (for image type)"}
// @input SceneObject voiceContainer {"hint":"Parent object for all voice-related UI (voice button, text display, etc.)"}
// @input SceneObject imageContainer {"hint":"Parent object for all image-related UI (image display, etc.)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/InputNode");
Object.setPrototypeOf(script, Module.InputNode.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("inputType", []);
    checkUndefined("baseNode", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
