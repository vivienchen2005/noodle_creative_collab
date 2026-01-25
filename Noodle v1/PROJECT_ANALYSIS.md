# Noodle v1 - Project Analysis

## Project Overview

**Project Name:** Noodle v1  
**Lens Studio Version:** 5.15.3 (Build 26011319)  
**Template:** Spectacles Starter  
**Platform:** Spectacles (2024)  
**Lens Type:** EXPERIMENTAL_API  
**Activation Camera:** Front & Back  

---

## Project Structure

All assets are located under `Assets/` as required:

```
Assets/
├── NodeSystem/              # Visual node-based connection system
│   ├── Scripts/            # Node system scripts
│   ├── Materials/          # (Empty - materials needed)
│   ├── Prefabs/            # (Empty - prefabs needed)
│   └── CONNECTION_SETUP.md # Setup documentation
├── Crop Circle.lspkg/       # Camera cropping package
├── SpectaclesUIKit.lspkg/   # UI framework package
├── RuntimeGizmos.lspkg/     # Debug visualization package
├── Hand Menu.lspkg/         # Hand menu package
└── [Scene assets]          # Materials, textures, meshes
```

---

## Core Systems

### 1. Node System (`Assets/NodeSystem/`)

A visual node-based system for creating connections between nodes using bezier curves.

#### Components:

**BaseNode.ts** (274 lines)
- Base component for all nodes
- Extends `BaseScriptComponent`
- Uses `SpectaclesUIKit` Frame component
- Features:
  - Fixed frame size (configurable in centimeters)
  - Node types: "text", "image", "3d" (via ComboBox)
  - Auto-generated unique node IDs
  - Connection points: "in" (left center) and "out" (right center)
  - Auto-registration with NodeManager
  - Frame visibility management

**NodeManager.ts** (303 lines)
- Singleton manager for all nodes and connections
- Features:
  - Node registration/unregistration
  - Connection creation/removal
  - Auto-discovery of nodes in scene
  - Connection tracking (incoming/outgoing)
  - Node deletion with connection cleanup
  - Shared connection material management
  - Optional parent organization for nodes/connections

**NodeConnectionHandler.ts** (295 lines)
- Handles gesture-based connection creation
- Features:
  - Grab gesture detection (Right/Left hand)
  - Connection dragging
  - Proximity-based node detection
  - Connection point finding (out/in points)
  - Palm orientation detection (for future use)
  - Connection threshold configuration

**ConnectionLine.ts** (210 lines)
- Visual connection line between nodes
- Uses `RuntimeGizmos` BezierCurve component
- Features:
  - Bezier curve rendering
  - Dragging support (temporary connections)
  - Automatic position updates
  - Connection point tracking
  - Material-based rendering

**NodeMenu.ts** (56 lines)
- UI menu for node creation (minimal implementation)
- Features:
  - Show/hide menu
  - Position-based display
  - Event system for node type selection
  - TODO: Full implementation pending

#### Current Status:
- ✅ Core node system implemented
- ✅ Connection system working
- ✅ Gesture-based dragging
- ⚠️ Materials folder empty (connection materials needed)
- ⚠️ Prefabs folder empty (node prefabs needed)
- ⚠️ NodeMenu needs full implementation

---

### 2. Crop Circle Package (`Assets/Crop Circle.lspkg/`)

Camera-based cropping system with hand gesture support.

#### Components:

**CameraService.ts** (73 lines)
- Camera management service
- Features:
  - Editor vs Spectacles camera handling
  - Left/Right camera setup for Spectacles
  - Virtual camera configuration
  - World-to-camera space conversion
  - Camera texture management
  - Screen crop texture support

**PictureController.ts** (149 lines)
- Main controller for picture/crop functionality
- Features:
  - Hand gesture detection (left/right pinch)
  - Scanner prefab instantiation
  - CameraService integration
  - Editor testing support
  - Automatic CameraService assignment to CropRegion

**CropRegion.ts** (Not read, but referenced)
- Handles crop region definition

**PictureBehavior.ts** (Not read, but referenced)
- Picture display behavior

**CaptionBehavior.ts** (Not read, but referenced)
- Caption display behavior

**PinchVisualIndicator.ts** (Not read, but referenced)
- Visual feedback for pinch gestures

#### Package Structure:
```
Crop Circle.lspkg/
├── Scripts/              # 6 TypeScript files
├── 3DModels/             # 3 mesh files
├── Images/               # 4 images (PNG, GIF)
├── Materials/            # 5 materials + shader graphs
├── Prefabs/              # Scanner prefab
└── Rendering/            # Camera textures
```

---

## Packages Used

### 1. SpectaclesUIKit.lspkg
- **Purpose:** UI framework for Spectacles
- **Usage:** 
  - Frame component (used in BaseNode)
  - UI elements and components
- **Files:** 222 files (111 meta, 60 TS, 11 PNG, etc.)

### 2. RuntimeGizmos.lspkg
- **Purpose:** Debug visualization tools
- **Usage:** 
  - BezierCurve component (used in ConnectionLine)
  - Line rendering utilities
- **Files:** 12 TypeScript files

### 3. Hand Menu.lspkg
- **Purpose:** Hand-based menu system
- **Status:** Package present but minimal usage

---

## Configuration Files

### tsconfig.json
- **Target:** ES2021
- **Module:** CommonJS
- **Paths:** Configured for Assets/ and Packages/
- **Includes:** TypeScript files in Assets and Packages

### jsconfig.json
- **Target:** ES2021
- **Base URL:** Assets/
- **Includes:** JavaScript files

### Noodle v1.esproj
- **Lens Name:** "Specs Starter"
- **Descriptors:** EXPERIMENTAL_API
- **Compatibilities:** Spectacles
- **Template:** Spectacles

---

## Key Features

### ✅ Implemented:
1. **Node System**
   - Base node component with Frame integration
   - Node manager with singleton pattern
   - Connection line rendering with bezier curves
   - Gesture-based connection creation
   - Auto-registration of nodes

2. **Camera System**
   - Camera service for editor/Spectacles
   - Virtual camera setup
   - World-to-camera space conversion
   - Crop texture support

3. **Hand Gestures**
   - Pinch detection (left/right)
   - Grab gesture handling
   - Hand tracking integration

### ⚠️ Partially Implemented:
1. **NodeMenu** - Basic structure, needs full UI implementation
2. **Connection Materials** - Materials folder is empty
3. **Node Prefabs** - Prefabs folder is empty

### 📝 TODO (from CONNECTION_SETUP.md):
1. Detect node grabbing using Frame's Interactable
2. Proximity detection for connection points
3. Visual feedback (highlight connection points on hover)
4. Connection validation (prevent invalid connections)

---

## Dependencies

### External Packages:
- `SpectaclesInteractionKit` - Referenced in NodeConnectionHandler
- `SpectaclesUIKit` - Used for Frame component
- `RuntimeGizmos` - Used for BezierCurve

### Lens Studio Modules:
- `LensStudio:CameraModule` - Camera access
- `LensStudio:GestureModule` - Gesture detection

---

## Code Quality Observations

### ✅ Good Practices:
- TypeScript with proper typing
- Singleton patterns where appropriate
- Comprehensive logging
- Error handling
- Component lifecycle management
- Clear separation of concerns

### ⚠️ Areas for Improvement:
- Some hardcoded values (connection thresholds)
- Missing null checks in some places
- NodeMenu needs full implementation
- Materials and prefabs need to be created

---

## Scene Structure

The scene file (`Scene.scene`) contains:
- Camera Object with Camera component
- Lighting setup
- Multiple scene objects (12 root objects)
- Render layers configured

---

## Development Notes

### Setup Requirements:
1. **Connection Material** - Must be assigned to NodeManager for connections to be visible
2. **Node Prefabs** - Need to be created for different node types
3. **Materials** - Connection line materials need to be created
4. **Frame Component** - BaseNode auto-creates Frame if not present

### Integration Points:
- NodeSystem uses SpectaclesUIKit Frame component
- ConnectionLine uses RuntimeGizmos BezierCurve
- Crop Circle uses SIK (Spectacles Interaction Kit) for hand tracking
- CameraService handles both editor and device cameras

---

## Next Steps (Recommendations)

1. **Create Connection Materials**
   - Add materials to `NodeSystem/Materials/`
   - Assign to NodeManager's `connectionMaterial` field

2. **Create Node Prefabs**
   - Create prefabs for different node types (text, image, 3d)
   - Add to `NodeSystem/Prefabs/`

3. **Complete NodeMenu**
   - Implement full UI for node type selection
   - Connect to node creation system

4. **Add Visual Feedback**
   - Highlight connection points on hover
   - Show connection preview while dragging

5. **Connection Validation**
   - Prevent self-connections
   - Validate connection types
   - Add connection rules if needed

---

## File Statistics

- **TypeScript Files:** 77 total
  - NodeSystem: 5 files
  - Crop Circle: 6 files
  - SpectaclesUIKit: 60 files
  - RuntimeGizmos: 6 files

- **JavaScript Files:** 0 (TypeScript-only project)

- **Total Scripts in Assets:** 77 TypeScript files

---

*Analysis generated from existing project files - no new files created*
