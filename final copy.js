const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
const bodyParser = require("body-parser");
var cors = require("cors");
var uts46 = require("idna-uts46");
var Isemail = require("isemail");
const notifier = require("node-notifier");
var tlds = require("tld-list");
var isAscii = require("is-ascii");


app.set("view engine", "ejs");
app.use(
  session({
    secret: "flashblog",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());
app.use(cors('*'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.locals.message = req.flash();
  next();
});


/************************************
 Function to Convert Text to Array
 ***********************************/

 function convertTextToArray() {
    var fs = require("fs");
    var text = fs.readFileSync("./docs/test.txt");
    var textByLine = text.toString().split(/\n|\r/g)
    return textByLine;
  }
  
  /**********************************
   Function for TLD Check
   *********************************/
  function tldcheck(domain) {
    let tldArray = convertTextToArray();
    if (domain.length > 0) {
      let d = domain.split(".").slice(-1)[0];
      let tld = uts46.toAscii(d);
      let status = tldArray.includes(tld.toUpperCase());
      return status;
    } else {
      return false;
    }
  }
  /**********************************
   Function To Check Domain/Local part
   **********************************/
  
  function checkUnicodeStandard(str) {
    for (var i = 0, n = str.length; i < n; i++) {
      if (str.charCodeAt(i) > 255) {
        return true;
      } else {
        return false;
      }
    }
  }
  
  /************************************
   *  Function to check Domain is Valid
   ************************************/
  
  function isValidDomain(str) {
    //Regex to check valid Domain Name
    let DomainRegex = new RegExp(
      /^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/
    );
    if (str == null) {
      return "false";
    }
    if (DomainRegex.test(str) == true) {
      return "true";
    } else {
      return "false";
    }
  }
  
  
  /*********************************************
   *  Function to remove http & https from domain
   *********************************************/
  function createURI(url){
    if(url.startsWith('https://')){
      const https = 'https://';
      return url.slice(https.length);
    }
    if(url.startsWith('http://')){
      const http = 'http://';
      return url.slice(http.length);
    }
    return url;
  }



  app.post("/domain", (req, res) => {
    const domain = req.body.domain;
    cleaned_domain_name = createURI(domain).split('/')[0]
    console.log("URL :" + cleaned_domain_name)
    function isASCII(str) {
      return /^[\x00-\x7F]*$/.test(str);
    }
    function isUnicode(str){
      return /^[\u0900-\u097F]+$/.test(str);
    }
    function isValidDomainName(str){
      return /^[a-zA-Z0-9 -][a-zA-Z0-9- -]{1,61}[a-zA-Z0-9 -]\.[a-zA-Z -]{2,}$/.test(str);
    }
    const localRegex =/\b((xn--)?(?!.*[.]{2})[a-z0-9]+(-[a-z0-9]+)*\.)+\b((xn--)?(?!.*[.]{2})[a-z0-9]*){2,63}\b/;
  
    let punyAsciiValue = uts46.toAscii(cleaned_domain_name, {
      useStd3ASCII: true,
    });

    let subdomain = cleaned_domain_name.split('.',1)[0]

      if(isValidDomainName(punyAsciiValue) === true){
        if(isASCII(cleaned_domain_name)){
            if(tldcheck(cleaned_domain_name) === true){
                res.send({"message": "Domain : " + cleaned_domain_name + " is a Valid ASCII Domain Name", "status": "success"});
            }else{
                res.send({"message":"Not a valid TLD", "status": "error"})
            }     
        }else if(isUnicode(subdomain) == true){
            res.send({"message": "Valid IDN DOMAIN Name", "status": "success"});
        }else{
            res.send({"message": "Please Enter a Valid Email Address", "status": "error"})
        }
    }
    else{
      if(isUnicode(subdomain) == true){
        res.send({"message": "Valid IDN DOMAIN Name", "status": "success"});
      }else{
        res.send({"message": "Please Enter a Valid Email Address", "status": "error"})
      }
    }
    
  });

  
app.post("/checkIdnEmail", (req, res) => {
    //Email address

    const email = req.body.email;

    function isASCII(str) {
      return /^[\x00-\x7F]*$/.test(str);
    }
  
    function isUnicode(str){
      return /^[\u0900-\u097F]*$/.test(str);
    }
  
    function isDevnagri(str){
      return /[^\u901\u902\u903\u93c\u93e\u93f\u940\u941\u942\u943\u944\u945\u946\u947\u948\u949\u94a\u94b\u94c\u94d\u951\u952\u953\u954\u962\u963]+$/.test(str);
    }

    const isEmailValid = Isemail.validate(email);

    if (isEmailValid === true) {
      var localpart = email.split("@")[0];
      var domainpart = email.split("@")[1];
      let subdomain = domainpart.split('.',1)[0]
    
      if (isASCII(localpart) && isASCII(domainpart) === true) {
        // CHECK TLD
        let tldCheck = tldcheck(domainpart);
        if (tldCheck === true) {
          res.send({"message":"Valid ASCII Email","status":"success"});
        } else {
          console.log("Please Enter a valid TLD email address");
          res.send({"message": "Please Enter a Valid Top level domain", "status": "error"});
          notifier.notify("Please Enter a Valid Top level domain");
        }
      } else if (
         isUnicode(subdomain) === true  && isUnicode(localpart) === true
      ) {
        console.log("Valid IDN Email");
  
        let tldCheck = tldcheck(domainpart);
        console.log("IDN tld check : " + tldCheck)
        if (tldCheck === true) {
          console.log("Checking IDN Status of email");
          if (checkUnicodeStandard(email)) {
            try {
              let punnyAsciiDomainValue = uts46.toAscii(domainpart, { useStd3ASCII: true });
              console.log(punnyAsciiDomainValue)
              let punnyAsciiValue = uts46.toAscii(localpart, { useStd3ASCII: true });
              console.log(punnyAsciiValue);
              const punnyRegEx =
                /\b((xn--)?(?!.*[.]{2})[a-z0-9]+(-[a-z0-9]+)*\.)+\b((xn--)?(?!.*[.]{2})[a-z0-9]*){2,63}\b/;
                notifier.notify("Valid IDN EMail");
                res.send({"message":"Valid IDN Email","status":"success"});
            } catch (error) {
              console.log("Error", error);
              console.log("domain invalidated");
            }
          }else{
              console.log("Not a Valid IDN");
              notifier.notify("Please Enter a Valid IDN Email Address");
              res.send({"message": "Not a valid TLD domain", "status": "error"});
          }
        }else{
          console.log("Not a valid TLD domain")
          notifier.notify("Entered email tld is not valid");
          res.send({"message": "Not a valid TLD domain", "status": "error"});
        }
      }else{
          console.log("Please Enter a Valid Email Address")
          notifier.notify("Please Enter a Valid Email Address");
      res.send({"message": "Please Enter a Valid Email Address", "status": "error"});
      }
    }else{
      console.log("Please Enter a Valid Email Address")
          notifier.notify("Please Enter a Valid Email Address");
      res.send({"message": "Please Enter a Valid Email Address", "status": "error"});
    }
  });
  
  app.listen(3005, () => {
    console.log("Server running on port 3005 : index1.js");
  });