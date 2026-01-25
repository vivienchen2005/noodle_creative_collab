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
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"Voice to Text (ASR)"}
// @ui {"widget":"separator"}
// @ui {"widget":"group_start", "label":"Controls"}
// @input AssignableType toggleButton {"hint":"Button to toggle start/stop voice transcription (works with RectangleButton, RoundButton, CapsuleButton, etc.)"}
// @input float silenceUntilTerminationMs = 2000 {"hint":"Whether to auto-stop after silence (milliseconds). Set to 0 to disable auto-stop."}
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}
// @ui {"widget":"group_start", "label":"Display"}
// @input Component.Text transcriptionText {"hint":"Optional: Text component to display transcribed text in real-time"}
// @input Component.Text statusText {"hint":"Optional: Text component to show status (listening, processing, etc.)"}
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/VoiceToText");
Object.setPrototypeOf(script, Module.VoiceToText.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("toggleButton", []);
    checkUndefined("silenceUntilTerminationMs", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
