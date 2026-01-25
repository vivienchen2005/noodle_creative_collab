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
// @input AssignableType_1 generateButton {"hint":"Generate button (will be created if not set)"}
// @input Asset.Material connectionMaterial {"hint":"Material for connection lines"}
// @input SceneObject textInputSection {"hint":"Text input section SceneObject (where text connections attach)"}
// @input SceneObject imageInputSection {"hint":"Image input section SceneObject (where image connections attach)"}
// @ui {"widget":"separator"}
// @ui {"widget":"group_start", "label":"3D Generation Settings"}
// @input bool refineMesh = true {"hint":"Whether to refine the mesh (higher quality, takes longer)"}
// @input bool useVertexColor {"hint":"Whether to use vertex colors"}
// @input float modelScale = 20 {"hint":"Scale factor for generated models (default: 20)"}
// @input bool makeInteractable = true {"hint":"Whether to make models draggable/interactable (enables movement)"}
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}
// @ui {"widget":"group_start", "label":"Output"}
// @input SceneObject modelRoot {"hint":"SceneObject root where the 3D model will be instantiated"}
// @input Asset.Material modelMaterial {"hint":"Material to apply to the 3D model (required for instantiation)"}
// @input Component.Text statusText {"hint":"Optional: Text component to show status/error messages"}
// @input SceneObject loadingIndicator {"hint":"Optional: SceneObject to show/hide as loading indicator"}
// @ui {"widget":"group_end"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/NodeSystem/Scripts/Process3DNode");
Object.setPrototypeOf(script, Module.Process3DNode.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("baseNode", []);
    checkUndefined("connectionMaterial", []);
    checkUndefined("refineMesh", []);
    checkUndefined("useVertexColor", []);
    checkUndefined("modelScale", []);
    checkUndefined("makeInteractable", []);
    checkUndefined("modelMaterial", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
