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
  console.log("inside the Function");
  for (var i = 0, n = str.length; i < n; i++) {
    if (str.charCodeAt(i) > 255) {
      return true;
    } else {
      return false;
    }
  }
}

app.post("checkIdnEmail", (req, res) => {
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

    console.log("Local Part : " + localpart + " Domain Part : " + domainpart);

    if (isASCII(localpart) && isASCII(domainpart) === true) {
      console.log("Valid ASCII Email Address");

      // CHECK TLD
      let tldCheck = tldcheck(domainpart);

      if (tldCheck === true) {
        console.log("Valid TLD of Email");
        notifier.notify("This is a Valid ASCII Email Address");
      } else {
        console.log("Please Enter a valid TLD email address");
        notifier.notify("Please Enter a Valid Top level domain");
      }
    } else if (
      checkUnicodeStandard(localpart) &&
      checkUnicodeStandard(domainpart)
    ) {
      console.log("Valid IDN Email");

      let tldCheck = tldCheck(domainpart);
      if (tldCheck === true) {
        console.log("Checking IDN Status of email");
        if (checkUnicodeStandard(email)) {
          try {
            let punnyAsciiValue = uts46.toAscii(email, { useStd3ASCII: true });
            console.log(punnyAsciiValue);
            const punnyRegEx =
              /\b((xn--)?(?!.*[.]{2})[a-z0-9]+(-[a-z0-9]+)*\.)+\b((xn--)?(?!.*[.]{2})[a-z0-9]*){2,63}\b/;
              console.log("Testing Punny Code Standard : " + punnyRegEx.test(punnyAsciiValue))
          } catch (error) {
            console.log("Error", error);
            console.log("domain invalidated");
          }
        }else{
            console.log("Not a Valid IDN")
        }
      }else{
        console.log("Not a valid TLD domain")
      }
    }else{
        console.log("Please Enter a Valid Email Address")
        notifier.notify("Please Enter a Valid Email Address");
    }
  }
});

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
