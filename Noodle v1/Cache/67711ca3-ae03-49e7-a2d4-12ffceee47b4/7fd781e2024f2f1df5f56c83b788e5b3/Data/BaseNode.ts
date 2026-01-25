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

        // Ensure sceneObject is enabled
        this.sceneObject.enabled = true;

        // Get Frame component from sceneObject
        this._frameComponent = this.sceneObject.getComponent(Frame.getTypeName() as any) as Frame | null;

        if (!this._frameComponent) {
            print(`BaseNode: ERROR - Frame component not found on ${this.sceneObject.name}. Make sure Frame component is added to the same SceneObject.`);
            return;
        }

        print(`BaseNode: Found Frame component on ${this.sceneObject.name}`);

        // Disable auto show/hide so frame is always visible
        this._frameComponent.autoShowHide = false;
        
        // Set fixed size
        this._frameComponent.innerSize = this.frameSize;
        
        print(`BaseNode: Configured Frame - autoShowHide=false, size=${this.frameSize.x}x${this.frameSize.y}`);
    }

    onStart() {
        print(`BaseNode: onStart called for node ${this.nodeId}`);
        
        // Frame initializes on Start, so we wait a few frames then show it
        let frameCheckCount = 0;
        this.createEvent("UpdateEvent").bind(() => {
            if (this._frameComponent && !this._initialized) {
                frameCheckCount++;
                
                // Check if frame is initialized (has roundedRectangle)
                if (this._frameComponent.roundedRectangle) {
                    print(`BaseNode: Frame initialized, making visible (check #${frameCheckCount})`);
                    this.makeFrameVisible();
                } else if (frameCheckCount > 10) {
                    // After 10 frames, try to show anyway
                    print(`BaseNode: Frame not fully initialized after 10 frames, attempting to show anyway`);
                    this.makeFrameVisible();
                }
            }
        });
    }

    /**
     * Makes the frame visible
     */
    private makeFrameVisible(): void {
        if (this._frameComponent && !this._initialized) {
            print(`BaseNode: Making frame visible for node ${this.nodeId}`);
            
            // Make sure frame is visible
            if (typeof this._frameComponent.showVisual === 'function') {
                this._frameComponent.showVisual();
                print(`BaseNode: Called showVisual()`);
            }
            
            // Also set opacity directly to ensure visibility
            this._frameComponent.opacity = 1.0;
            print(`BaseNode: Set opacity to 1.0`);
            
            this._initialized = true;
            print(`BaseNode: Frame visibility setup complete for node ${this.nodeId}`);
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
