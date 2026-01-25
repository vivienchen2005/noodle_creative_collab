/**
 * Component for connection points ("in" and "out") on nodes.
 * Tracks connections and provides position for bezier curves.
 */
@component
export class ConnectionPoint extends BaseScriptComponent {
    @input
    @hint("Type of connection point: 'in' or 'out'")
    @widget(
        new ComboBoxWidget()
            .addItem("In", "in")
            .addItem("Out", "out")
    )
    public pointType: string = "out";

    @input
    @hint("The parent node this connection point belongs to")
    public parentNode!: SceneObject;

    @input
    @hint("Visual indicator for the connection point (optional)")
    public visualIndicator!: SceneObject;

    private connections: SceneObject[] = [];

    onAwake() {
        // Create a simple visual indicator if none provided
        if (!this.visualIndicator) {
            this.createVisualIndicator();
        }
    }

    /**
     * Creates a simple visual indicator for the connection point
     */
    private createVisualIndicator(): void {
        // This would typically be a small sphere or circle
        // For now, we'll just ensure the SceneObject exists
        // Visual can be added via prefab or manually
    }

    /**
     * Gets the type of this connection point
     */
    getPointType(): string {
        return this.pointType;
    }

    /**
     * Gets the world position of this connection point
     */
    getWorldPosition(): vec3 {
        return this.sceneObject.getTransform().getWorldPosition();
    }

    /**
     * Adds a connection to this point
     */
    addConnection(connection: SceneObject): void {
        if (this.connections.indexOf(connection) === -1) {
            this.connections.push(connection);
        }
    }

    /**
     * Removes a connection from this point
     */
    removeConnection(connection: SceneObject): void {
        const index = this.connections.indexOf(connection);
        if (index !== -1) {
            this.connections.splice(index, 1);
        }
    }

    /**
     * Gets all connections attached to this point
     */
    getConnections(): SceneObject[] {
        return [...this.connections];
    }

    /**
     * Gets the number of connections
     */
    getConnectionCount(): number {
        return this.connections.length;
    }

    /**
     * Checks if this point can accept more connections
     * "in" points can typically have multiple, "out" points usually have one
     */
    canAcceptConnection(): boolean {
        if (this.pointType === "out") {
            return this.connections.length === 0;
        }
        return true; // "in" points can have multiple connections
    }
}
