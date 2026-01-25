import { BezierCurve } from "../../RuntimeGizmos.lspkg/Scripts/BezierCurve";
import { BaseNode } from "./BaseNode";

/**
 * Connection line component that draws a bezier curve between two nodes.
 * The line connects from one node's "out" point to another node's "in" point.
 */
@component
export class ConnectionLine extends BaseScriptComponent {
    @input
    @hint("Source node (where connection starts)")
    public sourceNode!: SceneObject;

    @input
    @hint("Target node (where connection ends, null if dragging)")
    public targetNode: SceneObject | null = null;

    @input
    @hint("Material for the connection line")
    public lineMaterial: Material | null = null;

    @input
    @hint("Curve height for the bezier curve")
    public curveHeight: number = 0.1;

    private bezierCurve: BezierCurve | null = null;
    private startPointObject: SceneObject | null = null;
    private endPointObject: SceneObject | null = null;
    private isDragging: boolean = false;

    onAwake() {
        // Create SceneObjects for start and end points
        this.startPointObject = global.scene.createSceneObject("ConnectionStartPoint");
        this.endPointObject = global.scene.createSceneObject("ConnectionEndPoint");
        
        // Create BezierCurve component
        const curveObject = global.scene.createSceneObject("BezierCurve");
        curveObject.setParent(this.sceneObject);
        this.bezierCurve = curveObject.createComponent(BezierCurve.getTypeName() as any) as BezierCurve;
        
        if (this.bezierCurve) {
            // Set start and end points
            this.bezierCurve.startPoint = this.startPointObject;
            this.bezierCurve.endPoint = this.endPointObject;
            
            // Set material if provided
            if (this.lineMaterial) {
                this.bezierCurve.lineMaterial = this.lineMaterial;
            }
            
            // Configure curve
            this.bezierCurve.curveHeight = this.curveHeight;
            this.bezierCurve.isEnabled = true;
        }
        
        // Update connection points
        this.updateConnectionPoints();
    }

    onStart() {
        // Update connection points after initialization
        this.createEvent("UpdateEvent").bind(() => {
            this.updateConnectionPoints();
        });
    }

    /**
     * Updates the connection point positions based on source and target nodes
     */
    private updateConnectionPoints(): void {
        if (!this.startPointObject || !this.endPointObject || !this.bezierCurve) {
            return;
        }

        // Get source node's "out" position
        if (this.sourceNode) {
            const sourceBaseNode = this.sourceNode.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (sourceBaseNode) {
                const outPos = sourceBaseNode.getOutConnectionPosition();
                this.startPointObject.getTransform().setWorldPosition(outPos);
            }
        }

        // Get target node's "in" position (or use current end point if dragging)
        if (this.targetNode && !this.isDragging) {
            const targetBaseNode = this.targetNode.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (targetBaseNode) {
                const inPos = targetBaseNode.getInConnectionPosition();
                this.endPointObject.getTransform().setWorldPosition(inPos);
            }
        }
        // If dragging, endPointObject position is updated externally
    }

    /**
     * Starts dragging the connection (when user grabs the "out" point)
     */
    startDragging(dragPosition: vec3): void {
        this.isDragging = true;
        if (this.endPointObject) {
            this.endPointObject.getTransform().setWorldPosition(dragPosition);
        }
        print("ConnectionLine: Started dragging");
    }

    /**
     * Updates the drag position (while user is dragging)
     */
    updateDragPosition(position: vec3): void {
        if (this.isDragging && this.endPointObject) {
            this.endPointObject.getTransform().setWorldPosition(position);
        }
    }

    /**
     * Stops dragging and connects to target node
     */
    stopDragging(targetNode: SceneObject | null): void {
        this.isDragging = false;
        this.targetNode = targetNode;
        
        if (targetNode) {
            // Connect to target node
            const targetBaseNode = targetNode.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (targetBaseNode) {
                const inPos = targetBaseNode.getInConnectionPosition();
                if (this.endPointObject) {
                    this.endPointObject.getTransform().setWorldPosition(inPos);
                }
                print(`ConnectionLine: Connected to target node`);
            }
        }
        
        print("ConnectionLine: Stopped dragging");
    }

    /**
     * Gets the source node
     */
    getSourceNode(): SceneObject | null {
        return this.sourceNode;
    }

    /**
     * Gets the target node
     */
    getTargetNode(): SceneObject | null {
        return this.targetNode;
    }

    /**
     * Checks if currently dragging
     */
    getIsDragging(): boolean {
        return this.isDragging;
    }

    onDestroy() {
        // Clean up
        if (this.startPointObject) {
            this.startPointObject.destroy();
        }
        if (this.endPointObject) {
            this.endPointObject.destroy();
        }
    }
}
