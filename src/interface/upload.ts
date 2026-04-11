export interface IUploadResponse {
    public_id: string; // Cloudinary or Appwrite ID
    url: string;
    format: string;
    bytes: number;
}

export interface IDeleteFileResponse {
    statusCode: number;
    message: string;
    data: any;
}

export interface IDeleteFileParams {
    fileId: string;
    type?: "image" | "raw";
}
