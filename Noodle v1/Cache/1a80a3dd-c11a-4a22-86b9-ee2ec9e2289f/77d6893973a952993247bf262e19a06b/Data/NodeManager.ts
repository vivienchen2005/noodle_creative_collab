import { BaseNode } from "./BaseNode";
import { NodeConnection } from "./NodeConnection";
import { ConnectionPoint } from "./ConnectionPoint";
import { NodeMenu } from "./NodeMenu";
import { getNodeTypeRegistry } from "./NodeTypeRegistry";

/**
 * Central manager for all nodes, connections, and persistence.
 * Singleton that tracks all nodes in the scene and manages their connections.
 */
@component
export class NodeManager extends BaseScriptComponent {
    @input
    @hint("NodeMenu component for showing node creation options")
    public nodeMenu!: NodeMenu;

    @input
    @hint("Material for connection lines")
    public connectionMaterial!: Material;

    @input
    @hint("Parent SceneObject for all nodes (optional)")
    public nodesParent!: SceneObject;

    private static instance: NodeManager | null = null;
    private nodes: Map<string, SceneObject> = new Map();
    private connections: Map<string, SceneObject> = new Map();
    private nodeTypeRegistry = getNodeTypeRegistry();
    private currentDraggingConnection: SceneObject | null = null;

    onAwake() {
        // Set as singleton instance
        if (!NodeManager.instance) {
            NodeManager.instance = this;
        }

        // Set up node menu callbacks
        if (this.nodeMenu) {
            this.nodeMenu.onNodeTypeSelected.add((nodeType: string) => {
                this.onNodeTypeSelectedFromMenu(nodeType);
            });
        }

        print("NodeManager: Initialized");
    }

    /**
     * Gets the singleton instance
     */
    static getInstance(): NodeManager | null {
        return NodeManager.instance;
    }

    /**
     * Creates a new node of the specified type at the given position
     */
    createNode(nodeType: string, position: vec3): SceneObject | null {
        const nodeObject = this.nodeTypeRegistry.createNode(nodeType, position);
        
        if (nodeObject) {
            // Get BaseNode component
            const baseNode = nodeObject.getComponent(BaseNode.getTypeName()) as BaseNode;
            if (baseNode) {
                const nodeId = baseNode.getNodeId();
                this.nodes.set(nodeId, nodeObject);

                // Parent to nodes parent if specified
                if (this.nodesParent) {
                    nodeObject.setParent(this.nodesParent);
                }

                print(`NodeManager: Created node "${nodeType}" with ID "${nodeId}"`);
                return nodeObject;
            }
        }

        return null;
    }

    /**
     * Removes a node and all its connections
     */
    removeNode(nodeId: string): void {
        const node = this.nodes.get(nodeId);
        if (!node) {
            print(`NodeManager: Node with ID "${nodeId}" not found`);
            return;
        }

        // Remove all connections involving this node
        const connectionsToRemove: string[] = [];
        this.connections.forEach((connectionObj, connectionId) => {
            const connection = connectionObj.getComponent(NodeConnection.getTypeName()) as NodeConnection;
            if (connection) {
                const sourcePoint = connection.getSourcePoint();
                const targetPoint = connection.getTargetPoint();
                
                // Check if this connection involves the node being removed
                const sourceNode = sourcePoint.getComponent(ConnectionPoint.getTypeName())?.parentNode;
                const targetNode = targetPoint?.getComponent(ConnectionPoint.getTypeName())?.parentNode;
                
                if (sourceNode === node || targetNode === node) {
                    connectionsToRemove.push(connectionId);
                }
            }
        });

        // Remove connections
        connectionsToRemove.forEach(connectionId => {
            this.removeConnection(connectionId);
        });

        // Remove node
        this.nodes.delete(nodeId);
        node.destroy();
        
        print(`NodeManager: Removed node "${nodeId}"`);
    }

    /**
     * Creates a connection between two connection points
     */
    createConnection(sourcePoint: SceneObject, targetPoint: SceneObject | null = null): SceneObject | null {
        // Check if source point can accept connection
        const sourcePointComp = sourcePoint.getComponent(ConnectionPoint.getTypeName()) as ConnectionPoint;
        if (!sourcePointComp) {
            print("NodeManager: Source point does not have ConnectionPoint component");
            return null;
        }

        if (!sourcePointComp.canAcceptConnection()) {
            print("NodeManager: Source point cannot accept more connections");
            return null;
        }

        // Create connection SceneObject as child of source point
        const connectionObject = sourcePoint.createChild("Connection");
        const connection = connectionObject.createComponent(NodeConnection.getTypeName()) as NodeConnection;
        
        if (!connection) {
            connectionObject.destroy();
            return null;
        }

        // Set up connection
        connection.setSourcePoint(sourcePoint);
        if (targetPoint) {
            connection.setTargetPoint(targetPoint);
            
            // Add to target point's connections
            const targetPointComp = targetPoint.getComponent(ConnectionPoint.getTypeName()) as ConnectionPoint;
            if (targetPointComp) {
                targetPointComp.addConnection(connectionObject);
            }
        }

        // Add to source point's connections
        sourcePointComp.addConnection(connectionObject);

        // Set material if provided
        if (this.connectionMaterial) {
            connection.lineMaterial = this.connectionMaterial;
        }

        // Store connection
        const connectionId = connection.getConnectionId();
        this.connections.set(connectionId, connectionObject);

        print(`NodeManager: Created connection "${connectionId}"`);
        return connectionObject;
    }

    /**
     * Starts dragging a connection from a connection point
     */
    startDraggingConnection(sourcePoint: SceneObject): SceneObject | null {
        // Create temporary connection
        const connectionObject = this.createConnection(sourcePoint, null);
        
        if (connectionObject) {
            const connection = connectionObject.getComponent(NodeConnection.getTypeName()) as NodeConnection;
            if (connection) {
                connection.startDragging();
                this.currentDraggingConnection = connectionObject;
                print("NodeManager: Started dragging connection");
            }
        }

        return connectionObject;
    }

    /**
     * Stops dragging the current connection
     */
    stopDraggingConnection(releasePosition: vec3): void {
        if (!this.currentDraggingConnection) {
            return;
        }

        const connection = this.currentDraggingConnection.getComponent(NodeConnection.getTypeName()) as NodeConnection;
        if (connection) {
            connection.stopDragging();
        }

        // Show node menu at release position
        if (this.nodeMenu) {
            this.nodeMenu.showMenu(releasePosition);
        }

        this.currentDraggingConnection = null;
        print(`NodeManager: Stopped dragging connection at ${releasePosition}`);
    }

    /**
     * Called when a node type is selected from the menu
     */
    private onNodeTypeSelectedFromMenu(nodeType: string): void {
        if (!this.currentDraggingConnection) {
            return;
        }

        const connection = this.currentDraggingConnection.getComponent(NodeConnection.getTypeName()) as NodeConnection;
        if (!connection) {
            return;
        }

        // Get release position from menu
        const menuPosition = this.nodeMenu.getMenuPosition();
        
        // Create new node at that position
        const newNode = this.createNode(nodeType, menuPosition);
        
        if (newNode) {
            const baseNode = newNode.getComponent(BaseNode.getTypeName()) as BaseNode;
            if (baseNode) {
                const inPoint = baseNode.getInConnectionPoint();
                if (inPoint) {
                    // Connect the dragging connection to the new node's in point
                    connection.setTargetPoint(inPoint);
                    
                    // Add to in point's connections
                    const inPointComp = inPoint.getComponent(ConnectionPoint.getTypeName()) as ConnectionPoint;
                    if (inPointComp) {
                        inPointComp.addConnection(this.currentDraggingConnection);
                    }
                }
            }
        }

        this.currentDraggingConnection = null;
        print(`NodeManager: Connected to new "${nodeType}" node`);
    }

    /**
     * Removes a connection
     */
    removeConnection(connectionId: string): void {
        const connectionObject = this.connections.get(connectionId);
        if (!connectionObject) {
            return;
        }

        const connection = connectionObject.getComponent(NodeConnection.getTypeName()) as NodeConnection;
        if (connection) {
            connection.destroyConnection();
        }

        this.connections.delete(connectionId);
        print(`NodeManager: Removed connection "${connectionId}"`);
    }

    /**
     * Gets a node by ID
     */
    getNode(nodeId: string): SceneObject | null {
        return this.nodes.get(nodeId) || null;
    }

    /**
     * Gets all nodes
     */
    getAllNodes(): SceneObject[] {
        return Array.from(this.nodes.values());
    }

    /**
     * Gets all connections
     */
    getAllConnections(): SceneObject[] {
        return Array.from(this.connections.values());
    }

    /**
     * Serializes all nodes and connections for saving
     */
    serialize(): any {
        const nodesData: any[] = [];
        const connectionsData: any[] = [];

        // Serialize nodes
        this.nodes.forEach((node, nodeId) => {
            const baseNode = node.getComponent(BaseNode.getTypeName()) as BaseNode;
            if (baseNode) {
                nodesData.push(baseNode.serialize());
            }
        });

        // Serialize connections
        this.connections.forEach((connectionObj, connectionId) => {
            const connection = connectionObj.getComponent(NodeConnection.getTypeName()) as NodeConnection;
            if (connection) {
                connectionsData.push(connection.serialize());
            }
        });

        return {
            nodes: nodesData,
            connections: connectionsData
        };
    }

    /**
     * Deserializes and recreates nodes and connections
     */
    deserialize(data: any): void {
        // Clear existing nodes and connections
        this.nodes.forEach((node, nodeId) => {
            this.removeNode(nodeId);
        });

        // Recreate nodes
        if (data.nodes) {
            data.nodes.forEach((nodeData: any) => {
                const position = new vec3(nodeData.position.x, nodeData.position.y, nodeData.position.z);
                const node = this.createNode(nodeData.nodeType, position);
                if (node) {
                    const baseNode = node.getComponent(BaseNode.getTypeName()) as BaseNode;
                    if (baseNode) {
                        baseNode.deserialize(nodeData);
                    }
                }
            });
        }

        // Recreate connections
        if (data.connections) {
            data.connections.forEach((connectionData: any) => {
                const sourceNode = this.getNode(connectionData.sourceNodeId);
                const targetNode = this.getNode(connectionData.targetNodeId);
                
                if (sourceNode && targetNode) {
                    const sourceBaseNode = sourceNode.getComponent(BaseNode.getTypeName()) as BaseNode;
                    const targetBaseNode = targetNode.getComponent(BaseNode.getTypeName()) as BaseNode;
                    
                    if (sourceBaseNode && targetBaseNode) {
                        const sourcePoint = connectionData.sourcePointType === "out" 
                            ? sourceBaseNode.getOutConnectionPoint() 
                            : sourceBaseNode.getInConnectionPoint();
                        const targetPoint = connectionData.targetPointType === "in"
                            ? targetBaseNode.getInConnectionPoint()
                            : targetBaseNode.getOutConnectionPoint();
                        
                        if (sourcePoint && targetPoint) {
                            this.createConnection(sourcePoint, targetPoint);
                        }
                    }
                }
            });
        }

        print("NodeManager: Deserialized and recreated nodes and connections");
    }

    /**
     * Saves the current state (to be implemented with storage solution)
     */
    save(): void {
        const data = this.serialize();
        // TODO: Save to LocalStorage or Supabase
        print("NodeManager: Save functionality to be implemented");
    }

    /**
     * Loads a saved state (to be implemented with storage solution)
     */
    load(): void {
        // TODO: Load from LocalStorage or Supabase
        print("NodeManager: Load functionality to be implemented");
    }
}
