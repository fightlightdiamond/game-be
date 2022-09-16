import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { BaseSchema } from 'yup';
import { SerializeValidationError } from '../utils/serialize-validation-error';

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private readonly schema: BaseSchema<object>) {}

  async transform(value: any) {
    try {
      await this.schema.validate(value, { abortEarly: false });
    } catch (err) {
      const yupError = SerializeValidationError(err);
      throw new BadRequestException(yupError);
    }
    return value;
  }
}
