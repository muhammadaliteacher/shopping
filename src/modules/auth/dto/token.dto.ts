import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class TokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsJWT()
  refreshToken: string;
}
