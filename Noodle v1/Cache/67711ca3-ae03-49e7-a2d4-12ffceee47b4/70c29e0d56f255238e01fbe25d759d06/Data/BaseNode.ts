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
    private _frameSize: vec2 = new vec2(10, 10);

    /**
     * Gets the frame size
     */
    public get frameSize(): vec2 {
        return this._frameSize;
    }

    /**
     * Sets the frame size and updates the Frame component
     */
    public set frameSize(size: vec2) {
        this._frameSize = size;
        // Update Frame component if it exists and is initialized
        if (this._frameComponent && this._frameComponent.roundedRectangle) {
            this._frameComponent.innerSize = size;
            print(`BaseNode: Updated frame size to ${size.x}x${size.y}`);
        }
    }

    @input
    @hint("Type identifier for this node")
    @widget(
        new ComboBoxWidget()
            .addItem("Text", "text")
            .addItem("Image", "image")
            .addItem("3D", "3d")
    )
    public nodeType: string = "text";

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

        // Get or create Frame component from sceneObject
        this._frameComponent = this.sceneObject.getComponent(Frame.getTypeName() as any) as Frame | null;

        if (!this._frameComponent) {
            // Auto-create Frame component if it doesn't exist
            this._frameComponent = this.sceneObject.createComponent(Frame.getTypeName() as any) as Frame;
            print(`BaseNode: Created Frame component automatically on ${this.sceneObject.name}`);
        } else {
            print(`BaseNode: Found existing Frame component on ${this.sceneObject.name}`);
        }

        // Disable auto show/hide so frame is always visible
        this._frameComponent.autoShowHide = false;

        // Disable scaling and auto-scaling content
        this._frameComponent.allowScaling = false;
        this._frameComponent.autoScaleContent = false;

        // Try to set innerSize - it will be set again after initialization to ensure it sticks
        // We wrap it in try-catch because Frame might not be initialized yet
        try {
            this._frameComponent.innerSize = this._frameSize;
            print(`BaseNode: Set frame size in onAwake to ${this._frameSize.x}x${this._frameSize.y}`);
        } catch (e) {
            // Frame not initialized yet - that's okay, we'll set it in configureAndShowFrame()
            print(`BaseNode: Frame not ready for size setting yet, will set after initialization`);
        }

        print(`BaseNode: Frame component ready - will configure size after initialization`);
    }

    onStart() {
        print(`BaseNode: onStart called for node ${this.nodeId}`);

        // Frame initializes on Start, so we wait for it then configure and show it
        if (this._frameComponent && !this._initialized) {
            // Try using Frame's onInitialized event first
            if (this._frameComponent.onInitialized) {
                print(`BaseNode: Using Frame's onInitialized event`);
                this._frameComponent.onInitialized.add(() => {
                    print(`BaseNode: Frame onInitialized event fired`);
                    this.configureAndShowFrame();
                });
            } else {
                print(`BaseNode: Frame onInitialized event not available, using UpdateEvent fallback`);
            }

            // Also set up UpdateEvent as fallback
            let frameCheckCount = 0;
            this.createEvent("UpdateEvent").bind(() => {
                if (this._frameComponent && !this._initialized) {
                    frameCheckCount++;

                    // Check if frame is initialized (has roundedRectangle)
                    if (this._frameComponent.roundedRectangle) {
                        print(`BaseNode: Frame initialized (check #${frameCheckCount}), configuring...`);
                        this.configureAndShowFrame();
                    } else if (frameCheckCount > 20) {
                        // After 20 frames, try to set size anyway
                        print(`BaseNode: Frame not fully initialized after 20 frames, attempting to configure anyway`);
                        this.configureAndShowFrame();
                    }
                }
            });
        } else {
            print(`BaseNode: Frame component not found or already initialized`);
        }
    }

    /**
     * Configures the frame size and makes it visible
     */
    private configureAndShowFrame(): void {
        if (this._frameComponent && !this._initialized) {
            try {
                // Set the frame size
                this._frameComponent.innerSize = this._frameSize;
                print(`BaseNode: Set frame size to ${this._frameSize.x}x${this._frameSize.y}`);

                // Make frame visible
                this.makeFrameVisible();
            } catch (e) {
                print(`BaseNode: Error configuring frame: ${e}`);
            }
        }
    }

    /**
     * Makes the frame visible
     */
    private makeFrameVisible(): void {
        if (this._frameComponent && !this._initialized) {
            // Make sure frame is visible
            if (typeof this._frameComponent.showVisual === 'function') {
                this._frameComponent.showVisual();
            }
            // Also set opacity directly to ensure visibility
            this._frameComponent.opacity = 1.0;
            this._initialized = true;
            print(`BaseNode: Frame made visible for node ${this.nodeId}`);
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

    /**
     * Checks if a world position is near the "out" connection point
     * @param worldPosition - The position to check
     * @param threshold - Distance threshold in meters (default: 0.05)
     * @returns true if the position is near the "out" point
     */
    isNearOutPoint(worldPosition: vec3, threshold: number = 0.05): boolean {
        const outPos = this.getOutConnectionPosition();
        const distance = outPos.sub(worldPosition).length;
        return distance < threshold;
    }

    /**
     * Checks if a world position is near the "in" connection point
     * @param worldPosition - The position to check
     * @param threshold - Distance threshold in meters (default: 0.05)
     * @returns true if the position is near the "in" point
     */
    isNearInPoint(worldPosition: vec3, threshold: number = 0.05): boolean {
        const inPos = this.getInConnectionPosition();
        const distance = inPos.sub(worldPosition).length;
        return distance < threshold;
    }
}
