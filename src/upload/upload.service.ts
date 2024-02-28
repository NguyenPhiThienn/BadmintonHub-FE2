import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Client, Storage, ID } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

@Injectable()
export class UploadService {
  private appwriteClient: Client;
  private appwriteStorage: Storage;

  constructor(private configService: ConfigService) {
    // Cloudinary config
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    // Appwrite config
    this.appwriteClient = new Client()
      .setEndpoint(this.configService.get<string>('APPWRITE_ENDPOINT') || 'https://cloud.appwrite.io/v1')
      .setProject(this.configService.get<string>('APPWRITE_PROJECT_ID'))
      .setKey(this.configService.get<string>('APPWRITE_API_KEY'));

    this.appwriteStorage = new Storage(this.appwriteClient);
  }

  async uploadImage(file: Express.Multer.File): Promise<any> {
    try {
      const result = await cloudinary.uploader.upload(
        file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'badmintonhub/images',
          resource_type: 'image',
          transformation: [
            { width: 1500, height: 1500, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
      );

      return {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadPdf(file: Express.Multer.File): Promise<any> {
    try {
      const bucketId = this.configService.get<string>('APPWRITE_BUCKET_ID');
      const inputFile = InputFile.fromBuffer(file.buffer as any, file.originalname);

      const result = await this.appwriteStorage.createFile(
        bucketId,
        ID.unique(),
        inputFile
      );

      // Construct the file URL (Note: Default Appwrite URL for preview)
      const fileUrl = `${this.configService.get('APPWRITE_ENDPOINT')}/storage/buckets/${bucketId}/files/${result.$id}/view?project=${this.configService.get('APPWRITE_PROJECT_ID')}`;

      return {
        public_id: result.$id,
        url: fileUrl,
        format: file.originalname.split('.').pop()?.toLowerCase() || 'document',
        bytes: result.sizeOriginal,
      };
    } catch (error) {
      throw new Error(`Failed to upload PDF to Appwrite: ${error.message}`);
    }
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'raw' | 'video' = 'image'): Promise<any> {
    try {
      if (resourceType === 'raw') {
        // Assume PDF/Raw files are in Appwrite
        const bucketId = this.configService.get<string>('APPWRITE_BUCKET_ID');
        return await this.appwriteStorage.deleteFile(bucketId, publicId);
      }

      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      return result;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
