# 🍜 Noodle - Creative Collaboration Tool for Spectacles

![Platform](https://img.shields.io/badge/Platform-Snap%20Spectacles-FFFC00?style=flat&logo=snapchat&logoColor=white)
![Lens Studio](https://img.shields.io/badge/Lens%20Studio-5.15.3+-00C4CC?style=flat)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)
![Event](https://img.shields.io/badge/MIT%20Reality%20Hack-2026-red?style=flat)

> A visual node-based AI creative tool for Snap Spectacles that enables voice-to-text prompts, image capture, AI image generation, and 3D model generation through an intuitive patch/node interface.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Node Types](#-node-types)
- [Getting Started](#-getting-started)
- [API Requirements](#-api-requirements)
- [Project Structure](#-project-structure)
- [Technical Details](#-technical-details)
- [Dependencies](#-dependencies)
- [Controls](#-controls)
- [Version History](#-version-history)
- [Team](#-team)
- [License](#-license)

---

## 🎯 Overview

**Project Name:** Noodle v1  
**Platform:** Snap Spectacles (2024)  
**Lens Studio Version:** 5.15.3+  
**Template:** Spectacles Starter  
**License:** MIT RealityHack 2026  

Noodle is a visual programming environment for Spectacles that allows users to create AI-powered creative workflows by connecting nodes together. Users can:

- Speak prompts using voice-to-text
- Capture images from the real world using hand gestures
- Generate AI images from text and/or image inputs
- Generate 3D models from text and/or image inputs
- Chain outputs together (e.g., generated image → 3D model)

---

## ✨ Features

### 🎤 Voice-to-Text Input
- Toggle-based voice recording using ASR (Automatic Speech Recognition)
- Auto-stop after configurable silence period
- Real-time transcription display
- Works with any SpectaclesUIKit button type

### 📸 Image Capture with Crop Circle
- Hand gesture-based capture (dual pinch to activate)
- Draw a circle with your hands to define crop region
- Automatic frame capture when hands move away
- Re-capture support for iterating on images

### 🎨 AI Image Generation (Gemini)
- Text-to-image generation
- Image-to-image generation (style transfer, modifications)
- Combined text + image input support
- Output chaining to other nodes

### 🧊 3D Model Generation (Snap3D)
- Text-to-3D generation
- Image-to-3D generation (uses Gemini to describe image first)
- Combined text + image input support
- Configurable mesh refinement and scaling
- Interactive/draggable generated models

### 🔗 Visual Node Connections
- Smooth bezier curve connections between nodes
- Click-based connection workflow
- Multiple connection support per node
- Cyan-colored cables (#7FECFB) with natural droop

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Node System                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌───────────────────┐     ┌────────────┐  │
│  │InputNodePrompt│────▶│ProcessImageGenNode│────▶│Process3DNode│ │
│  │  (Voice/Text) │     │  (Gemini AI)      │     │ (Snap3D)   │  │
│  └──────────────┘     └───────────────────┘     └────────────┘  │
│                              ▲                         ▲         │
│  ┌──────────────┐            │                         │         │
│  │InputNodeImage │───────────┴─────────────────────────┘         │
│  │ (Crop Circle) │                                               │
│  └──────────────┘                                                │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ConnectionLine (BezierCurve) │ NodeConnectionController        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Node Types

### Input Nodes

#### `InputNodePrompt`
Voice-to-text prompt input node.

| Property | Type | Description |
|----------|------|-------------|
| `baseNode` | BaseNode | Required - Frame component |
| `outputButton` | CapsuleButton | Connection output point |
| `voiceButton` | BaseButton | Toggle voice recording |
| `promptText` | Text | Displays transcribed text |

**Output:** Text string (prompt)

---

#### `InputNodeImage`
Camera image capture node using Crop Circle.

| Property | Type | Description |
|----------|------|-------------|
| `baseNode` | BaseNode | Required - Frame component |
| `outputButton` | RoundButton | Connection output point |
| `captureButton` | CapsuleButton | Trigger capture mode |
| `cropCircleObject` | SceneObject | Crop Circle prefab reference |

**Output:** Texture, Material

---

### Process Nodes

#### `ProcessImageGenNode`
AI image generation using Google Gemini.

| Property | Type | Description |
|----------|------|-------------|
| `baseNode` | BaseNode | Required - Frame component |
| `generateButton` | CapsuleButton | Trigger generation |
| `textInputSection` | SceneObject | Text connection input |
| `imageInputSection` | SceneObject | Image connection input |
| `outputButton` | RoundButton | Output for chaining |
| `outputImage` | Image | Displays generated image |

**Inputs:** Text (required) OR Text + Image  
**Output:** Generated image texture

---

#### `Process3DNode`
3D model generation using Snap3D.

| Property | Type | Description |
|----------|------|-------------|
| `baseNode` | BaseNode | Required - Frame component |
| `generateButton` | CapsuleButton | Trigger generation |
| `textInputSection` | SceneObject | Text connection input |
| `imageInputSection` | SceneObject | Image connection input |
| `modelRoot` | SceneObject | Where 3D model spawns |
| `modelMaterial` | Material | Material for 3D model |
| `refineMesh` | boolean | Higher quality mesh |
| `modelScale` | number | Scale factor (default: 20) |
| `makeInteractable` | boolean | Enable drag/move |

**Inputs:** Text OR Image OR Both  
**Output:** 3D RenderMeshVisual

---

## 🚀 Getting Started

### Prerequisites

1. **Lens Studio** 5.15.3 or later
2. **Spectacles** device or Preview mode
3. **API Keys:**
   - Google/Gemini API token (for image generation)
   - Snap token (for 3D generation)

### Setup

1. Open project in Lens Studio
2. Add `RemoteServiceGatewayCredentials` component to a SceneObject
3. Configure API tokens:
   - Set **Google Token** for Gemini image generation
   - Set **Snap Token** for Snap3D model generation
4. Assign nodes in the scene hierarchy

> **Note:** For normal operation, disable the "Demo mode" SceneObject in the scene hierarchy to hide the demo Mode.

### Basic Workflow

1. **Create a prompt:** Tap voice button, speak your prompt
2. **Connect to process node:** Click prompt output → click process node input
3. **Generate:** Click the Generate button on the process node
4. **Chain outputs:** Connect ImageGen output to 3D node for image-to-3D

---

## 🔑 API Requirements

### RemoteServiceGatewayCredentials

This component must be present in the scene and configured:

```typescript
// Required for ProcessImageGenNode (Gemini)
AvaliableApiTypes.Google  // Google/Gemini API token

// Required for Process3DNode (Snap3D)
AvaliableApiTypes.Snap    // Snap token for 3D generation
```

### Gemini API
- Used for: Text-to-image, Image-to-image generation
- Model: `gemini-2.0-flash-preview-image-generation`
- Endpoint: Google AI Studio

### Snap3D API
- Used for: Text-to-3D, Image-to-3D generation
- Returns: GLB mesh data
- Features: Mesh refinement, vertex colors

---

## 📁 Project Structure

```
Noodle v1/
├── Assets/
│   ├── NodeSystem/
│   │   └── Scripts/
│   │       ├── BaseNode.ts              # Base frame component
│   │       ├── InputNodePrompt.ts       # Voice/text input node
│   │       ├── InputNodeImage.ts        # Image capture node
│   │       ├── ProcessImageGenNode.ts   # AI image generation
│   │       ├── Process3DNode.ts         # 3D model generation
│   │       ├── VoiceToText.ts           # ASR component
│   │       ├── ConnectionLine.ts        # Bezier curve wrapper
│   │       ├── NodeConnectionController.ts # Connection management
│   │       ├── NodeConnectionHandler.ts # Gesture-based connections
│   │       ├── NodeManager.ts           # Node registry
│   │       ├── ConnectionManager.ts     # Connection registry
│   │       └── NodeMenu.ts              # Node creation menu
│   │
│   ├── Crop Circle.lspkg/
│   │   └── Scripts/
│   │       ├── CameraService.ts         # Camera management
│   │       ├── PictureController.ts     # Capture orchestration
│   │       ├── PictureBehavior.ts       # Capture logic
│   │       ├── CropRegion.ts            # Crop rectangle
│   │       ├── CaptionBehavior.ts       # Caption display
│   │       └── PinchVisualIndicator.ts  # Pinch feedback
│   │
│   ├── RuntimeGizmos.lspkg/
│   │   └── Scripts/
│   │       └── BezierCurve.ts           # Bezier curve rendering
│   │
│   ├── SpectaclesUIKit.lspkg/           # UI framework
│   ├── RemoteServiceGateway.lspkg       # API gateway
│   └── Materials/                        # Shared materials
│
├── Packages/
│   ├── SpectaclesInteractionKit.lspkg   # Hand tracking & gestures
│   └── SpectaclesUIKit.lspkg            # UI components
│
└── Support/
    └── StudioLib.d.ts                    # Type definitions
```

---

## 🔧 Technical Details

### Connection System

Connections use `BezierCurve` component with:
- **100 interpolation points** for smooth curves
- **Cable droop style** (curveDirection: 2)
- **Cyan color** (#7FECFB / `vec3(0.498, 0.925, 0.984)`)
- **0.3 line width**
- **0.15 curve height** (subtle droop)

### Node Connection Flow

1. User clicks output button on source node
2. `NodeConnectionController` sets pending connection
3. User clicks input section on target node
4. Controller validates and creates connection
5. `ConnectionLine` creates visual bezier curve
6. Nodes register parent/child relationships

### Image Capture Flow

1. User clicks Capture button
2. Crop Circle object is unhidden
3. User performs dual pinch gesture
4. Circle is drawn between hand positions
5. `CropRegion` calculates crop rectangle
6. On release, `PictureBehavior` captures frame
7. Cropped texture is passed to node
8. Crop Circle is hidden, image displayed

### Voice-to-Text Flow

1. User taps voice button to start
2. ASR module begins listening
3. Real-time transcription displayed
4. Auto-stops after silence (configurable)
5. Final text stored for connection output

---

## 📚 Dependencies

### Core Packages

| Package | Purpose |
|---------|---------|
| `SpectaclesUIKit.lspkg` | UI components (Frame, Buttons, etc.) |
| `SpectaclesInteractionKit.lspkg` | Hand tracking, gestures, interactions |
| `RuntimeGizmos.lspkg` | BezierCurve, debug visualization |
| `RemoteServiceGateway.lspkg` | API gateway for Gemini & Snap3D |

### Lens Studio Modules

| Module | Purpose |
|--------|---------|
| `LensStudio:AsrModule` | Automatic Speech Recognition |
| `LensStudio:CameraModule` | Camera access |
| `LensStudio:GestureModule` | Gesture detection |

---

## 🎮 Controls

| Gesture | Action |
|---------|--------|
| **Tap** (output button) | Start connection |
| **Tap** (input section) | Complete connection |
| **Tap** (voice button) | Toggle voice recording |
| **Tap** (capture button) | Enter capture mode |
| **Dual Pinch + Draw** | Define crop region |
| **Release Pinch** | Capture frame |
| **Tap** (generate button) | Generate AI content |

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial release - MIT RealityHack 2026 |

---

## 👥 Team

**MIT RealityHack 2026** - Noodle Creative Collaboration Tool

- **Kavin Kumar** - [LinkedIn Profile](https://www.linkedin.com/in/rbkavin/)
- **Neha Sajja** - [LinkedIn Profile](https://www.linkedin.com/in/neha-sajja-607071192/)
- **Stacey Cho** - [LinkedIn Profile](https://www.linkedin.com/in/staceycho0323/)
- **Ash Shah** - [LinkedIn Profile](https://www.linkedin.com/in/shah94/)

---

## 📄 License

MIT RealityHack 2026 Project

---

*Documentation generated for Noodle v1 - A visual node-based AI creative tool for Snap Spectacles*
