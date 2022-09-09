const express = require("express")
const app = express();
const bodyParser = require('body-parser');
var cors = require('cors');
var uts46 = require("idna-uts46");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.send("Test Code")
})

function convertTextToArray(){
    var fs = require("fs");
    var text = fs.readFileSync("./docs/test.txt");
    var textByLine = text.toString().split("\r\n")
    console.log(textByLine)
    return textByLine;
}

// check TLD
function tldcheck(domain){

}


// check domain/local part
function checkUnicodeStandard(str) {
    console.log("inside the Function")
    for (var i = 0, n = str.length; i < n; i++) {
        if (str.charCodeAt( i ) > 255) { 
            console.log("True")
            return true; 
        }
    }
    console.log("false")
    return false;
}


// check domain part is valid
function domainCheck(){

    // check unicode / ascii status

    // return true /false
}

// check local part is valid
function localCheck(){

    // check unicode / ascii status
    
    // return true /false
}


app.post("/test",(req,res)=>{
    const email = req.body.email;
    console.log(email)
    const TLDList = convertTextToArray();
    console.log(TLDList)
    var localpart = email.split('@')[0]
    var domainpart = email.split('@')[1]

    let punyAsciiValue = uts46.toAscii(domainpart,{useStd3ASCII: true});
    let punyUniCodeValue = uts46.toUnicode(punyAsciiValue)
    console.log(punyAsciiValue)
    console.log(punyUniCodeValue)

    // check TLD 
    let tldCheck = tldcheck(domainpart)

    if(tldCheck === true){
        // check local part is valid
        let domainStatus = domainCheck(domainpart)

        // check domain part is valid
        let localStatus = localCheck(localpart)

        // check if both local and domain part IDNA compliant
        if(domainStatus && localStatus){
            // Both domain and local parts are valid
        }else{

        }
    }else{
        // tld check failed
        
    }

    


    // let unicodeStatus = checkUnicodeStandard(domainpart)
    // // console.log("The Domain is IDNA Based : " , unicodeStatus)
    // if(unicodeStatus == true){
    //     console.log("Do UTS stuff")
    //     let punyAsciiValue = uts46.toAscii(domainpart,{useStd3ASCII: true});
    //     let punyUniCodeValue = uts46.toUnicode(punyAsciiValue);
    //     if(domainpart === punyUniCodeValue){
    //         console.log("Domain Part of The Domain" + " " + domainpart + " is Valid")
    //     }else{
    //         console.log("Domain Part is not valid")
    //     }
    // }else{
    //     console.log("regex stuff")
    //     const EmailRegEx = new RegExp('^[a-zA-Z0-9.!#$%&’*+=?^`{|}~-]+@([a-zA-Z0-9-]+[.]){1,2}[a-zA-Z]{2,10}$');
    //     console.log(EmailRegEx.test(email))
    // }
})


app.listen(3000, ()=> { 
    console.log('Server running on port 3000'); 
});