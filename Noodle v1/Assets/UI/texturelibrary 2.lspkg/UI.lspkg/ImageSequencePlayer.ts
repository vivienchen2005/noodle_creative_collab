@component
export class ImageSequencePlayer extends BaseScriptComponent {

  @input images: SceneObject[] = [];
  @input displayTime: number = 3.5;
  @input fadeDuration: number = 0.3;
  @input loopSequence: boolean = false;
  @input startAutomatically: boolean = false;
  @input onboardingContainer: SceneObject;
  @input onboardingFrame: SceneObject;

  private currentIndex: number = 0;
  private isFading: boolean = false;
  private fadeStartTime: number = 0;
  private fadeIn: boolean = false;
  private stopped: boolean = false;

  onAwake() {
    for (const img of this.images) {
      if (img) img.enabled = false;
    }

    if (this.startAutomatically) {
      this.createEvent("OnStartEvent").bind(() => {
        if (this.onboardingContainer && this.onboardingContainer.enabled) {
          this.startSequence();
        }
      });
    }
  }

  public startSequence() {
    if (this.images.length === 0) return;
    this.stopped = false;
    this.currentIndex = 0;
    this.showImage(0);
    this.createEvent("UpdateEvent").bind(() => this.onUpdate());
  }

  public stopSequence() {
    this.stopped = true;
    this.isFading = false;
    for (const img of this.images) {
      if (img) img.enabled = false;
    }
  }

  public showImage(index: number) {
    if (this.stopped) return;

    if (index >= this.images.length) {
      if (this.loopSequence) {
        this.currentIndex = 0;
        this.showImage(0);
      } else {
        if (this.onboardingContainer) {
          this.onboardingContainer.enabled = false;
        }
      }
      return;
    }

    const img = this.images[index];
    if (img) {
      img.enabled = true;
      this.setImageAlpha(img, 0);
    }

    this.isFading = true;
    this.fadeIn = true;
    this.fadeStartTime = getTime();
  }

  public onUpdate() {
    if (!this.isFading || this.stopped) return;

    const t = Math.min(1, (getTime() - this.fadeStartTime) / this.fadeDuration);
    const alpha = this.fadeIn ? t : 1 - t;

    const img = this.images[this.currentIndex];
    if (img) this.setImageAlpha(img, alpha);

    if (t >= 1) {
      this.isFading = false;

      if (this.fadeIn) {
        // If this is the last image and we're not looping,
        // keep it visible forever
        if (this.currentIndex === this.images.length - 1 && !this.loopSequence) {
          if (this.onboardingFrame) {
            this.onboardingFrame.enabled = false;
          }
          this.isFading = false;
          return;
        }

        const holdEvent = this.createEvent("DelayedCallbackEvent");
        holdEvent.bind(() => {
          if (this.stopped) return;
          this.isFading = true;
          this.fadeIn = false;
          this.fadeStartTime = getTime();
        });
        holdEvent.reset(this.displayTime);
      } else {
        if (img) img.enabled = false;
        this.currentIndex++;
        this.showImage(this.currentIndex);
      }
    }
  }

  public setImageAlpha(obj: SceneObject, alpha: number) {
    const image = obj.getComponent("Component.Image") as any;
    if (image && image.mainPass) {
      const c = image.mainPass.baseColor;
      if (c) {
        image.mainPass.baseColor = new vec4(c.r, c.g, c.b, alpha);
      }
    }
  }
}