import { getNodeTypeRegistry } from "./NodeTypeRegistry";
import { NodeManager } from "./NodeManager";

/**
 * Helper script to initialize the Node System.
 * Attach this to a SceneObject in your scene to auto-setup the system.
 */
@component
export class NodeSystemInitializer extends BaseScriptComponent {
    @input
    @hint("Node prefabs to register (Image, Text, AI, 3D, etc.)")
    public nodePrefabs: ObjectPrefab[] = [];

    @input
    @hint("Node type names corresponding to prefabs")
    public nodeTypeNames: string[] = [];

    @input
    @hint("NodeManager component (auto-finds if not set)")
    public nodeManager!: NodeManager;

    onAwake() {
        print("NodeSystemInitializer: Starting initialization...");

        // Find NodeManager if not set
        if (!this.nodeManager) {
            const managerObj = global.scene.getSceneObjectByName("NodeManager");
            if (managerObj) {
                this.nodeManager = managerObj.getComponent(NodeManager.getTypeName()) as NodeManager;
            }
        }

        // Register node types
        this.registerNodeTypes();

        print("NodeSystemInitializer: Initialization complete!");
    }

    /**
     * Registers all node types with the registry
     */
    private registerNodeTypes(): void {
        const registry = getNodeTypeRegistry();

        if (this.nodePrefabs.length !== this.nodeTypeNames.length) {
            print("NodeSystemInitializer: Warning - nodePrefabs and nodeTypeNames arrays must have the same length!");
            return;
        }

        for (let i = 0; i < this.nodePrefabs.length; i++) {
            const prefab = this.nodePrefabs[i];
            const typeName = this.nodeTypeNames[i];

            if (prefab && typeName) {
                registry.registerNodeType(typeName, prefab);
                print(`NodeSystemInitializer: Registered node type "${typeName}"`);
            }
        }
    }
}
