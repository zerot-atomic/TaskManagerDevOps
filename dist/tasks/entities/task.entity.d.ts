export declare enum TaskStatus {
    PENDIENTE = "pendiente",
    EN_PROCESO = "en_proceso",
    TERMINADA = "terminada"
}
export declare enum TaskPriority {
    ALTA = "alta",
    MEDIA = "media",
    BAJA = "baja"
}
export declare class Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    createdAt: Date;
    updatedAt: Date;
}
