import { registerDecorator, ValidationOptions } from 'class-validator';
import { MatchExistsRule } from '../rules/match-exists.rule';

export function MatchExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'MatchExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: MatchExistsRule,
    });
  };
}
