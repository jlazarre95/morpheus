import { Stringifyable } from "../../../../types/stringifyable";

export class LrEndFile implements Stringifyable {
    
    toString(): string {
return `vuser_end()
{
	return 0;
}`;
    }

}