import { Frame } from "../../SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame";

/**
 * Base node component - a Frame with fixed size that has "in" and "out" connection points.
 * Connection points are positioned at the left center (in) and right center (out) of the frame.
 * These are reference positions for connections, not visible objects.
 */
@component
export class BaseNode extends BaseScriptComponent {
    @input
    @hint("Fixed size for the frame (in centimeters)")
    public frameSize: vec2 = new vec2(20, 20);

    @input
    @hint("Type identifier for this node")
    public nodeType: string = "Base";

    @input
    @hint("Unique ID for this node (auto-generated if not set)")
    public nodeId: string = "";

    private _frameComponent: Frame | null = null;
    private _initialized: boolean = false;

    onAwake() {
        // Generate unique ID if not set
        if (!this.nodeId || this.nodeId === "") {
            this.nodeId = this.generateNodeId();
        }

        // Get Frame component from sceneObject
        this._frameComponent = this.sceneObject.getComponent(Frame.getTypeName() as any) as Frame | null;

        if (!this._frameComponent) {
            print(`BaseNode: Warning - Frame component not found on ${this.sceneObject.name}`);
            return;
        }

        // Initialize frame if not already initialized
        if (!this._initialized) {
            this.initializeFrame();
            this._initialized = true;
        }
    }

    /**
     * Initializes the frame component
     */
    private initializeFrame(): void {
        if (this._frameComponent) {
            // Disable auto show/hide so frame is always visible
            this._frameComponent.autoShowHide = false;

            // Set fixed size
            this._frameComponent.innerSize = this.frameSize;

            // Initialize the frame if it has an initialize method
            if (typeof this._frameComponent.initialize === 'function') {
                this._frameComponent.initialize();
            }

            // Make sure frame is visible
            if (typeof this._frameComponent.showVisual === 'function') {
                this._frameComponent.showVisual();
            }
        }
    }

    /**
     * Generates a unique node ID
     */
    private generateNodeId(): string {
        return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Gets the node's unique ID
     */
    getNodeId(): string {
        return this.nodeId;
    }

    /**
     * Gets the node type
     */
    getNodeType(): string {
        return this.nodeType;
    }

    /**
     * Gets the "in" connection point position (left center of frame)
     * Returns world position
     */
    getInConnectionPosition(): vec3 {
        if (!this._frameComponent) {
            return this.sceneObject.getTransform().getWorldPosition();
        }

        const transform = this.sceneObject.getTransform();
        const frameSize = this._frameComponent.innerSize;

        // Left center position in local space
        const localInPos = new vec3(-frameSize.x / 2, 0, 0);

        // Convert to world position
        return transform.getWorldTransform().multiplyPoint(localInPos);
    }

    /**
     * Gets the "out" connection point position (right center of frame)
     * Returns world position
     */
    getOutConnectionPosition(): vec3 {
        if (!this._frameComponent) {
            return this.sceneObject.getTransform().getWorldPosition();
        }

        const transform = this.sceneObject.getTransform();
        const frameSize = this._frameComponent.innerSize;

        // Right center position in local space
        const localOutPos = new vec3(frameSize.x / 2, 0, 0);

        // Convert to world position
        return transform.getWorldTransform().multiplyPoint(localOutPos);
    }

    /**
     * Gets the frame component
     */
    getFrame(): Frame | null {
        return this._frameComponent;
    }
}
