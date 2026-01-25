import { Frame } from "SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame";

/**
 * Base class for all node types in the visual programming system.
 * Each node is built on a Frame component and has "in" and "out" connection points.
 */
@component
export class BaseNode extends BaseScriptComponent {
    @input
    @hint("The Frame component for this node")
    public frameComponent!: Frame;

    @input
    @hint("Type identifier for this node (Image, Text, AI, 3D, etc.)")
    public nodeType: string = "Base";

    @input
    @hint("Unique ID for this node (auto-generated if not set)")
    public nodeId: string = "";

    @input
    @hint("The 'in' connection point SceneObject")
    public inConnectionPoint!: SceneObject;

    @input
    @hint("The 'out' connection point SceneObject")
    public outConnectionPoint!: SceneObject;

    @input
    @hint("Whether this node has an 'in' connection point")
    public hasInPoint: boolean = true;

    @input
    @hint("Whether this node has an 'out' connection point")
    public hasOutPoint: boolean = true;

    private _initialized: boolean = false;

    onAwake() {
        // Generate unique ID if not set
        if (!this.nodeId || this.nodeId === "") {
            this.nodeId = this.generateNodeId();
        }

        // Initialize connection points if they don't exist
        if (!this._initialized) {
            this.initializeConnectionPoints();
            this._initialized = true;
        }
    }

    /**
     * Initializes the connection point SceneObjects if they don't exist
     */
    private initializeConnectionPoints(): void {
        if (this.hasInPoint && !this.inConnectionPoint) {
            this.inConnectionPoint = global.scene.createSceneObject("InPoint");
            this.inConnectionPoint.setParent(this.sceneObject);
            this.inConnectionPoint.getTransform().setLocalPosition(new vec3(-0.5, 0, 0));
        }

        if (this.hasOutPoint && !this.outConnectionPoint) {
            this.outConnectionPoint = global.scene.createSceneObject("OutPoint");
            this.outConnectionPoint.setParent(this.sceneObject);
            this.outConnectionPoint.getTransform().setLocalPosition(new vec3(0.5, 0, 0));
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
     * Gets the 'in' connection point
     */
    getInConnectionPoint(): SceneObject | null {
        return this.hasInPoint ? this.inConnectionPoint : null;
    }

    /**
     * Gets the 'out' connection point
     */
    getOutConnectionPoint(): SceneObject | null {
        return this.hasOutPoint ? this.outConnectionPoint : null;
    }

    /**
     * Called when a connection is added to this node
     */
    onConnectionAdded(isIncoming: boolean): void {
        // Override in subclasses if needed
    }

    /**
     * Called when a connection is removed from this node
     */
    onConnectionRemoved(isIncoming: boolean): void {
        // Override in subclasses if needed
    }

    /**
     * Serializes this node's data for saving
     */
    serialize(): any {
        const transform = this.sceneObject.getTransform();
        const position = transform.getWorldPosition();
        const rotation = transform.getWorldRotation();

        return {
            nodeId: this.nodeId,
            nodeType: this.nodeType,
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            rotation: {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z,
                w: rotation.w
            },
            hasInPoint: this.hasInPoint,
            hasOutPoint: this.hasOutPoint
        };
    }

    /**
     * Deserializes node data and applies it
     */
    deserialize(data: any): void {
        if (data.nodeId) {
            this.nodeId = data.nodeId;
        }
        if (data.nodeType) {
            this.nodeType = data.nodeType;
        }
        if (data.position) {
            const transform = this.sceneObject.getTransform();
            transform.setWorldPosition(new vec3(data.position.x, data.position.y, data.position.z));
        }
        if (data.rotation) {
            const transform = this.sceneObject.getTransform();
            transform.setWorldRotation(new quat(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w));
        }
    }
}
