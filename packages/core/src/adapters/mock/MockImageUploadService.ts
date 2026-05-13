import type { IImageUploadService } from "../../services";

export class MockImageUploadService implements IImageUploadService {
  async uploadImage(file: File | Blob, bucketName: string, folderPath?: string): Promise<string> {

    await new Promise((resolve) => setTimeout(resolve, 100));

    const fakeUrl = `https://mockstorage.example.com/${bucketName}/${folderPath ?? ''}/mock-image-${Date.now()}.jpg`;
    return fakeUrl;
  }
}
