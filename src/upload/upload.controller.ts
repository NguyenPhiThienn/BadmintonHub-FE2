import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { createApiResponse, ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/auth.decorators';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtGuard, PermissionsGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('image')
  @ApiOperation({ summary: 'Upload hình ảnh' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh cần upload (jpg, jpeg, png, gif)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Upload thành công' })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, gif)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<ApiResponseType> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để upload');
    }

    const result = await this.uploadService.uploadImage(file);
    return createApiResponse(result, 'Upload hình ảnh thành công', HttpStatus.CREATED);
  }

  @Post('pdf')
  @ApiOperation({ summary: 'Upload file PDF hoặc Word' })
  @RequirePermissions('document-management:upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File PDF hoặc Word cần upload (.pdf, .doc, .docx)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Upload thành công' })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Chỉ chấp nhận file PDF và Word (.pdf, .doc, .docx)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  async uploadPdf(@UploadedFile() file: Express.Multer.File): Promise<ApiResponseType> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để upload');
    }

    const result = await this.uploadService.uploadPdf(file);
    return createApiResponse(result, 'Upload file thành công', HttpStatus.CREATED);
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Xóa file' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async deleteFile(
    @Param('fileId') fileId: string,
    @Query('type') type: 'image' | 'raw' | 'video' = 'image'
  ): Promise<ApiResponseType> {
    const result = await this.uploadService.deleteFile(fileId, type);
    return createApiResponse(result, 'Xóa file thành công', HttpStatus.OK);
  }
}
