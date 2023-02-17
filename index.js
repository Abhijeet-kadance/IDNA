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

app.post("/test", (req, res) => {
  const email = req.body.email;
  console.log(email);

  function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
  }

  if(isASCII(email)){
    console.log("Email ASCII True")
  }else{
    console.log("Email ASCII False")
  }
  // const TLDList = convertTextToArray();

  
  if (email === "") {
    return false;
  }else{
    const isEmailValid = Isemail.validate(email);
    console.log("Valid Email : " + isEmailValid);
  }

  if (isEmailValid === true) {
    console.log("Email is a valid email address");

    if (email.split("@").length > 2) {
      console.log("Email ", email, " not valid");
      return;
    }
    var localpart = email.split("@")[0];
    var domainpart = email.split("@")[1];
    // console.log(checkUnicodeStandard(localpart))
    console.log("Local Part : " + localpart + " Domain Part : " + domainpart);

    if (
      isASCII(localpart) && isASCII(domainpart) == true
    ) {
      console.log("Valid IDN Domain");
      // check TLD
      let tldCheck = tldcheck(domainpart);

      if (tldCheck === true) {
        if (checkUnicodeStandard(email)) {
          // true for unicode

          // validate for unicode
          console.log("Do UTS stuff");
          try {
            let punyAsciiValue = uts46.toAscii(domainpart, {
              useStd3ASCII: true,
            });
            let punyUniCodeValue = uts46.toUnicode(punyAsciiValue);

            const domainRegEx =
              /\b((xn--)?(?!.*[.]{2})[a-z0-9]+(-[a-z0-9]+)*\.)+\b((xn--)?(?!.*[.]{2})[a-z0-9]*){2,63}\b/;
            console.log(
              "Testing Domain RegExpression: " +
                domainRegEx.test(punyAsciiValue)
            );
            notifier.notify("Valid IDN Email Address");

            // validate local part
            const localRegex =
              /\b((xn--)?(?!.*[.]{2})[a-z0-9]+(-[a-z0-9]+)*\.)+\b((xn--)?(?!.*[.]{2})[a-z0-9]*){2,63}\b/;
            let LocalAsciiValue = uts46.toAscii(domainpart, {
              useStd3ASCII: true,
            });
            console.log(
              "Testing Local Part RegExpression: " +
                localRegex.test(LocalAsciiValue)
            );
          } catch (error) {
            console.log("Error", error);
            console.log("domain invalidated");
          }
        } else {
          // false for english
          // validate email
          console.log("regex stuff for ENGLISH");

          const EmailRegEx =
            /^[a-zA-Z0-9.!#$%&’*+=?^`{|}~-]+@([a-zA-Z0-9-]+[.]){1,2}[a-zA-Z]{2,10}$/;
          console.log("Email : ", EmailRegEx.test(email));
          notifier.notify("Valid ASCII Email Address");
        }
      } else {
        // tld check failed
        console.log("tld not valid");
        // window.alert('asasdasd')
        notifier.notify("Please Enter a Valid Top level domain");
      }
    } else if (isAscii(localpart) && isAscii(domainpart) === false) {
      // check TLD
      let tldCheck = tldcheck(domainpart);

      if (tldCheck === true) {
        if (checkUnicodeStandard(email)) {
          // true for unicode

          // validate for unicode
          console.log("Do UTS stuff");
          try {
            let punyAsciiValue = uts46.toAscii(domainpart, {
              useStd3ASCII: true,
            });
            let punyUniCodeValue = uts46.toUnicode(punyAsciiValue);

            const domainRegEx =
              /\b((xn--)?(?!.*[.]{2})[a-z0-9]+(-[a-z0-9]+)*\.)+\b((xn--)?(?!.*[.]{2})[a-z0-9]*){2,63}\b/;
            console.log(
              "Testing Domain RegExpression: " +
                domainRegEx.test(punyAsciiValue)
            );
            notifier.notify("Valid IDN Email Address");

            // validate local part
            const localRegex =
              /\b((xn--)?(?!.*[.]{2})[a-z0-9]+(-[a-z0-9]+)*\.)+\b((xn--)?(?!.*[.]{2})[a-z0-9]*){2,63}\b/;
            let LocalAsciiValue = uts46.toAscii(domainpart, {
              useStd3ASCII: true,
            });
            console.log(
              "Testing Local Part RegExpression: " +
                localRegex.test(LocalAsciiValue)
            );
          } catch (error) {
            console.log("Error", error);
            console.log("domain invalidated");
          }
        } else {
          // false for english
          // validate email
          console.log("regex stuff for ENGLISH");

          const EmailRegEx =
            /^[a-zA-Z0-9.!#$%&’*+=?^`{|}~-]+@([a-zA-Z0-9-]+[.]){1,2}[a-zA-Z]{2,10}$/;
          console.log("Email : ", EmailRegEx.test(email));
          notifier.notify("Valid ASCII Email Address");
        }
      } else {
        // tld check failed
        console.log("tld not valid");
        // window.alert('asasdasd')
        notifier.notify("Please Enter a Valid Top level domain");
      }
    } else {
      notifier.notify("Please Enter a Valid Email");
      console.log("Invalid Domain");
    }
  } else if (isEmailValid == false) {
    console.log("Please Enter a valid Email Address");
    notifier.notify("Please Enter a Valid Email address");
  } else {
    console.log("Endcase");
  }
});

app.get("/checkdns", (req, res) => {
  const data = req.body.domain;
  const local = data.split("@")[0];
  const domain = data.split("@")[1];
  let punny = uts46.toAscii(domain);
  console.log(data);
  let completeDomain = local + "@" + punny;
  console.log(completeDomain);

  console.log(uts46.toAscii(domain, { useStd3ASCII: true }));
  console.log();
  lookup("gmail.com", (err, address, family) => {
    if (address != null) {
      console.log("DNS resolved at : " + address);
    } else if (err) {
      console.log("DNS does not exists !!!");
    }
  });
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



  // let idnaStatus = checkUnicodeStandard(domain);
  // console.log("Idna Domain status : " + idnaStatus);

  // const domainRegEx =
  //   /\b((xn--)?(?!.*[.]{2})[a-z0-9]+(-[a-z0-9]+)*\.)+\b((xn--)?(?!.*[.]{2})[a-z0-9]*){2,63}\b/;
  // console.log(
  //   "Testing Domain RegExpression: " + domainRegEx.test(punyAsciiValue)
  // );

  //----Outputing Results----//

  // console.log("Valid Domain Check : " + isValidDomain(domain));
  // console.log("Testing ASCII : "+ isASCII(domain))
 

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
          } catch (error) {
            console.log("Error", error);
            console.log("domain invalidated");
          }
        }else{
            console.log("Not a Valid IDN");
            notifier.notify("Please Enter a Valid IDN Email Address");
        }
      }else{
        console.log("Not a valid TLD domain")
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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
