import { BaseNode } from "./BaseNode";
import { ConnectionLine } from "./ConnectionLine";
import { GestureModule, TargetingDataArgs } from "LensStudio:GestureModule";

/**
 * Handles connection creation and dragging between nodes.
 * Attach this to a SceneObject in the scene to enable node connections.
 */
@component
export class NodeConnectionHandler extends BaseScriptComponent {
    @input
    @hint("Material for connection lines")
    public connectionMaterial: Material | null = null;

    @input
    @hint("Hand type to use for gestures (0 = Right, 1 = Left)")
    @widget(
        new ComboBoxWidget()
            .addItem("Right", 0)
            .addItem("Left", 1)
    )
    public handType: number = 0;

    @input
    @hint("Distance threshold for connecting to a node (in meters)")
    public connectionThreshold: number = 0.1;

    private static instance: NodeConnectionHandler | null = null;
    private gestureModule: GestureModule = require("LensStudio:GestureModule");
    private currentConnection: ConnectionLine | null = null;
    private sourceNode: SceneObject | null = null;
    private isDragging: boolean = false;
    private connections: ConnectionLine[] = [];
    private lastHandPosition: vec3 | null = null;

    onAwake() {
        // Set as singleton instance
        if (!NodeConnectionHandler.instance) {
            NodeConnectionHandler.instance = this;
        }
    }

    onStart() {
        // Listen for grab gestures to start connections
        const hand = this.handType === 0 ? GestureModule.HandType.Right : GestureModule.HandType.Left;
        
        this.gestureModule.getGrabBeginEvent(hand).add(() => {
            this.onGrabBegin();
        });
        
        this.gestureModule.getGrabEndEvent(hand).add(() => {
            this.onGrabEnd();
        });
        
        // Listen for targeting data to update drag position and detect nodes
        this.gestureModule.getTargetingDataEvent(hand).add((targetArgs: TargetingDataArgs) => {
            if (targetArgs.isValid) {
                const handPosition = targetArgs.rayOriginInWorld.add(
                    targetArgs.rayDirectionInWorld.uniformScale(0.5)
                );
                this.lastHandPosition = handPosition;
                
                if (this.isDragging && this.currentConnection) {
                    // Update connection end position to follow hand
                    this.currentConnection.updateDragPosition(handPosition);
                }
            }
        });
    }

    /**
     * Gets the singleton instance
     */
    static getInstance(): NodeConnectionHandler | null {
        return NodeConnectionHandler.instance;
    }

    /**
     * Called when grab begins - check if we're grabbing a node's "out" point
     */
    private onGrabBegin(): void {
        if (this.lastHandPosition) {
            // Find node whose "out" point is near the hand
            const sourceNode = this.findNodeNearOutPoint(this.lastHandPosition);
            
            if (sourceNode) {
                const baseNode = sourceNode.getComponent(BaseNode.getTypeName() as any) as BaseNode;
                if (baseNode) {
                    const outPos = baseNode.getOutConnectionPosition();
                    this.startConnection(sourceNode, outPos);
                    print(`NodeConnectionHandler: Started connection from node ${baseNode.getNodeId()}`);
                }
            }
        }
    }

    /**
     * Called when grab ends - complete or cancel the connection
     */
    private onGrabEnd(): void {
        if (this.isDragging && this.currentConnection) {
            // Find the nearest node's "in" point
            const targetNode = this.findNearestNodeInPoint();
            
            if (targetNode) {
                // Complete the connection
                this.currentConnection.stopDragging(targetNode);
                this.connections.push(this.currentConnection);
                print(`NodeConnectionHandler: Connection completed to node`);
            } else {
                // Cancel the connection
                this.currentConnection.sceneObject.destroy();
                print("NodeConnectionHandler: Connection cancelled");
            }
            
            this.currentConnection = null;
            this.sourceNode = null;
            this.isDragging = false;
        }
    }

    /**
     * Starts a connection from a source node
     */
    public startConnection(sourceNode: SceneObject, startPosition: vec3): void {
        if (this.isDragging) {
            // Cancel previous connection
            if (this.currentConnection) {
                this.currentConnection.sceneObject.destroy();
            }
        }

        // Create new connection
        const connectionObject = global.scene.createSceneObject("Connection");
        const connection = connectionObject.createComponent(ConnectionLine.getTypeName() as any) as ConnectionLine;
        
        if (connection) {
            connection.sourceNode = sourceNode;
            connection.lineMaterial = this.connectionMaterial;
            connection.startDragging(startPosition);
            
            this.currentConnection = connection;
            this.sourceNode = sourceNode;
            this.isDragging = true;
            
            print(`NodeConnectionHandler: Started connection from node`);
        }
    }

    /**
     * Finds the nearest node's "in" point to the current drag position
     */
    private findNearestNodeInPoint(): SceneObject | null {
        // TODO: Implement raycast or proximity check to find nearest node
        // For now, return null (connection will be cancelled)
        return null;
    }

    /**
     * Gets all connections
     */
    public getConnections(): ConnectionLine[] {
        return this.connections;
    }

    /**
     * Removes a connection
     */
    public removeConnection(connection: ConnectionLine): void {
        const index = this.connections.indexOf(connection);
        if (index > -1) {
            this.connections.splice(index, 1);
            connection.sceneObject.destroy();
        }
    }
}
