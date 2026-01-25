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

    onStart() {
        // Listen for grab gestures to start connections
        const hand = this.handType === 0 ? GestureModule.HandType.Right : GestureModule.HandType.Left;
        
        this.gestureModule.getGrabBeginEvent(hand).add(() => {
            this.onGrabBegin();
        });
        
        this.gestureModule.getGrabEndEvent(hand).add(() => {
            this.onGrabEnd();
        });
        
        // Listen for targeting data to update drag position
        this.gestureModule.getTargetingDataEvent(hand).add((targetArgs: TargetingDataArgs) => {
            if (this.isDragging && targetArgs.isValid && this.currentConnection) {
                // Update connection end position to follow hand
                const dragPosition = targetArgs.rayOriginInWorld.add(
                    targetArgs.rayDirectionInWorld.uniformScale(1.0)
                );
                this.currentConnection.updateDragPosition(dragPosition);
            }
        });
    }

    /**
     * Called when grab begins - check if we're grabbing a node's "out" point
     */
    private onGrabBegin(): void {
        // TODO: Check if hand is near a node's "out" connection point
        // For now, we'll create a connection from the first node we find
        // In a full implementation, you'd raycast to find which node is being grabbed
        
        print("NodeConnectionHandler: Grab began - TODO: detect which node's out point");
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
