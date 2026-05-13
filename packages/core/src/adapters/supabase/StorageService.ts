import { SupabaseClient } from "@supabase/supabase-js";
import { IStorageService } from "../../services/IStorageService";

export class StorageService implements IStorageService {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async getPublicUrl(path: string): Promise<string> {
        const [bucket, ...folderPath] = path.split('/');
        const folder = folderPath.join('/') || '';
        const { data } = this.supabase.storage.from(bucket || 'public').getPublicUrl(folder);
        return data.publicUrl;
    }

    async uploadCsvFile(csvContent: string, fileName: string): Promise<string> {
        const file = new File([csvContent], fileName, { type: "text/csv;charset=utf-8" });
        const { data, error } = await this.supabase.storage.from('comptabilite').upload(
            fileName, 
            file,
            { upsert: true }
        );        
        if (error) {
            console.error("Error uploading CSV file: ", error);
            throw new Error(error.message);
        };
        const { data: { publicUrl } } = this.supabase.storage.from("comptabilite").getPublicUrl(data.path);

        // Normalize URL for preprod: ensure https and correct host
        try {
            const parsed = new URL(publicUrl);
            if (parsed.hostname.includes('supabase-kong')) {
                parsed.hostname = 'dev.db.nataquashop.com';
                parsed.port = '';
                parsed.protocol = 'https:';
                return parsed.toString();
            }
            // If protocol is http on a public host, force https
            if (parsed.protocol === 'http:') {
                parsed.protocol = 'https:';
                parsed.port = '';
                return parsed.toString();
            }
        } catch (_) {
            // Fallback to original publicUrl if URL parsing fails
        }
        return publicUrl;
    }
}