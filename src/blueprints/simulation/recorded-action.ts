export interface RecordedAction {
    name: string;
    date: string;
    state: "start" | "end";
}

export interface RecordedActions {
    actions: RecordedAction[];
}