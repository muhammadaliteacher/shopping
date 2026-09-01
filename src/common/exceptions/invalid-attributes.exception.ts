import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom.exception';

export class InvalidAttributesException extends CustomException {
  constructor(reason: string) {
    super(`Mahsulot attributes noto'g'ri: ${reason}`, HttpStatus.BAD_REQUEST);
  }
}
