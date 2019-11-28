const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { readFileSync, writeFileSync } = require("fs");
const { createHash } = require('crypto');
const { Tree } = require('./tree')

const generateHash = (txt) => createHash('md5').update(txt).digest('hex');

const baseXML = readFileSync('./output.xml', 'utf8')
const dom = new JSDOM(baseXML, { contentType: "application/xml" });
const document = dom.window.document.documentElement
console.log("Source", document.outerHTML)

// Generate Hash Table and Relations
const hashTable = {};
const tree = new Tree()

const elements = dom.window.document.querySelectorAll("*")

for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    const id = generateHash(element.innerHTML)
    element.id = id
    hashTable[id] = element.outerHTML;

    const parent = element.parentNode;
    if(parent && parent.id) {
        console.log(id, parent.id)
        tree.add(id, parent.id);
    } else {
        console.log(id)
        tree.add(id);
    }
}

writeFileSync('./hash_table.json', JSON.stringify(hashTable, null, 4), "utf8")
writeFileSync('./full_relation.json', JSON.stringify(tree.getList(), null, 4), "utf8")

// Recreate Original Document
const mainNode = "049ade24f9626caf952ec26e8140293c"
writeFileSync('./recovered_xml.xml', hashTable[mainNode], "utf8")

// Let's create a new Document
const newDocument = `<new-document>
${hashTable["4d6f618f683c460286d04611a1a18d6d"]}
${hashTable["0ce4a24e3169af54161d6d2679134cd2"]}
</new-document>`

writeFileSync('./new_document_xml.xml', newDocument, "utf8")
