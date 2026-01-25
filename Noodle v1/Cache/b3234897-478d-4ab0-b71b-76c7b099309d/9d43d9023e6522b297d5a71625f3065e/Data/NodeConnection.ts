import { InteractiveBezierCurve } from "./InteractiveBezierCurve";
import { ConnectionPoint } from "./ConnectionPoint";
import { BaseNode } from "./BaseNode";

/**
 * Manages a connection between two nodes.
 * Contains an InteractiveBezierCurve component and tracks source/target connection points.
 */
@component
export class NodeConnection extends BaseScriptComponent {
    @input
    @hint("Source connection point (where connection starts)")
    public sourcePoint!: SceneObject;

    @input
    @hint("Target connection point (where connection ends, null if not connected)")
    public targetPoint!: SceneObject | null;

    @input
    @hint("The InteractiveBezierCurve component for this connection")
    public bezierCurve!: InteractiveBezierCurve;

    @input
    @hint("Material for the connection line")
    private lineMaterial!: Material;

    private connectionId: string = "";
    private isTemporary: boolean = false;

    onAwake() {
        // Generate unique connection ID
        this.connectionId = this.generateConnectionId();

        // Initialize bezier curve if not provided
        if (!this.bezierCurve) {
            this.initializeBezierCurve();
        }

        // Set up event listeners
        if (this.bezierCurve) {
            this.bezierCurve.onReleaseAtPosition.add((position: vec3) => {
                this.onCurveReleased(position);
            });
        }
    }

    /**
     * Initializes the bezier curve component
     */
    private initializeBezierCurve(): void {
        // Create a child SceneObject for the curve
        const curveObject = global.scene.createSceneObject("BezierCurve");
        curveObject.setParent(this.sceneObject);
        
        // Add InteractiveBezierCurve component
        this.bezierCurve = curveObject.createComponent(InteractiveBezierCurve.getTypeName()) as InteractiveBezierCurve;
        
        // Set up the curve
        if (this.sourcePoint) {
            this.bezierCurve.startPoint = this.sourcePoint;
        }
        
        // If target point exists, use it; otherwise use temporary point
        if (this.targetPoint) {
            this.bezierCurve.endPoint = this.targetPoint;
        } else {
            // Will be set when dragging starts
            this.isTemporary = true;
        }

        // Set material if provided
        if (this.lineMaterial) {
            this.bezierCurve.lineMaterial = this.lineMaterial;
        }
    }

    /**
     * Generates a unique connection ID
     */
    private generateConnectionId(): string {
        return `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Gets the connection ID
     */
    getConnectionId(): string {
        return this.connectionId;
    }

    /**
     * Sets the source connection point
     */
    setSourcePoint(point: SceneObject): void {
        this.sourcePoint = point;
        if (this.bezierCurve) {
            this.bezierCurve.startPoint = point;
        }
    }

    /**
     * Sets the target connection point
     */
    setTargetPoint(point: SceneObject | null): void {
        this.targetPoint = point;
        if (this.bezierCurve && point) {
            this.bezierCurve.endPoint = point;
            this.isTemporary = false;
        }
    }

    /**
     * Gets the source connection point
     */
    getSourcePoint(): SceneObject {
        return this.sourcePoint;
    }

    /**
     * Gets the target connection point
     */
    getTargetPoint(): SceneObject | null {
        return this.targetPoint;
    }

    /**
     * Checks if this is a temporary connection (not yet connected to target)
     */
    isTemporaryConnection(): boolean {
        return this.isTemporary || this.targetPoint === null;
    }

    /**
     * Called when the curve is released at a position
     */
    private onCurveReleased(position: vec3): void {
        print(`NodeConnection: Curve released at position ${position}`);
        // This will trigger the NodeManager to show the node creation menu
        // The NodeManager will handle creating a new node and connecting it
    }

    /**
     * Starts dragging this connection
     */
    startDragging(): void {
        if (this.bezierCurve) {
            this.bezierCurve.startDragging();
        }
    }

    /**
     * Stops dragging this connection
     */
    stopDragging(): void {
        if (this.bezierCurve) {
            this.bezierCurve.stopDragging();
        }
    }

    /**
     * Serializes this connection for saving
     */
    serialize(): any {
        // Get connection point components to find parent nodes
        const sourcePointComp = this.sourcePoint.getComponent(ConnectionPoint.getTypeName()) as ConnectionPoint;
        const targetPointComp = this.targetPoint?.getComponent(ConnectionPoint.getTypeName()) as ConnectionPoint;

        return {
            connectionId: this.connectionId,
            sourceNodeId: sourcePointComp?.parentNode?.getComponent("BaseNode")?.getNodeId() || "",
            sourcePointType: sourcePointComp?.getPointType() || "out",
            targetNodeId: targetPointComp?.parentNode?.getComponent("BaseNode")?.getNodeId() || "",
            targetPointType: targetPointComp?.getPointType() || "in"
        };
    }

    /**
     * Destroys this connection
     */
    destroyConnection(): void {
        // Remove from connection points
        const sourcePointComp = this.sourcePoint.getComponent(ConnectionPoint.getTypeName()) as ConnectionPoint;
        const targetPointComp = this.targetPoint?.getComponent(ConnectionPoint.getTypeName()) as ConnectionPoint;

        if (sourcePointComp) {
            sourcePointComp.removeConnection(this.sceneObject);
        }
        if (targetPointComp) {
            targetPointComp.removeConnection(this.sceneObject);
        }

        // Destroy the scene object
        this.sceneObject.destroy();
    }

    onDestroy(): void {
        this.destroyConnection();
    }
}
