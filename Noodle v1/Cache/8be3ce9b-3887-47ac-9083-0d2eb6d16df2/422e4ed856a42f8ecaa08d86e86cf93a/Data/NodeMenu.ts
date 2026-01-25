import { getNodeTypeRegistry } from "./NodeTypeRegistry";
import { Frame } from "SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame";

/**
 * UI component that appears when releasing a dragged connection.
 * Shows available node types and allows user to select one to create.
 */
@component
export class NodeMenu extends BaseScriptComponent {
    @input
    @hint("Frame component for the menu UI")
    public menuFrame!: Frame;

    @input
    @hint("Position where the menu should appear")
    public menuPosition: vec3 = new vec3(0, 0, 0);

    @input
    @hint("Distance from release position to show menu")
    public menuDistance: number = 0.3;

    private nodeTypeRegistry = getNodeTypeRegistry();
    private selectedNodeType: string | null = null;
    private isVisible: boolean = false;

    // Event callbacks
    public onNodeTypeSelected: SceneEvent = this.createEvent("OnStartEvent");

    onAwake() {
        // Initialize menu as hidden
        if (this.menuFrame) {
            this.menuFrame.sceneObject.enabled = false;
        }
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
            this.isVisible = true;
        }

        // TODO: Populate menu with available node types
        // This would typically create UI buttons for each node type
        this.populateMenuOptions();
        
        print(`NodeMenu: Showing menu at position ${position}`);
    }

    /**
     * Hides the menu
     */
    hideMenu(): void {
        if (this.menuFrame) {
            this.menuFrame.sceneObject.enabled = false;
        }
        this.isVisible = false;
        this.selectedNodeType = null;
        print("NodeMenu: Hiding menu");
    }

    /**
     * Populates the menu with available node type options
     */
    private populateMenuOptions(): void {
        const availableTypes = this.nodeTypeRegistry.getAvailableNodeTypes();
        print(`NodeMenu: Available node types: ${availableTypes.join(", ")}`);
        
        // TODO: Create UI buttons for each node type
        // This would typically:
        // 1. Create button SceneObjects for each type
        // 2. Set up click/tap handlers
        // 3. Call selectNodeType() when clicked
    }

    /**
     * Selects a node type and triggers creation
     */
    selectNodeType(nodeType: string): void {
        if (!this.nodeTypeRegistry.isNodeTypeRegistered(nodeType)) {
            print(`NodeMenu: Node type "${nodeType}" is not registered`);
            return;
        }

        this.selectedNodeType = nodeType;
        this.onNodeTypeSelected.invoke(nodeType);
        this.hideMenu();
        
        print(`NodeMenu: Selected node type "${nodeType}"`);
    }

    /**
     * Gets the selected node type
     */
    getSelectedNodeType(): string | null {
        return this.selectedNodeType;
    }

    /**
     * Checks if the menu is visible
     */
    isMenuVisible(): boolean {
        return this.isVisible;
    }

    /**
     * Gets the menu position
     */
    getMenuPosition(): vec3 {
        return this.menuPosition;
    }
}
