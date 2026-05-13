import { IImageUploadService } from '../../services/IImageUploadService';
import { SupabaseClient } from '@supabase/supabase-js';

export class ImageUploadService implements IImageUploadService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async uploadImage(file: File | Blob, bucketName: string, folderPath = '', returnFullUrl = false): Promise<string> {
    const fileName = file instanceof File ? file.name : 'file';
    const fileExt = fileName.split('.').pop();

    const uniqueFileName = `${folderPath ? folderPath + '/' : ''}${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${fileExt}`;

    const { error } = await this.supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file instanceof File ? file.type : undefined,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (returnFullUrl) {
      const { data: urlData } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(uniqueFileName);

      if (!urlData?.publicUrl) {
        throw new Error(`Failed to get public URL`);
      }

      return urlData.publicUrl;
    }

    return `/${uniqueFileName}`;
  }
}