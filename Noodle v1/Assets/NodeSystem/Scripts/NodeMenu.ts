import { Frame } from "SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

/**
 * UI component that appears when releasing a dragged connection.
 * TODO: Will be implemented step by step
 */
@component
export class NodeMenu extends BaseScriptComponent {
    @input
    @hint("Frame component for the menu UI")
    public menuFrame!: Frame;

    @input
    @hint("Position where the menu should appear")
    public menuPosition: vec3 = new vec3(0, 0, 0);

    // Event callbacks
    public onNodeTypeSelected: Event<string>;

    onAwake() {
        // Initialize Event
        this.onNodeTypeSelected = new Event<string>();
        
        // Initialize menu as hidden
        if (this.menuFrame) {
            this.menuFrame.sceneObject.enabled = false;
        }
        print("NodeMenu: Initialized (minimal version - will be expanded step by step)");
    }

    /**
     * Shows the menu at the specified position
     */
    showMenu(position: vec3): void {
        this.menuPosition = position;
        
        if (this.menuFrame) {
            const transform = this.menuFrame.sceneObject.getTransform();
            transform.setWorldPosition(position);
            this.menuFrame.sceneObject.enabled = true;
        }
        
        print(`NodeMenu: Showing menu at position ${position} - TODO: populate with node types`);
    }

    /**
     * Hides the menu
     */
    hideMenu(): void {
        if (this.menuFrame) {
            this.menuFrame.sceneObject.enabled = false;
        }
        print("NodeMenu: Hiding menu");
    }
}
