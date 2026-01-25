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

  // Pinch visualization
  private rightHandMesh: RenderMeshVisual | null = null
  private rightHandTipGlowMaterial: Material | null = null
  private isRightHandPinching = false
  private pinchGlowInitialized = false

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
      //wait for small delay and capture image
      // const delayedEvent = this.createEvent("DelayedCallbackEvent")
      // delayedEvent.bind(() => {
      //   this.loadingObj.enabled = true
      //   this.cropRegion.enabled = false
      //   this.captureRendMesh.mainPass.captureImage = ProceduralTextureProvider.createFromTexture(this.screenCropTexture)
      //   this.chatGPT.makeImageRequest(this.captureRendMesh.mainPass.captureImage, (response) => {
      //     this.loadingObj.enabled = false
      //     this.loadCaption(response)
      //   })
      // })
      // delayedEvent.reset(0.1)
    } else {
      //send offscreen
      this.getSceneObject().getTransform().setWorldPosition(vec3.up().uniformScale(1000))
      this.updateEvent = this.createEvent("UpdateEvent")
      this.updateEvent.bind(this.update.bind(this))
      print("[PictureBehavior] Update event created for non-editor mode")
    }

    // Also create update event for editor mode if needed (will be created on pinch down)
    print("[PictureBehavior] onAwake complete, isEditor: " + this.isEditor)

    // Initialize pinch visualization
    this.initializePinchVisualization()
  }

  /**
   * Initializes pinch visualization by finding HandVisual component and accessing glow materials
   */
  private initializePinchVisualization(): void {
    try {
      // Find HandVisual component in the scene
      const handVisual = this.findHandVisualComponent()
      if (!handVisual) {
        print("[PictureBehavior] HandVisual component not found - pinch glow will not work")
        return
      }

      // Get the hand mesh RenderMeshVisual from HandVisual
      // HandVisual has handMeshIndexThumb, handMeshFull, or handMeshPin properties
      // We need to access the component's properties, but since it's a native component,
      // we'll search for the hand mesh SceneObject instead
      const rightHandMeshObj = this.findSceneObjectByName(null, "RightHandMeshIndexThumb")
      if (rightHandMeshObj) {
        this.rightHandMesh = rightHandMeshObj.getComponent("RenderMeshVisual") as RenderMeshVisual | null
        if (this.rightHandMesh) {
          // Try to get the tip glow material (usually material index 1)
          // Or we can clone the material like InteractionHintController does
          const materialCount = this.rightHandMesh.getMaterialsCount()
          print(`[PictureBehavior] Found right hand mesh with ${materialCount} materials`)
          
          if (materialCount > 1) {
            // Material index 1 is typically the tip glow material
            const originalMaterial = this.rightHandMesh.getMaterial(1)
            if (originalMaterial) {
              this.rightHandTipGlowMaterial = originalMaterial.clone()
              this.rightHandMesh.setMaterial(1, this.rightHandTipGlowMaterial)
              this.rightHandTipGlowMaterial.mainPass.glowIntensity = 0.0
              this.pinchGlowInitialized = true
              print("[PictureBehavior] Pinch glow visualization initialized successfully")
            }
          } else {
            print("[PictureBehavior] Hand mesh doesn't have enough materials for glow effect")
          }
        } else {
          print("[PictureBehavior] Could not find RenderMeshVisual on right hand mesh")
        }
      } else {
        print("[PictureBehavior] RightHandMeshIndexThumb not found - trying alternative search")
        // Try alternative: search for any hand mesh in HandVisual's hierarchy
        this.findHandMeshAlternative()
      }
    } catch (e) {
      print(`[PictureBehavior] Error initializing pinch visualization: ${e}`)
    }
  }

  /**
   * Finds HandVisual component in the scene
   */
  private findHandVisualComponent(): SceneObject | null {
    const rootObjects = global.scene.getRootObjectsCount()
    for (let i = 0; i < rootObjects; i++) {
      const rootObject = global.scene.getRootObject(i)
      const handVisual = rootObject.getComponent("HandVisual")
      if (handVisual) {
        print(`[PictureBehavior] Found HandVisual component on ${rootObject.name}`)
        return rootObject
      }
      // Also check children
      const childCount = rootObject.getChildrenCount()
      for (let j = 0; j < childCount; j++) {
        const child = rootObject.getChild(j)
        const childHandVisual = child.getComponent("HandVisual")
        if (childHandVisual) {
          print(`[PictureBehavior] Found HandVisual component on ${child.name}`)
          return child
        }
      }
    }
    return null
  }

  /**
   * Alternative method to find hand mesh by searching HandVisual hierarchy
   */
  private findHandMeshAlternative(): void {
    const handVisualObj = this.findHandVisualComponent()
    if (!handVisualObj) return

    // Search for hand mesh in HandVisual's children
    const handMesh = this.findSceneObjectByName(handVisualObj, "RightHandMeshIndexThumb") ||
                     this.findSceneObjectByName(handVisualObj, "RightHandGeo") ||
                     this.findSceneObjectByName(handVisualObj, "RightHand")
    
    if (handMesh) {
      this.rightHandMesh = handMesh.getComponent("RenderMeshVisual") as RenderMeshVisual | null
      if (this.rightHandMesh && this.rightHandMesh.getMaterialsCount() > 1) {
        const originalMaterial = this.rightHandMesh.getMaterial(1)
        if (originalMaterial) {
          this.rightHandTipGlowMaterial = originalMaterial.clone()
          this.rightHandMesh.setMaterial(1, this.rightHandTipGlowMaterial)
          this.rightHandTipGlowMaterial.mainPass.glowIntensity = 0.0
          this.pinchGlowInitialized = true
          print("[PictureBehavior] Pinch glow visualization initialized (alternative method)")
        }
      }
    }
  }

  /**
   * Helper method to find SceneObject by name (similar to InteractionHintController)
   */
  private findSceneObjectByName(root: SceneObject | null, name: string): SceneObject | null {
    if (root === null) {
      const rootObjectCount = global.scene.getRootObjectsCount()
      for (let i = 0; i < rootObjectCount; i++) {
        const result = this.findSceneObjectByName(global.scene.getRootObject(i), name)
        if (result) return result
      }
    } else {
      if (root.name === name) {
        return root
      }
      for (let i = 0; i < root.getChildrenCount(); i++) {
        const child = root.getChild(i)
        const result = this.findSceneObjectByName(child, name)
        if (result) return result
      }
    }
    return null
  }

  private startTracking() {
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
    // Capture the image now (after hands have moved away)
    if (this.screenCropTexture && this.screenCropTexture.getColorspace() == 3) {
      try {
        this.captureRendMesh.mainPass.captureImage = ProceduralTextureProvider.createFromTexture(this.screenCropTexture)
        print("[PictureBehavior] Frame captured successfully")
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

      // Disable crop region and show loading indicator
      this.cropRegion.enabled = false
      if (this.loadingObj) {
        this.loadingObj.enabled = true
      }

      // Frame is now captured and available in captureRendMesh.mainPass.captureImage
      // You can use it however you need (save, display, process, etc.)
      print("[PictureBehavior] Freeze frame captured and ready to use!")

      // Optional: Hide loading after a moment if you want
      // const hideLoadingEvent = this.createEvent("DelayedCallbackEvent")
      // hideLoadingEvent.bind(() => {
      //   if (this.loadingObj) {
      //     this.loadingObj.enabled = false
      //   }
      // })
      // hideLoadingEvent.reset(1.0)
    }
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
    // Update pinch visualization glow
    this.updatePinchGlow()

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

  /**
   * Updates pinch glow visualization based on thumb/index tip distance
   * Similar to InteractionHintController's onUpdate method
   */
  private updatePinchGlow(): void {
    if (!this.pinchGlowInitialized || !this.rightHandTipGlowMaterial) {
      return
    }

    try {
      // Get thumb and index tip positions
      const indexTipPos = this.rightHand.indexTip.position
      const thumbTipPos = this.rightHand.thumbTip.position
      const distance = thumbTipPos.distance(indexTipPos)

      // Update glow based on pinch distance (similar to InteractionHintController)
      // When distance < 2cm, show glow (pinch active)
      // When distance > 3cm, hide glow (pinch released)
      if (distance < 2 && !this.isRightHandPinching) {
        this.rightHandTipGlowMaterial.mainPass.glowIntensity = 1.0
        this.isRightHandPinching = true
      } else if (distance > 3 && this.isRightHandPinching) {
        this.rightHandTipGlowMaterial.mainPass.glowIntensity = 0.0
        this.isRightHandPinching = false
      } else if (distance >= 2 && distance <= 3) {
        // Smooth transition between 2-3cm
        const normalized = (distance - 2) / (3 - 2) // 0 to 1
        this.rightHandTipGlowMaterial.mainPass.glowIntensity = 1.0 - normalized
      }
    } catch (e) {
      // Hand tracking might not be available yet, ignore errors
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
