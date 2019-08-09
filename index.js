const langProp = require('./src/languageProperties.json');
const { handleRequest } = require('./src/rextester.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { port } = require('./config.json');


app.use(bodyParser.json() );
app.use(bodyParser.urlencoded( {
    extended: true,
} ) );

app.get('/languages', (req, res) => {
    const langArray = [];
    let currentLangAliases,
        currentLangImports;
    langProp.languageProperties.forEach( (i) => {
        currentLangAliases = i.aliases.join(', ');
        currentLangImports = i.defaultImports.join(', ');
        langArray.push(`Language: ${i.commonName};\nAliases: ${currentLangAliases};\nImports: ${currentLangImports}`);
    } );
    return res.send(langArray.join('\n\n') ).end();
} );

app.post('/', (req, res) => {
    // expecting body = {lang: 'language' < STR >, code: 'code' < STR >}
    // example req = superagent.post('api').send({lang: 'java', code: 'System.out.println("hello world")', imports: ['System']});
    handleRequest(req.body.lang, req.body.code, req.body.imports, (request) => {
        // eslint-disable-next-line no-magic-numbers
        if (request.code !== 200) {
            res.status(request.code);
            return res.send(`${request.payload}`);
        }
        if (request.error === true) {
            return res.send(request.payload);
        }
        return res.send(request.payload);
    } );
} );

app.listen(port, () => console.log(`running on port ${port}`) );
