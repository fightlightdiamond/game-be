import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsKeyValueValidate implements ValidatorConstraintInterface {
  validate(colmunValue: any) {
    try {
      if (this.isObject(colmunValue)) return false;

      let isValidate = true;
      Object.keys(colmunValue).forEach(function eachKey(key) {
        if (
          key.length > 20 ||
          typeof key != 'string' ||
          typeof colmunValue[key] != 'boolean'
        ) {
          isValidate = false;
        }
      });
      return isValidate;
    } catch (error) {
      console.log(error);
    }
  }

  isObject(objValue) {
    return (
      objValue &&
      typeof objValue === 'object' &&
      objValue.constructor === Object
    );
  }

  defaultMessage(args: ValidationArguments) {
    const params = args.constraints[0];
    if (!params.message) return `the ${args.property} is not validate`;
    else return params.message;
  }
}
