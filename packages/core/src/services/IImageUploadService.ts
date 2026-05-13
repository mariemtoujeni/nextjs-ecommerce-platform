
export interface IImageUploadService {
    uploadImage(file: File | Blob, bucketName: string, folderPath?: string, returnFullUrl?: boolean): Promise<string>;
}
