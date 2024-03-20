console.log('api.js')

const api = {

  reset: async (tab) => {
    let { id: tabId, url } = tab

    let { hostname, protocol } = new URL(url)

    if (!/^(https?|file):$/.test(protocol)) return;

    let files = [
      '_',
      hostname.replace(/^(www|jp)\.|\.(net|com|co\.jp|jp)$/g, ''),
    ]
    .map(filename => 'content-scripts/' + filename)

    for (let file of files) {
      try {
        await chrome.scripting.removeCSS({ target: { tabId }, files: [file + '.css'] })
        await chrome.scripting.insertCSS({ target: { tabId }, files: [file + '.css'] })
      } catch {}
      try {
        await chrome.scripting.executeScript({ target: { tabId }, files: [file + '.js'] })
      } catch {}
    }

    return
  },

  glob: async (pattern) => {
    let url = `http://localhost:25253/glob/${pattern}`
    let paths = await fetch(url).then(res => res.json())
    paths = paths.map(path => path.normalize())
    return paths
  },

  $$: async (urlPattern, selector) => {
    let [tab] = await chrome.tabs.query({ url: urlPattern })
    let [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selector) => {
        console.log('$$', selector)
        let els = [...document.querySelectorAll(selector)].map(el => {
          let _ = {}
          el.getAttributeNames().forEach(k => _[k] = el.getAttribute(k))
          _.innerText = el.innerText
          _.value = el.value
          _.dataset = el.dataset
          return _
        })
        console.log('$$', selector, '->', els)
        return els
      },
      args: [selector]
    })
    return result
  },

}

export default api