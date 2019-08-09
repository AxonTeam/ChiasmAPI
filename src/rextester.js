const languageProperties = require('./languageProperties.json');
const superagent = require('superagent')

function parseCode(code, languageObject, imports) {
    if (languageObject.classDeclaration) { //Add class declaration and replace {{code}} with the user's code
        let classDec = languageObject.classDeclaration
        classDec = classDec.replace("{{code}}", code.join(" "))
        code = classDec
    } else code = code.join(" ")
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

async function handleRequest(language, code, imports, callback) {
    let languageObject;
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

    code.join(" ")
    if (languageObject.defaultImports.length > 0 || languageObject.classDeclaration || imports.length > 0) { //If there is a class to declare or if there are default imports then add them to code
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
