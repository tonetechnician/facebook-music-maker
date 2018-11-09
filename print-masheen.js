/*
print-masheen

Prints plain text to file

Author: Sean Devonport
*/
const printer = require('printer');
const util = require('util')
const CHARACTERS_PER_LINE = 80;
// console.log("installed printers:\n"+util.inspect(printer.getPrinters(), {colors:true, depth:10}));


// printString = 'this is data being tested for printing';

// function stringtopcl(string){
//     for (let i=0;i<string.length;i++){
//         if(i%81){

//         }
//     }
// }

// printer.printDirect({data:"some text ypaaaaaaaaaaaaaaaaaaaaaaaaaaa" // or simple String: "some text"
// 	// , printer:'Microsoft Print to PDF' // printer name, if missing then will print to default printer
// 	, type: 'RAW/TEXT' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
// 	, success:function(jobID){
// 		console.log("sent to printer with ID: "+jobID);
// 	}
// 	, error:function(err){console.log(err);}
// });


// let printString = '';

function stringGen(len)
{
    var text = "";
    // let len = Math.round(Math.random()*50);
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

// let printString = '';


function printTheString(string){
    // console.log(string)
    printer.printDirect({data:string // or simple String: "some text"
        // , printer:'Microsoft Print to PDF' // printer name, if missing then will print to default printer
        , type: 'RAW/TEXT' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
        , success:function(jobID){
            console.log("sent to printer with ID: "+jobID);
        }
        , error:function(err){console.log(err);}
    });
}
let receiverString = '';
let printString = '';

function test(){
    for(let i=0;i<CHARACTERS_PER_LINE*10+1;i++){
        receiverString += stringGen(3);
        if(receiverString.length>=CHARACTERS_PER_LINE){
            // If receiverString reaches end of the line, add to printString and add \r\n
            printString += receiverString.substring(0,CHARACTERS_PER_LINE);
            printString += "\r\n";
            // Replace old string
            receiverString = receiverString.substring(CHARACTERS_PER_LINE,receiverString.length);
            // printString += "\r \n";
            console.log("added r n")
            console.log(printString)
        }
    
        if(printString.length >= CHARACTERS_PER_LINE*10){
            // printerString = printString.substring(0,CHARACTERS_PER_LINE*10);
            console.log("print string");
            console.log(printString.length)
            console.log(printString)
            printTheString(printString.substring(0,CHARACTERS_PER_LINE*10));
            printString = printString.substring(CHARACTERS_PER_LINE*10,printString.length);
            console.log("printString.length after reaching end of page")
            console.log(printString.length);
            console.log(printString)
        }   
    }
 
}
// test();
// Whenever a message is received add it to the print string
process.on('message', (msg) => {
    console.log( msg);
    receiverString += msg;

    if(receiverString.length>CHARACTERS_PER_LINE){
        // If receiverString reaches end of the line, add to printString and add \r\n
        printString += receiverString.substring(0,CHARACTERS_PER_LINE);
        printString += "\r\n";
        // Replace old receiverString with anything after characters per line
        receiverString = receiverString.substring(CHARACTERS_PER_LINE,receiverString.length);
    }

    if(printString.length >= CHARACTERS_PER_LINE*10){
        // printerString = printString.substring(0,CHARACTERS_PER_LINE*10);
        console.log("print string");
        printTheString(printString.substring(0,CHARACTERS_PER_LINE*10));
        printString = printString.substring(CHARACTERS_PER_LINE*10,printString.length);
        console.log("printString.length after reaching end of page")
        console.log(printString.length);
        console.log(printString)
        
    }
  });