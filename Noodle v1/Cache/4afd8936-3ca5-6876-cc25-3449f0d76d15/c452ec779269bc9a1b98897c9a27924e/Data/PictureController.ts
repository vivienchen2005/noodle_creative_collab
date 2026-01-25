import { SIK } from "SpectaclesInteractionKit.lspkg/SIK"
import { CameraService } from "./CameraService"
import { CropRegion } from "./CropRegion"

@component
export class PictureController extends BaseScriptComponent {
  @input scannerPrefab: ObjectPrefab
  @input cameraService: CameraService | null = null

  private isEditor = global.deviceInfoSystem.isEditor()

  private rightHand = SIK.HandInputData.getHand("right")
  private leftHand = SIK.HandInputData.getHand("left")

  private leftDown = false
  private rightDown = false

  onAwake() {
    this.rightHand.onPinchUp.add(this.rightPinchUp)
    this.rightHand.onPinchDown.add(this.rightPinchDown)
    this.leftHand.onPinchUp.add(this.leftPinchUp)
    this.leftHand.onPinchDown.add(this.leftPinchDown)
    if (this.isEditor) {
      this.createEvent("TouchStartEvent").bind(this.editorTest.bind(this))
    } else {
      const obj = this.getSceneObject()
      if (obj.getChildrenCount() > 0) {
        obj.getChild(0).destroy()
      }
    }
  }

  editorTest() {
    print("Creating Editor Scanner...")
    this.createScanner()
  }

  private leftPinchDown = () => {
    print("LEFT Pinch down")
    this.leftDown = true
    // Create scanner on single-hand pinch (right hand takes priority for circle drawing)
    // Only create if right hand is not already down (to avoid duplicate scanners)
    if (!this.rightDown) {
      // Left hand can also create scanner, but we prefer right hand for circle drawing
      // this.createScanner()
    }
  }

  private leftPinchUp = () => {
    print("LEFT Pinch up")
    this.leftDown = false
  }

  private rightPinchDown = () => {
    print("RIGHT Pinch down")
    this.rightDown = true
    // Create scanner on single-hand pinch for circle drawing
    this.createScanner()
  }

  private rightPinchUp = () => {
    print("RIGHT Pinch up")
    this.rightDown = false
  }

  isPinchClose() {
    return this.leftHand.thumbTip.position.distance(this.rightHand.thumbTip.position) < 10
  }

  createScanner() {
    print("[PictureController] Creating scanner...")
    const scanner = this.scannerPrefab.instantiate(this.getSceneObject())
    print("[PictureController] Scanner created")
    
    // Find and assign CameraService to CropRegion after instantiation
    this.assignCameraServiceToCropRegion(scanner)
  }

  /**
   * Finds CameraService and assigns it to CropRegion component in the instantiated scanner
   */
  private assignCameraServiceToCropRegion(scanner: SceneObject): void {
    // Find CameraService - first try the input, then search in scene
    let cameraService: CameraService | null = this.cameraService
    
    if (!cameraService) {
      // Search for CameraService in the scene
      const rootObjects = global.scene.getRootObjectsCount()
      for (let i = 0; i < rootObjects; i++) {
        const rootObject = global.scene.getRootObject(i)
        const service = rootObject.getComponent(CameraService.getTypeName() as any) as CameraService | null
        if (service) {
          cameraService = service
          print("[PictureController] Found CameraService in scene")
          break
        }
        // Also check children
        const childCount = rootObject.getChildrenCount()
        for (let j = 0; j < childCount; j++) {
          const child = rootObject.getChild(j)
          const childService = child.getComponent(CameraService.getTypeName() as any) as CameraService | null
          if (childService) {
            cameraService = childService
            print("[PictureController] Found CameraService in scene children")
            break
          }
        }
        if (cameraService) break
      }
    }
    
    if (!cameraService) {
      print("[PictureController] ERROR - CameraService not found! CropRegion will not work properly.")
      return
    }
    
    // Find CropRegion in the instantiated scanner
    const cropRegion = this.findCropRegionInHierarchy(scanner)
    if (cropRegion) {
      cropRegion.cameraService = cameraService
      print("[PictureController] Assigned CameraService to CropRegion")
    } else {
      print("[PictureController] WARNING - CropRegion component not found in scanner hierarchy")
    }
  }

  /**
   * Recursively searches for CropRegion component in the scene object hierarchy
   */
  private findCropRegionInHierarchy(obj: SceneObject): CropRegion | null {
    // Check current object
    const cropRegion = obj.getComponent(CropRegion.getTypeName() as any) as CropRegion | null
    if (cropRegion) {
      return cropRegion
    }
    
    // Check children recursively
    const childCount = obj.getChildrenCount()
    for (let i = 0; i < childCount; i++) {
      const child = obj.getChild(i)
      const found = this.findCropRegionInHierarchy(child)
      if (found) {
        return found
      }
    }
    
    return null
  }
}
