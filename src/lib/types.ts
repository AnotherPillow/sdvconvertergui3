export interface Manifest {
    Name: string;
    Author: string;
    Version: string;
    Description: string;
    UniqueID: string;
    EntryDll?: string;
    UpdateKeys: string[];
    ContentPackFor?: {
        UniqueID: string;
    };
    MinimumApiVersion?: string;
    Dependencies?: {
        UniqueID: string;
        MinimumVersion?: string;
        IsRequired?: boolean;
    }[];
}