import { registerDecorator, ValidationOptions, ValidationArguments, isDefined } from 'class-validator';

export function IsDefinedOr(names: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDefinedOr',
      target: object.constructor,
      propertyName: propertyName,
      constraints: names,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const properties: string[] = [value].concat(args.constraints);
          const keys: string[] = Object.keys(args.object);
          for(const property of properties) {
            if(keys.indexOf(property) >= 0) {
              return true;
            }
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `At least one of the properties must be defined: ${args.constraints}`;
        }
      },
    });
  };
}