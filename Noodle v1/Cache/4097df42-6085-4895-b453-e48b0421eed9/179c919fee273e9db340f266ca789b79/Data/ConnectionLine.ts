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
    public curveHeight: number = 0.2;

    @input
    public interpolationPoints: number = 20;

    @input("vec3", "{1, 1, 0}")
    @widget(new ColorWidget())
    public lineColor: vec3 = new vec3(1, 1, 0);

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

        // Create the BezierCurve component
        this.bezierCurve = this.bezierCurveObject.createComponent(BezierCurve.getTypeName()) as BezierCurve;

        // Set the required properties
        this.bezierCurve.startPoint = this.startPoint;
        this.bezierCurve.endPoint = this.endPoint;

        // Set optional properties
        if (this.lineMaterial) {
            this.bezierCurve.lineMaterial = this.lineMaterial;
        }
        this.bezierCurve.curveHeight = this.curveHeight;
        this.bezierCurve.interpolationPoints = this.interpolationPoints;
        this.bezierCurve.color = this.lineColor;

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

    onDestroy() {
        if (this.bezierCurveObject) {
            this.bezierCurveObject.destroy();
        }
    }
}
