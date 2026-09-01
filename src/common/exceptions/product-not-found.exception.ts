import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom.exception';

export class ProductNotFoundException extends CustomException {
  constructor(productId?: string) {
    super(
      productId ? `Mahsulot topilmadi: ${productId}` : 'Mahsulot topilmadi',
      HttpStatus.NOT_FOUND,
    );
  }
}
