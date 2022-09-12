const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var lookup = require('dns-lookup');
var cors = require("cors");
var uts46 = require("idna-uts46");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Test Code");
});

function convertTextToArray() {
  var fs = require("fs");
  var text = fs.readFileSync("./docs/test.txt");
  var textByLine = text.toString().split("\r\n");
  console.log(textByLine);
  return textByLine;
}

// check TLD
function tldcheck(domain) {
  let tldArray = convertTextToArray();

  if (domain.length > 0) {
    let d = domain.split(".").slice(-1)[0];
    let tld = uts46.toAscii(d);
    console.log(tld);
    let status = tldArray.includes(tld.toUpperCase());
    return status;
  } else {
    return false;
  }
}

// check domain/local part
function checkUnicodeStandard(str) {
  console.log("inside the Function");
  for (var i = 0, n = str.length; i < n; i++) {
    if (str.charCodeAt(i) > 255) {
      return true;
    }
  }
  return false;
}

app.post("/test", (req, res) => {
  const email = req.body.email;
  console.log(email);
  const TLDList = convertTextToArray();
  console.log(TLDList);

  if (email.split("@").length > 2) {
    console.log("Email ", email, " not valid");
    return;
  }
  var localpart = email.split("@")[0];
  var domainpart = email.split("@")[1];

  // check TLD
  let tldCheck = tldcheck(domainpart);

  if (tldCheck === true) {
    if (checkUnicodeStandard(email)) {
      // true for unicode
      // validate for unicode
      console.log("Do UTS stuff");
      try {
        let punyAsciiValue = uts46.toAscii(domainpart, { useStd3ASCII: true });
        let punyUniCodeValue = uts46.toUnicode(punyAsciiValue);
        console.log("Test : " + punyAsciiValue);
        console.log(punyUniCodeValue);
        //RegExp for Punny Code Standard 
        //\b((xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+\b((xn--)?[a-z0-9]*){2,63}\b

        //Regular Expression FOr no repeatative '.' character in email
        //^(?!\.)(?!.*\.$)(?!.*?\.\.)[a-zA-Z0-9_.]+$
        
      
        // validate domain part

        // Check whether each part of the domain is not longer than 63 characters, 
        // and allow internationalized domain names using the punycode notation:
        // \b((xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b
        // \b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b

        const domainRegEx = new RegExp('^(?!\.)(?!.*\.$)(?!.*?\.\.)[a-zA-Z0-9_.]+$')
        console.log("Testing Domain RegExpression: " + domainRegEx.test(punyUniCodeValue))

        if(punyUniCodeValue == domainpart){
            console.log("Domain Part is Verified...")
        }else{
            console.log("Domain part is not validated")
        }
       
        // validate local part
        const localRegex = new RegExp('^\w+([.-]?\w+)*$');
        console.log(localRegex.test(localpart))

      } catch (error) {
        console.log("Error", error);
        console.log("domain invalidated ");
      }
    } else {
      // false for english
      // validate email
      console.log("regex stuff for ENGLISH");
      //"^[a-zA-Z0-9.!#$%&’*+=?^`{|}~-]+@([a-zA-Z0-9-]+[.]){1,2}[a-zA-Z]{2,10}$"
      const EmailRegEx = new RegExp(
        "^((?!-)[A-Za-z0-9-]{1, 63}(?<!-)\\.)+[A-Za-z]{2, 6}$",
      );
      console.log("Email : ", EmailRegEx.test(email));
    }
  } else {
    // tld check failed
    console.log("tld not valid");
  }
});

app.get('/checkdns', (req,res) => {
    const data = req.body.domain;
    const local = data.split('@')[0];
    const domain = data.split('@')[1];
    let punny = uts46.toAscii(domain)
    console.log(data)
    let completeDomain = local+"@"+punny;
    console.log(completeDomain)

    
    console.log(uts46.toAscii(domain, { useStd3ASCII: true }))
    console.log()
    lookup('gmail.com', (err, address, family)=> {
        
        if(address != null){
            console.log("DNS resolved at : " + address)
        }else if(err){
            console.log("DNS does not exists !!!")
        }
    });
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
