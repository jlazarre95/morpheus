export class ArgDefinition {
    defaultValue?: string;
    optional?: boolean;
}

export class ArgValue {
    value?: string;
    type?: 'string' | 'number' | 'boolean';
}