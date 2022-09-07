import { Stringifyable } from "../../../../types/stringifyable";

export class LrInitFile implements Stringifyable {
    
    toString(): string {
return `vuser_init()
{
	return 0;
}`;
    }

}