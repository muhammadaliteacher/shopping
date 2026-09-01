import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ali Akbarov' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'CUSTOMER', enum: ['ADMIN', 'CUSTOMER'], required: false })
  @IsOptional()
  @IsIn(['ADMIN', 'CUSTOMER'])
  role?: 'ADMIN' | 'CUSTOMER';
}
