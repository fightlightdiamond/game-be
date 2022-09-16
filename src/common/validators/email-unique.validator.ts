import { registerDecorator, ValidationOptions } from 'class-validator';
import { EmailExistsRule } from '../rules/email-exists.rule';

export function EmailUniqueValidator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'EmailExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: EmailExistsRule,
    });
  };
}
