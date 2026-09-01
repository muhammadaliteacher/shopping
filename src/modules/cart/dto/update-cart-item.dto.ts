import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}
