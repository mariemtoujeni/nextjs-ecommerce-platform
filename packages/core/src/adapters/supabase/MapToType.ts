export type MappingObject = {
    key: string;
    transform?: (value: any) => any;
}

export type KeyMap<T> = {
    [K in keyof T]: string | MappingObject;
};

export function mapToType<T>(data: any, keyMap: KeyMap<T>): T {
    return Object.entries(keyMap).reduce((acc, [outputKey, mapping]) => {
        let inputKey: string;
        let transform: ((value: any) => any) | undefined;

        if (typeof mapping === 'string') {
            inputKey = mapping;
        } else {
            const mappingObject = mapping as MappingObject;
            inputKey = mappingObject.key;
            transform = mappingObject.transform;
        }

        // Handle nested keys with dot notation
        let value = data;
        const keys = inputKey.split('.');
        for (const key of keys) {
            if (!value || !(key in value)) {
                value = undefined;
                break;
            }
            value = value[key];
        }

        if(undefined === value) {
            return acc;
        }

        // Apply transformation if exists
        if (transform && null !== value) {
            value = transform(value);
        }

        return {...acc, [outputKey]: value};
    }, {} as T);
}

export function mapFromType<T>(data: T, keyMap: KeyMap<T>): Record<string, any> {
    return Object.entries(keyMap).reduce((acc, [inputKey, mapping]) => {
        let outputKey: string;
        let transform: ((value: any) => any) | undefined;

        if (typeof mapping === 'string') {
            outputKey = mapping;
        } else {
            const mappingObject = mapping as MappingObject;
            outputKey = mappingObject.key;
            transform = mappingObject.transform;
        }

        // Get the value from the input data
        let value = data[inputKey as keyof T];

        // Apply transformation if exists
        if (transform && value !== null && value !== undefined) {
            value = transform(value);
        }

        // Handle nested keys with dot notation
        const keys = outputKey.split('.');
        let current: Record<string, any> = acc;
        
        // Create nested structure
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if(key) {
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key] as Record<string, any>;
            }            
        }

        // Set the final value
        const lastKey = keys[keys.length - 1];
        if (value !== undefined && lastKey) {
            current[lastKey] = value;
        }

        return acc;
    }, {} as Record<string, any>);
}
