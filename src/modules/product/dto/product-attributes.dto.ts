import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class ProductAttributesDto {
  @ApiProperty({
    description: 'Mahsulot turiga qarab turli attributes',
    example: {
      type: 'phone',
      brand: 'Samsung',
      processor: 'Snapdragon 888',
      ram: '8GB',
      storage: '256GB',
    },
  })
  @IsObject()
  attributes: Record<string, any>;
}
