import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

const uploadDir = () => join(process.cwd(), process.env.UPLOAD_DIR || './uploads');

const allowedMimeTypes = () =>
  (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');

export const multerConfig = (): MulterOptions => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      const dir = uploadDir();
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes().includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          `Fayl turi ruxsat etilmagan. Ruxsat etilgan turlar: ${allowedMimeTypes().join(', ')}`,
        ),
        false,
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
  },
});
