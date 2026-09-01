import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductNotFoundException } from '../../common/exceptions/product-not-found.exception';
import { validateAndParseAttributes } from './validators/product-attributes.validator';
import { CategoryService } from '../category/category.service';

export interface PaginatedProducts {
  items: Product[];
  total: number; 
  page: number;
  limit: number; 
  totalPages: number; 
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(dto: CreateProductDto, imageFilename?: string): Promise<Product> {
    await this.categoryService.findById(dto.categoryId);

    const existing = await this.productRepository.findOne({ where: { sku: dto.sku } });
    if (existing) {
      throw new ConflictException('Bunday SKU allaqachon mavjud');
    }

    const { image, ...rest } = dto;
    const product = this.productRepository.create({
      ...rest,
      attributes: validateAndParseAttributes(dto.attributes),
      imageUrl: imageFilename ? `/uploads/${imageFilename}` : null,
    });
    return this.productRepository.save(product);
  }

  async findAll(filter: ProductFilterDto): Promise<PaginatedProducts> {
    const page = filter.page || 1;
    const limit = filter.limit || 12;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    if (filter.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: filter.categoryId });
    }
    if (filter.search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${filter.search}%` });
    }
    if (filter.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    const [items, total] = await qb
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto, imageFilename?: string): Promise<Product> {
    const product = await this.findById(id);

    if (dto.categoryId) {
      await this.categoryService.findById(dto.categoryId);
    }

    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.productRepository.findOne({ where: { sku: dto.sku } });
      if (existing) {
        throw new ConflictException('Bunday SKU allaqachon mavjud');
      }
    }

    const { image, attributes, ...rest } = dto;
    Object.assign(product, rest);

    if (attributes !== undefined) {
      product.attributes = validateAndParseAttributes(attributes);
    }

    if (imageFilename) {
      // Eski rasmni o'chirish
      this.deleteImageFile(product.imageUrl);
      product.imageUrl = `/uploads/${imageFilename}`;
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    // Buyurtma tarixini saqlab qolish uchun soft-delete (isActive = false).
    // Rasm o'chirilmaydi - buyurtma tarixi va savatdagi imageUrl ishlashda davom etadi
    product.isActive = false;
    await this.productRepository.save(product);
  }

  private deleteImageFile(imageUrl?: string): void {
    if (!imageUrl) return;
    const filename = imageUrl.replace('/uploads/', '');
    const filePath = join(process.cwd(), process.env.UPLOAD_DIR || './uploads', filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}
