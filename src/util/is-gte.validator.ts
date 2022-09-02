import { registerDecorator, ValidationOptions, ValidationArguments, isDefined } from 'class-validator';

export function IsGte(otherPropertyName: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isGte',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [otherPropertyName],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
            const otherValue: any = (args.object as any)[args.constraints[0]];
            return typeof value === 'number' && typeof otherValue === 'number' && value >= otherValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `'${args.property}' must be greater than or equal to '${args.constraints[0]}'`;
        }
      },
    });
  };
}