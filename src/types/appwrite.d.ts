declare module 'node-appwrite/file' {
    export class InputFile {
        static fromBuffer(buffer: Buffer, filename: string): any;
        static fromPath(path: string, filename: string): any;
    }
}
