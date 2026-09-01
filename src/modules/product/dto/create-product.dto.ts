import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsPositive,
  MinLength,
  MaxLength,
  IsJSON,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Samsung Galaxy S21' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'SKU-001-SAMSUNG-S21' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 5499999 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: "Eng so'nggi Samsung flagman smartfoni" })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 'category-uuid-here' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    type: 'string',
    description: "JSON string ko'rinishida yuboriladi (multipart/form-data uchun)",
    example:
      '{"type":"phone","brand":"Samsung","processor":"Snapdragon 888","ram":"8GB","storage":"256GB","camera":"64MP","battery":"4000mAh"}',
  })
  @IsJSON()
  attributes: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Mahsulot rasmi (image fayl)',
  })
  @IsOptional()
  image?: any;
}
