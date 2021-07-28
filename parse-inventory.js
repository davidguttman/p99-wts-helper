var ITEM_BLACKLIST = [
  'Backpack',
  'Ration',
  'Water Flask',
  'Iron Ration'
]

module.exports = function parseInventory (tsv) {
  var win = !!tsv.match('\r') ? '\r' : ''
  var lines = tsv.split(win + '\n')
  var headers = lines.shift().split('\t')

  var existing = {}

  return lines.map(function (line) {
    var fields = line.split('\t')
    var item = fields.reduce(function (acc, cur, i) {
      var header = headers[i]
      acc[header] = cur
      return acc
    }, {})

    if (existing[item.Name]) return
    existing[item.Name] = true

    item.Link = eqify(item.ID, item.Name)
    return item
  }).filter(function (item) {
    if (!item) return false
    if (item.ID === '0') return false
    if (ITEM_BLACKLIST.indexOf(item.Name) >= 0) return false

    var equipped = !item.Location.match(/^Bank|^General/)
    if (equipped) return false

    return true
  }).sort(function (a, b) {
    return a.Name > b.Name ? 1 : -1
  })
}

function eqify (id, text) {
  var space = '      '
  var special = ''
  return [
    special,
    pad(parseFloat(id).toString(16)),
    space,
    text,
    special
  ].join('')
}

function pad (input) {
  var prefix = input.length < 4 ? '000' : '00'
  var val = prefix + input
  while (val.length < 45) {
    val = val + '0'
  }
  return val
}
