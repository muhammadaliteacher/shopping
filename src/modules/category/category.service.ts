import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { slugify } from '../../utils/helpers';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = slugify(dto.name);
    const existing = await this.categoryRepository.findOne({
      where: [{ name: dto.name }, { slug }],
    });
    if (existing) {
      throw new ConflictException('Bunday nomli kategoriya allaqachon mavjud');
    }

    const category = this.categoryRepository.create({ ...dto, slug });
    return this.categoryRepository.save(category);
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (dto.name && dto.name !== category.name) {
      const slug = slugify(dto.name);
      const existing = await this.categoryRepository.findOne({
        where: [{ name: dto.name }, { slug }],
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Bunday nomli kategoriya allaqachon mavjud');
      }
      category.slug = slug;
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);

    const productCount = await this.categoryRepository.manager.count(Product, {
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Kategoriyani o'chirib bo'lmaydi: unda ${productCount} ta mahsulot bor`,
      );
    }

    await this.categoryRepository.remove(category);
  }
}
