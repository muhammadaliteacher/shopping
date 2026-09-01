import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Admin } from '../../common/decorators/admin.decorator';
import { multerConfig } from '../../config/multer.config';

@ApiTags('Products')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ============ PUBLIC ============

  @Public()
  @Get('products')
  @ApiOperation({ summary: "Mahsulotlar ro'yxati (filter va pagination bilan)" })
  @ApiOkResponse({ type: [ProductResponseDto] })
  findAll(@Query() filter: ProductFilterDto) {
    return this.productService.findAll(filter);
  }

  @Public()
  @Get('products/:id')
  @ApiOperation({ summary: "Bitta mahsulotni ko'rish" })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Mahsulot topilmadi' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findById(id);
  }

  // ============ ADMIN ============

  @Admin()
  @Post('admin/products')
  @ApiTags('Admin')
  @UseInterceptors(FileInterceptor('image', multerConfig()))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "Mahsulot qo'shish, rasm bilan (Admin)" })
  @ApiCreatedResponse({ type: ProductResponseDto })
  create(@Body() dto: CreateProductDto, @UploadedFile() image?: Express.Multer.File) {
    return this.productService.create(dto, image?.filename);
  }

  @Admin()
  @Patch('admin/products/:id')
  @ApiTags('Admin')
  @UseInterceptors(FileInterceptor('image', multerConfig()))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Mahsulotni tahrirlash (Admin)' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Mahsulot topilmadi' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productService.update(id, dto, image?.filename);
  }

  @Admin()
  @Delete('admin/products/:id')
  @ApiTags('Admin')
  @ApiOperation({ summary: "Mahsulotni o'chirish (Admin)" })
  @ApiNotFoundResponse({ description: 'Mahsulot topilmadi' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productService.remove(id);
    return { message: "Mahsulot o'chirildi" };
  }
}
