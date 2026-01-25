# Connection/Patch System Setup

## Overview
The connection system allows you to create visual connections (patches) between nodes using bezier curves.

## Components Created

### 1. ConnectionLine.ts
- Draws a bezier curve between two nodes
- Connects from source node's "out" point to target node's "in" point
- Supports dragging (temporary connection while dragging)

### 2. NodeConnectionHandler.ts
- Handles connection creation and interaction
- Listens for grab gestures
- Manages dragging and connecting

## How to Use

### Step 1: Create NodeConnectionHandler in Scene
1. Create a SceneObject named "NodeConnectionHandler"
2. Add `NodeConnectionHandler.ts` component
3. Assign a Material to `connectionMaterial` field (for the connection lines)

### Step 2: Start a Connection
Currently, you can start a connection programmatically:
```typescript
const handler = NodeConnectionHandler.getInstance();
const sourceNode = // your node SceneObject
const outPos = sourceNode.getComponent(BaseNode.getTypeName()).getOutConnectionPosition();
handler.startConnection(sourceNode, outPos);
```

### Step 3: Complete a Connection
When dragging ends, the handler will try to find a target node. To complete manually:
```typescript
const targetNode = // target node SceneObject
handler.currentConnection.stopDragging(targetNode);
```

## Next Steps (TODO)

1. **Detect node grabbing** - Use Frame's Interactable to detect when user grabs near "out" point
2. **Proximity detection** - Find nearest node's "in" point when releasing
3. **Visual feedback** - Highlight connection points when hovering
4. **Connection validation** - Check if connection is valid (e.g., can't connect to self)

## Current Limitations

- Manual connection creation (not yet gesture-based)
- No automatic node detection on grab
- No proximity-based connection completion

These will be implemented step by step!
