import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const globalValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: false,
  errorHttpStatusCode: 422,
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    if (validationErrors.length) {
      const validate = validationErrors.map((val: ValidationError) => {
        return { [val.property]: Object.values(val.constraints) };
      });
      return new BadRequestException(validate);
    }
  },
});
