var fs = require('fs')
var parseInventory = require('./parse-inventory')

var FILE = process.argv[2]
if (!FILE) {
  console.error('USAGE: tunnel <inventory_file.txt>')
  process.exit(1)
}

var inventoryTsv = fs.readFileSync(FILE, 'ascii')

console.log(JSON.stringify(parseInventory(inventoryTsv), null, 2))
