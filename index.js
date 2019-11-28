const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { parseString, Builder } = require('xml2js')
const { readFileSync, writeFileSync } = require("fs");
const { promisify } = require('util')
const { createHash } = require('crypto');

const parseXML = promisify(parseString);

const generateHash = (txt) => createHash('md5').update(txt).digest('hex');
const b64Encode = (txt) => Buffer.from(txt).toString('base64');
const b64Decode = (txt) => Buffer.from(txt, 'base64').toString('utf8');

(async () => {
// Read XML input
const inputXML = readFileSync('./input.xml', 'utf8')

// Parse XML input as DOM
const dom = new JSDOM(inputXML, { contentType: "application/xml" });
const document = dom.window.document.documentElement
console.log("Source", document.outerHTML)

// Hash generation for XML Input
const elements = dom.window.document.querySelectorAll("*")

for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    element.id = generateHash(element.innerHTML)
    if(element.nodeName === "content-body") {
        element.innerHTML = b64Encode(element.innerHTML)
    }
}

console.log("Output", document.outerHTML)

writeFileSync('./input_hashed.xml',  document.outerHTML, 'utf8')

// Parse transformed XML to JSON Object
const parsedXML = await parseXML(document.outerHTML)
const note = parsedXML.note

console.log("parsedXML:", parsedXML)

// Transform Object nodes
delete Object.assign(note, {"content": note["content-body"]})["content-body"];
console.log("Transformed parsedXML:", parsedXML)

// Decode Base64 content pot-transformation
const transformedXML = new Builder().buildObject(parsedXML);
writeFileSync('./input_transformed.xml',  transformedXML, 'utf8')

const transformedDom = new JSDOM(transformedXML, { contentType: "application/xml" });

const content = transformedDom.window.document.querySelector("content")
content.innerHTML = b64Decode(content.innerHTML)
const output = transformedDom.window.document.documentElement.outerHTML
writeFileSync('./output.xml',  output, 'utf8')
console.log("output:", output)

})();