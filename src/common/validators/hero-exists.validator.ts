import { registerDecorator, ValidationOptions } from 'class-validator';
import { HeroExistsRule } from '../rules/hero-exists.rule';

export function HeroExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'HeroExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: HeroExistsRule,
    });
  };
}
