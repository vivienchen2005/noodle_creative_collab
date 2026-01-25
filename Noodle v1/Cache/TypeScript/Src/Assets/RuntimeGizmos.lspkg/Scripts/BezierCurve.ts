import {
    withAlpha,
    withoutAlpha,
} from "SpectaclesInteractionKit.lspkg/Utils/color";
import InteractorLineRenderer, {
    VisualStyle,
} from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractorLineVisual/InteractorLineRenderer";

/**
 * A simplified spline component that takes only two points (start and finish)
 * and automatically generates two middle control points to create a smooth cubic bezier curve.
 */
@component
export class BezierCurve extends BaseScriptComponent {
    @input
    @allowUndefined
    @hint("The start point of the curve")
    public startPoint: SceneObject | null = null;

    @input
    @allowUndefined
    @hint("The end point of the curve")
    public endPoint: SceneObject | null = null;

    @input
    @hint("Number of interpolation points along the curve (higher = smoother)")
    public interpolationPoints: number = 100;

    @input
    @hint("Curve sag/arc amount - positive values arc up, negative droop down (cable style)")
    public curveHeight: number = 0.15;

    @input
    @hint("Curve style - Up: arc upward, Right: curve right, Forward: natural cable droop")
    @widget(
        new ComboBoxWidget()
            .addItem("Up", 0)
            .addItem("Right", 1)
            .addItem("Cable (Droop)", 2)
    )
    public curveDirection: number = 2;

    @input
    @hint("Control point distance - how far from start/end the control points extend along the path (affects curve smoothness)")
    public controlPointDistance: number = 0.4;

    @input
    @allowUndefined
    public lineMaterial: Material | null = null;

    // Cyan color #7FECFB = RGB(127, 236, 251) = (0.498, 0.925, 0.984)
    @input
    @widget(new ColorWidget())
    public _color: vec3 = new vec3(0.498, 0.925, 0.984);

    @input
    private lineWidth: number = 0.3;

    @input
    @widget(
        new ComboBoxWidget()
            .addItem("Full", 0)
            .addItem("Split", 1)
            .addItem("FadedEnd", 2)
    )
    public lineStyle: number = 0;

    private _enabled = true;
    private line: InteractorLineRenderer | null = null;
    private transform!: Transform;
    private lastStartPosition: vec3 = new vec3(0, 0, 0);
    private lastEndPosition: vec3 = new vec3(0, 0, 0);
    private splinePoints: vec3[] = [];
    private controlPoint1: vec3 = new vec3(0, 0, 0);
    private controlPoint2: vec3 = new vec3(0, 0, 0);
    private isInitialized: boolean = false;

    /**
     * Sets whether the visual can be shown.
     */
    set isEnabled(isEnabled: boolean) {
        this._enabled = isEnabled;
        if (this.line) {
            this.line.getSceneObject().enabled = isEnabled;
        }
    }

    /**
     * Gets whether the visual is active.
     */
    get isEnabled(): boolean {
        return this._enabled;
    }

    /**
     * Sets the color of the curve.
     */
    set color(color: vec3) {
        this._color = color;
        if (this.line) {
            const colorWithAlpha = withAlpha(color, 1);
            this.line.startColor = colorWithAlpha;
            this.line.endColor = colorWithAlpha;
        }
    }

    /**
     * Gets the color of the curve.
     */
    get color(): vec3 {
        return this._color;
    }

    onAwake() {
        this.transform = this.sceneObject.getTransform();

        // Set up update event to track point movements and deferred initialization
        this.createEvent("UpdateEvent").bind(() => {
            this.update();
        });
    }

    /**
     * Initialize the curve when both points are available
     * Called automatically when points are set, or can be called manually
     */
    public initialize(): boolean {
        if (this.isInitialized) {
            return true;
        }

        if (!this.startPoint || !this.endPoint) {
            // Not ready yet - wait for both points to be set
            return false;
        }

        // Initialize last positions
        this.lastStartPosition = this.startPoint.getTransform().getWorldPosition();
        this.lastEndPosition = this.endPoint.getTransform().getWorldPosition();

        // Generate the curve points
        this.generateCurvePoints();

        // Create the line renderer
        this.createCurve();

        this.isInitialized = true;
        return true;
    }

    /**
     * Updates the curve if the start or end points have moved
     */
    update() {
        // Try to initialize if not yet done
        if (!this.isInitialized) {
            this.initialize();
            return;
        }

        if (!this.startPoint || !this.endPoint) return;

        const currentStartPos = this.startPoint.getTransform().getWorldPosition();
        const currentEndPos = this.endPoint.getTransform().getWorldPosition();

        let hasChanged = false;

        // Check if start point has moved
        if (!currentStartPos.equal(this.lastStartPosition)) {
            hasChanged = true;
            this.lastStartPosition = currentStartPos;
        }

        // Check if end point has moved
        if (!currentEndPos.equal(this.lastEndPosition)) {
            hasChanged = true;
            this.lastEndPosition = currentEndPos;
        }

        // If any point has moved, refresh the curve
        if (hasChanged) {
            this.refreshCurve();
        }
    }

    /**
     * Regenerates the curve points and updates the visual
     */
    refreshCurve(): void {
        this.generateCurvePoints();
        this.updateCurveVisual();
    }

    /**
     * Updates the curve's visual representation
     */
    private updateCurveVisual(): void {
        if (this.line) {
            this.line.destroy();
        }
        this.createCurve();
    }

    /**
     * Creates the curve visual using InteractorLineRenderer
     */
    private createCurve(): void {
        if (this.splinePoints.length < 2) {
            print("Error: Not enough points to create a curve!");
            return;
        }

        this.line = new InteractorLineRenderer({
            material: this.lineMaterial,
            points: this.splinePoints,
            startColor: withAlpha(this._color, 1),
            endColor: withAlpha(this._color, 1),
            startWidth: this.lineWidth,
            endWidth: this.lineWidth,
        });

        this.line.getSceneObject().setParent(this.sceneObject);
        this.line.visualStyle = this.lineStyle;
        this.line.getSceneObject().enabled = this._enabled;
    }

    /**
     * Generates points along a quadratic bezier curve from start to end
     */
    private generateCurvePoints(): void {
        this.splinePoints = [];

        if (!this.startPoint || !this.endPoint) {
            return;
        }

        // Get world positions
        const startPos = this.startPoint.getTransform().getWorldPosition();
        const endPos = this.endPoint.getTransform().getWorldPosition();

        // Calculate the two middle control points
        this.calculateControlPoints(startPos, endPos);

        // Convert to local space
        const startLocal = this.transform.getInvertedWorldTransform().multiplyPoint(startPos);
        const control1Local = this.transform.getInvertedWorldTransform().multiplyPoint(this.controlPoint1);
        const control2Local = this.transform.getInvertedWorldTransform().multiplyPoint(this.controlPoint2);
        const endLocal = this.transform.getInvertedWorldTransform().multiplyPoint(endPos);

        // Generate cubic bezier curve points
        for (let i = 0; i <= this.interpolationPoints; i++) {
            const t = i / this.interpolationPoints;
            const point = this.cubicBezier(startLocal, control1Local, control2Local, endLocal, t);
            this.splinePoints.push(point);
        }
    }

    /**
     * Calculates the two control points for the cubic bezier curve
     * Creates a smooth "cable" style curve like in node editors (ComfyUI, Unreal Blueprints)
     * The curve extends outward horizontally from each point, then droops naturally
     */
    private calculateControlPoints(start: vec3, end: vec3): void {
        // Calculate the direction vector from start to end
        const direction = end.sub(start);
        const distance = direction.length;

        // If distance is too small, just use straight line
        if (distance < 0.001) {
            this.controlPoint1 = start;
            this.controlPoint2 = end;
            return;
        }

        // For node-editor style curves, control points extend OUTWARD from each node
        // This creates the classic "cable" look where wires flow smoothly out then connect

        // Calculate horizontal distance and vertical drop
        const horizontalDir = new vec3(direction.x, 0, direction.z);
        const horizontalDist = horizontalDir.length;

        // Determine the "outward" direction for each control point
        // Control point 1: extends in the general direction toward the end point
        // Control point 2: extends in the general direction toward the start point

        let outwardDir1: vec3;
        let outwardDir2: vec3;

        if (horizontalDist > 0.01) {
            // Use horizontal direction for more natural cable flow
            outwardDir1 = horizontalDir.normalize();
            outwardDir2 = horizontalDir.normalize().uniformScale(-1);
        } else {
            // Points are mostly vertical - use forward direction
            outwardDir1 = new vec3(0, 0, 1);
            outwardDir2 = new vec3(0, 0, -1);
        }

        // Control point distance scales with the connection distance
        // Longer connections need control points further out for smooth curves
        const baseDist = Math.max(distance * this.controlPointDistance, 0.1);

        // Add a droop/sag based on curveHeight (negative = droop down, positive = arc up)
        const droopAmount = this.curveHeight * distance;
        const droopVector = new vec3(0, -droopAmount, 0); // Droop downward for cable look

        // Control point 1: Start + outward direction + slight droop
        this.controlPoint1 = start.add(outwardDir1.uniformScale(baseDist)).add(droopVector.uniformScale(0.3));

        // Control point 2: End + outward direction (toward start) + slight droop  
        this.controlPoint2 = end.add(outwardDir2.uniformScale(baseDist)).add(droopVector.uniformScale(0.3));

        // Apply curve direction modifier for special cases
        if (this.curveDirection === 0) {
            // "Up" mode - make the curve arc upward instead of drooping
            const upOffset = new vec3(0, Math.abs(droopAmount), 0);
            this.controlPoint1 = start.add(outwardDir1.uniformScale(baseDist)).add(upOffset);
            this.controlPoint2 = end.add(outwardDir2.uniformScale(baseDist)).add(upOffset);
        } else if (this.curveDirection === 1) {
            // "Right" mode - curve extends to the right
            const rightOffset = new vec3(1, 0, 0).uniformScale(droopAmount);
            this.controlPoint1 = start.add(outwardDir1.uniformScale(baseDist)).add(rightOffset);
            this.controlPoint2 = end.add(outwardDir2.uniformScale(baseDist)).add(rightOffset);
        }
        // curveDirection === 2 (Forward) uses the default drooping behavior
    }

    /**
     * Performs cubic bezier interpolation
     * @param p0 Start point
     * @param p1 First control point
     * @param p2 Second control point
     * @param p3 End point
     * @param t Interpolation parameter (0 to 1)
     */
    private cubicBezier(p0: vec3, p1: vec3, p2: vec3, p3: vec3, t: number): vec3 {
        const oneMinusT = 1 - t;
        const oneMinusTSquared = oneMinusT * oneMinusT;
        const oneMinusTCubed = oneMinusTSquared * oneMinusT;
        const tSquared = t * t;
        const tCubed = tSquared * t;

        // Cubic bezier formula: (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
        const x = oneMinusTCubed * p0.x + 3 * oneMinusTSquared * t * p1.x + 3 * oneMinusT * tSquared * p2.x + tCubed * p3.x;
        const y = oneMinusTCubed * p0.y + 3 * oneMinusTSquared * t * p1.y + 3 * oneMinusT * tSquared * p2.y + tCubed * p3.y;
        const z = oneMinusTCubed * p0.z + 3 * oneMinusTSquared * t * p1.z + 3 * oneMinusT * tSquared * p2.z + tCubed * p3.z;

        return new vec3(x, y, z);
    }

    /**
     * Sets a new interpolation level for the curve
     */
    setInterpolationPoints(points: number): void {
        if (points >= 2) {
            this.interpolationPoints = points;
            this.refreshCurve();
        }
    }

    /**
     * Sets a new curve height
     */
    setCurveHeight(height: number): void {
        this.curveHeight = height;
        this.refreshCurve();
    }

    /**
     * Sets the curve direction
     */
    setCurveDirection(direction: number): void {
        if (direction >= 0 && direction <= 2) {
            this.curveDirection = direction;
            this.refreshCurve();
        }
    }

    /**
     * Sets the control point distance
     */
    setControlPointDistance(distance: number): void {
        this.controlPointDistance = Math.max(0.1, Math.min(0.5, distance));
        this.refreshCurve();
    }

    /**
     * Gets the calculated first control point position
     */
    getControlPoint1(): vec3 {
        return this.controlPoint1;
    }

    /**
     * Gets the calculated second control point position
     */
    getControlPoint2(): vec3 {
        return this.controlPoint2;
    }

    onDestroy(): void {
        if (this.line) {
            this.line.destroy();
        }
    }
}
