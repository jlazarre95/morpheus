import { registerDecorator, ValidationOptions, ValidationArguments, isDefined } from 'class-validator';

export function IsTypeOf(types: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTypeOf',
      target: object.constructor,
      propertyName: propertyName,
      constraints: types,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const types: string[] = [value].concat(args.constraints);
          for(const t of types) {
            if(typeof value === t) {
              return true;
            }
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be one of the following types: ${args.constraints}`;
        }
      },
    });
  };
}