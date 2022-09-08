import { registerDecorator, ValidationOptions } from 'class-validator';
import { GemIdsUniqueRule } from '../rules/gem-ids-unique.rule';

export function GemIdsUnique(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'GemIdsUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: GemIdsUniqueRule,
    });
  };
}
