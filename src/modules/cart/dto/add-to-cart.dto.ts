import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}
