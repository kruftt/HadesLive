const HadesLive = (function () {
  // Session key stored on localhost?
  if (window.HadesLive) return window.HadesLive
  const HadesLive = { connected: false }
  const cb_arrs = {}
  let _socket

  function error_cb (e) { HadesLive.connected = false }
  function open_cb () { HadesLive.connected = true }
  function close_cb () { HadesLive.connected = false; setTimeout(search, 0) }
  function message_cb (event) {
    const { target, message } = JSON.parse(event.data)
    const cb_arr = cb_arrs[target]
    if (cb_arr === undefined) return
    for (const cb in cb_arr) {
      cb(message)
    }
  }

  function search () {
    _socket = new WebSocket("ws://localhost:55666", 'HadesLive')
    _socket.addEventListener('open', open_cb)
    _socket.addEventListener('close', close_cb)
    _socket.addEventListener('message', message_cb)
    _socket.addEventListener('error', error_cb)
  }

  HadesLive.send = function (target, message) {
    if (_socket.readyState === WebSocket.OPEN) {
      _socket.send(JSON.stringify({ target, message }))
    }
  }

  HadesLive.listen = function (target, callback) {
    cb_arr = cb_arrs[target] || (cb_arrs[target] = [])
    cb_arr.push(callback)
  }

  HadesLive.unlisten = function (target, callback) {
    cb_arr = cb_arrs[target]
    if (cb_arr === undefined) return
    const i = cb_arr.indexOf(callback)
    if (i !== -1) cb_arr.splice(i, 1)
  }

  const subbed = {}
  function twitchListen (target) {
    twitch = window.Twitch
    if (twitch && !subbed[target]) {
      twitch.ext.listen(target, twitchListenCallback)
      subbed[target] = true
    }
  }

  function twitchListenCallback (target, contentType, message) {
    HadesLive.send('twitch', { target: target, message })
  }

  function twitchUnlisten (target) {
    twitch = window.Twitch
    if (twitch && subbed[target]) {
      twitch.ext.unlisten(target, twitchListenCallback)
      subbed[target] = false
    }
  }

  function twitchSend (data) {
    twitch = window.Twitch
    if (twitch) {
      const { target, message } = data
      if (target && message) {
        const contentType = (typeof message === object) ? 'application/json' : 'text/plain'
        twitch.ext.send(target, contentType, message)
      } else {
        console.warn('invalid arg to twitchSend:', data)
      }
    }
  }

  HadesLive.listen('twitch-listen', twitchListen)
  HadesLive.listen('twitch-unlisten', twitchUnlisten)
  HadesLive.listen('twitch-send', twitchSend)
    
  search()
  return HadesLive
})()
