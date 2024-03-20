console.log(`--- ${chrome.runtime.getManifest().name} ${chrome.runtime.id} ---`)

window.__x__ = '__x__'


document.querySelectorAll('x').forEach(el => el.remove())
document.querySelectorAll('[x-entry]').forEach(el => el.removeAttribute('x-entry'))
document.querySelectorAll('[class^="x-"], [class*=" x-"]').forEach(el => el.classList.forEach(c => c.startsWith('x-') && el.classList.remove(c)))


window.api = {}
window.api.chrome = {}

;`
glob
$$
`
.trim()
.split(/\s+/)
.forEach(s => {
  window.api[s] = (...args) => chrome.runtime.sendMessage([s, ...args])
})

;`
tabs.query
bookmarks.getTree
bookmarks.search
history.getVisits
history.search
`
.trim()
.split(/\s+/)
.forEach(s => {
  let [apiName, methodName] = s.split('.')
  window.api.chrome[apiName] ??= {}
  window.api.chrome[apiName][methodName] = (...args) => chrome.runtime.sendMessage([`chrome.${apiName}.${methodName}`, ...args])
})

