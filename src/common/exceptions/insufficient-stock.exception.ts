import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom.exception';

export class InsufficientStockException extends CustomException {
  constructor(productName: string, available: number) {
    super(
      `"${productName}" mahsuloti uchun yetarli zaxira yo'q. Mavjud: ${available} ta`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
