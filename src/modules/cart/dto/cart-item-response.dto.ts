import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../product/dto/product-response.dto';

export class CartItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
