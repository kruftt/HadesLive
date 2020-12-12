if (window.HadesLive === undefined) {
  window.HadesLive = (function (window) {
    const twitch = window.Twitch.ext
    const HadesLive = { readyState: WebSocket.CLOSED }
    const cb_arrs = {}
    let _socket

    status_cbs = []
    HadesLive.onstatus = function (callback) {
      status_cbs.push(callback)
      return () => status_cbs.splice(status_cbs.indexOf[callback], 1)
    }

    function updateStatus () {
      HadesLive.readyState = (_socket && _socket.readyState)
      for (const cb of status_cbs) {
        cb(HadesLive.readyState)
      }
    }
    
    function error_cb (e) { updateStatus() }
    function open_cb () { console.log('connected'); updateStatus() }
    function close_cb () { console.log('closed'); updateStatus(); setTimeout(search, 0) }
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
      updateStatus()
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
      if (twitch && !subbed[target]) {
        twitch.listen(target, twitchListenCallback)
        subbed[target] = true
      }
    }

    function twitchListenCallback (target, contentType, message) {
      HadesLive.send('twitch', { target: target, message })
    }

    function twitchUnlisten (target) {
      if (twitch && subbed[target]) {
        twitch.unlisten(target, twitchListenCallback)
        subbed[target] = false
      }
    }

    function twitchSend (data) {
      if (twitch) {
        const { target, message } = data
        if (target && message) {
          const contentType = (typeof message === object) ? 'application/json' : 'text/plain'
          twitch.send(target, contentType, message)
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
  })(window)
}

(function() {
  window.Twitch.ext.rig.log('in hadeslive')
  const anchor = document.getElementById('hades_live')
  if (anchor) {
    const dot = document.createElement('div')
    dot.id = 'hades_live__dot'
    dot.className = 'hades_live__dot--disconnected'
    anchor.appendChild(dot)

    const status = document.createElement('div')  
    const nameText = document.createTextNode('HadesLive: ')
    const statusText = document.createTextNode('disconnected')
    status.id = 'hades_live__status'   
    status.appendChild(nameText)
    status.appendChild(statusText)
    anchor.appendChild(status)
    
    HadesLive.onstatus((status) => {
      switch (status) {
        case WebSocket.CONNECTING:
          dot.className = 'hades_live__dot--scanning'
          statusText.nodeValue = 'scanning'
          break
        case WebSocket.OPEN:
          dot.className = 'hades_live__dot--connected'
          statusText.nodeValue = 'connected'
          break
        case WebSocket.CLOSING:
          dot.className = 'hades_live__dot--disconnecting'
          statusText.nodeValue = 'disconnecting'
          break
        case WebSocket.CLOSED:
          dot.className = 'hades_live__dot--disconnected'
          statusText.nodeValue = 'disconnected'
          break
      }
    })
    
    const styles = document.createElement("style")
    styles.innerText = `
      #hades_live {
        display: flex;
        flexBasis: row nowrap;
      }
      #hades_live__dot {
        width: 1.0em;
        height: 1.0em;
        margin: 0 0.3em;
        border-radius: 50%;
        box-shadow: 0 0 0.25em 0.1em #111 inset, -0.1em 0.1em 0.1em 0.05em #111;
        transition: background-color 0.14s;
        filter: saturate(70%)
      }
      .hades_live__dot--scanning { background-color: yellow; }
      .hades_live__dot--connected { background-color: rgb(49, 179, 49); }
      .hades_live__dot--disconnecting { background-color: rgb(255, 115, 0); }
      .hades_live__dot--disconnected { background-color: red; }
      #hades_live__status {
        margin-left: 0.3em;
      }
    `
    document.head.appendChild(styles)
  }
})()
