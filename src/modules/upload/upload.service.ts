import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadResponseDto } from './dto/upload-response.dto';

@Injectable()
export class UploadService {
  toResponse(file: Express.Multer.File): UploadResponseDto {
    if (!file) {
      throw new BadRequestException('Fayl yuborilmadi');
    }
    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
