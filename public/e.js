function sendPostRequest(url, data, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(xhr.responseText)
    }
  }
  xhr.send(JSON.stringify(data))
}

window.addEventListener('error', (event) => {
  try {
    const origin = window.document.currentScript.getAttribute('data-domain')
    const url = window.location.href
    const payload = { message: event.message, origin, url }
    sendPostRequest('https://a.jorgeadolfo.com/error', payload)
  } catch {
    //
  }
})
