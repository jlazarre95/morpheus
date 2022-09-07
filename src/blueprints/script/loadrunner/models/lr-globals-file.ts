import { Stringifyable } from "../../../../types/stringifyable";

export class LrGlobalsFile implements Stringifyable {
    
    toString(): string {
return `#ifndef _GLOBALS_H
#define _GLOBALS_H
        
// Include Files"
        
#include "lrun.h"
#include "web_api.h"
#include "lrw_custom_body.h"
        
// Global Variables"

#endif // _GLOBALS_H"`;
    }

}