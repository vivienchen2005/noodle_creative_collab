@component
export class SplashScreenController extends BaseScriptComponent {

  @input vfxObject: SceneObject;
  @input splashRoot: SceneObject;
  @input mainRoot: SceneObject;
  @input toggleGroup: SceneObject;
  @input vfxAudio: AudioComponent;
  @input fadeDuration: number = 3.0;

  private fading: boolean = false;
  private fadeStartTime: number = 0;

  onAwake() {
    const initEvent = this.createEvent("UpdateEvent");
    let initialized = false;

    initEvent.bind(() => {
      if (initialized) return;
      initialized = true;

      this.splashRoot.enabled = true;
      this.mainRoot.enabled = false;
      this.toggleGroup.enabled = false;

      if (this.vfxAudio) {
        this.vfxAudio.volume = 1;
      }

      const waitEvent = this.createEvent("DelayedCallbackEvent");
      waitEvent.bind(() => this.startFade());
      waitEvent.reset(3.0);
    });
  }

  startFade() {
    this.mainRoot.enabled = true;
    this.toggleGroup.enabled = true;

    this.traverseOpacity(this.mainRoot, 0);
    this.traverseOpacity(this.toggleGroup, 0);

    this.fading = true;
    this.fadeStartTime = getTime();

    if (this.vfxObject) {
      this.vfxObject.enabled = false;
    }

    const updateEvent = this.createEvent("UpdateEvent");
    updateEvent.bind(() => {
      if (!this.fading) return;

      const raw = (getTime() - this.fadeStartTime) / this.fadeDuration;
      const clampedT = Math.min(1, Math.max(0, raw));
      const eased = this.easeInOut(clampedT);

      this.traverseOpacity(this.splashRoot, 1 - eased);
      this.traverseOpacity(this.mainRoot, eased);

      const toggleT = Math.min(1, Math.max(0, (clampedT - 0.4) / 0.6));
      this.traverseOpacity(this.toggleGroup, this.easeInOut(toggleT));

      if (this.vfxAudio) {
        this.vfxAudio.volume = Math.max(0, 1 - eased);
      }

      if (clampedT >= 1) {
        this.fading = false;
        this.splashRoot.enabled = false;
        this.traverseOpacity(this.mainRoot, 1);
        this.traverseOpacity(this.toggleGroup, 1);
        if (this.vfxAudio) {
          this.vfxAudio.volume = 0;
        }
      }
    });
  }

  easeInOut(t: number): number {
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  traverseOpacity(obj: SceneObject, alpha: number) {
    if (!obj) return;

    // Image
    const image = obj.getComponent("Component.Image") as any;
    if (image && image.mainPass) {
      const c = image.mainPass.baseColor;
      if (c) {
        image.mainPass.baseColor = new vec4(c.r, c.g, c.b, alpha);
      } else {
        image.mainPass.baseColor = new vec4(1, 1, 1, alpha);
      }
    }

    // Text
    const text = obj.getComponent("Component.Text") as any;
    if (text && text.textFill) {
      const c = text.textFill.color;
      if (c) {
        text.textFill.color = new vec4(c.r, c.g, c.b, alpha);
      } else {
        text.textFill.color = new vec4(1, 1, 1, alpha);
      }
    }

    // Mesh
    const mesh = obj.getComponent("Component.MeshVisual") as any;
    if (mesh) {
      const mat = mesh.getMaterial(0);
      if (mat && mat.mainPass) {
        const c = mat.mainPass.baseColor;
        if (c) {
          mat.mainPass.baseColor = new vec4(c.r, c.g, c.b, alpha);
        } else {
          mat.mainPass.baseColor = new vec4(1, 1, 1, alpha);
        }
      }
    }

    for (let i = 0; i < obj.getChildrenCount(); i++) {
      this.traverseOpacity(obj.getChild(i), alpha);
    }
  }
}