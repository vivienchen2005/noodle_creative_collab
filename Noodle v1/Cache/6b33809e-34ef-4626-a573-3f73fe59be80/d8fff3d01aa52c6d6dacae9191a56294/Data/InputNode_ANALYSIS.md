# InputNode.ts Analysis - Issues Found

## Critical Issues:

### 1. **Title Not Updating**
**Problem**: Title text doesn't update when input type changes
**Root Cause**: 
- `updateTitle()` updates `titleText.text`, but the Text component might not be refreshing
- Title might not exist when `setInputType()` is called before `setupNode()`
- No forced refresh of the Text component

**Fix Needed**: Ensure title exists before updating, force text refresh

### 2. **Image Mode Not Switching**
**Problem**: Image UI doesn't show when switching to image mode
**Root Cause**:
- `setupImageContent()` returns early if `imageComponent` exists, but doesn't ensure container is enabled
- Container might be created but disabled
- Order of operations: hide → setup → show might have timing issues

**Fix Needed**: Always ensure containers are enabled when setting up content, even if components exist

### 3. **Content Object Destruction Issue**
**Problem**: When switching types, `_contentObject` is destroyed but containers remain
**Root Cause**:
- Containers are persistent, but their children are destroyed
- This leaves containers empty but enabled/disabled incorrectly
- Need to ensure containers are properly managed

**Fix Needed**: Better container state management when switching types

### 4. **Position Unit Conversion Bug**
**Problem**: Output button position calculation is wrong
**Root Cause**: 
- `frameSize` is in **centimeters** (cm)
- Positions need to be in **meters** (divide by 100)
- Current code: `frameSize.x / 2` should be `frameSize.x / 200` (cm to meters)

**Fix Needed**: Fix position calculations to convert cm to meters

### 5. **Early Return Logic Issues**
**Problem**: Setup methods return early if components exist, skipping container enablement
**Root Cause**:
- `setupPromptContent()` and `setupImageContent()` check if components exist and return early
- But they don't ensure containers are enabled/disabled correctly
- This causes containers to be in wrong state when switching types

**Fix Needed**: Always ensure containers are in correct state, even if components exist

## Recommended Fixes:

1. **Ensure title exists before updating** - Check and create if needed
2. **Fix container enablement** - Always enable containers when setting up content
3. **Fix position calculations** - Convert cm to meters properly
4. **Improve state management** - Better handling of container/content lifecycle
5. **Add defensive checks** - Ensure all objects exist before accessing properties
