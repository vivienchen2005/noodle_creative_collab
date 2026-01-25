# Quick Start Guide

## ✅ Error Check Results

All files have been checked - **NO ERRORS FOUND** ✓

## 🚀 Quick Setup (5 Steps)

### Step 1: Create NodeManager in Scene
1. Create SceneObject named "NodeManager"
2. Add `NodeManager.ts` component
3. Leave fields empty for now (we'll fill them in step 2-3)

### Step 2: Create NodeMenu
1. Create SceneObject named "NodeMenu"
2. Add `Frame` component (from Spectacles UI Kit)
3. Add `NodeMenu.ts` component
4. Assign Frame to NodeMenu's `menuFrame` field
5. Go back to NodeManager and assign this NodeMenu

### Step 3: Create Connection Material
1. Create a Material asset
2. Save it in `Assets/NodeSystem/Materials/`
3. Assign it to NodeManager's `connectionMaterial` field

### Step 4: Create Base Node Prefab
1. Create SceneObject "BaseNode"
2. Add `Frame` component
3. Add `BaseNode.ts` component
4. Assign Frame to BaseNode's `frameComponent`
5. Set `nodeType` to "Base"
6. The component will auto-create InPoint and OutPoint children
7. Add `ConnectionPoint` component to InPoint and OutPoint
8. Set InPoint's `pointType` to "in", OutPoint's to "out"
9. Assign BaseNode to both connection points' `parentNode`
10. Save as prefab: `Assets/NodeSystem/Prefabs/BaseNode.prefab`

### Step 5: Register Node Types
1. Create SceneObject "NodeSystemInitializer"
2. Add `NodeSystemInitializer.ts` component
3. Add your node prefabs to `nodePrefabs` array
4. Add corresponding type names to `nodeTypeNames` array
   - Example: ["Image", "Text", "AI", "3D"]
   - Make sure order matches prefabs array

## 📋 Complete Setup Checklist

- [ ] NodeManager created and configured
- [ ] NodeMenu created with Frame component
- [ ] Connection material created
- [ ] BaseNode prefab created with connection points
- [ ] Node types registered via NodeSystemInitializer
- [ ] Gesture Module enabled in project
- [ ] Hand tracking enabled

## 🎮 How to Use

### Creating Your First Connection

1. **Create a node** (programmatically or via prefab):
   ```typescript
   const nodeManager = NodeManager.getInstance();
   const node = nodeManager.createNode("Base", new vec3(0, 1, 0));
   ```

2. **Grab the "out" connection point** with your hand (grab gesture)

3. **Drag** - the curve will follow your hand

4. **Release** - NodeMenu appears

5. **Select node type** from menu

6. **New node created** and automatically connected!

## 🔧 Common Issues & Fixes

### Import Path Issue
If `BezierCurve` import fails in `InteractiveBezierCurve.ts`:
- The path `../../RuntimeGizmos.lspkg/Scripts/BezierCurve` should work
- If not, you may need to copy BezierCurve.ts into NodeSystem/Scripts/

### Gestures Not Working
- Ensure Gesture Module is enabled
- Check hand tracking is active
- Verify `handType` in InteractiveBezierCurve matches your hand

### Connections Not Showing
- Check `connectionMaterial` is assigned
- Verify material works with InteractorLineRenderer
- Check BezierCurve's `lineMaterial` is set

### Nodes Not Creating
- Verify prefabs are registered in NodeTypeRegistry
- Check prefab has BaseNode component
- Ensure connection points are set up correctly

## 📚 Next Steps

1. Create specialized node prefabs (ImageNode, TextNode, etc.)
2. Implement NodeMenu UI buttons
3. Add save/load functionality
4. Customize node behaviors
5. Add connection validation

## 📖 Full Documentation

See `SETUP_GUIDE.md` for detailed documentation.
