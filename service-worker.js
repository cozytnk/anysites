import api from './api.js'
console.log('id:', chrome.runtime.id)
console.log('api:', api)



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // (message: any, sender: MessageSender, sendResponse: function) => boolean|undefined
  console.log('@ runtime.onMessage', message, sender)
  let { tab } = sender

  let [apiName, ...args] = Array.isArray(message) ? message : []

  if (apiName in api) {
    api[apiName](...args)
    .then(ret => sendResponse(ret))
    .catch(error => sendResponse({ error }))
    // .catch(error => sendResponse([error.message]))
  }

  if (apiName.startsWith('chrome.')) {
    let [, className, methodName] = apiName.split('.')
    chrome[className]?.[methodName]?.(...args)
    .then(ret => sendResponse(ret))
    .catch(error => sendResponse({ error }))
  }

  return true // allows asynchronous
})



chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setOptions({ path: './sidepanel.html' })
})



chrome.action.onClicked.addListener(async tab => {
  console.log('@ action.onClicked', tab)
  let { id: tabId } = tab

  await chrome.action.setBadgeText({ tabId: tab.id, text: '-_-' })
  setTimeout(() => chrome.action.setBadgeText({ tabId: tab.id, text: '' }), 1000)

  // await chrome.sidePanel.setOptions({
  //   tabId,
  //   path: 'sidepanel.html',
  //   enabled: true
  // })

  // await chrome.tabs.create({ url: 'index.html' })
  // await chrome.sidePanel.open({ windowId: tab.windowId })
  // await api.reset(tab)
  // TODO:
})



chrome.commands.onCommand.addListener(async (command) => {
  console.log('@ commands.onCommand', command)
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (command === 'R') {
    await api.reset(tab)
  }
  if (command === 'X') {
    // TODO:
  }
  if (command === 'Z') {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.classList.toggle('x-zoomed')
    })
  }

})



chrome.tabs.onActivated.addListener(async tab => {
  console.log('@ tabs.onActivated', tab)
  // TODO:
})



chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  console.log('@ tabs.onUpdated', tabId, info, tab)
  if (info.status === 'complete') { // "unloaded", "loading", or "complete"
    await api.reset(tab)
  }
})



chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  console.log('@ downloads.onDeterminingFilename', downloadItem)
  let { id, exists, fileSize, filename, totalBytes, url, mime } = downloadItem

  suggest({ filename })
  // TODO:

  return true // allow to call suggest() in promise
})