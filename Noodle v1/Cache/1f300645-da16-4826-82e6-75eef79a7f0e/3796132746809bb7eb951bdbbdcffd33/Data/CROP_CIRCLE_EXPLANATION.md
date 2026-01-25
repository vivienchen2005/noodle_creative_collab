# Crop Circle System - How It Works

## Overview
The Crop Circle system allows users to draw a rectangle in 3D space using hand gestures, which then crops a region from the camera feed and captures it as an image.

## System Architecture

### Components Overview

1. **PictureController** - Entry point, detects pinch gestures
2. **PictureBehavior** - Tracks hand movement and calculates crop rectangle
3. **CropRegion** - Real-time crop rectangle tracking on camera texture
4. **CameraService** - Camera setup and coordinate space conversions
5. **CaptionBehavior** - Optional caption display (not actively used in main flow)

---

## Detailed Flow

### Phase 1: Gesture Detection & Scanner Creation

**PictureController** (`PictureController.ts`):
- Listens for **right hand pinch down** gesture
- When detected, instantiates the `Scanner` prefab
- The Scanner prefab contains:
  - `PictureBehavior` component
  - `CropRegion` component  
  - 4 corner objects (TopLeft, TopRight, BottomRight, BottomLeft)
  - Visual elements (circles, loading indicator, etc.)

**Key Code:**
```typescript
private rightPinchDown = () => {
  this.rightDown = true
  this.createScanner() // Creates Scanner prefab
}
```

---

### Phase 2: Hand Movement Tracking

**PictureBehavior** (`PictureBehavior.ts`):
- When pinch is detected, starts tracking the **right hand thumb tip position**
- Continuously records positions while user is pinching (every 0.2cm movement)
- Stores all positions in `trackedPositions[]` array
- Circles are **hidden** during tracking (only shown after release)

**Key Code:**
```typescript
update() {
  if (this.isPinching) {
    const currentPos = this.rightHand.thumbTip.position
    // Only add if moved significantly (0.2cm threshold)
    if (currentPos.distance(lastPos) > 0.2) {
      this.trackedPositions.push(currentPos)
    }
  }
}
```

---

### Phase 3: Rectangle Calculation (On Pinch Release)

When user releases pinch:

1. **Calculate Bounds from Tracked Positions:**
   - Converts all tracked world positions to **camera local space**
   - Finds min/max X and Y values
   - Calculates average Z depth
   - Applies **15% shrink factor** (RECTANGLE_SHRINK_FACTOR = 0.85) to make rectangle smaller than drawn bounds

2. **Position 4 Corner Objects:**
   - Calculates 4 corner positions in world space
   - Positions the corner SceneObjects (circles) to form a rectangle
   - These corners are what `CropRegion` will track

3. **Show Visual Feedback:**
   - Enables the 4 corner circle objects (they were hidden during tracking)
   - Sets up `picAnchorObj` (image anchor) to match rectangle size/rotation
   - Positions loading indicator at center

**Key Code:**
```typescript
private calculateRectangleFromTrackedPositions() {
  // Convert to camera local space
  const localPositions = this.trackedPositions.map(pos =>
    this.camTrans.getInvertedWorldTransform().multiplyPoint(pos)
  )
  
  // Find min/max bounds
  let min_x = Infinity, max_x = -Infinity
  let min_y = Infinity, max_y = -Infinity
  
  // Apply shrink factor (85% of original size)
  const shrunk_width = width * 0.85
  const shrunk_height = height * 0.85
  
  // Position 4 corners
  this.circleTrans[0].setWorldPosition(topLeftPos)    // Top left
  this.circleTrans[1].setWorldPosition(topRightPos)   // Top right
  this.circleTrans[2].setWorldPosition(bottomRightPos) // Bottom right
  this.circleTrans[3].setWorldPosition(bottomLeftPos) // Bottom left
}
```

---

### Phase 4: Real-Time Crop Rectangle Tracking

**CropRegion** (`CropRegion.ts`):
- Tracks the 4 corner objects in **real-time** every frame
- Converts their world positions to **camera image space** (normalized -1 to 1)
- Calculates bounding rectangle from the 4 points
- Updates the `screenCropTexture`'s crop rectangle dynamically

**How it works:**
1. Gets world position of each corner object
2. Converts to camera image space using `CameraService`:
   - Editor: `WorldToEditorCameraSpace()`
   - Device: `WorldToTrackingRightCameraSpace()`
3. Checks if all points are within image bounds (-1 to 1)
4. If any point is out of bounds, resets crop to full image
5. Otherwise, calculates min/max bounds and updates crop rectangle

**Key Code:**
```typescript
update() {
  const imagePoints = []
  for (let i = 0; i < this.transformsToTrack.length; i++) {
    // Convert world position to camera image space
    let imagePos = vec2.zero()
    if (this.isEditor) {
      imagePos = this.cameraService.WorldToEditorCameraSpace(
        this.transformsToTrack[i].getWorldPosition()
      )
    } else {
      imagePos = this.cameraService.WorldToTrackingRightCameraSpace(
        this.transformsToTrack[i].getWorldPosition()
      )
    }
    
    // Check if point is in bounds
    const isTrackingPoint = Math.abs(imagePos.x) <= 1 && Math.abs(imagePos.y) <= 1
    imagePoints.push(imagePos)
    
    if (!isTrackingPoint) {
      // Reset to full image if any point is out of bounds
      this.cropProvider.cropRect = Rect.create(-1, 1, -1, 1)
      return
    }
  }
  
  // Calculate crop rectangle from min/max bounds
  this.OnTrackingUpdated(imagePoints)
}
```

**OnTrackingUpdated:**
- Finds min/max X and Y from the 4 image points
- Calculates center and size
- Updates `cropProvider.cropRect` which crops the camera texture in real-time

---

### Phase 5: Image Capture

After pinch release:
1. **Wait 500ms** for hands to move away (so hands aren't in captured image)
2. **Capture the cropped frame:**
   - Creates `ProceduralTextureProvider` from `screenCropTexture`
   - Assigns to `captureRendMesh.mainPass.captureImage`
   - This freezes the current cropped camera frame

3. **Validation:**
   - Checks if crop area is large enough (min 8cm x 8cm)
   - If too small, destroys scanner and aborts

4. **Finalization:**
   - Disables `CropRegion` (stops real-time tracking)
   - Shows loading indicator
   - Captured image is now available in `captureRendMesh.mainPass.captureImage`

**Key Code:**
```typescript
private captureAndProcessImage() {
  // Wait 500ms for hands to move away
  captureDelayEvent.reset(0.5)
  
  // Capture cropped texture
  this.captureRendMesh.mainPass.captureImage = 
    ProceduralTextureProvider.createFromTexture(this.screenCropTexture)
  
  // Validate size
  if (this.getHeight() < 8 || this.getWidth() < 8) {
    this.getSceneObject().destroy() // Too small, abort
    return
  }
  
  // Disable real-time tracking
  this.cropRegion.enabled = false
  this.loadingObj.enabled = true
}
```

---

## CameraService - Coordinate Space Conversion

**CameraService** (`CameraService.ts`):
- Sets up camera texture from device camera
- Creates virtual cameras matching device tracking cameras
- Provides coordinate conversion functions:

**Key Functions:**
- `WorldToEditorCameraSpace(worldPos)` - Converts world position to editor camera image space
- `WorldToTrackingRightCameraSpace(worldPos)` - Converts to device right camera image space
- `CameraToScreenSpace(camComp, worldPos)` - Core conversion:
  1. Uses `camera.worldSpaceToScreenSpace()` to get screen coordinates (0-1)
  2. Remaps to normalized image space (-1 to 1)
  3. Inverts Y axis (screen Y goes 0→1 top→bottom, image Y goes -1→1 bottom→top)

**Coordinate Spaces:**
- **World Space**: 3D positions in scene (centimeters)
- **Screen Space**: 0-1 normalized screen coordinates
- **Image Space**: -1 to 1 normalized camera image coordinates (what crop uses)

---

## Visual Elements

### Corner Objects (Circles)
- 4 SceneObjects representing rectangle corners
- Hidden during tracking, shown after pinch release
- Positioned by `PictureBehavior` based on tracked hand movement
- Tracked by `CropRegion` to update crop rectangle

### Loading Indicator
- Shown after image capture
- Positioned at center of crop rectangle
- Rotated to match rectangle orientation

### Image Anchor (`picAnchorObj`)
- SceneObject that represents the final image plane
- Positioned and scaled to match crop rectangle
- Rotated to align with rectangle orientation
- Can be used to display the captured image

---

## Key Concepts

### Why Two Systems?
1. **PictureBehavior** - Calculates rectangle from **hand movement** (gesture-based)
2. **CropRegion** - Tracks rectangle from **corner objects** (object-based)

This dual system allows:
- User draws with hand → Rectangle calculated from gesture
- Rectangle corners positioned → CropRegion tracks them in real-time
- If corners move (e.g., user adjusts them), crop updates automatically

### Crop Rectangle Coordinate System
- Uses normalized coordinates: **-1 to 1** for both X and Y
- Center is (0, 0)
- Top-left is approximately (-1, 1)
- Bottom-right is approximately (1, -1)
- Applied to `CameraTextureProvider.cropRect`

### Shrink Factor
- Rectangle is **15% smaller** than drawn bounds
- Prevents edge cases where drawn area might be slightly off
- Ensures captured image is fully within intended bounds

---

## Data Flow Summary

```
User Pinches Right Hand
    ↓
PictureController.createScanner()
    ↓
Scanner Prefab Instantiated
    ├─ PictureBehavior starts tracking thumb position
    └─ CropRegion waits for cameraService assignment
    ↓
User Moves Hand While Pinching
    ↓
PictureBehavior.update() tracks positions
    ↓
User Releases Pinch
    ↓
PictureBehavior.calculateRectangleFromTrackedPositions()
    ├─ Calculates bounds from tracked positions
    ├─ Applies 15% shrink
    └─ Positions 4 corner objects
    ↓
CropRegion.update() (every frame)
    ├─ Tracks 4 corner world positions
    ├─ Converts to camera image space
    └─ Updates screenCropTexture.cropRect
    ↓
Wait 500ms (hands move away)
    ↓
PictureBehavior.captureAndProcessImage()
    ├─ Captures screenCropTexture
    ├─ Validates size (min 8cm x 8cm)
    └─ Freezes frame in captureRendMesh.mainPass.captureImage
    ↓
Image Ready for Use!
```

---

## Important Notes

1. **Hands must move away** before capture (500ms delay) to avoid hands in image
2. **Minimum size validation**: Crop area must be at least 8cm x 8cm
3. **Real-time tracking**: CropRegion updates every frame, so if corners move, crop updates
4. **Coordinate conversion**: Critical for accurate cropping - world space → camera image space
5. **Shrink factor**: Applied to make rectangle slightly smaller than drawn area for safety
