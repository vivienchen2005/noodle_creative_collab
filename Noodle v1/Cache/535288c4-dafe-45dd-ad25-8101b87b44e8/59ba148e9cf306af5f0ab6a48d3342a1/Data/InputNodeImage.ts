import { BaseNode } from "./BaseNode";
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton";

/**
 * InputNodeImage - A specialized node for image input
 * Extends BaseNode functionality with image content and output button
 */
@component
export class InputNodeImage extends BaseScriptComponent {
    @input
    @hint("BaseNode component (required)")
    public baseNode: BaseNode | null = null;

    @input
    @hint("Title text component (optional - will be created if not set)")
    @allowUndefined
    public titleText: Text | null = null;

    @input
    @hint("Round button for output connection (will be created if not set)")
    @allowUndefined
    public outputButton: RoundButton | null = null;

    @input
    @hint("Image component (will be created if not set)")
    @allowUndefined
    public imageComponent: Image | null = null;

    @input
    @hint("Camera service for image capture")
    @allowUndefined
    public cameraService: ScriptComponent | null = null;

    @input
    @hint("Parent object for all image-related UI (image display, etc.)")
    @allowUndefined
    public imageContainer: SceneObject | null = null;

    private _initialized: boolean = false;
    private _titleTextObject: SceneObject | null = null;
    private _outputButtonObject: SceneObject | null = null;
    private _contentObject: SceneObject | null = null;
    private _imageContainerObject: SceneObject | null = null;
    private _onStartCalled: boolean = false;
    
    // Reference to cloned material for external access
    private _clonedMaterial: Material | null = null;

    onAwake() {
        print(`InputNodeImage: onAwake called`);

        // Ensure BaseNode is set
        if (!this.baseNode) {
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print("InputNodeImage: ERROR - BaseNode component not found! Please add BaseNode component to this SceneObject.");
                return;
            }
            print(`InputNodeImage: Found BaseNode component`);
        } else {
            print(`InputNodeImage: BaseNode already assigned`);
        }

        // Set node type to "image"
        if (this.baseNode) {
            this.baseNode.nodeType = "image";
            print(`InputNodeImage: Set BaseNode type to: image`);
        }

        print(`InputNodeImage: onAwake complete`);
        
        // Fallback: If onStart doesn't get called, try to initialize in UpdateEvent
        let fallbackAttempts = 0;
        this.createEvent("UpdateEvent").bind(() => {
            if (!this._onStartCalled && fallbackAttempts > 5) {
                print(`InputNodeImage: WARNING - onStart not called after ${fallbackAttempts} frames, calling manually...`);
                this._onStartCalled = true;
                this.onStart();
            }
            fallbackAttempts++;
        });
    }

    onStart() {
        this._onStartCalled = true;
        print(`InputNodeImage: onStart called, baseNode exists=${!!this.baseNode}`);

        // Check if baseNode is available
        if (!this.baseNode) {
            print(`InputNodeImage: ERROR - baseNode is null in onStart, trying to find it...`);
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print(`InputNodeImage: ERROR - Still cannot find BaseNode, setup will fail`);
                return;
            }
        }

        // Try immediate setup if frame is already available
        const frame = this.baseNode.getFrame();
        if (frame) {
            print(`InputNodeImage: Frame is already available, attempting immediate setup...`);
            this.createEvent("UpdateEvent").bind(() => {
                if (!this._initialized) {
                    this.setupNode();
                    this._initialized = true;
                }
            });
            return;
        }

        // Wait for BaseNode frame to initialize
        let frameCheckAttempts = 0;
        const maxFrameCheckAttempts = 120;
        
        this.createEvent("UpdateEvent").bind(() => {
            if (!this._initialized && this.baseNode) {
                const frame = this.baseNode.getFrame();
                frameCheckAttempts++;
                
                if (frameCheckAttempts % 20 === 0) {
                    print(`InputNodeImage: Frame check attempt ${frameCheckAttempts}/${maxFrameCheckAttempts}, frame exists=${!!frame}`);
                }
                
                if (frame) {
                    const frameReady = frame.roundedRectangle !== undefined || frameCheckAttempts > 5;
                    
                    if (frameReady) {
                        print(`InputNodeImage: Frame is ready (attempt ${frameCheckAttempts}), setting up node...`);
                        this.setupNode();
                        this._initialized = true;
                        print(`InputNodeImage: Node setup complete!`);
                        return;
                    }
                }
                
                if (frameCheckAttempts >= maxFrameCheckAttempts && !this._initialized) {
                    print(`InputNodeImage: WARNING - Frame check timeout, attempting setup anyway...`);
                    this.setupNode();
                    this._initialized = true;
                }
            }
        });
    }

    /**
     * Sets up the node UI
     */
    private setupNode(): void {
        print(`InputNodeImage: setupNode() called`);
        
        if (!this.baseNode) {
            print(`InputNodeImage: ERROR - baseNode is null, cannot setup node`);
            return;
        }

        const frame = this.baseNode.getFrame();
        if (!frame) {
            print(`InputNodeImage: ERROR - Frame is null, cannot setup node`);
            return;
        }

        print(`InputNodeImage: BaseNode and Frame are ready, starting UI setup...`);

        // Create title
        this.setupTitle();

        // Create output button
        this.setupOutputButton();

        // Create image content
        this.setupImageContent();

        print(`InputNodeImage: setupNode() complete!`);
    }

    /**
     * Sets up the title text component
     */
    private setupTitle(): void {
        if (this.titleText) {
            this.updateTitle();
            return;
        }

        // Create title text object
        this._titleTextObject = global.scene.createSceneObject("InputNodeImage_Title");
        this._titleTextObject.setParent(this.sceneObject);
        this._titleTextObject.enabled = true;

        // Create Text component
        this.titleText = this._titleTextObject.createComponent("Component.Text") as Text;
        if (this.titleText) {
            this.titleText.text = "Image Input";
            this.titleText.horizontalAlignment = HorizontalAlignment.Center;
            this.titleText.verticalAlignment = VerticalAlignment.Center;
            
            // Position at top of frame
            const transform = this._titleTextObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                transform.setLocalPosition(new vec3(0, frameSize.y / 200 + 0.05, 0.01));
            } else {
                transform.setLocalPosition(new vec3(0, 0.05, 0.01));
            }

            print(`InputNodeImage: Created title text component`);
        }
    }

    /**
     * Updates the title text
     */
    private updateTitle(): void {
        if (this.titleText) {
            this.titleText.text = "Image Input";
        }
    }

    /**
     * Sets up the output button (round button at connection point)
     */
    private setupOutputButton(): void {
        if (this.outputButton) {
            return;
        }

        // Create output button object
        this._outputButtonObject = global.scene.createSceneObject("InputNodeImage_OutputButton");
        this._outputButtonObject.setParent(this.sceneObject);

        // Create RoundButton component
        this.outputButton = this._outputButtonObject.createComponent(RoundButton.getTypeName() as any) as RoundButton;
        if (this.outputButton) {
            this.outputButton.width = 2;
            // Position at right center (output connection point)
            const transform = this._outputButtonObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                transform.setLocalPosition(new vec3(frameSize.x / 200, 0, 0)); // Convert cm to meters
            }

            // Set up button click tracking
            this.setupButtonClickTracking();

            print("InputNodeImage: Created output button");
        }
    }

    /**
     * Sets up image content (Image component for screen grab/clone)
     */
    private setupImageContent(): void {
        // Create image container if not set
        this.setupImageContainer();

        // Ensure container is enabled
        if (this._imageContainerObject) {
            this._imageContainerObject.enabled = true;
        }

        if (this.imageComponent) {
            return; // Already set
        }

        // Create content object (image) - parent to image container
        this._contentObject = global.scene.createSceneObject("InputNodeImage_ImageContent");
        if (this._imageContainerObject) {
            this._contentObject.setParent(this._imageContainerObject);
        } else {
            this._contentObject.setParent(this.sceneObject);
        }

        // Create Image component
        this.imageComponent = this._contentObject.createComponent("Component.Image") as Image;
        if (this.imageComponent) {
            // Position in center of frame (relative to container)
            const transform = this._contentObject.getTransform();
            transform.setLocalPosition(new vec3(0, 0, 0));

            // Set up image size
            const imageTransform = this.imageComponent.sceneObject.getTransform();
            imageTransform.setLocalScale(new vec3(6, 6, 1));

            // Clone the material and keep reference
            this.cloneAndStoreMaterial();

            print("InputNodeImage: Created image component");
        }

        // TODO: Integrate with camera service for screen grab
        if (this.cameraService) {
            print("InputNodeImage: Camera service found, will integrate for image capture");
        }
    }

    /**
     * Sets up the image container (parent object for all image-related UI)
     */
    private setupImageContainer(): void {
        if (this.imageContainer) {
            this._imageContainerObject = this.imageContainer;
            return;
        }

        // Create image container object
        this._imageContainerObject = global.scene.createSceneObject("InputNodeImage_ImageContainer");
        this._imageContainerObject.setParent(this.sceneObject);
        this.imageContainer = this._imageContainerObject;

        // Position at center (children will be positioned relative to this)
        const transform = this._imageContainerObject.getTransform();
        transform.setLocalPosition(new vec3(0, -1, 0));

        print("InputNodeImage: Created image container");
    }

    /**
     * Gets the image texture
     */
    public getImageTexture(): Texture | null {
        if (this.imageComponent) {
            return this.imageComponent.mainPass.baseTex;
        }
        return null;
    }

    /**
     * Sets the image texture
     */
    public setImageTexture(texture: Texture): void {
        if (this.imageComponent) {
            this.imageComponent.mainPass.baseTex = texture;
        }
    }

    /**
     * Gets the output button (for connection handling)
     */
    public getOutputButton(): RoundButton | null {
        return this.outputButton;
    }

    /**
     * Gets the BaseNode component
     */
    public getBaseNode(): BaseNode | null {
        return this.baseNode;
    }
}
