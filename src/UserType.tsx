// Типизируем объекты для большей надежности
export type UserType = {
    id: string;
    name: string;
}
export type MessageType = {
    id: string;
    message: string;
    user: UserType;
}