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
        const curveObject = global.scene.createSceneObject("BezierCurve");
        curveObject.setParent(this.sceneObject);
        
        // Store reference for later component creation
        // We'll create the BezierCurve component in onStart after everything is initialized
    }

    onStart() {
        // Create BezierCurve component after a small delay to ensure everything is initialized
        // Use OnStartEvent to ensure all components are awake
        this.createEvent("OnStartEvent").bind(() => {
            // Small additional delay using UpdateEvent
            let frameCount = 0;
            this.createEvent("UpdateEvent").bind(() => {
                // Create BezierCurve on first update frame after OnStartEvent
                if (frameCount === 0 && !this.bezierCurve && this.startPointObject && this.endPointObject) {
                    const curveObject = this.sceneObject.children.find((child) => child.name === "BezierCurve");
                    let targetObject: SceneObject;
                    
                    if (curveObject) {
                        targetObject = curveObject;
                    } else {
                        targetObject = global.scene.createSceneObject("BezierCurve");
                        targetObject.setParent(this.sceneObject);
                    }
                    
                    // Set inputs on the SceneObject before creating component (workaround)
                    // This doesn't work, but we'll try setting them immediately after
                    try {
                        // Create BezierCurve component
                        this.bezierCurve = targetObject.createComponent(BezierCurve.getTypeName() as any) as BezierCurve;
                        
                        if (this.bezierCurve) {
                            // Set required inputs immediately after creation
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
                    } catch (e) {
                        print(`ConnectionLine: Error creating BezierCurve: ${e}`);
                        // If creation fails, try again next frame
                        frameCount = -1; // Reset to try again
                    }
                }
                
                frameCount++;
                
                // Update connection points
                if (this.bezierCurve) {
                    this.updateConnectionPoints();
                }
            });
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
