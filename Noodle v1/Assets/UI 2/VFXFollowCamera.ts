@component
export class VFXFollowCamera extends BaseScriptComponent {
  
  @input camera: Camera;
  @input distance: number = 100.0;

  private camTransform: Transform;
  private myTransform: Transform;

  onAwake() {
    this.camTransform = this.camera.getTransform();
    this.myTransform = this.getSceneObject().getTransform();

    const update = this.createEvent("UpdateEvent");
    update.bind(() => {
      const camPos = this.camTransform.getWorldPosition();
      const camForward = this.camTransform.forward;
      this.myTransform.setWorldPosition(
        camPos.add(camForward.uniformScale(this.distance))
      );
      this.myTransform.setWorldRotation(this.camTransform.getWorldRotation());
    });
  }
}