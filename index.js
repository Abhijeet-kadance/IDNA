const express = require("express")
const app = express();
const bodyParser = require('body-parser');
var uts46 = require("idna-uts46");
// const { body, validationResult } = require('express-validator');
app.use(bodyParser.json());

app.get('/',(req,res)=>{
    res.send("Test Code")
})

// app.get('/result',(req,res)=>{
//     res.render('result');
// });


app.get("/uts46",(req,res)=>{
    console.log(uts46.toAscii('cdac.in'))
    console.log(uts46.toAscii('सीडैक.रत',{useStd3ASCII: true}))
    console.log(uts46.toUnicode('सीडैक.$रत'))
    console.log(uts46.toUnicode('xn--11bx2e6a3b.xn--h2brj9c'))
})

app.post("/data",(req,res)=>{
    var domain = req.body.domain;
    var f={domain:domain};
    
    var localpart = f.domain.split('@')[0]
    var domainpart = f.domain.split('@')[1]

    // console.log(localpart)
    // console.log(domainpart)

    try{
        // console.log(uts46.toAscii(domainpart,{useStd3ASCII: true}))
        let punyAsciiValue = uts46.toAscii(domainpart,{useStd3ASCII: true});
        // console.log("Ascii Value : ", punyAsciiValue)
        // console.log(uts46.toUnicode(domainpart))
        let punyUniCodeValue = uts46.toUnicode(punyAsciiValue)
        // console.log("Domain Value : ",punyUniCodeValue)
        const localPartRegEx = new RegExp('^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$');
        //const localPartRegEx = new RegExp('^[a-zA-Z0-9.!#$%&’*+=?^`{|}~-]+@([a-zA-Z0-9-]+[.]){1,2}[a-zA-Z]{2,10}$');
        //const localPartRegEx = `^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$`;
        let name = 'abhijeett@cdac.in';
        console.log(localPartRegEx.test(name))

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