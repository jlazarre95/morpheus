export function setJoin(set: Set<string>, delimiter: string): string {
    let message: string = '';
    for(const value of set.values()) {
        message += value + delimiter;
    }
    return message === '' ? message : message.substring(0, message.length - 1);
}