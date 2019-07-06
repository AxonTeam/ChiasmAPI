# ChiasmAPI
An API to evaluate code.
Supports 8 languages at present and will expand over time to include more than 40.
You can see the currently supported languages in `/src/languageProperties.json` as they are added.
The currently supported languages are: `Python`, `C++ (Visual C++)`, `C#`, `TCL`, `Ruby`, `Node.js`, `Visual Basic`, `Java`

### Setup
To setup ChiasmAPI, clone the repo and configure the port you want it to listen on in `config.json`. From there, you can run the API using `node run.js` and the API will then listen on the port you specified.

### Requests
Requests can be made by GET to `/languages` where a list of currently supported languages and their properties will be returned.
POST requests to run code should be made in the form `{lang: [language], code: [code]}`, for instance `{lang: 'java', code: 'System.out.println("hello world")'}`.
An example request with Superagent would look like:
```javascript
    let a = await superagent
    .post('http://167.86.72.246:4840/')
    .set({
        "Content-Type": "application/json"
    })
    .send({
        lang: 'java',
        code: 'System.out.println("a");'
    })
    console.log(a.text)
```
If malformed JSON is sent, an error 400 (Bad Request) will be returned. If the language sent is not supported, a 400 will be returned. Else, code 200 will be returned even if the code resulted in an error. The body of the response contains either the output of the code or the error caused by it (if an empty response is generated, `Empty Response` is returned with code 200, again, even if there was an error.)