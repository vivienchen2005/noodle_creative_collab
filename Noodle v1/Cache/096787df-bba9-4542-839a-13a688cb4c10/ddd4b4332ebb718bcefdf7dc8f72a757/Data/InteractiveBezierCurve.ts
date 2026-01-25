import { BezierCurve } from "../../RuntimeGizmos.lspkg/Scripts/BezierCurve";

/**
 * Gesture-interactive version of BezierCurve that responds to grab/targeting gestures.
 * When grabbed, the curve follows the hand position. When released, triggers node creation menu.
 */
@component
export class InteractiveBezierCurve extends BezierCurve {
    @input
    @hint("Hand type to use for gestures (Left or Right)")
    @widget(
        new ComboBoxWidget()
            .addItem("Right", 0)
            .addItem("Left", 1)
    )
    public handType: number = 0;

    @input
    @hint("Use grab gesture (true) or targeting gesture (false)")
    public useGrabGesture: boolean = true;

    @input
    @hint("Temporary end point SceneObject that follows hand during dragging")
    private tempEndPoint!: SceneObject;

    private gestureModule: GestureModule = require("LensStudio:GestureModule");
    private isDragging: boolean = false;
    private tempEndPointObject: SceneObject | null = null;
    private originalEndPoint: SceneObject | null = null;

    // Event callbacks
    public onDragStart: SceneEvent = this.createEvent("OnStartEvent");
    public onDragEnd: SceneEvent = this.createEvent("OnStartEvent");
    public onReleaseAtPosition: SceneEvent = this.createEvent("OnStartEvent");

    onAwake() {
        super.onAwake();

        // Create temporary end point if not provided
        if (!this.tempEndPoint) {
            this.tempEndPointObject = global.scene.createSceneObject("TempEndPoint");
            this.tempEndPointObject.setParent(this.sceneObject);
        } else {
            this.tempEndPointObject = this.tempEndPoint;
        }

        // Store original end point
        this.originalEndPoint = this.endPoint;

        // Set up gesture listeners
        this.setupGestureListeners();
    }

    /**
     * Sets up gesture event listeners
     */
    private setupGestureListeners(): void {
        const hand = this.handType === 0 ? GestureModule.HandType.Right : GestureModule.HandType.Left;

        if (this.useGrabGesture) {
            // Use grab gesture
            this.gestureModule.getGrabBeginEvent(hand).add(() => {
                this.onGrabBegin();
            });

            this.gestureModule.getGrabEndEvent(hand).add(() => {
                this.onGrabEnd();
            });
        } else {
            // Use targeting gesture for continuous tracking
            this.gestureModule.getTargetingDataEvent(hand).add((targetArgs: TargetingDataArgs) => {
                if (this.isDragging && targetArgs.isValid) {
                    this.updateTempEndPoint(targetArgs.rayOriginInWorld.add(targetArgs.rayDirectionInWorld.uniformScale(2)));
                }
            });
        }

        // Also use targeting for position updates during drag
        this.gestureModule.getTargetingDataEvent(hand).add((targetArgs: TargetingDataArgs) => {
            if (this.isDragging && targetArgs.isValid) {
                // Update temporary end point to follow hand
                const targetPosition = targetArgs.rayOriginInWorld.add(targetArgs.rayDirectionInWorld.uniformScale(2));
                this.updateTempEndPoint(targetPosition);
            }
        });
    }

    /**
     * Called when grab begins
     */
    private onGrabBegin(): void {
        if (!this.isDragging) {
            this.startDragging();
        }
    }

    /**
     * Called when grab ends
     */
    private onGrabEnd(): void {
        if (this.isDragging) {
            this.stopDragging();
        }
    }

    /**
     * Starts dragging the curve
     */
    public startDragging(): void {
        if (this.isDragging) return;

        this.isDragging = true;

        // Switch to temporary end point
        if (this.tempEndPointObject) {
            this.endPoint = this.tempEndPointObject;
            // Position temp point at current end position
            const currentEndPos = this.originalEndPoint?.getTransform().getWorldPosition() || new vec3(0, 0, 0);
            this.tempEndPointObject.getTransform().setWorldPosition(currentEndPos);
        }

        this.onDragStart.invoke();
        print("InteractiveBezierCurve: Started dragging");
    }

    /**
     * Stops dragging the curve
     */
    public stopDragging(): void {
        if (!this.isDragging) return;

        this.isDragging = false;

        // Get release position
        const releasePosition = this.tempEndPointObject?.getTransform().getWorldPosition() || new vec3(0, 0, 0);

        // Restore original end point
        if (this.originalEndPoint) {
            this.endPoint = this.originalEndPoint;
        }

        this.onDragEnd.invoke();
        this.onReleaseAtPosition.invoke(releasePosition);

        print("InteractiveBezierCurve: Stopped dragging at position: " + releasePosition);
    }

    /**
     * Updates the temporary end point position
     */
    private updateTempEndPoint(position: vec3): void {
        if (this.tempEndPointObject) {
            this.tempEndPointObject.getTransform().setWorldPosition(position);
        }
    }

    /**
     * Checks if currently dragging
     */
    public getIsDragging(): boolean {
        return this.isDragging;
    }

    /**
     * Gets the current drag position
     */
    public getDragPosition(): vec3 | null {
        if (this.isDragging && this.tempEndPointObject) {
            return this.tempEndPointObject.getTransform().getWorldPosition();
        }
        return null;
    }

    onDestroy(): void {
        // Clean up temporary objects
        if (this.tempEndPointObject && this.tempEndPointObject !== this.tempEndPoint) {
            this.tempEndPointObject.destroy();
        }
        super.onDestroy();
    }
}
