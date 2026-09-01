import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Admin } from '../../common/decorators/admin.decorator';

@ApiTags('Categories')
@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // ============ PUBLIC ============

  @Public()
  @Get('categories')
  @ApiOperation({ summary: "Barcha kategoriyalar ro'yxati" })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  findAll() {
    return this.categoryService.findAll();
  }

  @Public()
  @Get('categories/:id')
  @ApiOperation({ summary: "Bitta kategoriyani ko'rish" })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Kategoriya topilmadi' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findById(id);
  }

  // ============ ADMIN ============

  @Admin()
  @Post('admin/categories')
  @ApiTags('Admin')
  @ApiOperation({ summary: 'Kategoriya yaratish (Admin)' })
  @ApiCreatedResponse({ type: CategoryResponseDto })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Admin()
  @Patch('admin/categories/:id')
  @ApiTags('Admin')
  @ApiOperation({ summary: 'Kategoriyani tahrirlash (Admin)' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Kategoriya topilmadi' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Admin()
  @Delete('admin/categories/:id')
  @ApiTags('Admin')
  @ApiOperation({ summary: "Kategoriyani o'chirish (Admin)" })
  @ApiNotFoundResponse({ description: 'Kategoriya topilmadi' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoryService.remove(id);
    return { message: "Kategoriya o'chirildi" };
  }
}
