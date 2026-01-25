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
  }
}
