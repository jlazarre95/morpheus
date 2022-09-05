import { registerDecorator, ValidationOptions, ValidationArguments, isDefined } from 'class-validator';

export interface IsOfTypeOptions {
    type: string;
    validate: (args: ValidationArguments) => boolean;
    message: (args: ValidationArguments) => string;
}

export function IsOfType(options: IsOfTypeOptions, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOfType',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [options],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
            if(typeof value === args.constraints[0].type) {
                return options.validate(args);
            }
            return true;
        },
        defaultMessage(args: ValidationArguments) {
          return args.constraints[0].message(args);
        }
      },
    });
  };
}