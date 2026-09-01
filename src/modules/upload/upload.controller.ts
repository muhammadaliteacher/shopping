import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { Admin } from '../../common/decorators/admin.decorator';
import { multerConfig } from '../../config/multer.config';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Admin()
  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig()))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Rasm yuklash (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadResponseDto })
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.toResponse(file);
  }
}
