import { registerDecorator, ValidationOptions, ValidationArguments, isDefined } from 'class-validator';

export function IsDefinedXor(names: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDefinedXor',
      target: object.constructor,
      propertyName: propertyName,
      constraints: names,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const properties: string[] = [value].concat(args.constraints);
          const keys: string[] = Object.keys(args.object);
          let alreadyDefined: boolean = false;
          for(const property of properties) {
            if(keys.indexOf(property) >= 0) {
                if(alreadyDefined) {
                    return false;
                }
                alreadyDefined = true;
            }
          }
          return alreadyDefined;
        },
        defaultMessage(args: ValidationArguments) {
          return `One (and only one) of these properties must be defined: ${args.constraints.join(', ')}`;
        }
      },
    });
  };
}