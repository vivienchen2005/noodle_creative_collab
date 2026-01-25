import { SIK } from "SpectaclesInteractionKit.lspkg/SIK"

/**
 * Simple component to show/hide a visual indicator based on right hand pinch state
 * Shows when right hand is pinching, hides when not pinching
 */
@component
export class PinchVisualIndicator extends BaseScriptComponent {
  @input
  @hint("The SceneObject to show/hide based on pinch state")
  indicatorObject: SceneObject

  private rightHand = SIK.HandInputData.getHand("right")
  private updateEvent: SceneEvent | null = null
  private isPinching = false

  onAwake() {
    // Hide initially
    if (this.indicatorObject) {
      this.indicatorObject.enabled = false
      print("[PinchVisualIndicator] Indicator hidden initially")
    }

    // Listen for pinch events
    this.rightHand.onPinchDown.add(this.onPinchDown)
    this.rightHand.onPinchUp.add(this.onPinchUp)

    // Create update event to continuously check pinch state
    this.updateEvent = this.createEvent("UpdateEvent")
    this.updateEvent.bind(this.update.bind(this))
  }

  onDestroy() {
    // Clean up event listeners
    if (this.updateEvent) {
      this.removeEvent(this.updateEvent)
    }
    this.rightHand.onPinchDown.remove(this.onPinchDown)
    this.rightHand.onPinchUp.remove(this.onPinchUp)
  }

  private onPinchDown = () => {
    this.isPinching = true
    this.updateIndicator()
    print("[PinchVisualIndicator] Pinch down detected")
  }

  private onPinchUp = () => {
    this.isPinching = false
    this.updateIndicator()
    print("[PinchVisualIndicator] Pinch up detected")
  }

  private update() {
    // Also check pinch state by distance in case events are missed
    try {
      const thumbPos = this.rightHand.thumbTip.position
      const indexPos = this.rightHand.indexTip.position
      const distance = thumbPos.distance(indexPos)
      const currentlyPinching = distance < 3.0

      // Update if state changed
      if (currentlyPinching !== this.isPinching) {
        this.isPinching = currentlyPinching
        this.updateIndicator()
      }
    } catch (e) {
      // Hand tracking might not be available, ignore
    }
  }

  private updateIndicator() {
    if (!this.indicatorObject) {
      return
    }

    try {
      this.indicatorObject.enabled = this.isPinching
      if (this.isPinching) {
        print("[PinchVisualIndicator] Indicator shown")
      } else {
        print("[PinchVisualIndicator] Indicator hidden")
      }
    } catch (e) {
      print("[PinchVisualIndicator] Error updating indicator: " + e)
    }
  }
}
