const langProp = require('./src/languageProperties.json');
const { handleRequest } = require('./src/rextester.js')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = require('./config.json').port


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/languages', (req, res) => {
    let langArray = [];
    let currentLangAliases;
    let currentLangImports;
    langProp.languageProperties.forEach(function(i){
        currentLangAliases = i.aliases.join(", ")
        currentLangImports = i.defaultImports.join(", ")
        langArray.push(`Language: ${i.commonName};\nAliases: ${currentLangAliases};\nImports: ${currentLangImports}`)
    });
    return res.send(langArray.join('\n\n')).end();
})

app.post('/', async function (req, res) {
    // expecting body = {lang: 'language' < STR >, code: 'code' < STR >}
    // example req = superagent.post('api').send({lang: 'java', code: 'System.out.println("hello world")'});
    await handleRequest(req.body.lang, req.body.code, res.body.imports, function(request) {
        if (request.code != 200) {
            res.status(request.code)
            return res.send(`${request.payload}`);
        }
        else if (request.error == true) {
            return res.send(request.payload);
        } else {
            return res.send(request.payload);
        };
    });
});

app.listen(port, () => console.log(`running on port ${port}`))
