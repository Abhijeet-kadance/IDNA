const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var cors = require("cors");
var uts46 = require("idna-uts46");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function convertTextToArray() {
    var fs = require("fs");
    var text = fs.readFileSync("./docs/test.txt");
    var textByLine = text.toString().split("\r\n");
    return textByLine;
  }

function tldcheck(domain) {
    let tldArray = convertTextToArray();

    let words = ['hello','world','eberyone']

    console.log("Tesing : " + tldArray)
    
    if (domain.length > 0) {
      let d = domain.split(".").slice(-1)[0];
      let tld = uts46.toAscii(d);
      console.log("Converted IDN : " + tld)
      let status = tldArray.includes(tld.toUpperCase());
      console.log("Converted IDN status : " + status)
      return status;
    } else {
      return false;
    }
  }

app.get('/test',(req,res)=>{
    const email = "Abhijeett@cdac.in"
    console.log("Testing Email TLD : " + tldcheck(email))
})
  
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
  