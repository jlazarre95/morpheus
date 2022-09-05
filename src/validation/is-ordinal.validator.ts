import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsOrdinal(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOrdinal',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
            return typeof value === 'number' || value === 'all';
        },
        defaultMessage(args: ValidationArguments) {
            return ""
        }
      },
    });
  };
}