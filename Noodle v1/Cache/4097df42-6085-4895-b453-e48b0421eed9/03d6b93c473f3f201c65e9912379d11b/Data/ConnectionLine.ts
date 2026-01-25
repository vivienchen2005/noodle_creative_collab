import { BezierCurve } from "RuntimeGizmos.lspkg/Scripts/BezierCurve";

/**
 * A wrapper for BezierCurve that allows setting start and end points after creation.
 * This solves the issue where BezierCurve requires startPoint and endPoint during component creation.
 * Also supports dynamic dragging for interactive connection creation.
 */
@component
export class ConnectionLine extends BaseScriptComponent {
    @input
    @allowUndefined
    public startPoint: SceneObject | null = null;

    @input
    @allowUndefined
    public endPoint: SceneObject | null = null;

    @input
    @allowUndefined
    public lineMaterial: Material | null = null;

    @input
    public curveHeight: number = 0.3;

    @input
    public interpolationPoints: number = 50;

    // Cyan color #7FECFB
    @input
    @widget(new ColorWidget())
    public lineColor: vec3 = new vec3(0.498, 0.925, 0.984);

    // Source and target nodes for connection tracking
    public sourceNode: SceneObject | null = null;
    public targetNode: SceneObject | null = null;

    private bezierCurve: BezierCurve | null = null;
    private bezierCurveObject: SceneObject | null = null;
    private isInitialized: boolean = false;

    // For dynamic dragging
    private isDragging: boolean = false;
    private dragEndPoint: SceneObject | null = null;

    onAwake() {
        // Wait for start and end points to be set via Inspector or script
        const checkEvent = this.createEvent("UpdateEvent");
        checkEvent.bind(() => {
            if (!this.isInitialized && this.startPoint && this.endPoint) {
                this.initializeBezierCurve();
            }
        });
    }

    private initializeBezierCurve() {
        if (this.isInitialized) {
            return;
        }

        if (!this.startPoint || !this.endPoint) {
            print("[ConnectionLine] Cannot initialize - start or end point is null");
            return;
        }

        print("[ConnectionLine] Initializing BezierCurve with start and end points");

        // Create a child object for the BezierCurve
        this.bezierCurveObject = global.scene.createSceneObject("BezierCurveVisual");
        this.bezierCurveObject.setParent(this.sceneObject);

        // Create the BezierCurve component (now supports deferred initialization)
        this.bezierCurve = this.bezierCurveObject.createComponent(BezierCurve.getTypeName()) as BezierCurve;

        // Set the start and end points
        this.bezierCurve.startPoint = this.startPoint;
        this.bezierCurve.endPoint = this.endPoint;

        // Set optional properties
        if (this.lineMaterial) {
            this.bezierCurve.lineMaterial = this.lineMaterial;
        }
        this.bezierCurve.curveHeight = this.curveHeight;
        this.bezierCurve.interpolationPoints = this.interpolationPoints;

        // FORCE cyan color #7FECFB - override any saved yellow color
        const cyanColor = new vec3(0.498, 0.925, 0.984);
        this.bezierCurve.color = cyanColor;

        // Initialize the curve (will create the visual)
        this.bezierCurve.initialize();

        this.isInitialized = true;
        print("[ConnectionLine] BezierCurve initialized successfully");
    }

    /**
     * Update the start point (useful for dynamic connections)
     */
    public setStartPoint(point: SceneObject) {
        this.startPoint = point;
        if (this.bezierCurve) {
            this.bezierCurve.startPoint = point;
        } else if (!this.isInitialized) {
            this.initializeBezierCurve();
        }
    }

    /**
     * Update the end point (useful for dynamic connections)
     */
    public setEndPoint(point: SceneObject) {
        this.endPoint = point;
        if (this.bezierCurve) {
            this.bezierCurve.endPoint = point;
        } else if (!this.isInitialized) {
            this.initializeBezierCurve();
        }
    }

    /**
     * Update the material
     */
    public setMaterial(material: Material) {
        this.lineMaterial = material;
        if (this.bezierCurve) {
            this.bezierCurve.lineMaterial = material;
        }
    }

    /**
     * Get the underlying BezierCurve component
     */
    public getBezierCurve(): BezierCurve | null {
        return this.bezierCurve;
    }

    /**
     * Start dragging a connection from a position
     * Creates a temporary end point that follows the drag
     */
    public startDragging(startPosition: vec3): void {
        this.isDragging = true;

        // Create a temporary end point for dragging
        this.dragEndPoint = global.scene.createSceneObject("DragEndPoint");
        this.dragEndPoint.setParent(this.sceneObject);
        this.dragEndPoint.getTransform().setWorldPosition(startPosition);

        // Set as end point (start point should already be set)
        this.endPoint = this.dragEndPoint;

        // Initialize if not already done
        if (!this.isInitialized) {
            this.initializeBezierCurve();
        }

        print("[ConnectionLine] Started dragging from position: " + startPosition.toString());
    }

    /**
     * Update the drag position (called while dragging)
     */
    public updateDragPosition(position: vec3): void {
        if (this.isDragging && this.dragEndPoint) {
            this.dragEndPoint.getTransform().setWorldPosition(position);
        }
    }

    /**
     * Stop dragging and connect to a target node
     */
    public stopDragging(targetNode: SceneObject): void {
        if (!this.isDragging) {
            return;
        }

        this.isDragging = false;
        this.targetNode = targetNode;

        // Replace drag end point with the actual target node
        if (this.dragEndPoint) {
            this.dragEndPoint.destroy();
            this.dragEndPoint = null;
        }

        // Set the target node as the end point
        this.endPoint = targetNode;

        // Update the bezier curve
        if (this.bezierCurve) {
            this.bezierCurve.endPoint = targetNode;
        }

        print("[ConnectionLine] Stopped dragging, connected to target node: " + targetNode.name);
    }

    /**
     * Get the source node
     */
    public getSourceNode(): SceneObject | null {
        return this.sourceNode;
    }

    /**
     * Get the target node
     */
    public getTargetNode(): SceneObject | null {
        return this.targetNode;
    }

    onDestroy() {
        if (this.dragEndPoint) {
            this.dragEndPoint.destroy();
        }
        if (this.bezierCurveObject) {
            this.bezierCurveObject.destroy();
        }
    }
}
