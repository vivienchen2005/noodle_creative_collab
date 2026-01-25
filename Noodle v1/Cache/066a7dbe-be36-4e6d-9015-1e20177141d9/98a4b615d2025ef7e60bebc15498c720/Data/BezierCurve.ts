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
    @hint("The start point of the curve")
    public startPoint!: SceneObject;

    @input
    @hint("The end point of the curve")
    public endPoint!: SceneObject;

    @input
    @hint("Number of interpolation points along the curve (higher = smoother)")
    public interpolationPoints: number = 20;

    @input
    @hint("Curve height offset - how much the curve arches upward (in meters)")
    public curveHeight: number = 0.5;

    @input
    @hint("Curve direction - offset direction for the control points (0 = up, 1 = right, 2 = forward)")
    @widget(
        new ComboBoxWidget()
            .addItem("Up", 0)
            .addItem("Right", 1)
            .addItem("Forward", 2)
    )
    public curveDirection: number = 0;

    @input
    @hint("Control point spread - how far along the path the control points are positioned (0.3 = closer to ends, 0.5 = at midpoint)")
    public controlPointSpread: number = 0.33;

    @input
    private lineMaterial!: Material;

    @input("vec3", "{1, 1, 0}")
    @widget(new ColorWidget())
    public _color: vec3 = new vec3(1, 1, 0);

    @input
    private lineWidth: number = 0.5;

    @input
    @widget(
        new ComboBoxWidget()
            .addItem("Full", 0)
            .addItem("Split", 1)
            .addItem("FadedEnd", 2)
    )
    public lineStyle: number = 0;

    private _enabled = true;
    private line!: InteractorLineRenderer;
    private transform!: Transform;
    private lastStartPosition: vec3 = new vec3(0, 0, 0);
    private lastEndPosition: vec3 = new vec3(0, 0, 0);
    private splinePoints: vec3[] = [];
    private controlPoint1: vec3 = new vec3(0, 0, 0);
    private controlPoint2: vec3 = new vec3(0, 0, 0);

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
        if (!this.startPoint || !this.endPoint) {
            print("Error: Both start and end points are required!");
            return;
        }

        this.transform = this.sceneObject.getTransform();

        // Initialize last positions
        this.lastStartPosition = this.startPoint.getTransform().getWorldPosition();
        this.lastEndPosition = this.endPoint.getTransform().getWorldPosition();

        // Generate the curve points
        this.generateCurvePoints();

        // Create the line renderer
        this.createCurve();

        // Set up update event to track point movements
        this.createEvent("UpdateEvent").bind(() => {
            this.update();
        });
    }

    /**
     * Updates the curve if the start or end points have moved
     */
    update() {
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
     * This creates a smooth, natural arching curve between start and end points
     */
    private calculateControlPoints(start: vec3, end: vec3): void {
        // Calculate the direction vector from start to end
        const direction = end.sub(start);
        const distance = direction.length;

        // Normalize the direction
        const normalizedDir = direction.normalize();

        // Calculate perpendicular vector based on curve direction
        let perpendicular: vec3;
        const up = new vec3(0, 1, 0);

        switch (this.curveDirection) {
            case 0: // Up
                // Use cross product to get a perpendicular vector, then cross again to get upward component
                const right = normalizedDir.cross(up).normalize();
                if (right.length < 0.1) {
                    // If direction is parallel to up, use forward
                    perpendicular = new vec3(0, 0, 1);
                } else {
                    perpendicular = right.cross(normalizedDir).normalize();
                }
                break;
            case 1: // Right
                perpendicular = normalizedDir.cross(up).normalize();
                if (perpendicular.length < 0.1) {
                    perpendicular = new vec3(1, 0, 0);
                }
                break;
            case 2: // Forward
                perpendicular = normalizedDir;
                break;
            default:
                perpendicular = up;
        }

        // Calculate the offset distance based on curve height and distance
        // The curve height is scaled by the distance to maintain proportions
        const offsetDistance = this.curveHeight * (0.5 + distance * 0.1);
        const offset = perpendicular.uniformScale(offsetDistance);

        // Calculate positions along the path for the two control points
        // Clamp spread to reasonable values (0.1 to 0.5)
        const spread = Math.max(0.1, Math.min(0.5, this.controlPointSpread));
        
        // First control point: positioned partway from start
        const t1 = spread;
        const point1AlongPath = new vec3(
            start.x + (end.x - start.x) * t1,
            start.y + (end.y - start.y) * t1,
            start.z + (end.z - start.z) * t1
        );
        this.controlPoint1 = point1AlongPath.add(offset);

        // Second control point: positioned partway from end (symmetric)
        const t2 = 1 - spread;
        const point2AlongPath = new vec3(
            start.x + (end.x - start.x) * t2,
            start.y + (end.y - start.y) * t2,
            start.z + (end.z - start.z) * t2
        );
        this.controlPoint2 = point2AlongPath.add(offset);
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
     * Sets the control point spread
     */
    setControlPointSpread(spread: number): void {
        this.controlPointSpread = Math.max(0.1, Math.min(0.5, spread));
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
