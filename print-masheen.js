/*
print-masheen

Prints plain text to file

Author: Sean Devonport
*/
const printer = require('printer');
const util = require('util')
console.log("installed printers:\n"+util.inspect(printer.getPrinters(), {colors:true, depth:10}));

let printString = '';
printString = 'this is data being tested for printing';

printer.printDirect({data:"some text ypaaaaaaaaaaaaaaaaaaaaaaaaaaa" // or simple String: "some text"
	// , printer:'Microsoft Print to PDF' // printer name, if missing then will print to default printer
	, type: 'RAW/TEXT' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
	, success:function(jobID){
		console.log("sent to printer with ID: "+jobID);
	}
	, error:function(err){console.log(err);}
});

// Whenever a message is received add it to the print string
process.on('message', (msg) => {
    console.log( msg);
    printString += msg;
    if(printString.length > 500){
        // print
        printString = '';
    }
  });