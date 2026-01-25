"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTypeRegistry = void 0;
exports.getNodeTypeRegistry = getNodeTypeRegistry;
/**
 * Registry for different node types and their prefabs.
 * Manages available node types (Image, Text, AI, 3D, etc.) and their creation.
 */
class NodeTypeRegistry {
    constructor() {
        this.nodeTypes = new Map();
        this.nodeTypeNames = [];
        // Initialize default node types
        this.initializeDefaultTypes();
    }
    /**
     * Gets the singleton instance
     */
    static getInstance() {
        if (!NodeTypeRegistry.instance) {
            NodeTypeRegistry.instance = new NodeTypeRegistry();
        }
        return NodeTypeRegistry.instance;
    }
    /**
     * Initializes default node types
     */
    initializeDefaultTypes() {
        // Default node types - prefabs should be registered via registerNodeType
        this.nodeTypeNames = ["Image", "Text", "AI", "3D", "Base"];
    }
    /**
     * Registers a node type with its prefab
     */
    registerNodeType(typeName, prefab) {
        this.nodeTypes.set(typeName, prefab);
        if (this.nodeTypeNames.indexOf(typeName) === -1) {
            this.nodeTypeNames.push(typeName);
        }
        print(`NodeTypeRegistry: Registered node type "${typeName}"`);
    }
    /**
     * Gets a prefab for a node type
     */
    getNodePrefab(typeName) {
        return this.nodeTypes.get(typeName) || null;
    }
    /**
     * Gets all available node type names
     */
    getAvailableNodeTypes() {
        return [...this.nodeTypeNames];
    }
    /**
     * Checks if a node type is registered
     */
    isNodeTypeRegistered(typeName) {
        return this.nodeTypes.has(typeName);
    }
    /**
     * Creates a node instance from a type name
     */
    createNode(typeName, position) {
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
        }
        catch (error) {
            print(`NodeTypeRegistry: Error creating node "${typeName}": ${error}`);
        }
        return null;
    }
    /**
     * Unregisters a node type
     */
    unregisterNodeType(typeName) {
        this.nodeTypes.delete(typeName);
        const index = this.nodeTypeNames.indexOf(typeName);
        if (index !== -1) {
            this.nodeTypeNames.splice(index, 1);
        }
    }
}
exports.NodeTypeRegistry = NodeTypeRegistry;
NodeTypeRegistry.instance = null;
// Export singleton instance getter
function getNodeTypeRegistry() {
    return NodeTypeRegistry.getInstance();
}
//# sourceMappingURL=NodeTypeRegistry.js.map