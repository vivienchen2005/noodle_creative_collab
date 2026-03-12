@component
export class HoverScale extends BaseScriptComponent {

    @input('Component.ScriptComponent') pinchButtonScript: any;
    @input scaleAmount: number = 1.15;
    @input scaleSpeed:  number = 10.0;

    private tr:           Transform;
    private originalScale: vec3;
    private currentScale:  vec3;
    private targetScale:   vec3;
    private isReady:       boolean = false;

    onAwake(): void {
        this.tr = this.getSceneObject().getTransform();
        this.createEvent("OnStartEvent").bind(() => this.onStart());
        this.createEvent("UpdateEvent").bind(() => this.onUpdate());
    }

    private onStart(): void {
        this.originalScale = this.tr.getLocalScale();
        this.currentScale  = new vec3(this.originalScale.x, this.originalScale.y, this.originalScale.z);
        this.targetScale   = new vec3(this.originalScale.x, this.originalScale.y, this.originalScale.z);
        this.isReady       = true;

        if (!this.pinchButtonScript) {
            print("HoverScale: Drag PinchButton script into Inspector!");
            return;
        }

        const pb = this.pinchButtonScript as any;

        if (pb.onHoverEnter) {
            pb.onHoverEnter.add(() => {
                this.targetScale = new vec3(
                    this.originalScale.x * this.scaleAmount,
                    this.originalScale.y * this.scaleAmount,
                    this.originalScale.z * this.scaleAmount
                );
            });
        }

        if (pb.onHoverExit) {
            pb.onHoverExit.add(() => {
                this.targetScale = new vec3(
                    this.originalScale.x,
                    this.originalScale.y,
                    this.originalScale.z
                );
            });
        }
    }

    private onUpdate(): void {
        if (!this.isReady) return;
        const dt = getDeltaTime();
        const t  = Math.min(dt * this.scaleSpeed, 1);
        this.currentScale = new vec3(
            this.currentScale.x + (this.targetScale.x - this.currentScale.x) * t,
            this.currentScale.y + (this.targetScale.y - this.currentScale.y) * t,
            this.currentScale.z + (this.targetScale.z - this.currentScale.z) * t
        );
        this.tr.setLocalScale(this.currentScale);
    }
}