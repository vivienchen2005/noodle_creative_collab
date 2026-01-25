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
// @input AssignableType baseNode {"hint":"BaseNode component (required)"}
// @input Component.Text titleText {"hint":"Title text component (optional - will be created if not set)"}
// @input AssignableType_1 outputButton {"hint":"Capsule button for output connection (will be created if not set)"}
// @input Component.Text promptText {"hint":"Text component for displaying prompt text (will be created if not set)"}
// @input AssignableType_2 voiceToTextComponent {"hint":"Voice to text component (will be created if not set)"}
// @input AssignableType_3 voiceButton {"hint":"Button for voice-to-text (will be created if not set)"}
// @input SceneObject voiceContainer {"hint":"Parent object for all voice-related UI (voice button, text display, etc.)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/InputNodePrompt");
Object.setPrototypeOf(script, Module.InputNodePrompt.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("baseNode", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
