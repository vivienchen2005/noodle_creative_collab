import { ConnectionLine } from "./ConnectionLine";
import { InputNodePrompt } from "./InputNodePrompt";
import { InputNodeImage } from "./InputNodeImage";

/**
 * Connection data structure
 */
export interface ConnectionData {
    id: string;
    connectionLine: ConnectionLine;
    sourceNode: SceneObject;
    sourceType: "text" | "image";
    targetNode: SceneObject;
    targetInputType: "text" | "image";
    createdAt: number;
}

/**
 * ConnectionManager - Central manager for all node connections
 * 
 * Responsibilities:
 * - Creates and destroys ConnectionLine instances
 * - Tracks all active connections
 * - Validates connection rules
 * - Provides query methods for finding connections
 * - Single source of truth for connection state
 * 
 * Usage:
 *   const manager = ConnectionManager.getInstance();
 *   const connection = manager.createConnection(sourceNode, "image", targetNode, "image");
 *   manager.removeConnection(connection.id);
 */
@component
export class ConnectionManager extends BaseScriptComponent {
    private static instance: ConnectionManager | null = null;

    @input
    @allowUndefined
    @hint("Material for connection lines")
    public connectionMaterial: Material | null = null;

    @input
    public curveHeight: number = 0.2;

    @input
    public interpolationPoints: number = 20;

    @input("vec3", "{1, 1, 0}")
    @widget(new ColorWidget())
    public lineColor: vec3 = new vec3(1, 1, 0);

    // All active connections
    private connections: Map<string, ConnectionData> = new Map();

    // Connection counter for unique IDs
    private connectionCounter: number = 0;

    onAwake() {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = this;
            print("[ConnectionManager] Initialized");
        } else {
            print("[ConnectionManager] WARNING - Multiple instances detected!");
        }
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(): ConnectionManager | null {
        return ConnectionManager.instance;
    }

    /**
     * Generate a unique connection ID
     */
    private generateConnectionId(sourceType: string, targetType: string): string {
        this.connectionCounter++;
        return `conn_${sourceType}_${targetType}_${Date.now()}_${this.connectionCounter}`;
    }

    /**
     * Create a connection between two nodes
     * 
     * @param sourceNode - The source node (InputNodePrompt or InputNodeImage)
     * @param sourceType - Type of source ("text" or "image")
     * @param targetNode - The target process node
     * @param targetInputType - Which input on target ("text" or "image")
     * @param startPoint - SceneObject for curve start (usually output button)
     * @param endPoint - SceneObject for curve end (usually input section)
     * @returns ConnectionData or null if creation failed
     */
    public createConnection(
        sourceNode: SceneObject,
        sourceType: "text" | "image",
        targetNode: SceneObject,
        targetInputType: "text" | "image",
        startPoint: SceneObject,
        endPoint: SceneObject
    ): ConnectionData | null {
        // Validate connection rules
        if (!this.validateConnection(sourceType, targetInputType)) {
            print(`[ConnectionManager] Invalid connection: ${sourceType} -> ${targetInputType}`);
            return null;
        }

        // Generate unique ID
        const connectionId = this.generateConnectionId(sourceType, targetInputType);

        // Create connection object
        const connectionObject = global.scene.createSceneObject(`Connection_${connectionId}`);
        connectionObject.setParent(this.sceneObject);

        // Create ConnectionLine component
        const connectionLine = connectionObject.createComponent(ConnectionLine.getTypeName()) as ConnectionLine;
        if (!connectionLine) {
            print(`[ConnectionManager] ERROR - Failed to create ConnectionLine`);
            connectionObject.destroy();
            return null;
        }

        // Configure the connection line
        connectionLine.startPoint = startPoint;
        connectionLine.endPoint = endPoint;
        connectionLine.sourceNode = sourceNode;
        connectionLine.targetNode = targetNode;

        if (this.connectionMaterial) {
            connectionLine.lineMaterial = this.connectionMaterial;
        }
        connectionLine.curveHeight = this.curveHeight;
        connectionLine.interpolationPoints = this.interpolationPoints;
        connectionLine.lineColor = this.lineColor;

        // Store connection data
        const connectionData: ConnectionData = {
            id: connectionId,
            connectionLine: connectionLine,
            sourceNode: sourceNode,
            sourceType: sourceType,
            targetNode: targetNode,
            targetInputType: targetInputType,
            createdAt: Date.now()
        };

        this.connections.set(connectionId, connectionData);

        print(`[ConnectionManager] Connection created: ${connectionId} (Total: ${this.connections.size})`);
        return connectionData;
    }

    /**
     * Validate if a connection is allowed
     */
    public validateConnection(sourceType: "text" | "image", targetInputType: "text" | "image"): boolean {
        // Image sources can only connect to image inputs
        // Text sources can only connect to text inputs
        return sourceType === targetInputType;
    }

    /**
     * Remove a connection by ID
     */
    public removeConnection(connectionId: string): boolean {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            print(`[ConnectionManager] Connection not found: ${connectionId}`);
            return false;
        }

        // Destroy the visual
        if (connection.connectionLine && connection.connectionLine.sceneObject) {
            connection.connectionLine.sceneObject.destroy();
        }

        // Remove from tracking
        this.connections.delete(connectionId);

        print(`[ConnectionManager] Connection removed: ${connectionId} (Remaining: ${this.connections.size})`);
        return true;
    }

    /**
     * Remove all connections from a specific source node
     */
    public removeConnectionsFromSource(sourceNode: SceneObject): number {
        let removedCount = 0;
        const toRemove: string[] = [];

        this.connections.forEach((data, id) => {
            if (data.sourceNode === sourceNode) {
                toRemove.push(id);
            }
        });

        toRemove.forEach(id => {
            if (this.removeConnection(id)) {
                removedCount++;
            }
        });

        return removedCount;
    }

    /**
     * Remove all connections to a specific target node
     */
    public removeConnectionsToTarget(targetNode: SceneObject): number {
        let removedCount = 0;
        const toRemove: string[] = [];

        this.connections.forEach((data, id) => {
            if (data.targetNode === targetNode) {
                toRemove.push(id);
            }
        });

        toRemove.forEach(id => {
            if (this.removeConnection(id)) {
                removedCount++;
            }
        });

        return removedCount;
    }

    /**
     * Get all connections from a source node
     */
    public getConnectionsFromSource(sourceNode: SceneObject): ConnectionData[] {
        const result: ConnectionData[] = [];
        this.connections.forEach((data) => {
            if (data.sourceNode === sourceNode) {
                result.push(data);
            }
        });
        return result;
    }

    /**
     * Get all connections to a target node
     */
    public getConnectionsToTarget(targetNode: SceneObject): ConnectionData[] {
        const result: ConnectionData[] = [];
        this.connections.forEach((data) => {
            if (data.targetNode === targetNode) {
                result.push(data);
            }
        });
        return result;
    }

    /**
     * Get connections to a specific input type on a target node
     */
    public getConnectionsToTargetInput(targetNode: SceneObject, inputType: "text" | "image"): ConnectionData[] {
        const result: ConnectionData[] = [];
        this.connections.forEach((data) => {
            if (data.targetNode === targetNode && data.targetInputType === inputType) {
                result.push(data);
            }
        });
        return result;
    }

    /**
     * Check if a connection exists between two nodes
     */
    public hasConnection(sourceNode: SceneObject, targetNode: SceneObject): boolean {
        let found = false;
        this.connections.forEach((data) => {
            if (data.sourceNode === sourceNode && data.targetNode === targetNode) {
                found = true;
            }
        });
        return found;
    }

    /**
     * Get a connection by ID
     */
    public getConnection(connectionId: string): ConnectionData | null {
        return this.connections.get(connectionId) || null;
    }

    /**
     * Get all connections
     */
    public getAllConnections(): ConnectionData[] {
        return Array.from(this.connections.values());
    }

    /**
     * Get connection count
     */
    public getConnectionCount(): number {
        return this.connections.size;
    }

    /**
     * Update the line color for all existing connections
     */
    public setAllConnectionsColor(color: vec3): void {
        this.lineColor = color;
        this.connections.forEach((data) => {
            if (data.connectionLine) {
                data.connectionLine.setColor(color);
            }
        });
        print(`[ConnectionManager] Updated color for all ${this.connections.size} connections`);
    }

    /**
     * Update a specific connection's color
     */
    public setConnectionColor(connectionId: string, color: vec3): void {
        const connection = this.connections.get(connectionId);
        if (connection && connection.connectionLine) {
            connection.connectionLine.setColor(color);
        }
    }

    /**
     * Clear all connections
     */
    public clearAllConnections(): void {
        const ids = Array.from(this.connections.keys());
        ids.forEach(id => this.removeConnection(id));
        print(`[ConnectionManager] All connections cleared`);
    }

    /**
     * Check if target node has any text input connected
     */
    public hasTextInputConnected(targetNode: SceneObject): boolean {
        return this.getConnectionsToTargetInput(targetNode, "text").length > 0;
    }

    /**
     * Check if target node has any image input connected
     */
    public hasImageInputConnected(targetNode: SceneObject): boolean {
        return this.getConnectionsToTargetInput(targetNode, "image").length > 0;
    }

    /**
     * Get the first text input data from connections to a target
     */
    public getTextInputFromConnections(targetNode: SceneObject): { promptText: string; textComponent: Text | null } | null {
        const textConnections = this.getConnectionsToTargetInput(targetNode, "text");
        if (textConnections.length === 0) {
            return null;
        }

        const sourceNode = textConnections[0].sourceNode;
        const promptNode = sourceNode.getComponent(InputNodePrompt.getTypeName() as any) as InputNodePrompt;
        if (promptNode) {
            return promptNode.getOutputData();
        }

        return null;
    }

    /**
     * Get the first image input data from connections to a target
     */
    public getImageInputFromConnections(targetNode: SceneObject): { texture: Texture | null; material: Material | null; imageComponent: Image | null } | null {
        const imageConnections = this.getConnectionsToTargetInput(targetNode, "image");
        if (imageConnections.length === 0) {
            return null;
        }

        const sourceNode = imageConnections[0].sourceNode;
        const imageNode = sourceNode.getComponent(InputNodeImage.getTypeName() as any) as InputNodeImage;
        if (imageNode) {
            return imageNode.getOutputData();
        }

        return null;
    }
}
