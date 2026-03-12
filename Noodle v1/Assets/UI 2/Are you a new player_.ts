import { BaseButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/BaseButton";

@component
export class NewPlayerCheck extends BaseScriptComponent {

  @input yesButton: BaseButton;
  @input noButton: BaseButton;
  @input onboardingContainer: SceneObject;
  @input oldPlayer: SceneObject;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {

      // Log what we have
      print("=== NewPlayerCheck Init ===");
      print("yesButton: " + (this.yesButton ? this.yesButton.getSceneObject().name : "NULL"));
      print("noButton: " + (this.noButton ? this.noButton.getSceneObject().name : "NULL"));
      print("onboardingContainer: " + (this.onboardingContainer ? this.onboardingContainer.name : "NULL"));
      print("oldPlayer: " + (this.oldPlayer ? this.oldPlayer.name : "NULL"));

      // Hide both destinations
      if (this.onboardingContainer) this.onboardingContainer.enabled = false;
      if (this.oldPlayer) this.oldPlayer.enabled = false;

      if (this.yesButton && this.yesButton.onTriggerUp) {
        this.yesButton.onTriggerUp.add(() => {
          print(">>> YES PRESSED");
          this.sceneObject.enabled = false;
          if (this.onboardingContainer) this.onboardingContainer.enabled = true;
        });
      } else {
        print("!!! yesButton or onTriggerUp is NULL");
      }

      if (this.noButton && this.noButton.onTriggerUp) {
        this.noButton.onTriggerUp.add(() => {
          print(">>> NO PRESSED");
          this.sceneObject.enabled = false;
          if (this.oldPlayer) this.oldPlayer.enabled = true;
        });
      } else {
        print("!!! noButton or onTriggerUp is NULL");
      }

    });
  }
}