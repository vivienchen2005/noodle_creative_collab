import { SIK } from "SpectaclesInteractionKit.lspkg/SIK"
import { CropRegion } from "./CropRegion"

const BOX_MIN_SIZE = 8 //min size in cm for image capture
const RECTANGLE_SHRINK_FACTOR = 0.85 // Make rectangle 15% smaller than drawn bounds

@component
export class PictureBehavior extends BaseScriptComponent {
  @input circleObjs: SceneObject[]
  @input editorCamObj: SceneObject
  @input picAnchorObj: SceneObject
  @input loadingObj: SceneObject
  @input captureRendMesh: RenderMeshVisual
  @input screenCropTexture: Texture
  @input cropRegion: CropRegion

  // Store the static captured texture (cropped snapshot)
  private _capturedStaticTexture: Texture | null = null

  // Hidden Image component for capturing static texture
  private _hiddenCaptureImage: Image | null = null
  private _hiddenCaptureObject: SceneObject | null = null

  // RenderTarget for capturing static cropped texture
  private _renderTarget: Texture | null = null
  private _renderTargetCamera: Camera | null = null
  private _renderTargetObject: SceneObject | null = null


  private isEditor = global.deviceInfoSystem.isEditor()

  private camTrans: Transform
  private loadingTrans: Transform

  private circleTrans: Transform[]
  private circleObjsRef: SceneObject[] // Keep reference to circle objects to enable/disable them

  private rightHand = SIK.HandInputData.getHand("right")
  private leftHand = SIK.HandInputData.getHand("left")

  private picAnchorTrans = null

  private isPinching = false
  private trackedPositions: vec3[] = [] // Store all positions during pinch gesture
  private rotMat = new mat3()

  private updateEvent = null

  onAwake() {
    print("[PictureBehavior] onAwake called!")
    this.loadingObj.enabled = false
    this.loadingTrans = this.loadingObj.getTransform()
    this.captureRendMesh.mainMaterial = this.captureRendMesh.mainMaterial.clone()

    this.camTrans = this.editorCamObj.getTransform()

    this.picAnchorTrans = this.picAnchorObj.getTransform()
    this.circleTrans = this.circleObjs.map((obj) => obj.getTransform())
    this.circleObjsRef = this.circleObjs // Store reference to circle objects
    print("[PictureBehavior] Found " + this.circleTrans.length + " circle transforms")

    // Hide circles initially - they will be shown after pinch is finished
    for (let i = 0; i < this.circleObjsRef.length; i++) {
      if (this.circleObjsRef[i]) {
        this.circleObjsRef[i].enabled = false
      }
    }
    print("[PictureBehavior] Circles hidden initially")

    // HIDE picAnchorObj and captureRendMesh from the start - we don't want to show captured image in 3D space
    // The texture will be passed to InputNodeImage instead
    if (this.picAnchorObj) {
      this.picAnchorObj.enabled = false
      print("[PictureBehavior] picAnchorObj hidden from start - image will not be displayed in 3D space")
    }
    if (this.captureRendMesh && this.captureRendMesh.sceneObject) {
      this.captureRendMesh.sceneObject.enabled = false
      print("[PictureBehavior] captureRendMesh hidden from start - image will not be displayed in 3D space")
    }

    // Create hidden Image component for capturing static texture
    this._hiddenCaptureObject = global.scene.createSceneObject("HiddenCaptureImage")
    this._hiddenCaptureObject.setParent(this.getSceneObject())
    this._hiddenCaptureObject.enabled = false // Keep it hidden
    this._hiddenCaptureImage = this._hiddenCaptureObject.createComponent("Component.Image") as Image
    if (this._hiddenCaptureImage) {
      print("[PictureBehavior] Created hidden Image component for static texture capture")
    }

    // Create RenderTarget for capturing static cropped texture
    // This will render the cropped image to a static texture
    // Note: RenderTarget must be created as an asset, not programmatically
    // For now, we'll use a simpler approach: copy the camera frame and apply crop manually
    // The RenderTarget approach would require a pre-created RenderTarget asset
    print("[PictureBehavior] RenderTarget approach requires asset - using alternative method")

    // Use only right hand for single-hand pinch gesture
    this.rightHand.onPinchUp.add(this.rightPinchUp)
    this.rightHand.onPinchDown.add(this.rightPinchDown)
    print("[PictureBehavior] Pinch event handlers registered")

    // Since scanner is created on pinch down, check if we should start tracking immediately
    // Use a small delay to ensure hand tracking is ready
    const checkPinchEvent = this.createEvent("DelayedCallbackEvent")
    checkPinchEvent.bind(() => {
      // Check if pinch is still active (scanner was just created on pinch down)
      // We can detect this by checking if thumb and index are close together
      try {
        const thumbPos = this.rightHand.thumbTip.position
        const indexPos = this.rightHand.indexTip.position
        const pinchDistance = thumbPos.distance(indexPos)
        if (pinchDistance < 3.0) { // If fingers are close, likely still pinching
          print("[PictureBehavior] Detected active pinch on init (distance: " + pinchDistance.toFixed(2) + ") - starting tracking")
          this.startTracking()
        }
      } catch (e) {
        print("[PictureBehavior] Could not check pinch state: " + e)
      }
    })
    checkPinchEvent.reset(0.05) // Check after 50ms

    if (this.isEditor) {
      //place this transform in front of camera for testing
      const trans = this.getSceneObject().getTransform()
      trans.setWorldPosition(this.camTrans.getWorldPosition().add(this.camTrans.forward.uniformScale(-60)))
      trans.setWorldRotation(quat.lookAt(this.camTrans.forward, vec3.up()))
      // Create update event for editor mode too, so we can control visibility
      this.updateEvent = this.createEvent("UpdateEvent")
      this.updateEvent.bind(this.update.bind(this))
      print("[PictureBehavior] Update event created for editor mode")
    } else {
      //send offscreen
      this.getSceneObject().getTransform().setWorldPosition(vec3.up().uniformScale(1000))
      this.updateEvent = this.createEvent("UpdateEvent")
      this.updateEvent.bind(this.update.bind(this))
      print("[PictureBehavior] Update event created for non-editor mode")
    }

    print("[PictureBehavior] onAwake complete, isEditor: " + this.isEditor)
  }

  private startTracking() {
    // Prevent multiple calls
    if (this.isPinching) {
      print("[PictureBehavior] Already tracking, ignoring duplicate startTracking call")
      return
    }

    print("[PictureBehavior] Starting circle drawing tracking")
    this.isPinching = true
    this.trackedPositions = [] // Reset tracked positions

    // Hide circles during tracking
    for (let i = 0; i < this.circleObjsRef.length; i++) {
      if (this.circleObjsRef[i]) {
        this.circleObjsRef[i].enabled = false
      }
    }


    // Store initial position
    const initialPos = this.rightHand.thumbTip.position
    this.trackedPositions.push(new vec3(initialPos.x, initialPos.y, initialPos.z))
    print("[PictureBehavior] Initial position tracked: x=" + initialPos.x.toFixed(2) + ", y=" + initialPos.y.toFixed(2) + ", z=" + initialPos.z.toFixed(2))

    // Make sure update loop is running (needed for both editor and non-editor modes)
    if (this.updateEvent == null) {
      this.updateEvent = this.createEvent("UpdateEvent")
      this.updateEvent.bind(this.update.bind(this))
      print("[PictureBehavior] Update event created on pinch down")
    }
  }

  private rightPinchDown = () => {
    print("[PictureBehavior] RIGHT Pinch down - starting circle drawing")
    this.startTracking()
  }

  private rightPinchUp = () => {
    print("[PictureBehavior] RIGHT Pinch up - finished circle drawing")
    print("[PictureBehavior] Total positions tracked: " + this.trackedPositions.length)
    this.isPinching = false // Stop tracking immediately

    if (this.trackedPositions.length > 0) {
      // Log all tracked positions
      for (let i = 0; i < this.trackedPositions.length; i++) {
        const pos = this.trackedPositions[i]
        print("[PictureBehavior] Position " + i + ": x=" + pos.x.toFixed(2) + ", y=" + pos.y.toFixed(2) + ", z=" + pos.z.toFixed(2))
      }

      // Calculate min/max x,y from all tracked positions and show mask
      this.calculateRectangleFromTrackedPositions()

      // Wait a moment for hands to move away before capturing the frame
      // This ensures hands won't be in the captured image
      print("[PictureBehavior] Waiting for hands to move away before capturing frame...")
      const captureDelayEvent = this.createEvent("DelayedCallbackEvent")
      captureDelayEvent.bind(() => {
        print("[PictureBehavior] Hands should be away now - capturing frame")
        this.captureAndProcessImage()
      })
      captureDelayEvent.reset(0.5) // Wait 500ms for hands to move away
    } else {
      print("[PictureBehavior] WARNING: No positions were tracked!")
    }
  }

  private captureAndProcessImage() {
    // Ensure visual elements are hidden BEFORE capture - don't show image in 3D space
    try {
      if (this.picAnchorObj && !isNull(this.picAnchorObj)) {
        this.picAnchorObj.enabled = false
      }
    } catch (e) {
      print("[PictureBehavior] Warning: Could not hide picAnchorObj: " + e)
    }
    try {
      if (this.captureRendMesh && this.captureRendMesh.sceneObject && !isNull(this.captureRendMesh.sceneObject)) {
        this.captureRendMesh.sceneObject.enabled = false
      }
    } catch (e) {
      print("[PictureBehavior] Warning: Could not hide captureRendMesh: " + e)
    }
    try {
      if (this.loadingObj && !isNull(this.loadingObj)) {
        this.loadingObj.enabled = false
      }
    } catch (e) {
      print("[PictureBehavior] Warning: Could not hide loadingObj: " + e)
    }

    // Capture the image now (after hands have moved away)
    if (this.screenCropTexture && this.screenCropTexture.getColorspace() == 3) {
      try {
        // DIRECTLY set crop rect based on circle positions - don't rely on CropRegion
        // This ensures the crop is applied correctly before capture
        this.setCropRectFromCircles()
        
        // Verify crop region is set
        const cropControl = this.screenCropTexture.control as any
        if (cropControl && cropControl.cropRect) {
          const cropRect = cropControl.cropRect
          const center = cropRect.getCenter()
          const size = cropRect.getSize()
          print(`[PictureBehavior] Final crop region: center=(${center.x.toFixed(3)}, ${center.y.toFixed(3)}), size=(${size.x.toFixed(3)}, ${size.y.toFixed(3)})`)
          
          // Check if crop is valid (not full frame)
          if (Math.abs(size.x - 2.0) < 0.01 && Math.abs(size.y - 2.0) < 0.01) {
            print("[PictureBehavior] WARNING - Crop region is full frame! Circle positions may be invalid.")
          }
        }

        // Create the static texture from the cropped screenCropTexture
        this.captureRendMesh.mainPass.captureImage = ProceduralTextureProvider.createFromTexture(this.screenCropTexture)
        print("[PictureBehavior] Frame captured successfully with crop region applied!")

        // Disable crop region after capture
        if (this.cropRegion) {
          this.cropRegion.enabled = false
        }
      } catch (e) {
        print("[PictureBehavior] Error capturing frame: " + e)
        return
      }
    } else {
      print("[PictureBehavior] Screen crop texture not ready for capture")
      return
    }

    // Now process the image
    if (this.updateEvent != null) {
      //remove all events
      this.removeEvent(this.updateEvent)
      this.updateEvent = null
      this.rightHand.onPinchUp.remove(this.rightPinchUp)
      this.rightHand.onPinchDown.remove(this.rightPinchDown)

      //make sure image area is above threshold
      if (this.getHeight() < BOX_MIN_SIZE || this.getWidth() < BOX_MIN_SIZE) {
        print("[PictureBehavior] Crop area too small, destroying scanner.")
        this.getSceneObject().destroy()
        return
      }

      // Disable crop region
      this.cropRegion.enabled = false

      // Ensure visual elements stay hidden - don't display captured image in 3D space
      // The texture (screenCropTexture) is available for InputNodeImage to use directly
      if (this.picAnchorObj) {
        this.picAnchorObj.enabled = false
      }
      if (this.captureRendMesh && this.captureRendMesh.sceneObject) {
        this.captureRendMesh.sceneObject.enabled = false
      }
      if (this.loadingObj) {
        this.loadingObj.enabled = false
      }

      // Frame is now captured - _capturedStaticTexture contains the static camera frame
      // InputNodeImage will poll for captureImage to be set, then get the static texture
      print("[PictureBehavior] Freeze frame captured! Static texture stored. Visuals hidden.")
    }
  }

  /**
   * Gets the captured static texture (cropped snapshot)
   * Returns null if capture failed or texture is not available
   */
  public getCapturedStaticTexture(): Texture | null {
    return this._capturedStaticTexture
  }

  localTopLeft() {
    return this.camTrans.getInvertedWorldTransform().multiplyPoint(this.circleTrans[0].getWorldPosition())
  }

  localBottomRight() {
    return this.camTrans.getInvertedWorldTransform().multiplyPoint(this.circleTrans[2].getWorldPosition())
  }

  getWidth() {
    return Math.abs(this.localBottomRight().x - this.localTopLeft().x)
  }

  getHeight() {
    return Math.abs(this.localBottomRight().y - this.localTopLeft().y)
  }

  update() {
    if (this.isPinching) {
      // Don't capture image during tracking - wait until after pinch is released
      // This ensures hands won't be in the captured frame

      // Track current thumb tip position
      const currentPos = this.rightHand.thumbTip.position

      // Only add position if it's significantly different from last position (to avoid too many points)
      // Reduced threshold from 0.5 to 0.2 to capture more positions during circle drawing
      if (this.trackedPositions.length === 0 ||
        currentPos.distance(this.trackedPositions[this.trackedPositions.length - 1]) > 0.2) {
        this.trackedPositions.push(new vec3(currentPos.x, currentPos.y, currentPos.z))
        if (this.trackedPositions.length % 5 === 0) { // Log every 5th position to reduce spam
          print("[PictureBehavior] Tracking position #" + this.trackedPositions.length + ": x=" + currentPos.x.toFixed(2) + ", y=" + currentPos.y.toFixed(2) + ", z=" + currentPos.z.toFixed(2))
        }
      }

      // Don't show mask during tracking - only show after pinch is released
      // Removed: this.calculateRectangleFromTrackedPositions()
    }
  }


  private calculateRectangleFromTrackedPositions() {
    if (this.trackedPositions.length === 0) {
      print("[PictureBehavior] calculateRectangleFromTrackedPositions: No positions to calculate from")
      return
    }

    print("[PictureBehavior] calculateRectangleFromTrackedPositions: Processing " + this.trackedPositions.length + " positions")

    // Show the circles/mask now that we're done tracking
    for (let i = 0; i < this.circleObjsRef.length; i++) {
      if (this.circleObjsRef[i]) {
        this.circleObjsRef[i].enabled = true
      }
    }
    print("[PictureBehavior] Circles/mask enabled - showing rectangle")

    // Ensure picAnchorObj and captureRendMesh stay hidden - don't show captured image in 3D space
    // The texture will be passed to InputNodeImage instead
    if (this.picAnchorObj) {
      this.picAnchorObj.enabled = false
    }
    if (this.captureRendMesh && this.captureRendMesh.sceneObject) {
      this.captureRendMesh.sceneObject.enabled = false
    }

    // Convert all tracked positions to camera local space to find min/max
    const localPositions = this.trackedPositions.map(pos =>
      this.camTrans.getInvertedWorldTransform().multiplyPoint(pos)
    )

    // Find min and max x, y in camera local space, and average z
    let min_x = Infinity
    let max_x = -Infinity
    let min_y = Infinity
    let max_y = -Infinity
    let avg_z = 0

    for (let i = 0; i < localPositions.length; i++) {
      const localPos = localPositions[i]
      if (localPos.x < min_x) min_x = localPos.x
      if (localPos.x > max_x) max_x = localPos.x
      if (localPos.y < min_y) min_y = localPos.y
      if (localPos.y > max_y) max_y = localPos.y
      avg_z += localPos.z
    }
    avg_z = avg_z / localPositions.length // Average z depth

    // Calculate center and size
    const center_x = (min_x + max_x) * 0.5
    const center_y = (min_y + max_y) * 0.5
    const width = max_x - min_x
    const height = max_y - min_y

    // Shrink the bounds to make rectangle smaller
    const shrunk_width = width * RECTANGLE_SHRINK_FACTOR
    const shrunk_height = height * RECTANGLE_SHRINK_FACTOR

    // Calculate new bounds (centered, but smaller)
    const shrunk_min_x = center_x - shrunk_width * 0.5
    const shrunk_max_x = center_x + shrunk_width * 0.5
    const shrunk_min_y = center_y - shrunk_height * 0.5
    const shrunk_max_y = center_y + shrunk_height * 0.5

    print("[PictureBehavior] Original bounds - min_x: " + min_x.toFixed(2) + ", max_x: " + max_x.toFixed(2) + ", min_y: " + min_y.toFixed(2) + ", max_y: " + max_y.toFixed(2))
    print("[PictureBehavior] Shrunk bounds - min_x: " + shrunk_min_x.toFixed(2) + ", max_x: " + shrunk_max_x.toFixed(2) + ", min_y: " + shrunk_min_y.toFixed(2) + ", max_y: " + shrunk_max_y.toFixed(2) + ", avg_z: " + avg_z.toFixed(2))

    // Convert back to world space for the corners (using average z depth and shrunk bounds)
    const topLeftLocal = new vec3(shrunk_min_x, shrunk_max_y, avg_z) // Top-left in camera space
    const topRightLocal = new vec3(shrunk_max_x, shrunk_max_y, avg_z) // Top-right in camera space
    const bottomRightLocal = new vec3(shrunk_max_x, shrunk_min_y, avg_z) // Bottom-right in camera space
    const bottomLeftLocal = new vec3(shrunk_min_x, shrunk_min_y, avg_z) // Bottom-left in camera space

    // Convert to world positions
    const topLeftPos = this.camTrans.getWorldTransform().multiplyPoint(topLeftLocal)
    const topRightPos = this.camTrans.getWorldTransform().multiplyPoint(topRightLocal)
    const bottomRightPos = this.camTrans.getWorldTransform().multiplyPoint(bottomRightLocal)
    const bottomLeftPos = this.camTrans.getWorldTransform().multiplyPoint(bottomLeftLocal)

    // Set circle positions to form rectangle
    this.circleTrans[0].setWorldPosition(topLeftPos) // Top left
    this.circleTrans[1].setWorldPosition(topRightPos) // Top right
    this.circleTrans[2].setWorldPosition(bottomRightPos) // Bottom right
    this.circleTrans[3].setWorldPosition(bottomLeftPos) // Bottom left

    // Calculate center position
    const centerPos = topLeftPos.add(bottomRightPos).uniformScale(0.5)

    // Rotate the picAnchorTrans to stay aligned with the box formed by the circles
    this.picAnchorTrans.setWorldPosition(bottomRightPos)
    const worldWidth = bottomRightPos.distance(bottomLeftPos)
    const worldHeight = topRightPos.distance(bottomRightPos)
    this.picAnchorTrans.setWorldScale(new vec3(worldWidth, worldHeight, 1))

    const rectRight = topRightPos.sub(topLeftPos).normalize()
    const rectUp = topLeftPos.sub(bottomLeftPos).normalize()
    const rectForward = rectRight.cross(rectUp).normalize()
    this.rotMat.column0 = rectRight
    this.rotMat.column1 = rectUp
    this.rotMat.column2 = rectForward
    const rectRotation = quat.fromRotationMat(this.rotMat)
    this.picAnchorTrans.setWorldRotation(rectRotation)

    // Set loader position to center of rectangle
    this.loadingTrans.setWorldPosition(centerPos.add(rectForward.uniformScale(0.2)))
    this.loadingTrans.setWorldRotation(rectRotation)
  }
}
