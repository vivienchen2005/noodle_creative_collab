import { BezierCurve } from "../../RuntimeGizmos.lspkg/Scripts/BezierCurve";
import { BaseNode } from "./BaseNode";

/**
 * Connection line component that draws a bezier curve between two nodes.
 * The line connects from one node's "out" point to another node's "in" point.
 */
@component
export class ConnectionLine extends BaseScriptComponent {
    @input
    @hint("Source node (where connection starts) - Set this to see the connection line")
    public sourceNode: SceneObject | null = null;

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
    private curveObject: SceneObject | null = null;
    private isDragging: boolean = false;

    onAwake() {
        // Create SceneObjects for start and end points FIRST
        this.startPointObject = global.scene.createSceneObject("ConnectionStartPoint");
        this.endPointObject = global.scene.createSceneObject("ConnectionEndPoint");

        // Set initial positions to avoid errors
        this.startPointObject.getTransform().setWorldPosition(new vec3(0, 0, 0));
        this.endPointObject.getTransform().setWorldPosition(new vec3(0, 0, 0));

        // Create the curve object (but don't create the component yet)
        this.curveObject = global.scene.createSceneObject("BezierCurve");
        this.curveObject.setParent(this.sceneObject);

        // Store reference for later component creation
        // We'll create the BezierCurve component in onStart after everything is initialized
    }

    onStart() {
        // Create BezierCurve component - inputs are now optional, so this should work
        if (!this.bezierCurve && this.startPointObject && this.endPointObject && this.curveObject) {
            // Create BezierCurve component (inputs can be set after creation now)
            this.bezierCurve = this.curveObject.createComponent(BezierCurve.getTypeName() as any) as BezierCurve;
            
            if (this.bezierCurve) {
                // Set required inputs
                this.bezierCurve.startPoint = this.startPointObject;
                this.bezierCurve.endPoint = this.endPointObject;

                // Set material - REQUIRED for BezierCurve to work
                if (this.lineMaterial) {
                    this.bezierCurve.lineMaterial = this.lineMaterial;
                    print(`ConnectionLine: Material set on BezierCurve`);
                } else {
                    print(`ConnectionLine: WARNING - No material provided! Connection will not be visible.`);
                }

                // Configure curve
                this.bezierCurve.curveHeight = this.curveHeight;
                this.bezierCurve.isEnabled = true;
                
                print(`ConnectionLine: BezierCurve created and configured. Enabled: ${this.bezierCurve.isEnabled}`);
            } else {
                print(`ConnectionLine: ERROR - Failed to create BezierCurve component`);
            }
        } else {
            print(`ConnectionLine: Cannot create BezierCurve - missing dependencies. startPoint: ${!!this.startPointObject}, endPoint: ${!!this.endPointObject}, curveObject: ${!!this.curveObject}`);
        }
        
        // Initial update of connection points
        if (this.sourceNode || this.targetNode) {
            this.updateConnectionPoints();
        }
        
        // Update connection points every frame
        this.createEvent("UpdateEvent").bind(() => {
            if (this.bezierCurve && (this.sourceNode || this.targetNode)) {
                this.updateConnectionPoints();
            }
        });
    }

    /**
     * Updates the connection point positions based on source and target nodes
     */
    private updateConnectionPoints(): void {
        if (!this.startPointObject || !this.endPointObject) {
            return;
        }

        // Get source node's "out" position
        if (this.sourceNode) {
            const sourceBaseNode = this.sourceNode.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (sourceBaseNode) {
                const outPos = sourceBaseNode.getOutConnectionPosition();
                this.startPointObject.getTransform().setWorldPosition(outPos);
            } else {
                // If no BaseNode, use the source node's position directly
                const sourcePos = this.sourceNode.getTransform().getWorldPosition();
                this.startPointObject.getTransform().setWorldPosition(sourcePos);
            }
        }

        // Get target node's "in" position (or use current end point if dragging)
        if (this.targetNode && !this.isDragging) {
            const targetBaseNode = this.targetNode.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (targetBaseNode) {
                const inPos = targetBaseNode.getInConnectionPosition();
                this.endPointObject.getTransform().setWorldPosition(inPos);
            } else {
                // If no BaseNode, use the target node's position directly
                const targetPos = this.targetNode.getTransform().getWorldPosition();
                this.endPointObject.getTransform().setWorldPosition(targetPos);
            }
        } else if (!this.isDragging && !this.targetNode) {
            // If no target node and not dragging, position end point near start point (so line is visible)
            if (this.startPointObject) {
                const startPos = this.startPointObject.getTransform().getWorldPosition();
                this.endPointObject.getTransform().setWorldPosition(startPos.add(new vec3(0.1, 0, 0)));
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
