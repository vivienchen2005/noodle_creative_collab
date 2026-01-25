import { BaseNode } from "./BaseNode";
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton";
import { CapsuleButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/CapsuleButton";
import { NodeConnectionController } from "./NodeConnectionController";
import { PictureBehavior } from "../../Crop Circle.lspkg/Scripts/PictureBehavior";

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

    @input
    @hint("Crop Circle SceneObject (already in scene - will be unhidden for capture, then hidden again)")
    @allowUndefined
    public cropCircleObject: SceneObject | null = null;

    @input
    @hint("Capture button (CapsuleButton - will be created if not set)")
    @allowUndefined
    public captureButton: CapsuleButton | null = null;

    private _initialized: boolean = false;
    private _titleTextObject: SceneObject | null = null;
    private _outputButtonObject: SceneObject | null = null;
    private _contentObject: SceneObject | null = null;
    private _imageContainerObject: SceneObject | null = null;
    private _onStartCalled: boolean = false;
    private _captureButtonObject: SceneObject | null = null;
    private _isCapturing: boolean = false; // Track if this InputNodeImage is currently capturing

    // Reference to cloned material for external access
    private _clonedMaterial: Material | null = null;

    // Track connected child nodes (nodes this connects to) - can have multiple
    private _connectedChildNodes: SceneObject[] = [];

    // Unique ID for the output button
    private _outputButtonId: string = "";

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

        // Create capture button
        this.setupCaptureButton();

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
     * Generates a unique button ID
     */
    private generateButtonId(): string {
        return `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Sets up the capture button for crop circle capture
     */
    private setupCaptureButton(): void {
        // If button already exists, just set up click tracking
        if (this.captureButton) {
            this.setupCaptureButtonClick();
            return;
        }

        // Create capture button object
        this._captureButtonObject = global.scene.createSceneObject("InputNodeImage_CaptureButton");
        this._captureButtonObject.setParent(this.sceneObject);

        // Create CapsuleButton component
        this.captureButton = this._captureButtonObject.createComponent(CapsuleButton.getTypeName() as any) as CapsuleButton;
        if (this.captureButton) {
            // CapsuleButton uses size property (vec3) - width, height, depth in cm
            this.captureButton.size = new vec3(6, 3, 1); // Width, Height, Depth
            // Position below the image content
            const transform = this._captureButtonObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                transform.setLocalPosition(new vec3(0, -frameSize.y / 200 - 0.5, 0));
            } else {
                transform.setLocalPosition(new vec3(0, -2, 0));
            }

            // Set up button click tracking
            this.setupCaptureButtonClick();

            print("InputNodeImage: Created capture button (CapsuleButton)");
        }
    }

    /**
     * Sets up capture button click tracking
     */
    private setupCaptureButtonClick(): void {
        if (!this.captureButton) {
            return;
        }

        if (this.captureButton.onTriggerUp) {
            this.captureButton.onTriggerUp.add(() => {
                this.onCaptureButtonClicked();
            });
            print("InputNodeImage: Capture button click tracking set up");
        }
    }

    /**
     * Called when capture button is clicked
     */
    private onCaptureButtonClicked(): void {
        print(`InputNodeImage: Capture button clicked - unhiding crop circle for ${this.sceneObject.name}`);

        // Check if we're already capturing
        if (this._isCapturing) {
            print(`InputNodeImage: Already capturing for ${this.sceneObject.name}`);
            return;
        }

        // Check if we have a crop circle object
        if (!this.cropCircleObject) {
            print("InputNodeImage: ERROR - Crop Circle SceneObject not assigned! Please assign the Crop Circle object from the scene.");
            return;
        }

        // Unhide the crop circle object (it's already in the scene)
        this.cropCircleObject.enabled = true;
        this._isCapturing = true;
        print(`InputNodeImage: Crop circle unhidden for ${this.sceneObject.name}`);

        // Set up listener for when capture completes
        this.setupCaptureListener();
    }

    /**
     * Sets up listener to detect when capture is complete
     */
    private setupCaptureListener(): void {
        if (!this.cropCircleObject || !this._isCapturing) {
            return;
        }

        // Find PictureBehavior component in the crop circle object
        const pictureBehavior = this.findPictureBehaviorInHierarchy(this.cropCircleObject);
        if (!pictureBehavior) {
            print(`InputNodeImage: WARNING - PictureBehavior not found in crop circle for ${this.sceneObject.name}`);
            this._isCapturing = false;
            return;
        }

        // Poll for capture completion (check if captureImage is set)
        let checkCount = 0;
        const maxChecks = 600; // 10 seconds at 60fps
        let callbackExecuted = false;
        this.createEvent("UpdateEvent").bind(() => {
            if (callbackExecuted) return; // Only execute once

            if (!this._isCapturing || !this.cropCircleObject || isNull(this.cropCircleObject)) {
                callbackExecuted = true;
                return; // Not capturing anymore or crop circle was destroyed
            }

            checkCount++;
            if (checkCount > maxChecks) {
                print(`InputNodeImage: Capture timeout for ${this.sceneObject.name} - hiding crop circle`);
                if (this.cropCircleObject) {
                    this.cropCircleObject.enabled = false;
                }
                this._isCapturing = false;
                callbackExecuted = true;
                return;
            }

            // Check if capture is complete by looking at captureRendMesh
            // When captureImage is set, the screenCropTexture contains the CROPPED image (not raw camera)
            // PictureBehavior already hides the visual elements, so we just need to get the texture
            try {
                const captureRendMesh = (pictureBehavior as any).captureRendMesh;
                const screenCropTexture = (pictureBehavior as any).screenCropTexture;

                if (captureRendMesh && captureRendMesh.mainPass && captureRendMesh.mainPass.captureImage) {
                    // Capture is complete - screenCropTexture contains the cropped texture
                    // PictureBehavior has already hidden the visual elements (picAnchorObj, captureRendMesh, etc.)
                    // so the image won't be displayed in 3D space
                    if (screenCropTexture && screenCropTexture.getColorspace() == 3) {
                        print(`InputNodeImage: Capture detected for ${this.sceneObject.name}! screenCropTexture is ready (colorspace: ${screenCropTexture.getColorspace()})`);

                        callbackExecuted = true;
                        this._isCapturing = false;

                        // Pass the cropped texture directly to InputNodeImage
                        // screenCropTexture is already a Texture containing the cropped image
                        this.onCaptureComplete(screenCropTexture);

                        // Hide crop circle after capture (don't destroy, just hide)
                        if (this.cropCircleObject) {
                            this.cropCircleObject.enabled = false;
                            print(`InputNodeImage: Crop circle hidden after capture for ${this.sceneObject.name}`);
                        }
                    } else {
                        // screenCropTexture exists but might not be ready yet
                        if (checkCount % 60 == 0) { // Log every second
                            print(`InputNodeImage: Waiting for screenCropTexture to be ready... (colorspace: ${screenCropTexture ? screenCropTexture.getColorspace() : "null"})`);
                        }
                    }
                }
            } catch (e) {
                // Property might not be accessible, keep checking
                if (checkCount % 60 == 0) { // Log every second
                    print(`InputNodeImage: Error checking capture status: ${e}`);
                }
            }
        });
    }

    /**
     * Recursively finds PictureBehavior component in hierarchy
     */
    private findPictureBehaviorInHierarchy(obj: SceneObject): PictureBehavior | null {
        if (!obj || isNull(obj)) {
            return null;
        }

        // Check current object
        const pictureBehavior = obj.getComponent(PictureBehavior.getTypeName() as any) as PictureBehavior | null;
        if (pictureBehavior) {
            return pictureBehavior;
        }

        // Check children recursively
        const childCount = obj.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = obj.getChild(i);
            const found = this.findPictureBehaviorInHierarchy(child);
            if (found) {
                return found;
            }
        }

        return null;
    }

    /**
     * Called when capture is complete - displays the captured cropped image
     * Ensures material is cloned before displaying
     */
    private onCaptureComplete(croppedTexture: Texture): void {
        print(`InputNodeImage: Processing captured cropped image for ${this.sceneObject.name}...`);

        try {
            if (!croppedTexture) {
                print("InputNodeImage: ERROR - Cropped texture is null");
                return;
            }

            // Verify texture is valid
            try {
                const colorspace = croppedTexture.getColorspace();
                print(`InputNodeImage: Cropped texture colorspace: ${colorspace}`);
            } catch (e) {
                print(`InputNodeImage: WARNING - Could not verify texture colorspace: ${e}`);
            }

            // Ensure image component exists
            if (!this.imageComponent) {
                print("InputNodeImage: ERROR - Image component not found, cannot display captured image");
                return;
            }

            // Wait for material to be available, then clone and set texture
            let frameCount = 0;
            let callbackExecuted = false;
            const maxFrames = 60; // Wait up to 1 second for material
            this.createEvent("UpdateEvent").bind(() => {
                if (callbackExecuted) return; // Only execute once
                frameCount++;

                // Check if image component still exists
                if (!this.imageComponent) {
                    print("InputNodeImage: ERROR - Image component lost during capture processing");
                    callbackExecuted = true;
                    return;
                }

                // Try to clone material (will succeed once material is assigned)
                this.cloneAndStoreMaterial();

                // If we have a cloned material, we can set the texture
                if (this._clonedMaterial) {
                    callbackExecuted = true;

                    // Set the cropped texture on the image component
                    this.setImageTexture(croppedTexture);

                    print(`InputNodeImage: Cropped texture displayed in ${this.sceneObject.name} with cloned material`);
                    return;
                }

                // If material still not available after max frames, try to set texture anyway
                if (frameCount >= maxFrames) {
                    callbackExecuted = true;
                    print("InputNodeImage: WARNING - Material not available, setting texture anyway...");
                    
                    // Try to set texture directly (might work if material gets assigned later)
                    try {
                        if (this.imageComponent.mainPass) {
                            this.imageComponent.mainPass.baseTex = croppedTexture;
                            print(`InputNodeImage: Texture set directly (material will be cloned when available)`);
                        }
                    } catch (e) {
                        print(`InputNodeImage: ERROR - Could not set texture: ${e}`);
                    }
                }
            });
        } catch (e) {
            print(`InputNodeImage: ERROR - Failed to process captured cropped image: ${e}`);
        }
    }

    /**
     * Sets up the output button (round button at connection point)
     */
    private setupOutputButton(): void {
        // Generate unique ID for this button
        if (!this._outputButtonId) {
            this._outputButtonId = this.generateButtonId();
        }

        // If button already exists, just set up tracking
        if (this.outputButton) {
            this.setupButtonClickTracking();
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

        // If imageComponent already exists, try to clone its material
        if (this.imageComponent) {
            this.cloneAndStoreMaterial();
            // Set up periodic check for material (in case it's assigned later)
            // Only check every 30 frames to reduce log spam
            let materialCheckFrame = 0;
            this.createEvent("UpdateEvent").bind(() => {
                materialCheckFrame++;
                if (materialCheckFrame % 30 === 0) { // Check every 30 frames (~0.5 seconds)
                    this.checkAndCloneMaterial();
                }
            });
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

            // Try to clone material (if it exists)
            this.cloneAndStoreMaterial();

            // Set up periodic check for material (in case it's assigned later)
            // Only check every 30 frames to reduce log spam
            let materialCheckFrame = 0;
            this.createEvent("UpdateEvent").bind(() => {
                materialCheckFrame++;
                if (materialCheckFrame % 30 === 0) { // Check every 30 frames (~0.5 seconds)
                    this.checkAndCloneMaterial();
                }
            });
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
     * Clones the material from the image component and stores a reference
     * This ensures the material is independent and won't affect other nodes
     */
    private cloneAndStoreMaterial(): void {
        if (!this.imageComponent) {
            return; // Will retry when material is assigned
        }

        try {
            // Get the main pass material
            const mainPass = this.imageComponent.mainPass;
            if (!mainPass) {
                return; // Will retry when material is assigned
            }

            // Get the original material
            const originalMaterial = mainPass.material;
            if (!originalMaterial) {
                return; // Material not assigned yet, will check periodically
            }

            // If we already have a cloned material, check if it's still the one being used
            if (this._clonedMaterial && mainPass.material === this._clonedMaterial) {
                // Already using cloned material, no need to clone again
                return;
            }

            // Clone the material to create an independent copy
            this._clonedMaterial = originalMaterial.clone();

            // Apply the cloned material to the image component
            // This ensures we're using the cloned version, not the original
            mainPass.material = this._clonedMaterial;

            print(`InputNodeImage: Material cloned and stored (independent copy created)`);
        } catch (error) {
            print(`InputNodeImage: Failed to clone material: ${error} (will retry when material is assigned)`);
        }
    }

    /**
     * Checks and clones material if it becomes available later
     */
    private checkAndCloneMaterial(): void {
        if (!this._clonedMaterial && this.imageComponent) {
            // Only log once per check, not every frame
            const hasMaterial = this.imageComponent.mainPass && this.imageComponent.mainPass.material;
            if (hasMaterial) {
                this.cloneAndStoreMaterial();
            }
            // Don't log if material is still missing - it's expected
        }
    }

    /**
     * Sets up button click tracking for the output button
     */
    private setupButtonClickTracking(): void {
        if (!this.outputButton) {
            return;
        }

        // Track button clicks
        if (this.outputButton.onTriggerUp) {
            this.outputButton.onTriggerUp.add(() => {
                print(`InputNodeImage: Output button clicked!`);
                this.onOutputButtonClicked();
            });
            print("InputNodeImage: Output button click tracking set up");
        }
    }

    /**
     * Called when output button is clicked
     */
    private onOutputButtonClicked(): void {
        const texture = this.getImageTexture();
        print(`InputNodeImage: Output button clicked (ID: ${this._outputButtonId}) - Has texture: ${!!texture}, Has material: ${!!this._clonedMaterial}`);

        // Notify connection controller to start pending connection
        const controller = NodeConnectionController.getInstance();
        if (controller) {
            controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
        } else {
            print(`InputNodeImage: WARNING - NodeConnectionController not found! Attempting to find or create...`);
            // Try to find NodeConnectionController in scene
            this.findOrCreateConnectionController();
        }
    }

    /**
     * Finds or creates NodeConnectionController in the scene
     */
    private findOrCreateConnectionController(): void {
        // First check singleton instance
        let controller = NodeConnectionController.getInstance();
        if (controller) {
            print(`InputNodeImage: Found NodeConnectionController (singleton)`);
            controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
            return;
        }

        // Try to find existing controller in scene
        const rootObjects = global.scene.getRootObjectsCount();
        for (let i = 0; i < rootObjects; i++) {
            const rootObject = global.scene.getRootObject(i);
            controller = rootObject.getComponent(NodeConnectionController.getTypeName() as any) as NodeConnectionController | null;
            if (controller) {
                print(`InputNodeImage: Found NodeConnectionController in scene`);
                controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
                return;
            }
        }

        // If not found, create one (material is optional, so it won't error)
        print(`InputNodeImage: Creating NodeConnectionController in scene...`);
        const controllerObject = global.scene.createSceneObject("NodeConnectionController");
        controller = controllerObject.createComponent(NodeConnectionController.getTypeName() as any) as NodeConnectionController;
        if (controller) {
            print(`InputNodeImage: NodeConnectionController created (material can be assigned later)`);
            // Wait a frame for component to initialize
            this.createEvent("UpdateEvent").bind(() => {
                controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
            });
        } else {
            print(`InputNodeImage: ERROR - Failed to create NodeConnectionController component`);
        }
    }

    /**
     * Adds a connected child node (called when connection is made)
     * Input nodes can connect to multiple process nodes
     */
    public addChildNode(childNode: SceneObject): void {
        if (!this._connectedChildNodes.includes(childNode)) {
            this._connectedChildNodes.push(childNode);
            print(`InputNodeImage: Added child node: ${childNode.name} (Total: ${this._connectedChildNodes.length})`);
        }
    }

    /**
     * Removes a connected child node
     */
    public removeChildNode(childNode: SceneObject): void {
        const index = this._connectedChildNodes.indexOf(childNode);
        if (index > -1) {
            this._connectedChildNodes.splice(index, 1);
            print(`InputNodeImage: Removed child node: ${childNode.name} (Total: ${this._connectedChildNodes.length})`);
        }
    }

    /**
     * Gets all connected child nodes
     */
    public getChildNodes(): SceneObject[] {
        return this._connectedChildNodes;
    }

    /**
     * Gets the number of connected child nodes
     */
    public getChildNodeCount(): number {
        return this._connectedChildNodes.length;
    }

    /**
     * Gets the output button ID
     */
    public getOutputButtonId(): string {
        return this._outputButtonId;
    }

    /**
     * Gets the image texture
     */
    public getImageTexture(): Texture | null {
        if (this.imageComponent && this.imageComponent.mainPass) {
            return this.imageComponent.mainPass.baseTex;
        }
        return null;
    }

    /**
     * Sets the image texture
     * Uses cloned material if available to ensure independence
     */
    public setImageTexture(texture: Texture): void {
        if (!this.imageComponent || !this.imageComponent.mainPass) {
            print("InputNodeImage: WARNING - Cannot set texture, image component or mainPass is null");
            return;
        }

        // Ensure we're using the cloned material (not original)
        if (this._clonedMaterial) {
            this.imageComponent.mainPass.material = this._clonedMaterial;
        } else {
            // Clone material if not already cloned
            this.cloneAndStoreMaterial();
        }

        // Set the texture on the cloned material
        this.imageComponent.mainPass.baseTex = texture;
        print(`InputNodeImage: Texture set on ${this.sceneObject.name} (using ${this._clonedMaterial ? "cloned" : "original"} material)`);
    }

    /**
     * Gets the cloned material reference (for external access)
     */
    public getClonedMaterial(): Material | null {
        return this._clonedMaterial;
    }

    /**
     * Gets the image component (for external access)
     */
    public getImageComponent(): Image | null {
        return this.imageComponent;
    }

    /**
     * Gets the output button (for connection handling)
     */
    public getOutputButton(): RoundButton | null {
        return this.outputButton;
    }

    /**
     * Gets the output button's local position (relative to this node)
     */
    public getOutputButtonLocalPosition(): vec3 | null {
        if (this._outputButtonObject) {
            return this._outputButtonObject.getTransform().getLocalPosition();
        }
        if (this.outputButton && this.outputButton.sceneObject) {
            return this.outputButton.sceneObject.getTransform().getLocalPosition();
        }
        return null;
    }

    /**
     * Gets the output button's world position
     */
    public getOutputButtonWorldPosition(): vec3 | null {
        if (this._outputButtonObject) {
            return this._outputButtonObject.getTransform().getWorldPosition();
        }
        if (this.outputButton && this.outputButton.sceneObject) {
            return this.outputButton.sceneObject.getTransform().getWorldPosition();
        }
        return null;
    }

    /**
     * Gets the output button's SceneObject (for patch/connection handling)
     */
    public getOutputButtonObject(): SceneObject | null {
        return this._outputButtonObject || (this.outputButton ? this.outputButton.sceneObject : null);
    }

    /**
     * Gets the BaseNode component
     */
    public getBaseNode(): BaseNode | null {
        return this.baseNode;
    }

    /**
     * Gets all data that can be passed to other nodes
     * Returns the cloned material to ensure nodes don't share materials
     */
    public getOutputData(): {
        texture: Texture | null;
        material: Material | null;
        imageComponent: Image | null;
        outputButtonPosition: vec3 | null;
        outputButtonWorldPosition: vec3 | null;
        outputButtonObject: SceneObject | null;
    } {
        // Ensure material is cloned before returning
        if (!this._clonedMaterial && this.imageComponent) {
            this.cloneAndStoreMaterial();
        }

        return {
            texture: this.getImageTexture(),
            material: this.getClonedMaterial(), // Always return cloned material, never original
            imageComponent: this.getImageComponent(),
            outputButtonPosition: this.getOutputButtonLocalPosition(),
            outputButtonWorldPosition: this.getOutputButtonWorldPosition(),
            outputButtonObject: this.getOutputButtonObject()
        };
    }
}
