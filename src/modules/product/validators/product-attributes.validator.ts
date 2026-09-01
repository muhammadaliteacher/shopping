import { InvalidAttributesException } from '../../../common/exceptions/invalid-attributes.exception';

const MAX_ATTRIBUTE_KEYS = 50;
const MAX_KEY_LENGTH = 100;
const MAX_VALUE_LENGTH = 1000;

// JSONB attributes'ni tekshirish va parse qilish.
// String (form-data) yoki tayyor obyekt qabul qiladi.
export function validateAndParseAttributes(
  input: string | Record<string, any>,
): Record<string, any> {
  let attributes: Record<string, any>;

  if (typeof input === 'string') {
    try {
      attributes = JSON.parse(input);
    } catch {
      throw new InvalidAttributesException("JSON formatda emas");
    }
  } else {
    attributes = input;
  }

  if (attributes === null || typeof attributes !== 'object' || Array.isArray(attributes)) {
    throw new InvalidAttributesException("obyekt bo'lishi kerak (array yoki primitive emas)");
  }

  const keys = Object.keys(attributes);
  if (keys.length > MAX_ATTRIBUTE_KEYS) {
    throw new InvalidAttributesException(`kalitlar soni ${MAX_ATTRIBUTE_KEYS} tadan oshmasligi kerak`);
  }

  for (const key of keys) {
    if (key.length > MAX_KEY_LENGTH) {
      throw new InvalidAttributesException(`"${key}" kaliti juda uzun`);
    }
    const value = attributes[key];
    const valueType = typeof value;
    if (!['string', 'number', 'boolean'].includes(valueType) && value !== null) {
      throw new InvalidAttributesException(
        `"${key}" qiymati faqat string, number, boolean yoki null bo'lishi mumkin`,
      );
    }
    if (valueType === 'string' && value.length > MAX_VALUE_LENGTH) {
      throw new InvalidAttributesException(`"${key}" qiymati juda uzun`);
    }
  }

  return attributes;
}
