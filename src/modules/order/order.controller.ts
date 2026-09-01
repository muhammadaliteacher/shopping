import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Admin } from '../../common/decorators/admin.decorator';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ============ CUSTOMER ============

  @Post('orders/create')
  @ApiOperation({ summary: 'Savatdan buyurtma yaratish' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  @ApiBadRequestResponse({ description: "Savat bo'sh yoki stock yetarli emas" })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createFromCart(userId, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: "O'z buyurtmalari ro'yxati" })
  @ApiOkResponse({ type: [OrderResponseDto] })
  findMy(@CurrentUser('userId') userId: string) {
    return this.orderService.findAllForUser(userId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: "Bitta buyurtmani ko'rish" })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Buyurtma topilmadi' })
  findOne(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderService.findByIdForUser(id, userId);
  }

  @Patch('orders/:id/cancel')
  @ApiOperation({ summary: 'Buyurtmani bekor qilish (faqat PENDING)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiBadRequestResponse({ description: 'Buyurtmani bekor qilib bo\'lmaydi' })
  cancel(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderService.cancelByUser(id, userId);
  }

  // ============ ADMIN ============

  @Admin()
  @Get('admin/orders')
  @ApiTags('Admin')
  @ApiOperation({ summary: 'Barcha buyurtmalar (Admin)' })
  @ApiOkResponse({ type: [OrderResponseDto] })
  findAll() {
    return this.orderService.findAll();
  }

  @Admin()
  @Patch('admin/orders/:id/status')
  @ApiTags('Admin')
  @ApiOperation({ summary: "Buyurtma statusini o'zgartirish (Admin)" })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Buyurtma topilmadi' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto.status);
  }

  @Admin()
  @Get('admin/stats')
  @ApiTags('Admin')
  @ApiOperation({ summary: 'Statistika (Admin)' })
  getStats() {
    return this.orderService.getStats();
  }
}
