import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Elektronika' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Barcha elektronika mahsulotlari', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
