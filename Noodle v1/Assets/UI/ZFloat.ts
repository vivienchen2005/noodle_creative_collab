@component
export class ZFloat extends BaseScriptComponent {

    @input phaseOffset:  number = 0.0;
    @input rockDegrees:  number = 8.0;
    @input rockSpeed:    number = 0.8;

    // Push the card this many units in front of the panel
    // so rotation doesn't clip into the background
    @input zOffset:      number = 5.0;

    private tr:          Transform;
    private originalRot: quat;
    private phase:       number  = 0;
    private isReady:     boolean = false;

    onAwake(): void {
        this.tr = this.getSceneObject().getTransform();
        this.createEvent("OnStartEvent").bind(() => {
            const originalPos    = this.tr.getLocalPosition();

            // Push card forward on Z at start
            this.tr.setLocalPosition(new vec3(
                originalPos.x,
                originalPos.y,
                originalPos.z + this.zOffset
            ));

            this.originalRot = this.tr.getLocalRotation();
            this.phase       = this.phaseOffset;
            this.isReady     = true;
        });
        this.createEvent("UpdateEvent").bind(() => this.onUpdate());
    }

    private onUpdate(): void {
        if (!this.isReady) return;
        this.phase += getDeltaTime() * this.rockSpeed;

        const maxRad    = this.rockDegrees * (Math.PI / 180);
        const rockAngle = Math.sin(this.phase) * maxRad;
        const rockQuat  = quat.angleAxis(rockAngle, new vec3(0, 1, 0));

        this.tr.setLocalRotation(this.originalRot.multiply(rockQuat));
    }
}