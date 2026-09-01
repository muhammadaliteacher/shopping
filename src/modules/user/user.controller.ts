import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: "O'z profilini ko'rish" })
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(@CurrentUser() user: JwtUser) {
    const found = await this.userService.findById(user.userId);
    return this.userService.toResponse(found);
  }

  @Patch('me')
  @ApiOperation({ summary: "O'z profilini tahrirlash" })
  @ApiOkResponse({ type: UserResponseDto })
  async updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateUserDto) {
    const updated = await this.userService.update(user.userId, dto);
    return this.userService.toResponse(updated);
  }
}
