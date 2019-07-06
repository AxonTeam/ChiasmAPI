const languageProperties = require('./languageProperties.json');
const superagent = require('superagent')

function parseCode(code, languageObject, imports) {
    if (languageObject.classDeclaration) { //Add class declaration and replace {{code}} with the user's code
        let classDec = languageObject.classDeclaration
        classDec = classDec.replace("{{code}}", code)
        code = classDec
    }
    let i = 0
    imports.forEach(element => { //If import already exists in defaults then remove it from the array
        if (languageObject.defaultImports.includes(element)) {
            imports.splice(i, 1)
        }
        i++
    });
    languageObject.defaultImports.forEach(element => {  //Add the default imports the the imports array
        imports.push(element)
    })
    imports.forEach(element => { //Add the imports to the top of the code
        code = `${languageObject.importType} ${element}${languageObject.lineBreak}\n${code}`
    });
    return code
}

function parseLanguages(args, imports) { //Add the imports to the array that were user-added
    for (let i = 2; i < args.length; i++) {
        if (args[i].endsWith(';')) {
            imports.push(args[i].substr(0, args[i].length - 1));
            i = args.length + 1;
        } else {
            imports.push(args[i]);
        }
    };
}

async function outputResult(language, code, compilerArgs, callback) {
    let r;
    let response = await superagent
        .post('https://rextester.com/rundotnet/api')
        .set({
            "Content-Type": "application/json"
        })
        .send({
            LanguageChoice: language,
            Program: code,
            Input: "",
            CompilerArgs: compilerArgs
        })
        .catch((err) => r = {
            payload: err.toString(),
            error: false,
            code: 400
        });
    if (response.body.Result) {
        if (response.body.Result.length == 0)
            r = {
                payload: 'Empty response',
                error: false,
                code: 200
            }
        else
            r = {
                payload: response.body.Result,
                error: false,
                code: 200
            };

    } else if (response.body.Errors) {
        if (response.body.Errors.length == 0) r = {
            payload: "Empty response (errored)",
            error: true,
            code: 200
        }
        else
            r = {
                payload: response.body.Errors,
                error: true,
                code: 200
            };

    }
    return callback(r);
}

async function handleRequest(language, code, callback) {
    let parseLangs = languageProperties.languageProperties.filter(i => i.classDeclaration != undefined).map(j => j.name); //The languages that have defined classes
    let languageObject;
    let imports = [];
    let compilerArgs;

    if (!code || !code[0]) return callback({
        payload: 'no code/lang???',
        error: false,
        code: 400
    });

    code = code.split(' ');

    languageProperties.languageProperties.forEach(curobject => { //Fetch the language that the user wants to use
        if (curobject.aliases.includes(language.toString())) {
            languageObject = curobject
        }
    });

    if (!languageObject) return callback({
        payload: 'Unsupported language',
        error: false,
        code: 400
    });

    if (parseLangs.includes(languageObject.name) && code[0] == languageObject.importType) { //If there are imports to parse then parse them
        parseLanguages(code, imports)
    };
    if (code[0] == languageObject.importType && parseLangs.includes(languageObject.name)) { //Remove the imports after they have been parsed
        code.splice(0, imports.length + 1)
    }
    code.join(" ")
    if (languageObject.defaultImports.length > 0 || languageObject.classDeclaration) { //If there is a class to declare or if there are default imports then add them to code
        code = await parseCode(code, languageObject, imports)
    }
    if(languageObject.languageCode) language = languageObject.languageCode
    if(languageObject.compilerArgs) {
        compilerArgs = languageObject.compilerArgs.join(" ")
    } else {
        compilerArgs = ""
    }

    outputResult(language, code, compilerArgs, async function (output) {
        return await callback(output);
    });

};

module.exports = {
    handleRequest: handleRequest
}
