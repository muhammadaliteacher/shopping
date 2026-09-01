import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsEnum, MinLength } from 'class-validator';

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Tashkent shahar, Yunusabad tumani...' })
  @IsString()
  @MinLength(10)
  shippingAddress: string;

  @ApiProperty({ example: '+998991234567' })
  @IsPhoneNumber('UZ')
  phoneNumber: string;

  @ApiProperty({ enum: PaymentMethod, example: 'CARD' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
