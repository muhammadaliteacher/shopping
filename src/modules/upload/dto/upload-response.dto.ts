import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6.jpg' })
  filename: string;

  @ApiProperty({ example: '/uploads/a1b2c3d4-e5f6.jpg' })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ example: 204800 })
  size: number;
}
