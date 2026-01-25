# Node System Setup Guide

## Overview
This guide explains how to set up and use the Node-Based Visual Programming System for Spectacles.

## File Structure
```
Assets/
├── NodeSystem/
│   ├── Scripts/
│   │   ├── BaseNode.ts              # Base class for all nodes
│   │   ├── ConnectionPoint.ts       # In/Out connection points
│   │   ├── InteractiveBezierCurve.ts # Gesture-interactive curves
│   │   ├── NodeConnection.ts        # Connection manager
│   │   ├── NodeManager.ts           # Central manager (singleton)
│   │   ├── NodeMenu.ts              # Node creation menu
│   │   └── NodeTypeRegistry.ts      # Node type registry
│   ├── Prefabs/                     # Node prefabs (to be created)
│   └── Materials/                   # Connection materials (to be created)
└── RuntimeGizmos.lspkg/
    └── Scripts/
        └── BezierCurve.ts           # Base bezier curve (used by InteractiveBezierCurve)
```

## Step-by-Step Setup

### 1. Create Node Manager in Scene

1. **Create a SceneObject** in your scene (e.g., "NodeManager")
2. **Add NodeManager component** to it:
   - In Inspector, click "Add Component" → "Script" → select `NodeManager.ts`
3. **Configure NodeManager**:
   - Assign `NodeMenu` (create this next)
   - Assign `connectionMaterial` (create material for connection lines)
   - Optionally assign `nodesParent` (SceneObject to parent all nodes to)

### 2. Create Node Menu

1. **Create a SceneObject** (e.g., "NodeMenu")
2. **Add Frame component** (from Spectacles UI Kit)
3. **Add NodeMenu component**:
   - Assign the Frame component to `menuFrame`
4. **Connect to NodeManager**:
   - Assign this NodeMenu to NodeManager's `nodeMenu` field

### 3. Create Base Node Prefab

1. **Create a new SceneObject** (e.g., "BaseNode")
2. **Add Frame component** (from Spectacles UI Kit)
3. **Add BaseNode component**:
   - Assign the Frame component to `frameComponent`
   - Set `nodeType` (e.g., "Base", "Image", "Text", "AI", "3D")
   - Set `hasInPoint` and `hasOutPoint` as needed
4. **Create Connection Points**:
   - The BaseNode will auto-create "InPoint" and "OutPoint" SceneObjects
   - OR manually create them:
     - Create "InPoint" child SceneObject
     - Create "OutPoint" child SceneObject
     - Add `ConnectionPoint` component to each
     - Set `pointType` ("in" or "out")
     - Assign `parentNode` to the BaseNode SceneObject
5. **Save as Prefab**:
   - Drag the SceneObject to `Assets/NodeSystem/Prefabs/`
   - Name it `BaseNode.prefab`

### 4. Register Node Types

In your initialization script or NodeManager's `onAwake`:

```typescript
import { getNodeTypeRegistry } from "./NodeSystem/Scripts/NodeTypeRegistry";

const registry = getNodeTypeRegistry();

// Register node types with their prefabs
registry.registerNodeType("Image", imageNodePrefab);
registry.registerNodeType("Text", textNodePrefab);
registry.registerNodeType("AI", aiNodePrefab);
registry.registerNodeType("3D", threeDNodePrefab);
```

### 5. Create Connection Material

1. **Create a Material** in `Assets/NodeSystem/Materials/`
2. **Configure** for line rendering (compatible with InteractorLineRenderer)
3. **Assign** to NodeManager's `connectionMaterial` field

### 6. Set Up Gesture Interaction

The system uses Gesture Module automatically. Make sure:
- Gesture Module is enabled in your project
- Hand tracking is set up
- Users can perform grab or targeting gestures

## Usage Flow

### Creating a Connection

1. **User grabs "out" connection point** on a node
2. **NodeManager detects grab** via ConnectionPoint component
3. **Creates temporary connection** with InteractiveBezierCurve
4. **Curve follows hand** using TargetingDataEvent
5. **User releases grab**
6. **NodeMenu appears** at release position
7. **User selects node type** from menu
8. **New node created** and automatically connected

### Programmatic Usage

```typescript
// Get NodeManager instance
const nodeManager = NodeManager.getInstance();

// Create a node
const newNode = nodeManager.createNode("Image", new vec3(0, 1, 2));

// Create a connection between two nodes
const sourcePoint = sourceNode.getComponent(BaseNode.getTypeName()).getOutConnectionPoint();
const targetPoint = targetNode.getComponent(BaseNode.getTypeName()).getInConnectionPoint();
nodeManager.createConnection(sourcePoint, targetPoint);

// Start dragging a connection
nodeManager.startDraggingConnection(sourcePoint);

// Save/load
nodeManager.save();  // Serializes all nodes and connections
nodeManager.load();  // Deserializes and recreates
```

## Component Reference

### BaseNode
- **Purpose**: Base class for all node types
- **Key Properties**:
  - `frameComponent`: Frame UI component
  - `nodeType`: Type identifier
  - `nodeId`: Unique ID
  - `inConnectionPoint`: "In" connection point SceneObject
  - `outConnectionPoint`: "Out" connection point SceneObject

### ConnectionPoint
- **Purpose**: Represents "in" or "out" connection points
- **Key Properties**:
  - `pointType`: "in" or "out"
  - `parentNode`: Parent node SceneObject
- **Key Methods**:
  - `addConnection()`: Add a connection
  - `removeConnection()`: Remove a connection
  - `canAcceptConnection()`: Check if more connections allowed

### NodeConnection
- **Purpose**: Manages a single connection between nodes
- **Key Properties**:
  - `sourcePoint`: Source connection point
  - `targetPoint`: Target connection point (null if temporary)
  - `bezierCurve`: InteractiveBezierCurve component

### InteractiveBezierCurve
- **Purpose**: Gesture-interactive bezier curve
- **Key Properties**:
  - `handType`: Left or Right hand
  - `useGrabGesture`: Use grab (true) or targeting (false)
- **Key Events**:
  - `onDragStart`: Fired when dragging starts
  - `onDragEnd`: Fired when dragging ends
  - `onReleaseAtPosition`: Fired with release position

### NodeManager
- **Purpose**: Central manager (singleton)
- **Key Methods**:
  - `createNode()`: Create a new node
  - `removeNode()`: Remove a node and its connections
  - `createConnection()`: Create a connection
  - `startDraggingConnection()`: Start dragging from a point
  - `stopDraggingConnection()`: Stop dragging
  - `serialize()`: Save state
  - `deserialize()`: Load state

### NodeMenu
- **Purpose**: UI menu for node creation
- **Key Methods**:
  - `showMenu()`: Show menu at position
  - `hideMenu()`: Hide menu
  - `selectNodeType()`: Select and create node type

### NodeTypeRegistry
- **Purpose**: Registry for node types and prefabs
- **Key Methods**:
  - `registerNodeType()`: Register a node type
  - `getNodePrefab()`: Get prefab for type
  - `createNode()`: Create node instance
  - `getAvailableNodeTypes()`: Get all registered types

## Troubleshooting

### Connection not appearing
- Check that `connectionMaterial` is assigned to NodeManager
- Verify ConnectionPoint components are on connection point SceneObjects
- Ensure BezierCurve's `lineMaterial` is set

### Gestures not working
- Verify Gesture Module is enabled
- Check hand tracking is active
- Ensure `handType` matches the hand being used

### Nodes not creating
- Verify node prefabs are registered in NodeTypeRegistry
- Check prefab has BaseNode component
- Ensure prefab has connection points set up

### Menu not appearing
- Verify NodeMenu is assigned to NodeManager
- Check NodeMenu's Frame component is set up
- Ensure menu UI buttons are created (TODO in code)

## Next Steps

1. **Create node prefabs** for each node type (Image, Text, AI, 3D)
2. **Implement NodeMenu UI** with buttons for each node type
3. **Add save/load functionality** (LocalStorage or Supabase)
4. **Customize node types** with specific functionality
5. **Add visual feedback** for dragging and connections
6. **Implement connection validation** (e.g., type checking)
