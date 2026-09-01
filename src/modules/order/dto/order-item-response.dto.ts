import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  priceAtPurchase: number;

  @ApiProperty({
    example: {
      type: 'phone',
      brand: 'Samsung',
    },
  })
  productAttributes: Record<string, any>;

  @ApiProperty()
  createdAt: Date;
}
