import { BaseNode } from "./BaseNode";

/**
 * Central manager for all nodes, connections, and persistence.
 * TODO: Will be implemented step by step
 */
@component
export class NodeManager extends BaseScriptComponent {
    @input
    @hint("Material for connection lines (optional)")
    public connectionMaterial: Material | null = null;

    @input
    @hint("Parent SceneObject for all nodes (optional)")
    public nodesParent: SceneObject | null = null;

    private static instance: NodeManager | null = null;
    private nodes: Map<string, SceneObject> = new Map();

    onAwake() {
        // Set as singleton instance
        if (!NodeManager.instance) {
            NodeManager.instance = this;
        }
        print("NodeManager: Initialized (minimal version - will be expanded step by step)");
    }

    /**
     * Gets the singleton instance
     */
    static getInstance(): NodeManager | null {
        return NodeManager.instance;
    }

    /**
     * Creates a new node (TODO: will be implemented with node registry)
     */
    createNode(nodeType: string, position: vec3): SceneObject | null {
        print(`NodeManager: createNode called for type "${nodeType}" at position ${position} - TODO: implement`);
        return null;
    }

    /**
     * Gets a node by ID
     */
    getNode(nodeId: string): SceneObject | null {
        return this.nodes.get(nodeId) || null;
    }

    /**
     * Removes a node
     */
    removeNode(nodeId: string): void {
        const node = this.nodes.get(nodeId);
        if (node) {
            node.destroy();
            this.nodes.delete(nodeId);
            print(`NodeManager: Removed node ${nodeId}`);
        }
    }
}
