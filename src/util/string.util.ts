export function replaceAll(string: string, search: string, replace: string): string {
    return string.split(search).join(replace);
}

export function indent(string: string, numSpaces: number = 1, space: string = "\t", lineSeparator: string = "\n") {
    let result: string = "";
    let fullSpace: string = "";
    for(let i = 0; i < numSpaces; i++) {
        fullSpace += space;
    } 
    string.split(lineSeparator).forEach(line => result += fullSpace + line + lineSeparator);
    return result;
}

export function createComment(string: string, lineSeparator: string = "\n") {
    let result = "//";
    string.split(lineSeparator).forEach(line => result += " " + line);
    return result;
}

export function createDoubleStarComment(string: string, lineSeparator: string = "\n"): string {
    let result = "/**\n";
    string.split(lineSeparator).forEach(line => result += " * " + line + lineSeparator);
    return result + " */";
}

export function escapeString(string: string): string {
    const escapes = {
        "\\": "\\\\",   // replace \ with \\
        "\"": "\\\"",   // replace " with \"
        "\r": "\\r",
        "\n": "\\n",
        "\t": "\\t",
    };

    let result: string = string;
    for(const entry of Object.entries(escapes)) {
        result = replaceAll(result, entry[0], entry[1]);
        //result = result.replace(new RegExp(entry[0], "g"), entry[1]);
    }
    return result;
}

export function matchWildcardPattern(str: string | undefined, pattern: string | undefined): boolean {
    if(!str) {
        str = "";
    }
    if(!pattern) {
        return true;
    }
    let m = str.length;
    let n = pattern.length;

    // empty pattern can only match with
    // empty string
    if(n == 0)
        return m == 0;

    // lookup table for storing results of
    // subproblems
    const lookup: boolean[][] = [];

    // initailze lookup table to false
    for(let i = 0; i < m + 1; i++) {
        lookup.push([]);
        for(let j = 0; j < n + 1; j++) {
            lookup[i].push(false);
        }
    }

    // empty pattern can match with empty string
    lookup[0][0] = true;

    // only '*' can match with empty string
    for(let j = 1; j <= n; j++)
        if(pattern.charAt(j - 1) === '*')
            lookup[0][j] = lookup[0][j - 1];

    // fill the table in bottom-up fashion
    for(let i = 1; i <= m; i++) {
        for(let j = 1; j <= n; j++) {
            // Two cases if we see a '*'
            // a) We ignore '*'' character and move
            //    to next  character in the pattern,
            //     i.e., '*' indicates an empty sequence.
            // b) '*' character matches with ith
            //    character in input
            if(pattern.charAt(j - 1) === '*')
                lookup[i][j] = lookup[i][j - 1] ||
                        lookup[i - 1][j];

                // Current characters are considered as
                // matching in two cases
                // (a) current character of pattern is '?'
                // (b) characters actually match
            else if(str.charAt(i - 1) === pattern.charAt(j - 1))
                lookup[i][j] = lookup[i - 1][j - 1];

                // If characters don't match
            else lookup[i][j] = false;
        }
    }

    return lookup[m][n];
}