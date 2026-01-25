import { InputNodePrompt } from "./InputNodePrompt";
import { InputNodeImage } from "./InputNodeImage";
import { ProcessImageGenNode } from "./ProcessImageGenNode";
import { Process3DNode } from "./Process3DNode";
import { BaseNode } from "./BaseNode";

/**
 * NodeConnectionController - Handles button-click-based connections between nodes
 * Flow: Click input node output button -> Click process node input section -> Create connection
 */
@component
export class NodeConnectionController extends BaseScriptComponent {
    @input
    @hint("Material for connection lines (BezierCurve)")
    public connectionMaterial: Material | null = null;

    private static instance: NodeConnectionController | null = null;
    private _pendingSourceNode: SceneObject | null = null;
    private _pendingSourceType: "text" | "image" | null = null;

    onAwake() {
        if (!NodeConnectionController.instance) {
            NodeConnectionController.instance = this;
        }
        print("NodeConnectionController: Initialized");
    }

    /**
     * Gets the singleton instance
     */
    static getInstance(): NodeConnectionController | null {
        return NodeConnectionController.instance;
    }

    /**
     * Called when an input node's output button is clicked
     * This starts a pending connection
     */
    public onInputNodeButtonClicked(sourceNode: SceneObject, sourceType: "text" | "image"): void {
        print(`NodeConnectionController: Input node button clicked - Type: ${sourceType}, Node: ${sourceNode.name}`);
        
        this._pendingSourceNode = sourceNode;
        this._pendingSourceType = sourceType;
        
        print(`NodeConnectionController: Pending connection started. Click a process node input section to complete.`);
    }

    /**
     * Called when a process node's input section is clicked
     * This completes the connection if there's a pending source
     */
    public onProcessNodeInputClicked(targetNode: SceneObject, inputType: "text" | "image"): boolean {
        if (!this._pendingSourceNode || !this._pendingSourceType) {
            print(`NodeConnectionController: No pending connection to complete`);
            return false;
        }

        // Validate connection type matches
        if (this._pendingSourceType !== inputType) {
            print(`NodeConnectionController: Connection type mismatch. Source: ${this._pendingSourceType}, Target: ${inputType}`);
            this.clearPendingConnection();
            return false;
        }

        print(`NodeConnectionController: Attempting to connect ${this._pendingSourceType} from ${this._pendingSourceNode.name} to ${targetNode.name}`);

        // Try to connect based on target node type
        let connected = false;

        // Check if target is ProcessImageGenNode
        const imageGenNode = targetNode.getComponent(ProcessImageGenNode.getTypeName() as any) as ProcessImageGenNode;
        if (imageGenNode) {
            if (inputType === "text") {
                connected = imageGenNode.connectTextInput(this._pendingSourceNode);
            } else if (inputType === "image") {
                connected = imageGenNode.connectImageInput(this._pendingSourceNode);
            }
        }

        // Check if target is Process3DNode
        if (!connected) {
            const process3DNode = targetNode.getComponent(Process3DNode.getTypeName() as any) as Process3DNode;
            if (process3DNode) {
                if (inputType === "text") {
                    connected = process3DNode.connectTextInput(this._pendingSourceNode);
                } else if (inputType === "image") {
                    connected = process3DNode.connectImageInput(this._pendingSourceNode);
                }
            }
        }

        if (connected) {
            print(`NodeConnectionController: Connection successful!`);
            this.clearPendingConnection();
            return true;
        } else {
            print(`NodeConnectionController: Connection failed - target node not found or already connected`);
            this.clearPendingConnection();
            return false;
        }
    }

    /**
     * Clears the pending connection
     */
    public clearPendingConnection(): void {
        this._pendingSourceNode = null;
        this._pendingSourceType = null;
    }

    /**
     * Gets the pending source node (for UI feedback)
     */
    public getPendingSourceNode(): SceneObject | null {
        return this._pendingSourceNode;
    }

    /**
     * Gets the pending source type (for UI feedback)
     */
    public getPendingSourceType(): "text" | "image" | null {
        return this._pendingSourceType;
    }

    /**
     * Checks if there's a pending connection
     */
    public hasPendingConnection(): boolean {
        return this._pendingSourceNode !== null && this._pendingSourceType !== null;
    }
}
