// OldPlayer.ts
// Lens Studio TypeScript
// -------------------------------------------------------
// Slots:
//   button1      – first button SceneObject
//   button2      – second button SceneObject
//   page1        – SceneObject shown when button1 is tapped
//   page2        – SceneObject shown when button2 is tapped
//   currentPage  – the SceneObject this script lives on (hides when either button is tapped)
// -------------------------------------------------------

@component
export class OldPlayer extends BaseScriptComponent {

    @input button1: SceneObject;
    @input button2: SceneObject;
    @input page1: SceneObject;
    @input page2: SceneObject;
    @input currentPage: SceneObject;

    onAwake(): void {
        if (this.page1) this.page1.enabled = false;
        if (this.page2) this.page2.enabled = false;

        this.createEvent("OnStartEvent").bind(() => {
            this.addTapHandler(this.button1, () => {
                if (this.currentPage) this.currentPage.enabled = false;
                if (this.page1) this.page1.enabled = true;
                if (this.page2) this.page2.enabled = false;
                print("[OldPlayer] button1 tapped → page1 VISIBLE, currentPage HIDDEN");
            });

            this.addTapHandler(this.button2, () => {
                if (this.currentPage) this.currentPage.enabled = false;
                if (this.page1) this.page1.enabled = false;
                if (this.page2) this.page2.enabled = true;
                print("[OldPlayer] button2 tapped → page2 VISIBLE, currentPage HIDDEN");
            });
        });
    }

    private addTapHandler(obj: SceneObject, callback: () => void): void {
        if (!obj) return;
        const tapEvent = this.createEvent("TapEvent");
        tapEvent.bind(callback);
    }
}