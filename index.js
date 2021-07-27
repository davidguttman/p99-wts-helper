var dnd = require('drag-and-drop-files')
var html = require('yo-yo')

var parseInventory = require('./parse-inventory')

addStyles()

var state = {
  inventory: [],
  wts: []
}

var el = render()

function render () {
  return html`
    <body class='sans-serif w-100'>
      <div class="mw9 center ph3-ns">
        <div class="fl w-100 pa4 tc">
          ${renderDropZone()}
        </div>
      </div>
      ${renderMain()}
    </body>
  `
}

function renderMain () {
  if (!state.inventory.length) return

  return html`
    <div class="mw9 center ph3-ns">
      <div class="cf ph2-ns">
        <div class="fl w-100 w-third-ns pa2">
          ${renderInventory()}
        </div>
        <div class="fl w-100 w-third-ns pa2">
          ${renderWTS()}
        </div>
        <div class="fl w-100 w-third-ns pa2">
          ${renderOutput()}
        </div>
      </div>
    </div>
  `
}

function renderDropZone () {
  if (state.inventory.length) return

  var drop = html`
    <div class="outline bg-white pv4 w-third center pa4">
      <p class='f2'>Drop Inventory File Here</p>

      <p>
      While in game, use <code class='blue'>/outputfile inventory inventory.txt</code> to create an <code class='blue'>inventory.txt</code> file in your P99 directory. Then drag it here.
      </p>
    </div>
  `

  dnd(drop, function (files) {
    var file = files[0]
    if (!file) return

    file.text().then(function (tsv) {
      var inv = parseInventory(tsv)
      state.inventory = inv
      update(state)
    })
  })

  return drop
}

function renderInventory () {
  var buttonStyle = 'ph3 pv2 bb b--light-silver bg-animate pointer'
  var unselected = 'hover-bg-black hover-white'
  var selected = 'bg-black white'

  return html`
    <div>
      <h1 class="f4 bold mw5">Inventory</h1>
      <p>
        Click on the items you'd like to advertise for sale.
      </p>
      <ul class="list pl0 ml0 mw6 ba b--light-silver br3">
        ${state.inventory.map(function (item, i) {
          var selStyle = state.wts.indexOf(i) >= 0
            ? selected
            : unselected
          return html`
            <li class="${buttonStyle} ${selStyle}" onclick=${handleInventoryClick(i)} >
              ${item.Name}
            </li>
          `
        })}
      </ul>
    </div>
  `
}

function renderWTS () {
  var buttonStyle = 'ph3 pv2 bb b--light-silver bg-animate hover-bg-black hover-white pointer'

  if (!state.wts.length) return ''

  return html`
    <div>
      <h1 class="f4 bold mw5">WTS</h1>
      <p>
        Click to remove any items you would not like to sell.
      </p>
      <ul class="list pl0 ml0 mw6 ba b--light-silver br3">
        ${state.wts.map(function (item) {
          return html`
            <li class="${buttonStyle}" onclick=${handleWTSClick(item)}>
              ${state.inventory[item].Name}
            </li>
          `
        })}
      </ul>
    </div>
  `
}

function renderOutput () {
  var links = state.wts.map(function (i) {
    return state.inventory[i].Link
  })
  var linkLines = groupList(links, 3)
  var socialMacros = groupList(linkLines, 3)
  return html`
    <div>
      <h1 class="f4 bold mw5">Output</h1>
        <p>
          Copy and paste this into the bottom of your <code class='blue'>[Your Character Name]_project1999.ini</code> File. It belongs at the bottom of the <code class='blue'>[Socials]</code> section.
        </p>
        <p class='f6'>
          Note: this assumes your 10th page of social macros are blank/available.
        </p>
        <textarea class='w-100 h4 mb3 f6' style='height: 100vh'>${socialMacros.map(createMacro).join('\n')}</textarea>
    </div>
  `

  function createMacro (macro, i) {
    var button = `Page10Button${i+1}`
    var macro2 = [macro[0], null, macro[1], null, macro[2]]
    return [
      `${button}Name=WTS ${i+1}`,
      `${button}Color=0`,
      macro2.map(function (links, j) {
        return `${button}Line${j+1}=${links ? createAuc(links) : '/pause 1'}`
      }).join('\n')
    ].join('\n')
  }

  function createAuc (links) {
    return `/auc WTS ${links.join(' - ')}`
  }
}

function handleInventoryClick (i) {
  return function (evt) {
    if (state.wts.indexOf(i) >= 0) return handleWTSClick(i)()
    state.wts.push(i)
    update(state)
  }
}

function handleWTSClick (item) {
  return function (evt) {
    if (state.wts.indexOf(item) === -1) return
    state.wts = state.wts.filter(function (i) {
      return item === i ? false : true
    })
    update(state)
  }
}

function update (state) {
  html.update(el, render(state, update))
}

document.body.appendChild(el)

function addStyles () {
  var link = document.createElement('link')
  link.href = 'https://unpkg.com/tachyons@4.12.0/css/tachyons.min.css'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

function groupList (list, nMax) {
  var groups = [[]]
  list.forEach(function (item, i) {
    var subList = groups[groups.length - 1]
    if (subList.length >= nMax) {
      subList = []
      groups.push(subList)
    }
    subList.push(item)
  })
  return groups
}
