import { Frame } from "../../SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame";

/**
 * Base node component - a Frame with fixed size that has "in" and "out" connection points.
 * Connection points are positioned at the left center (in) and right center (out) of the frame.
 * These are reference positions for connections, not visible objects.
 */
@component
export class BaseNode extends BaseScriptComponent {
    @input
    @hint("The Frame component for this node")
    public frameComponent!: Frame;

    @input
    @hint("Fixed size for the frame (in centimeters)")
    public frameSize: vec2 = new vec2(20, 20);

    @input
    @hint("Type identifier for this node")
    public nodeType: string = "Base";

    @input
    @hint("Unique ID for this node (auto-generated if not set)")
    public nodeId: string = "";

    private _initialized: boolean = false;

    onAwake() {
        // Generate unique ID if not set
        if (!this.nodeId || this.nodeId === "") {
            this.nodeId = this.generateNodeId();
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
        if (this.frameComponent) {
            // Set fixed size
            this.frameComponent.innerSize = this.frameSize;
            // Initialize the frame if it has an initialize method
            if (typeof this.frameComponent.initialize === 'function') {
                this.frameComponent.initialize();
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
        if (!this.frameComponent) {
            return this.sceneObject.getTransform().getWorldPosition();
        }

        const transform = this.sceneObject.getTransform();
        const frameSize = this.frameComponent.innerSize;
        
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
        if (!this.frameComponent) {
            return this.sceneObject.getTransform().getWorldPosition();
        }

        const transform = this.sceneObject.getTransform();
        const frameSize = this.frameComponent.innerSize;
        
        // Right center position in local space
        const localOutPos = new vec3(frameSize.x / 2, 0, 0);
        
        // Convert to world position
        return transform.getWorldTransform().multiplyPoint(localOutPos);
    }

    /**
     * Gets the frame component
     */
    getFrame(): Frame {
        return this.frameComponent;
    }
}
