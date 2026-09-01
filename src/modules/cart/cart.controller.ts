import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth('JWT')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Savatni ko'rish" })
  @ApiOkResponse({ type: CartResponseDto })
  getCart(@CurrentUser('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('add')
  @ApiOperation({ summary: "Savatga mahsulot qo'shish" })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'Mahsulot topilmadi' })
  addToCart(@CurrentUser('userId') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(userId, dto);
  }

  @Patch('item/:id')
  @ApiOperation({ summary: "Savat elementi miqdorini o'zgartirish" })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'Savat elementi topilmadi' })
  updateItem(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(userId, itemId, dto);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Savatni tozalash' })
  @ApiOkResponse({ type: CartResponseDto })
  clearCart(@CurrentUser('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Delete('item/:id')
  @ApiOperation({ summary: 'Savatdan mahsulotni olib tashlash' })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'Savat elementi topilmadi' })
  removeItem(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeCartItem(userId, itemId);
  }
}
