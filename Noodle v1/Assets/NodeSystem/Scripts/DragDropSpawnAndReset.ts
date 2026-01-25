// DragDropSpawnAndReset - Event-based approach
import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class DragDropSpawnAndReset extends BaseScriptComponent {
    @input
    spawnPrefab: ObjectPrefab;

    @input
    @allowUndefined
    spawnParent: SceneObject;

    @input
    useLocalPosition: boolean = false;

    @input
    @widget(
        new ComboBoxWidget()
            .addItem("Inherit from dragged object", "inherit")
            .addItem("Face the user", "faceUser")
            .addItem("Use prefab default", "prefabDefault")
    )
    spawnRotationMode: string = "inherit";

    @input
    @allowUndefined
    camera: Camera;

    @input
    @hint("Animate spawned item scaling up")
    animateSpawn: boolean = true;

    @input
    @hint("Duration of scale animation in seconds")
    animationDuration: number = 0.3;

    private originalPos: vec3;
    private originalRot: quat;
    private originalScale: vec3;
    private tr: Transform;
    private interactable: Interactable;

    onAwake() {
        print("DragDrop: onAwake");
        this.tr = this.sceneObject.getTransform();
        
        // Get Interactable
        this.interactable = this.sceneObject.getComponent(Interactable.getTypeName());
        if (!this.interactable) {
            print("DragDrop: ERROR - No Interactable found!");
            return;
        }
        print("DragDrop: Found Interactable");
        
        // Set up events
        this.createEvent("OnStartEvent").bind(() => this.setup());
    }

    private setup() {
        print("DragDrop: setup()");
        this.cacheOriginalTransform();
        
        // Listen for drag end
        this.interactable.onDragEnd.add(() => {
            print("DragDrop: onDragEnd fired!");
            this.onReleased();
        });
        
        print("DragDrop: Listening for onDragEnd");
    }

    private cacheOriginalTransform() {
        if (this.useLocalPosition) {
            this.originalPos = this.tr.getLocalPosition();
            this.originalRot = this.tr.getLocalRotation();
            this.originalScale = this.tr.getLocalScale();
        } else {
            this.originalPos = this.tr.getWorldPosition();
            this.originalRot = this.tr.getWorldRotation();
            this.originalScale = this.tr.getWorldScale();
        }
        print("DragDrop: Cached position");
    }

    private onReleased() {
        const dropPos = this.tr.getWorldPosition();
        const dropRot = this.tr.getWorldRotation();
        
        print("DragDrop: Released at " + dropPos.toString());
        
        // Spawn
        this.spawnAt(dropPos, dropRot);
        
        // Reset after short delay
        const delayed = this.createEvent("DelayedCallbackEvent");
        delayed.bind(() => this.resetPosition());
        delayed.reset(0.1);
    }

    private spawnAt(pos: vec3, rot: quat) {
        if (!this.spawnPrefab) {
            print("DragDrop: No prefab assigned");
            return;
        }
        
        const instance = this.spawnPrefab.instantiate(this.spawnParent || null);
        const instTr = instance.getTransform();
        instTr.setWorldPosition(pos);
        instTr.setWorldRotation(this.getSpawnRotation(pos, rot));
        
        if (this.animateSpawn) {
            this.animateScaleIn(instTr);
        }
        
        print("DragDrop: Spawned prefab");
    }

    private animateScaleIn(tr: Transform) {
        const targetScale = tr.getLocalScale();
        const startScale = vec3.zero();
        const duration = this.animationDuration;
        let elapsed = 0;
        
        // Start at zero scale
        tr.setLocalScale(startScale);
        
        // Animate using UpdateEvent
        const updateEvent = this.createEvent("UpdateEvent");
        updateEvent.bind(() => {
            elapsed += getDeltaTime();
            const t = Math.min(elapsed / duration, 1);
            
            // Ease out cubic: 1 - (1-t)^3
            const eased = 1 - Math.pow(1 - t, 3);
            
            const currentScale = vec3.lerp(startScale, targetScale, eased);
            tr.setLocalScale(currentScale);
            
            if (t >= 1) {
                tr.setLocalScale(targetScale); // Ensure exact final scale
                updateEvent.enabled = false;
            }
        });
    }

    private getSpawnRotation(pos: vec3, draggedRot: quat): quat {
        if (this.spawnRotationMode === "faceUser") {
            const cam = this.camera?.getSceneObject() || this.findCamera();
            if (cam) {
                const dir = cam.getTransform().getWorldPosition().sub(pos).normalize();
                return quat.lookAt(dir, vec3.up());
            }
        } else if (this.spawnRotationMode === "prefabDefault") {
            return quat.quatIdentity();
        }
        return draggedRot;
    }

    private findCamera(): SceneObject | null {
        const count = global.scene.getRootObjectsCount();
        for (let i = 0; i < count; i++) {
            const found = this.searchCamera(global.scene.getRootObject(i));
            if (found) return found;
        }
        return null;
    }

    private searchCamera(obj: SceneObject): SceneObject | null {
        if (obj.getComponent("Component.Camera")) return obj;
        for (let i = 0; i < obj.getChildrenCount(); i++) {
            const found = this.searchCamera(obj.getChild(i));
            if (found) return found;
        }
        return null;
    }

    private resetPosition() {
        print("DragDrop: Resetting position");
        if (this.useLocalPosition) {
            this.tr.setLocalPosition(this.originalPos);
            this.tr.setLocalRotation(this.originalRot);
            this.tr.setLocalScale(this.originalScale);
        } else {
            this.tr.setWorldPosition(this.originalPos);
            this.tr.setWorldRotation(this.originalRot);
            this.tr.setWorldScale(this.originalScale);
        }
    }

    public recachePosition() {
        this.cacheOriginalTransform();
    }
}
