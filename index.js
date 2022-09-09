const express = require("express")
const app = express();
const bodyParser = require('body-parser');
var cors = require('cors');
var uts46 = require("idna-uts46");
// const { body, validationResult } = require('express-validator');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.send("Test Code")
})

const domains = ["IN","COM","","",""];

// app.get('/result',(req,res)=>{
//     res.render('result');
// });
function convertTextToArray(){
    var fs = require("fs");
    var text = fs.readFileSync("./docs/test.txt");
    var textByLine = text.toString().split("\n")
    // console.log(textByLine)
    return textByLine;
}
function checkDomainUnicodeStandard(str) {
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

app.get("/uts46",(req,res)=>{
    console.log(uts46.toAscii('cdac.in'))
    console.log(uts46.toAscii('सीडैक.रत',{useStd3ASCII: true}))
    console.log(uts46.toUnicode('सीडैक.$रत'))
    console.log(uts46.toUnicode('xn--11bx2e6a3b.xn--h2brj9c'))
})

app.post("/test",(req,res)=>{
    const email = req.body.email;
    const TLDList = convertTextToArray();
    console.log(TLDList)
    var localpart = email.split('@')[0]
    var domainpart = email.split('@')[1]

    let punyAsciiValue = uts46.toAscii(domainpart,{useStd3ASCII: true});
    let punyUniCodeValue = uts46.toUnicode(punyAsciiValue)
    console.log(punyAsciiValue)
    console.log(punyUniCodeValue)

    let unicodeStatus = checkDomainUnicodeStandard(domainpart)
    // console.log("The Domain is IDNA Based : " , unicodeStatus)
    if(unicodeStatus == true){
        console.log("Do UTS stuff")
        let punyAsciiValue = uts46.toAscii(domainpart,{useStd3ASCII: true});
        let punyUniCodeValue = uts46.toUnicode(punyAsciiValue);
        if(domainpart === punyUniCodeValue){
            console.log("Domain Part of The Domain" + " " + domainpart + " is Valid")
        }else{
            console.log("Domain Part is not valid")
        }
    }else{
        console.log("regex stuff")
        const EmailRegEx = new RegExp('^[a-zA-Z0-9.!#$%&’*+=?^`{|}~-]+@([a-zA-Z0-9-]+[.]){1,2}[a-zA-Z]{2,10}$');
        console.log(EmailRegEx.test(email))
    }
})

app.post("/data",(req,res)=>{
    console.log("tets", req.body)

    console.log(req.body.username)
    var domain = req.body.username;
    var f={domain:domain};
    
    var localpart = f.domain.split('@')[0]
    var domainpart = f.domain.split('@')[1]

    console.log(localpart)
    console.log(domainpart)

    try{
        // console.log(uts46.toAscii(domainpart,{useStd3ASCII: true}))
        let punyAsciiValue = uts46.toAscii(domainpart,{useStd3ASCII: true});
        // console.log("Ascii Value : ", punyAsciiValue)
        // console.log(uts46.toUnicode(domainpart))
        let punyUniCodeValue = uts46.toUnicode(punyAsciiValue)
        // console.log("Domain Value : ",punyUniCodeValue)
        // const localPartRegEx = new RegExp('^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$');
        //const emailRegex =/^[a-zA-Z0-9.!#$%&’*+/=?^`{|}~-]/;
        //const localPartRegEx = new RegExp('^[a-zA-Z0-9.!#$%&’*+=?^`{|}~-]+@([a-zA-Z0-9-]+[.]){1,2}[a-zA-Z]{2,10}$');
        //const localPartRegEx = `^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$`;
        //let name = 'abhijeett@cdac.in';
        //console.log(emailRegex.test(localpart))

        if(domainpart === punyUniCodeValue){
            console.log("Domain Part of The Domain" + " " + domainpart + " is Valid")
        }else{
            console.log("Domain Part is not valid")
        }
    }catch(e){
        console.log(e)
    }
});

app.listen(3000, ()=> { 
    console.log('Server running on port 3000'); 
});