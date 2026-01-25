// SpawnPatch.js
// Spawns a prefab in front of the camera at a specified distance
//@input Asset.ObjectPrefab prefab {"label": "Prefab to Spawn"}
//@input float distance = 100.0 {"label": "Distance in Front (cm)"}
//@input Component.Camera camera {"label": "Camera (optional - uses scene camera if not set)"}
//@input SceneObject parentObject {"label": "Parent Object (optional)"}

function spawnPrefabInFront() {
    // Get camera - use input camera or find scene camera
    var camera = script.camera;
    
    if (!camera) {
        // Try to find camera in scene
        var rootObjects = global.scene.getRootObjectsCount();
        for (var i = 0; i < rootObjects; i++) {
            var rootObject = global.scene.getRootObject(i);
            var camComponent = rootObject.getComponent("Component.Camera");
            if (camComponent) {
                camera = camComponent;
                print("SpawnPatch: Found camera in scene: " + rootObject.name);
                break;
            }
        }
    }
    
    if (!camera) {
        print("SpawnPatch: ERROR - No camera found!");
        return null;
    }
    
    if (!script.prefab) {
        print("SpawnPatch: ERROR - No prefab assigned!");
        return null;
    }
    
    // Get camera transform
    var cameraTransform = camera.getSceneObject().getTransform();
    var cameraPosition = cameraTransform.getWorldPosition();
    var cameraForward = cameraTransform.getWorldForward();
    
    // Calculate spawn position (camera position + forward direction * distance)
    // Convert distance from cm to meters (Lens Studio uses meters)
    var distanceInMeters = script.distance / 100.0;
    var spawnPosition = cameraPosition.add(cameraForward.uniformScale(distanceInMeters));
    
    print("SpawnPatch: Camera position: " + cameraPosition.x + ", " + cameraPosition.y + ", " + cameraPosition.z);
    print("SpawnPatch: Camera forward: " + cameraForward.x + ", " + cameraForward.y + ", " + cameraForward.z);
    print("SpawnPatch: Spawning prefab at: " + spawnPosition.x + ", " + spawnPosition.y + ", " + spawnPosition.z);
    
    // Instantiate prefab
    var parent = script.parentObject || script.sceneObject;
    var instance = script.prefab.instantiate(parent);
    
    // Set position
    instance.getTransform().setWorldPosition(spawnPosition);
    
    // Optionally face the camera (or face away from camera)
    // Uncomment the line below if you want the prefab to face the camera
    // var lookAtRotation = quat.lookAt(spawnPosition, cameraPosition, vec3.up());
    // instance.getTransform().setWorldRotation(lookAtRotation);
    
    print("SpawnPatch: Prefab spawned successfully!");
    return instance;
}

// Public function to spawn prefab
script.spawn = function() {
    return spawnPrefabInFront();
};

// Auto-spawn on start (optional - comment out if you want manual control)
// script.createEvent("OnStartEvent").bind(function() {
//     spawnPrefabInFront();
// });
