import { registerDecorator, ValidationOptions } from 'class-validator';
import { UserHeroExistsRule } from '../rules/user-hero-exists.rule';

export function UserHeroExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserHeroExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: UserHeroExistsRule,
    });
  };
}
