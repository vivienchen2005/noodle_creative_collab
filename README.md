# 🍜 Noodle - AI Creative Collaboration for Spectacles

<p align="center">
  <strong>A visual node-based AI creative tool for Snap Spectacles</strong><br>
  Voice-to-text • Image Capture • AI Image Generation • 3D Model Generation
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Snap%20Spectacles-FFFC00?style=for-the-badge&logo=snapchat&logoColor=black" alt="Platform">
  <img src="https://img.shields.io/badge/Lens%20Studio-5.15.3+-00A5E0?style=for-the-badge" alt="Lens Studio">
  <img src="https://img.shields.io/badge/MIT%20Reality%20Hack-2026-FF6B6B?style=for-the-badge" alt="MIT Reality Hack 2026">
</p>

---

## 🎬 Demo

> *Transform your voice into AI-generated images and 3D models in augmented reality*

**Core Workflow:**
1. 🎤 **Speak** your creative prompt
2. 📸 **Capture** reference images from the real world
3. 🎨 **Generate** AI images with Gemini
4. 🧊 **Create** 3D models with Snap3D
5. 🔗 **Chain** outputs together for complex workflows

---

## 🎯 What is Noodle?

Noodle is a **visual programming environment** for Snap Spectacles that democratizes AI-powered creative workflows. Instead of complex interfaces, users simply:

- **Connect nodes** like a visual patch system
- **Speak prompts** instead of typing
- **Gesture to capture** images from the real world
- **Generate content** with a single tap

Perfect for:
- **Artists** exploring AI-assisted creation
- **Designers** rapid prototyping in AR
- **Creators** who want intuitive AI tools
- **Developers** building on Spectacles platform

---

## ✨ Features

### 🎤 Voice-to-Text Input
| Feature | Description |
|---------|-------------|
| ASR Integration | Automatic Speech Recognition via Lens Studio |
| Toggle Recording | Tap to start/stop voice capture |
| Auto-Stop | Configurable silence detection (default: 2s) |
| Real-time Display | See transcription as you speak |

### 📸 Image Capture (Crop Circle)
| Feature | Description |
|---------|-------------|
| Dual Pinch Activation | Natural hand gesture to start |
| Draw to Crop | Circle your hands to define capture region |
| Auto-Capture | Frame captured when hands move away |
| Re-capture Support | Iterate on images without restarting |

### 🎨 AI Image Generation (Gemini)
| Feature | Description |
|---------|-------------|
| Text-to-Image | Generate from voice prompts |
| Image-to-Image | Style transfer & modifications |
| Combined Input | Text + image for guided generation |
| Output Chaining | Connect to other nodes |

### 🧊 3D Model Generation (Snap3D)
| Feature | Description |
|---------|-------------|
| Text-to-3D | Generate models from descriptions |
| Image-to-3D | Create 3D from captured images |
| Mesh Refinement | Optional high-quality processing |
| Interactive Models | Drag and move generated objects |

### 🔗 Visual Node System
| Feature | Description |
|---------|-------------|
| Bezier Curves | Smooth, cable-like connections |
| Click-to-Connect | Intuitive workflow |
| Multi-Connection | Multiple outputs per node |
| Visual Feedback | Cyan cables (#7FECFB) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NOODLE NODE SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   INPUT NODES                    PROCESS NODES                           │
│   ───────────                    ─────────────                           │
│                                                                          │
│   ┌─────────────────┐           ┌─────────────────────┐                 │
│   │ InputNodePrompt │──────────▶│ ProcessImageGenNode │                 │
│   │   🎤 Voice/Text │           │     🎨 Gemini AI    │                 │
│   └─────────────────┘           └──────────┬──────────┘                 │
│                                            │                             │
│   ┌─────────────────┐                      │   ┌─────────────────┐      │
│   │ InputNodeImage  │──────────────────────┼──▶│  Process3DNode  │      │
│   │  📸 Crop Circle │                      │   │   🧊 Snap3D     │      │
│   └─────────────────┘                      │   └─────────────────┘      │
│                                            │           ▲                 │
│                                            └───────────┘                 │
│                                        (Image → 3D chaining)             │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│   ConnectionLine (BezierCurve)  │  NodeConnectionController             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Lens Studio** 5.15.3 or later
- **Snap Spectacles** (2024) or Preview mode
- **API Keys:**
  - 🔑 Google/Gemini API token
  - 🔑 Snap token (for 3D generation)

### Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/rbkavin/noodle_creative_collab.git

# 2. Open in Lens Studio
# Open: Noodle v1/Noodle v1.esproj

# 3. Configure API tokens (see below)
```

### API Configuration

1. **Add RemoteServiceGatewayCredentials** component to any SceneObject
2. **Set Google Token** for Gemini image generation
3. **Set Snap Token** for Snap3D model generation

```typescript
// Tokens are configured in RemoteServiceGatewayCredentials
AvaliableApiTypes.Google  // → Gemini API
AvaliableApiTypes.Snap    // → Snap3D API
```

### Your First Workflow

1. **Open** the project in Lens Studio
2. **Run** in Preview or deploy to Spectacles
3. **Tap** the voice button and speak: *"A cute robot"*
4. **Click** the prompt output button
5. **Click** the ImageGen text input
6. **Tap** Generate → AI image appears!
7. **Connect** ImageGen output to 3D node
8. **Tap** Generate → 3D model spawns!

---

## 📦 Node Reference

### `InputNodePrompt`
> Voice-to-text input with ASR

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `baseNode` | BaseNode | ✅ | Frame component |
| `voiceButton` | BaseButton | Auto | Recording toggle |
| `outputButton` | CapsuleButton | Auto | Connection point |

**Output:** `string` (transcribed text)

---

### `InputNodeImage`
> Camera capture with crop region

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `baseNode` | BaseNode | ✅ | Frame component |
| `cropCircleObject` | SceneObject | ✅ | Crop Circle prefab |
| `captureButton` | CapsuleButton | Auto | Capture trigger |

**Output:** `Texture`, `Material`

---

### `ProcessImageGenNode`
> AI image generation via Gemini

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `baseNode` | BaseNode | ✅ | Frame component |
| `connectionMaterial` | Material | ⚠️ | For visible connections |
| `textInputSection` | SceneObject | Auto | Text input connector |
| `imageInputSection` | SceneObject | Auto | Image input connector |

**Accepts:** Text (required) OR Text + Image  
**Output:** `Texture` (generated image)

---

### `Process3DNode`
> 3D model generation via Snap3D

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `baseNode` | BaseNode | ✅ | Frame component |
| `modelMaterial` | Material | ✅ | Material for 3D model |
| `modelRoot` | SceneObject | ✅ | Spawn location |
| `refineMesh` | boolean | ❌ | Higher quality (slower) |
| `modelScale` | number | ❌ | Scale factor (default: 20) |

**Accepts:** Text OR Image OR Both  
**Output:** `RenderMeshVisual` (3D model)

---

## 📁 Project Structure

```
Noodle/
├── README.md                    # This file
├── .gitignore                   # Git ignore rules
│
└── Noodle v1/                   # Main Lens Studio project
    ├── Noodle v1.esproj         # Project file
    ├── Scene.scene              # Main scene
    │
    ├── Assets/
    │   ├── NodeSystem/          # 🧠 Core node system
    │   │   └── Scripts/
    │   │       ├── BaseNode.ts
    │   │       ├── InputNodePrompt.ts
    │   │       ├── InputNodeImage.ts
    │   │       ├── ProcessImageGenNode.ts
    │   │       ├── Process3DNode.ts
    │   │       ├── VoiceToText.ts
    │   │       ├── ConnectionLine.ts
    │   │       └── NodeConnectionController.ts
    │   │
    │   ├── Crop Circle.lspkg/   # 📸 Image capture system
    │   │   └── Scripts/
    │   │       ├── CameraService.ts
    │   │       ├── PictureController.ts
    │   │       ├── PictureBehavior.ts
    │   │       └── CropRegion.ts
    │   │
    │   ├── RuntimeGizmos.lspkg/ # 🎨 Visual utilities
    │   │   └── Scripts/
    │   │       └── BezierCurve.ts
    │   │
    │   ├── SpectaclesUIKit.lspkg/      # UI framework
    │   └── RemoteServiceGateway.lspkg  # API gateway
    │
    └── Packages/
        ├── SpectaclesInteractionKit.lspkg  # Hand tracking
        └── SpectaclesUIKit.lspkg           # UI components
```

---

## 🎮 Controls Reference

| Gesture | Context | Action |
|---------|---------|--------|
| **Tap** | Voice button | Start/stop recording |
| **Tap** | Capture button | Enter capture mode |
| **Dual Pinch** | Capture mode | Start drawing crop region |
| **Move hands** | While pinching | Define crop area |
| **Release** | Pinching | Capture frame |
| **Tap** | Output button | Start connection |
| **Tap** | Input section | Complete connection |
| **Tap** | Generate button | Run AI generation |
| **Drag** | 3D model | Move in space |

---

## 🔧 Technical Specifications

### Connection System
- **Interpolation:** 100 points (smooth curves)
- **Style:** Cable droop (natural physics feel)
- **Color:** Cyan `#7FECFB` / `vec3(0.498, 0.925, 0.984)`
- **Line width:** 0.3
- **Curve height:** 0.15

### AI APIs
| API | Model | Use Case |
|-----|-------|----------|
| Gemini | `gemini-2.0-flash-preview-image-generation` | Image generation |
| Snap3D | Native Snap API | 3D model generation |

### Dependencies
| Package | Purpose |
|---------|---------|
| `SpectaclesUIKit` | UI components |
| `SpectaclesInteractionKit` | Hand tracking & gestures |
| `RuntimeGizmos` | BezierCurve rendering |
| `RemoteServiceGateway` | API integration |

---

## 🛠 Development

### Adding New Node Types

1. Create new script extending pattern from `InputNodePrompt.ts` or `ProcessImageGenNode.ts`
2. Implement `baseNode` integration
3. Add input/output buttons as needed
4. Register with `NodeConnectionController`
5. Handle connection callbacks

### Customizing Connections

Edit `BezierCurve.ts` or `ConnectionLine.ts`:
```typescript
// Change connection color
public _color: vec3 = new vec3(0.498, 0.925, 0.984);

// Adjust curve style
public curveDirection: number = 2; // 0=Up, 1=Right, 2=Cable
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No connections visible | Assign `connectionMaterial` to process nodes |
| Voice not working | Check ASR permissions in Lens settings |
| 3D models not spawning | Verify `modelMaterial` and `modelRoot` are set |
| API errors | Confirm tokens in RemoteServiceGatewayCredentials |
| Capture not working | Ensure `cropCircleObject` is assigned |

---

## 📝 Changelog

### v1.0.0 (January 2026)
- 🎉 Initial release at MIT Reality Hack 2026
- ✅ Voice-to-text input nodes
- ✅ Image capture with Crop Circle
- ✅ Gemini AI image generation
- ✅ Snap3D model generation
- ✅ Visual bezier curve connections
- ✅ Node chaining support

---

## 👥 Team

**MIT Reality Hack 2026**

**Kavin Kumar**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rbkavin)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/rbkavin)

---

## 📄 License

This project was created at **MIT Reality Hack 2026**.

---

## 🙏 Acknowledgments

- **Snap Inc.** - Spectacles platform & Snap3D API
- **Google** - Gemini AI API
- **MIT Reality Hack** - Event & support
- **Spectacles Developer Community** - Resources & inspiration

---

<p align="center">
  <strong>🍜 Noodle - Making AI creativity tangible in AR</strong><br>
  <sub>Built with ❤️ at MIT Reality Hack 2026</sub>
</p>
