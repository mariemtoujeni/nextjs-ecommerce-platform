export interface IStorageService {
    getPublicUrl(path: string): Promise<string>;
    uploadCsvFile(csvContent: string, fileName: string): Promise<string>;
}