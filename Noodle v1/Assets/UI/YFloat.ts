@component
export class FloatY extends BaseScriptComponent {
  @input floatDistance: number = 3.0;
  @input floatSpeed: number = 1.5;

  private startY: number = 0;
  private elapsed: number = 0;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.startY = this.sceneObject.getTransform().getLocalPosition().y;
    });

    this.createEvent("UpdateEvent").bind(() => {
      this.elapsed += getDeltaTime() * this.floatSpeed;
      const transform = this.sceneObject.getTransform();
      const pos = transform.getLocalPosition();
      transform.setLocalPosition(new vec3(pos.x, this.startY + Math.sin(this.elapsed) * this.floatDistance, pos.z));
    });
  }
}