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

app.post('/', async(req, res) => {
    // expecting body = {lang: 'language' < STR >, code: 'code' < STR >, imports: ['imports'] < ARR >}
    // example req = superagent.post('api').send({lang: 'java', code: 'System.out.println("hello world")', imports: ['System']});
    const response = await handleRequest(req.body.lang, req.body.code, req.body.imports);
    // eslint-disable-next-line no-magic-numbers
    if (response.code !== 200) {
        res.status(response.code);
        return res.send(`${response.payload}`);
    }
    if (response.error === true) {
        return res.send(response.payload);
    }
    return res.send(response.payload);
} );

app.listen(port, () => console.log(`running on port ${port}`) );
