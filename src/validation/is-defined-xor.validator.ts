import { registerDecorator, ValidationOptions, ValidationArguments, isDefined } from 'class-validator';

function propertyName() {

}

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
          // Get all keys that have defined values.
          const keys: string[] = Object.entries(args.object).filter(([k, v]) => isDefined(v)).map(([k,v]) => k);
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