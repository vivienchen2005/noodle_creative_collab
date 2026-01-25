/**
 * Registry for different node types and their prefabs.
 * Manages available node types (Image, Text, AI, 3D, etc.) and their creation.
 */
export class NodeTypeRegistry {
    private static instance: NodeTypeRegistry | null = null;
    private nodeTypes: Map<string, ObjectPrefab> = new Map();
    private nodeTypeNames: string[] = [];

    private constructor() {
        // Initialize default node types
        this.initializeDefaultTypes();
    }

    /**
     * Gets the singleton instance
     */
    static getInstance(): NodeTypeRegistry {
        if (!NodeTypeRegistry.instance) {
            NodeTypeRegistry.instance = new NodeTypeRegistry();
        }
        return NodeTypeRegistry.instance;
    }

    /**
     * Initializes default node types
     */
    private initializeDefaultTypes(): void {
        // Default node types - prefabs should be registered via registerNodeType
        this.nodeTypeNames = ["Image", "Text", "AI", "3D", "Base"];
    }

    /**
     * Registers a node type with its prefab
     */
    registerNodeType(typeName: string, prefab: ObjectPrefab): void {
        this.nodeTypes.set(typeName, prefab);
        if (this.nodeTypeNames.indexOf(typeName) === -1) {
            this.nodeTypeNames.push(typeName);
        }
        print(`NodeTypeRegistry: Registered node type "${typeName}"`);
    }

    /**
     * Gets a prefab for a node type
     */
    getNodePrefab(typeName: string): ObjectPrefab | null {
        return this.nodeTypes.get(typeName) || null;
    }

    /**
     * Gets all available node type names
     */
    getAvailableNodeTypes(): string[] {
        return [...this.nodeTypeNames];
    }

    /**
     * Checks if a node type is registered
     */
    isNodeTypeRegistered(typeName: string): boolean {
        return this.nodeTypes.has(typeName);
    }

    /**
     * Creates a node instance from a type name
     */
    createNode(typeName: string, position: vec3): SceneObject | null {
        const prefab = this.getNodePrefab(typeName);
        if (!prefab) {
            print(`NodeTypeRegistry: Node type "${typeName}" not found or prefab not registered`);
            return null;
        }

        try {
            const nodeObject = prefab.instantiate(null);
            if (nodeObject) {
                nodeObject.getTransform().setWorldPosition(position);
                print(`NodeTypeRegistry: Created node of type "${typeName}" at position ${position}`);
                return nodeObject;
            }
        } catch (error) {
            print(`NodeTypeRegistry: Error creating node "${typeName}": ${error}`);
        }

        return null;
    }

    /**
     * Unregisters a node type
     */
    unregisterNodeType(typeName: string): void {
        this.nodeTypes.delete(typeName);
        const index = this.nodeTypeNames.indexOf(typeName);
        if (index !== -1) {
            this.nodeTypeNames.splice(index, 1);
        }
    }
}

// Export singleton instance getter
export function getNodeTypeRegistry(): NodeTypeRegistry {
    return NodeTypeRegistry.getInstance();
}
