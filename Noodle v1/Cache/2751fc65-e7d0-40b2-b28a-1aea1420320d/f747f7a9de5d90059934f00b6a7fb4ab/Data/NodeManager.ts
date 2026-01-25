import { BaseNode } from "./BaseNode";
import { ConnectionLine } from "./ConnectionLine";

/**
 * Central manager for all nodes, connections, and persistence.
 * Handles node registration, connection creation, and provides shared resources like materials.
 */
@component
export class NodeManager extends BaseScriptComponent {
    @input
    @hint("Material for connection lines - REQUIRED for connections to be visible")
    public connectionMaterial: Material | null = null;

    @input
    @hint("Default curve height for connections")
    public defaultCurveHeight: number = 0.1;

    @input
    @allowUndefined
    @hint("Parent object for all nodes (optional - for organization)")
    public nodesParent: SceneObject | null = null;

    @input
    @allowUndefined
    @hint("Parent object for all connections (optional - for organization)")
    public connectionsParent: SceneObject | null = null;

    private static instance: NodeManager | null = null;
    private nodes: Map<string, SceneObject> = new Map(); // Track nodes by ID
    private connections: Map<string, ConnectionLine> = new Map(); // Track connections by ID
    private nodeComponents: Map<string, BaseNode> = new Map(); // Track BaseNode components

    onAwake() {
        if (!NodeManager.instance) {
            NodeManager.instance = this;
            print("NodeManager: Initialized");
        } else {
            print("NodeManager: WARNING - Multiple instances detected! Only one should exist.");
        }
    }

    onStart() {
        // Check if material is set
        if (!this.connectionMaterial) {
            print("NodeManager: WARNING - No connection material set! Connections will not be visible.");
        } else {
            print(`NodeManager: Connection material ready`);
        }

        // Auto-register existing nodes in the scene (defer to onStart so components are fully initialized)
        this.autoRegisterNodes();
    }

    /**
     * Gets the singleton instance
     */
    static getInstance(): NodeManager | null {
        return NodeManager.instance;
    }

    /**
     * Auto-registers all nodes with BaseNode components in the scene
     */
    private autoRegisterNodes(): void {
        const rootObjects = global.scene.getRootObjectsCount();
        let registeredCount = 0;

        for (let i = 0; i < rootObjects; i++) {
            const rootObject = global.scene.getRootObject(i);
            const baseNode = rootObject.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;

            if (baseNode) {
                this.registerNode(rootObject, baseNode);
                registeredCount++;
            }
        }

        print(`NodeManager: Auto-registered ${registeredCount} nodes`);
    }

    /**
     * Registers a node with the manager
     */
    public registerNode(nodeObject: SceneObject, baseNode: BaseNode): void {
        // Access nodeId directly as property, or use getNodeId if it's a method
        let nodeId: string;
        if (typeof baseNode.getNodeId === 'function') {
            nodeId = baseNode.getNodeId();
        } else if (baseNode.nodeId) {
            nodeId = baseNode.nodeId;
        } else {
            print(`NodeManager: ERROR - Cannot get nodeId from BaseNode component`);
            return;
        }
        
        if (!nodeId || nodeId === "") {
            print(`NodeManager: ERROR - Node has empty nodeId, skipping registration`);
            return;
        }
        
        if (this.nodes.has(nodeId)) {
            print(`NodeManager: Node ${nodeId} already registered`);
            return;
        }

        this.nodes.set(nodeId, nodeObject);
        this.nodeComponents.set(nodeId, baseNode);

        // Set parent if specified
        if (this.nodesParent) {
            nodeObject.setParent(this.nodesParent);
        }

        // Get node type safely
        let nodeType = "unknown";
        if (typeof baseNode.getNodeType === 'function') {
            nodeType = baseNode.getNodeType();
        } else if (baseNode.nodeType) {
            nodeType = baseNode.nodeType;
        }

        print(`NodeManager: Registered node ${nodeId} (${nodeType})`);
    }

    /**
     * Unregisters a node
     */
    public unregisterNode(nodeId: string): void {
        if (this.nodes.has(nodeId)) {
            this.nodes.delete(nodeId);
            this.nodeComponents.delete(nodeId);
            print(`NodeManager: Unregistered node ${nodeId}`);
        }
    }

    /**
     * Creates a connection between two nodes
     */
    public createConnection(sourceNodeId: string, targetNodeId: string): ConnectionLine | null {
        const sourceNode = this.nodes.get(sourceNodeId);
        const targetNode = this.nodes.get(targetNodeId);

        if (!sourceNode || !targetNode) {
            print(`NodeManager: Cannot create connection - nodes not found. Source: ${sourceNodeId}, Target: ${targetNodeId}`);
            return null;
        }

        if (sourceNode === targetNode) {
            print(`NodeManager: Cannot connect node to itself`);
            return null;
        }

        // Check if connection already exists
        const connectionId = `${sourceNodeId}->${targetNodeId}`;
        if (this.connections.has(connectionId)) {
            print(`NodeManager: Connection ${connectionId} already exists`);
            return this.connections.get(connectionId) || null;
        }

        // Create connection object
        const connectionObject = global.scene.createSceneObject(`Connection_${connectionId}`);
        if (this.connectionsParent) {
            connectionObject.setParent(this.connectionsParent);
        }

        const connection = connectionObject.createComponent(ConnectionLine.getTypeName() as any) as ConnectionLine;

        if (!connection) {
            print(`NodeManager: ERROR - Failed to create ConnectionLine component`);
            connectionObject.destroy();
            return null;
        }

        // Configure connection
        connection.sourceNode = sourceNode;
        connection.targetNode = targetNode;
        connection.lineMaterial = this.connectionMaterial;
        connection.curveHeight = this.defaultCurveHeight;

        // Store connection
        this.connections.set(connectionId, connection);

        print(`NodeManager: Created connection ${connectionId}`);
        print(`NodeManager: Connection details - source: ${sourceNode.name}, target: ${targetNode.name}, material: ${this.connectionMaterial ? 'SET' : 'MISSING'}`);

        return connection;
    }

    /**
     * Removes a connection
     */
    public removeConnection(sourceNodeId: string, targetNodeId: string): void {
        const connectionId = `${sourceNodeId}->${targetNodeId}`;
        const connection = this.connections.get(connectionId);

        if (connection) {
            this.connections.delete(connectionId);
            connection.sceneObject.destroy();
            print(`NodeManager: Removed connection ${connectionId}`);
        } else {
            print(`NodeManager: Connection ${connectionId} not found`);
        }
    }

    /**
     * Gets a node by ID
     */
    public getNode(nodeId: string): SceneObject | null {
        return this.nodes.get(nodeId) || null;
    }

    /**
     * Gets a BaseNode component by ID
     */
    public getBaseNode(nodeId: string): BaseNode | null {
        return this.nodeComponents.get(nodeId) || null;
    }

    /**
     * Gets all registered nodes
     */
    public getAllNodes(): SceneObject[] {
        return Array.from(this.nodes.values());
    }

    /**
     * Gets all connections
     */
    public getAllConnections(): ConnectionLine[] {
        return Array.from(this.connections.values());
    }

    /**
     * Gets connections for a specific node (both incoming and outgoing)
     */
    public getNodeConnections(nodeId: string): { incoming: ConnectionLine[], outgoing: ConnectionLine[] } {
        const incoming: ConnectionLine[] = [];
        const outgoing: ConnectionLine[] = [];

        this.connections.forEach((connection, connectionId) => {
            const sourceNode = connection.getSourceNode();
            const targetNode = connection.getTargetNode();

            if (sourceNode) {
                const sourceBaseNode = sourceNode.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
                if (sourceBaseNode && sourceBaseNode.getNodeId() === nodeId) {
                    outgoing.push(connection);
                }
            }

            if (targetNode) {
                const targetBaseNode = targetNode.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
                if (targetBaseNode && targetBaseNode.getNodeId() === nodeId) {
                    incoming.push(connection);
                }
            }
        });

        return { incoming, outgoing };
    }

    /**
     * Deletes a node and all its connections
     */
    public deleteNode(nodeId: string): void {
        // Remove all connections involving this node
        const nodeConnections = this.getNodeConnections(nodeId);

        nodeConnections.incoming.forEach(conn => {
            const sourceNode = conn.getSourceNode();
            if (sourceNode) {
                const sourceBaseNode = sourceNode.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
                if (sourceBaseNode) {
                    this.removeConnection(sourceBaseNode.getNodeId(), nodeId);
                }
            }
        });

        nodeConnections.outgoing.forEach(conn => {
            const targetNode = conn.getTargetNode();
            if (targetNode) {
                const targetBaseNode = targetNode.getComponent(BaseNode.getTypeName() as any) as BaseNode | null;
                if (targetBaseNode) {
                    this.removeConnection(nodeId, targetBaseNode.getNodeId());
                }
            }
        });

        // Remove node
        const node = this.nodes.get(nodeId);
        if (node) {
            this.unregisterNode(nodeId);
            node.destroy();
            print(`NodeManager: Deleted node ${nodeId}`);
        }
    }

    onDestroy() {
        if (NodeManager.instance === this) {
            NodeManager.instance = null;
        }
    }
}
