const express = require("express");
var cors = require("cors");
const XRegExp = require('xregexp');
const app = express();
const bodyParser = require("body-parser");

app.use(cors('*'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function detect(text){
    console.log("Text : " + text)
    const regexes = {
        'en': /[\u0000-\u007F]/gi,
        'bg': /[\u0980-\u09FF]/gi,
        'hi': /[\u0900-\u097F]/gi,
        'bn': /[\u0995-\u09B9\u09CE\u09DC-\u09DF\u0985-\u0994\u09BE-\u09CC\u09D7\u09BC]/gi,
        'gj': /[\u0A80-\u0AFF]/gi,
      }

      const languages = {
        en: XRegExp('\\p{Latin}', 'gi'),
        hi: XRegExp('\\p{Devanagari}', 'gi'),
        bn: XRegExp('\\p{Bengali}', 'gi'),
      }
    //   const languages = {
    //     "/^[\u0900-\u097F]*$/": "english",
    //   } 

    for (const [lang,regex] of Object.entries(languages)){
        // let match = regex.test(text);
        // console.log(regex)
        console.log(text.match(regex) || [])
        console.log("Testing : " + regex.test(text))
        let matches = XRegExp.match(text, regex) || []
        console.log(matches)
        
        let matched = regex.test(text)
        console.log("Status : " + matched)
        if(matched === true){
            console.log("Text matched : " + matched)
            return matched;
        }
        // }else{
        //     return false;
        // }
    }
    // console.log(Object.entries(regexes))

}

app.get("/lang", (req, res) => {
    let text = 'নিক্সি'
   console.log("returned from detect : " + detect(text))
});

app.listen(3001, () => {
    console.log("Server running on port 3001 : index1.js");
  });