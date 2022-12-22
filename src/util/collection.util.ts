export function setJoin(set: Set<string>, delimiter: string): string {
    let message: string = '';
    for(const value of set.values()) {
        message += value + delimiter;
    }
    return message === '' ? message : message.substring(0, message.length - 1);
}

export function accept<T>(obj: T, acceptList: T[] = [], denyList: T[] = []): boolean {
    const acceptSet = new Set<T>(acceptList);
    const denySet = new Set<T>(denyList);

    if(acceptSet.size > 0) {
        return acceptSet.has(obj) && !denySet.has(obj);
    }
    return !denySet.has(obj);
}

export function grant<T, U>(obj: T, acceptList: U[] = [], denyList: U[] = [], fn: (obj: T, compareTo: U) => boolean): boolean {
    if(acceptList.length > 0) {
        return !!acceptList.find(v => fn(obj, v)) && !denyList.find(v => fn(obj, v));
    }
    return !denyList.find(v => fn(obj, v));
}