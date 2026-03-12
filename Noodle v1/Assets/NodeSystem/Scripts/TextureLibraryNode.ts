import { BaseNode } from "./BaseNode";
import { RoundButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RoundButton";
import { NodeConnectionController } from "./NodeConnectionController";
import { ToggleGroup } from "SpectaclesUIKit.lspkg/Scripts/Components/Toggle/ToggleGroup";

/**
 * TextureLibraryNode
 *
 * Behaves like an image source node, similar to InputNodeImage,
 * but the image comes from a preset texture library instead of capture.
 *
 * Scene setup expected:
 * - Root object has BaseNode + TextureLibraryNode
 * - Existing RoundButton output can be assigned, or one will be created
 * - Existing ToggleGroup assigned in inspector
 * - Optional preview Image assigned in inspector
 * - Textures 1-8 assigned in inspector
 */
@component
export class TextureLibraryNode extends BaseScriptComponent {
    @input
    public baseNode: BaseNode | null = null;

    @input
    @allowUndefined
    public titleText: Text | null = null;

    @input
    @allowUndefined
    public outputButton: RoundButton | null = null;

    @input
    @allowUndefined
    public previewImage: Image | null = null;

    @input
    @allowUndefined
    public toggleGroup: ToggleGroup | null = null;

    @input @allowUndefined public texture1: Texture | null = null;
    @input @allowUndefined public texture2: Texture | null = null;
    @input @allowUndefined public texture3: Texture | null = null;
    @input @allowUndefined public texture4: Texture | null = null;
    @input @allowUndefined public texture5: Texture | null = null;
    @input @allowUndefined public texture6: Texture | null = null;
    @input @allowUndefined public texture7: Texture | null = null;
    @input @allowUndefined public texture8: Texture | null = null;

    @input @allowUndefined public texture1Preview: Image | null = null;
    @input @allowUndefined public texture2Preview: Image | null = null;
    @input @allowUndefined public texture3Preview: Image | null = null;
    @input @allowUndefined public texture4Preview: Image | null = null;
    @input @allowUndefined public texture5Preview: Image | null = null;
    @input @allowUndefined public texture6Preview: Image | null = null;
    @input @allowUndefined public texture7Preview: Image | null = null;
    @input @allowUndefined public texture8Preview: Image | null = null;

    @input
    @hint("Optional default selected texture index (1-8). Set 0 for none.")
    public defaultSelectionIndex: number = 0;

    private _initialized: boolean = false;
    private _onStartCalled: boolean = false;

    private _outputButtonObject: SceneObject | null = null;
    private _outputButtonId: string = "";

    private _selectedTexture: Texture | null = null;
    private _selectedIndex: number = -1;
    private _clonedMaterial: Material | null = null;

    private _connectedChildNodes: SceneObject[] = [];

    onAwake(): void {
        print("TextureLibraryNode: onAwake called");

        if (!this.baseNode) {
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print("TextureLibraryNode: ERROR - BaseNode not found");
                return;
            }
            print("TextureLibraryNode: Found BaseNode component");
        } else {
            print("TextureLibraryNode: BaseNode already assigned");
        }

        this.baseNode.nodeType = "image";

        if (!this._outputButtonId) {
            this._outputButtonId = this.generateButtonId();
        }

        if (this.titleText) {
            this.titleText.text = "Texture Library";
        }

        print("TextureLibraryNode: onAwake complete");

        // Fallback in case onStart is flaky
        let fallbackAttempts = 0;
        this.createEvent("UpdateEvent").bind(() => {
            if (!this._onStartCalled && fallbackAttempts > 5) {
                print(`TextureLibraryNode: WARNING - onStart not called after ${fallbackAttempts} frames, calling manually...`);
                this._onStartCalled = true;
                this.onStart();
            }
            fallbackAttempts++;
        });
    }

    onStart(): void {
        this._onStartCalled = true;
        print(`TextureLibraryNode: onStart called, baseNode exists=${!!this.baseNode}`);

        if (!this.baseNode) {
            print("TextureLibraryNode: ERROR - baseNode is null in onStart, trying to find it...");
            this.baseNode = this.sceneObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
            if (!this.baseNode) {
                print("TextureLibraryNode: ERROR - Still cannot find BaseNode");
                return;
            }
        }

        // Texture library node does not need frame-dependent layout setup as much,
        // but we follow the same pattern as InputNodeImage for consistency.
        const frame = this.baseNode.getFrame();
        if (frame) {
            print("TextureLibraryNode: Frame already available, attempting setup...");
            this.createEvent("UpdateEvent").bind(() => {
                if (!this._initialized) {
                    this.setupNode();
                    this._initialized = true;
                }
            });
            return;
        }

        let frameCheckAttempts = 0;
        const maxFrameCheckAttempts = 120;

        this.createEvent("UpdateEvent").bind(() => {
            if (!this._initialized && this.baseNode) {
                const currentFrame = this.baseNode.getFrame();
                frameCheckAttempts++;

                if (frameCheckAttempts % 20 === 0) {
                    print(`TextureLibraryNode: Frame check attempt ${frameCheckAttempts}/${maxFrameCheckAttempts}, frame exists=${!!currentFrame}`);
                }

                if (currentFrame) {
                    const frameReady = currentFrame.roundedRectangle !== undefined || frameCheckAttempts > 5;
                    if (frameReady) {
                        print(`TextureLibraryNode: Frame ready (attempt ${frameCheckAttempts}), setting up node...`);
                        this.setupNode();
                        this._initialized = true;
                        print("TextureLibraryNode: Node setup complete!");
                        return;
                    }
                }

                if (frameCheckAttempts >= maxFrameCheckAttempts && !this._initialized) {
                    print("TextureLibraryNode: WARNING - Frame check timeout, attempting setup anyway...");
                    this.setupNode();
                    this._initialized = true;
                }
            }
        });
    }

    /**
     * Main setup
     */
    private setupNode(): void {
        print("TextureLibraryNode: setupNode() called");

        this.setupOutputButton();
        this.setupToggleSelection();
        this.cloneAndStoreMaterial();
        this.setupThumbnailPreviews();

        if (this.defaultSelectionIndex >= 1 && this.defaultSelectionIndex <= 8) {
            this.selectTextureByIndex(this.defaultSelectionIndex);
        }

        print("TextureLibraryNode: setupNode() complete");
    }

    private setupThumbnailPreviews(): void {
        this.setupSingleThumbnail(this.texture1Preview, this.texture1, 1);
        this.setupSingleThumbnail(this.texture2Preview, this.texture2, 2);
        this.setupSingleThumbnail(this.texture3Preview, this.texture3, 3);
        this.setupSingleThumbnail(this.texture4Preview, this.texture4, 4);
        this.setupSingleThumbnail(this.texture5Preview, this.texture5, 5);
        this.setupSingleThumbnail(this.texture6Preview, this.texture6, 6);
        this.setupSingleThumbnail(this.texture7Preview, this.texture7, 7);
        this.setupSingleThumbnail(this.texture8Preview, this.texture8, 8);
    }

    private setupSingleThumbnail(image: Image | null, texture: Texture | null, index: number): void {
        if (!image) {
            print("TextureLibraryNode: Thumbnail image " + index + " not assigned");
            return;
        }

        if (!texture) {
            print("TextureLibraryNode: Thumbnail texture " + index + " not assigned");
            return;
        }

        let attempts = 0;
        const maxAttempts = 60;
        let done = false;

        this.createEvent("UpdateEvent").bind(() => {
            if (done) {
                return;
            }

            attempts++;

            try {
                const mainPass = image.mainPass;
                const materialFromMainMaterial = (image as any).mainMaterial as Material | null;
                const materialFromPass = mainPass ? mainPass.material : null;
                const originalMaterial = materialFromMainMaterial || materialFromPass;

                if (!mainPass) {
                    if (attempts >= maxAttempts) {
                        print("TextureLibraryNode: Thumbnail " + index + " has no mainPass after waiting");
                        done = true;
                    }
                    return;
                }

                if (!originalMaterial) {
                    if (attempts >= maxAttempts) {
                        print("TextureLibraryNode: Thumbnail " + index + " has no material after waiting");
                        done = true;
                    }
                    return;
                }

                const clonedMaterial = originalMaterial.clone();

                // Assign cloned material back using the safest route available
                if ((image as any).mainMaterial !== undefined) {
                    (image as any).mainMaterial = clonedMaterial;
                } else {
                    mainPass.material = clonedMaterial;
                }

                mainPass.baseTex = texture;

                print("TextureLibraryNode: Thumbnail " + index + " preview set");
                done = true;
            } catch (e) {
                if (attempts >= maxAttempts) {
                    print("TextureLibraryNode: Failed to set thumbnail " + index + ": " + e);
                    done = true;
                }
            }
        });
    }

    /**
     * Generates a unique button ID
     */
    private generateButtonId(): string {
        return `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Output button setup copied in spirit from InputNodeImage
     */
    private setupOutputButton(): void {
        if (!this._outputButtonId) {
            this._outputButtonId = this.generateButtonId();
        }

        if (this.outputButton) {
            this.setupButtonClickTracking();
            return;
        }

        this._outputButtonObject = global.scene.createSceneObject("TextureLibraryNode_OutputButton");
        this._outputButtonObject.setParent(this.sceneObject);

        this.outputButton = this._outputButtonObject.createComponent(RoundButton.getTypeName() as any) as RoundButton;
        if (this.outputButton) {
            this.outputButton.width = 2;

            const transform = this._outputButtonObject.getTransform();
            if (this.baseNode) {
                const frameSize = this.baseNode.frameSize;
                transform.setLocalPosition(new vec3(frameSize.x / 200, 0, 0));
            }

            this.setupButtonClickTracking();
            print("TextureLibraryNode: Created output button");
        }
    }

    /**
     * Output button click tracking copied from InputNodeImage pattern
     */
    private setupButtonClickTracking(): void {
        if (!this.outputButton) {
            print("TextureLibraryNode: No output button to bind");
            return;
        }

        const buttonAny = this.outputButton as any;

        if (buttonAny.onTriggerUp && buttonAny.onTriggerUp.add) {
            buttonAny.onTriggerUp.add(() => {
                print("TextureLibraryNode: Output button clicked!");
                this.onOutputButtonClicked();
            });
            print("TextureLibraryNode: Output button click tracking set up via onTriggerUp");
            return;
        }

        if (buttonAny.onPress && buttonAny.onPress.add) {
            buttonAny.onPress.add(() => {
                print("TextureLibraryNode: Output button pressed!");
                this.onOutputButtonClicked();
            });
            print("TextureLibraryNode: Output button click tracking set up via onPress");
            return;
        }

        print("TextureLibraryNode: WARNING - outputButton has no supported click event");
    }

    /**
     * Reads the assigned ToggleGroup and binds selection callbacks.
     * We access the serialized _toggles field because the getter can be unreliable at runtime.
     */
    private setupToggleSelection(): void {
        if (!this.toggleGroup) {
            print("TextureLibraryNode: toggleGroup not assigned");
            return;
        }

        const groupAny = this.toggleGroup as any;
        const toggles = groupAny._toggles;

        if (!toggles) {
            print("TextureLibraryNode: toggleGroup has no _toggles. Make sure the scene ToggleGroup has its Toggles list assigned.");
            return;
        }

        print("TextureLibraryNode: toggle count = " + toggles.length);

        for (let i = 0; i < toggles.length; i++) {
            const toggle = toggles[i];
            const index = i + 1;

            if (!toggle) {
                print("TextureLibraryNode: Toggle " + index + " is null");
                continue;
            }

            if (toggle.onTriggerUp && toggle.onTriggerUp.add) {
                toggle.onTriggerUp.add(() => {
                    print("TextureLibraryNode: Texture " + index + " selected via onTriggerUp");
                    this.selectTextureByIndex(index);
                });
                print("TextureLibraryNode: bound Texture " + index + " via onTriggerUp");
                continue;
            }

            if (toggle.onPress && toggle.onPress.add) {
                toggle.onPress.add(() => {
                    print("TextureLibraryNode: Texture " + index + " selected via onPress");
                    this.selectTextureByIndex(index);
                });
                print("TextureLibraryNode: bound Texture " + index + " via onPress");
                continue;
            }

            if (toggle.onStateChanged && toggle.onStateChanged.add) {
                toggle.onStateChanged.add((isOn: boolean) => {
                    if (isOn) {
                        print("TextureLibraryNode: Texture " + index + " selected via onStateChanged");
                        this.selectTextureByIndex(index);
                    }
                });
                print("TextureLibraryNode: bound Texture " + index + " via onStateChanged");
                continue;
            }

            if (toggle.onValueChanged && toggle.onValueChanged.add) {
                toggle.onValueChanged.add((isOn: boolean) => {
                    if (isOn) {
                        print("TextureLibraryNode: Texture " + index + " selected via onValueChanged");
                        this.selectTextureByIndex(index);
                    }
                });
                print("TextureLibraryNode: bound Texture " + index + " via onValueChanged");
                continue;
            }

            print("TextureLibraryNode: Toggle " + index + " has no supported event");
        }
    }

    /**
     * Select one of the assigned textures
     */
    private selectTextureByIndex(index: number): void {
        const texture = this.getTextureByIndex(index);
        if (!texture) {
            print("TextureLibraryNode: WARNING - No texture assigned for index " + index);
            return;
        }

        this._selectedIndex = index;
        this._selectedTexture = texture;

        print("TextureLibraryNode: Selected texture " + index);

        if (this.previewImage) {
            this.setPreviewTexture(texture);
        }
    }

    /**
     * Maps index to inspector texture
     */
    private getTextureByIndex(index: number): Texture | null {
        switch (index) {
            case 1: return this.texture1;
            case 2: return this.texture2;
            case 3: return this.texture3;
            case 4: return this.texture4;
            case 5: return this.texture5;
            case 6: return this.texture6;
            case 7: return this.texture7;
            case 8: return this.texture8;
            default: return null;
        }
    }

    /**
     * Output button callback
     */
    private onOutputButtonClicked(): void {
        print(`TextureLibraryNode: Output button clicked (ID: ${this._outputButtonId}) - Has texture: ${!!this._selectedTexture}, Selected index: ${this._selectedIndex}`);

        if (!this._selectedTexture) {
            print("TextureLibraryNode: No texture selected yet");
            return;
        }

        const controller = NodeConnectionController.getInstance();
        if (controller) {
            controller.onInputNodeButtonClicked(this.sceneObject, "image", this._outputButtonId);
        } else {
            print("TextureLibraryNode: WARNING - NodeConnectionController not found");
        }
    }

    /**
     * Clone preview image material so this node does not affect shared materials
     */
    private cloneAndStoreMaterial(): void {
        if (!this.previewImage) {
            return;
        }

        try {
            const mainPass = this.previewImage.mainPass;
            if (!mainPass) {
                return;
            }

            const originalMaterial = mainPass.material;
            if (!originalMaterial) {
                return;
            }

            if (this._clonedMaterial && mainPass.material === this._clonedMaterial) {
                return;
            }

            this._clonedMaterial = originalMaterial.clone();
            mainPass.material = this._clonedMaterial;
            print("TextureLibraryNode: Material cloned and stored");
        } catch (e) {
            print("TextureLibraryNode: Failed to clone material: " + e);
        }
    }

    /**
     * Update preview image with selected texture
     */
    public setPreviewTexture(texture: Texture): void {
        if (!this.previewImage || !this.previewImage.mainPass) {
            print("TextureLibraryNode: WARNING - previewImage missing");
            return;
        }

        if (this._clonedMaterial) {
            this.previewImage.mainPass.material = this._clonedMaterial;
        } else {
            this.cloneAndStoreMaterial();
        }

        this.previewImage.mainPass.baseTex = texture;
        print("TextureLibraryNode: preview updated");
    }

    /**
     * Child connection tracking
     */
    public addChildNode(childNode: SceneObject): void {
        if (!this._connectedChildNodes.includes(childNode)) {
            this._connectedChildNodes.push(childNode);
            print(`TextureLibraryNode: Added child node: ${childNode.name} (Total: ${this._connectedChildNodes.length})`);
        }
    }

    public removeChildNode(childNode: SceneObject): void {
        const index = this._connectedChildNodes.indexOf(childNode);
        if (index > -1) {
            this._connectedChildNodes.splice(index, 1);
            print(`TextureLibraryNode: Removed child node: ${childNode.name} (Total: ${this._connectedChildNodes.length})`);
        }
    }

    public getChildNodes(): SceneObject[] {
        return this._connectedChildNodes;
    }

    public getChildNodeCount(): number {
        return this._connectedChildNodes.length;
    }

    public getOutputButtonId(): string {
        return this._outputButtonId;
    }

    public getSelectedTexture(): Texture | null {
        return this._selectedTexture;
    }

    public getSelectedIndex(): number {
        return this._selectedIndex;
    }

    public getClonedMaterial(): Material | null {
        return this._clonedMaterial;
    }

    public getPreviewImage(): Image | null {
        return this.previewImage;
    }

    public getOutputButton(): RoundButton | null {
        return this.outputButton;
    }

    public getOutputButtonLocalPosition(): vec3 | null {
        if (this._outputButtonObject) {
            return this._outputButtonObject.getTransform().getLocalPosition();
        }
        if (this.outputButton && this.outputButton.sceneObject) {
            return this.outputButton.sceneObject.getTransform().getLocalPosition();
        }
        return null;
    }

    public getOutputButtonWorldPosition(): vec3 | null {
        if (this._outputButtonObject) {
            return this._outputButtonObject.getTransform().getWorldPosition();
        }
        if (this.outputButton && this.outputButton.sceneObject) {
            return this.outputButton.sceneObject.getTransform().getWorldPosition();
        }
        return null;
    }

    public getOutputButtonObject(): SceneObject | null {
        return this._outputButtonObject || (this.outputButton ? this.outputButton.sceneObject : null);
    }

    public getBaseNode(): BaseNode | null {
        return this.baseNode;
    }

    /**
     * Matches InputNodeImage output shape so downstream nodes can treat it as an image source.
     */
    public getOutputData(): {
        texture: Texture | null;
        material: Material | null;
        imageComponent: Image | null;
        outputButtonPosition: vec3 | null;
        outputButtonWorldPosition: vec3 | null;
        outputButtonObject: SceneObject | null;
    } {
        if (!this._clonedMaterial && this.previewImage) {
            this.cloneAndStoreMaterial();
        }

        return {
            texture: this._selectedTexture,
            material: this._clonedMaterial,
            imageComponent: this.previewImage,
            outputButtonPosition: this.getOutputButtonLocalPosition(),
            outputButtonWorldPosition: this.getOutputButtonWorldPosition(),
            outputButtonObject: this.getOutputButtonObject()
        };
    }
}