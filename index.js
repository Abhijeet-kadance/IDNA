const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
const bodyParser = require("body-parser");
var lookup = require("dns-lookup");
var cors = require("cors");
var uts46 = require("idna-uts46");
var Isemail = require("isemail");
const notifier = require("node-notifier");
const WindowsBalloon = require("node-notifier/notifiers/balloon");
var tlds = require("tld-list");
var isAscii = require("is-ascii");
const idnaMap = require("idna-uts46/idna-map");

app.set("view engine", "ejs");
app.use(
  session({
    secret: "flashblog",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());
app.use(cors());
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
  var textByLine = text.toString().split("\r\n");
  // console.log(textByLine);
  return textByLine;
}

/**********************************
 Function for TLD Check 
 *********************************/
function tldcheck(domain) {
  let tldArray = convertTextToArray();
 console.log(tldArray)
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
/**********************************
 Function To Check Domain/Local part
 **********************************/

function checkUnicodeStandard(str) {
  console.log("inside the Function");
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

app.get("/", (req, res) => {
  console.log("Testing");
  req.flash("message", "Welcome to IDNA DOMAIN CHECKER");
  res.redirect("/flash-message");
});
app.get("/flash-message", (req, res) => {
  // res.send(req.flash('message'));
  console.log("Testing");
  res.render("flash");
});

app.post("/domain", (req, res) => {
  const domain = req.body.domain;
  

  function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
  }

  let punyAsciiValue = uts46.toAscii(domain, {
    useStd3ASCII: true,
  });

  if(isASCII(domain)){
    console.log("The Domain name is a ASCII based domain name")
    console.log("The Unicode Version of the Domain is : " + domain)
    
  }else if(checkUnicodeStandard(domain)){
    console.log("The Domain is a Internationalized Domain")
    console.log("The Unicode Version of the Domain is : " + domain)
    console.log("IDN Domain Punnycode Format : "+punyAsciiValue);
    
  }
});

app.post("/checkIdnEmail", (req, res) => {
  //Email address
  const email = req.body.email;

  // Check Non-ASCII string
  function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
  }

  const isEmailValid = Isemail.validate(email);
  console.log("Given Email is valid : " + isEmailValid);

  if (isEmailValid === true) {
    var localpart = email.split("@")[0];
    var domainpart = email.split("@")[1];
    console.log("ASCCI : "+ isASCII(domainpart))
    console.log("Unicode: " + checkUnicodeStandard(localpart))
    console.log("Local Part : " + localpart + " Domain Part : " + domainpart);

    if (isASCII(localpart) && isASCII(domainpart) === true) {
      console.log("Valid ASCII Email Address");

      // CHECK TLD
      let tldCheck = tldcheck(domainpart);

      if (tldCheck === true) {
        console.log("Valid TLD of Email");
        notifier.notify("This is a Valid ASCII Email Address");
        return true;
      } else {
        console.log("Please Enter a valid TLD email address");
        notifier.notify("Please Enter a Valid Top level domain");
        return false
      }
    } else if (
       isASCII(domainpart) === false  && isASCII(localpart) === false
    ) {
      console.log("Valid IDN Email");

      let tldCheck = tldcheck(domainpart);
      console.log(tldCheck)
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
              console.log("Testing Punny Code Standard for Domain part : " + punnyRegEx.test(punnyAsciiDomainValue))
              notifier.notify("Valid IDN EMail");
          } catch (error) {
            console.log("Error", error);
            console.log("domain invalidated");
          }
        }else{
            console.log("Not a Valid IDN");
            notifier.notify("Please Enter a Valid IDN Email Address");
            res.send({message:'Please Enter a Valid IDN Email Address'})
        }
      }else{
        console.log("Not a valid TLD domain")
        res.send({message:'Not a valid TLD domain',status:'error'})
      }
    }else{
        console.log("Please Enter a Valid Email Address")
        notifier.notify("Please Enter a Valid Email Address");
    }
  }else{
    console.log("Please Enter a Valid Email Address")
        notifier.notify("Please Enter a Valid Email Address");
  }
});






app.post("/checkIdnEmail1", (req, res) => {
  //Email address
  console.log(req.body);
  const email = req.body.email;

  // Check Non-ASCII string
  function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
  }

  console.log("Recived Email : " + email);
  console.log(Isemail.validate(email));
  const isEmailValid = Isemail.validate(email);
  console.log("Given Email is valid : " + isEmailValid);

  if (isEmailValid === true) {
    var localpart = email.split("@")[0];
    var domainpart = email.split("@")[1];
    console.log("ASCCI : "+ isASCII(domainpart))
    console.log("Unicode: " + checkUnicodeStandard(localpart))
    console.log("Local Part : " + localpart + " Domain Part : " + domainpart);

    if (isASCII(localpart) && isASCII(domainpart) === true) {
      console.log("Valid ASCII Email Address");

      // CHECK TLD
      let tldCheck = tldcheck(domainpart);
      console.log("Checking TLD staus : "+tldCheck)
      if (tldCheck === true) {
        console.log("Valid TLD of Email");
        notifier.notify("This is a Valid ASCII Email Address");
        res.send({"message":"Valid ASCII Email","status":"success"});
        //res.send({"message": "Not a valid TLD domain", "status": "error"});


      } else {
        console.log("Please Enter a valid TLD email address");
        notifier.notify("Please Enter a Valid Top level domain");
      }
    } else if (
       isASCII(domainpart) === false  && isASCII(localpart) === false
    ) {
      console.log("Valid IDN Email");

      let tldCheck = tldcheck(domainpart);
      console.log(tldCheck)
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
            console.log("Testing Punny Code Standard for Domain part : " + punnyRegEx.test(punnyAsciiDomainValue))
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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
