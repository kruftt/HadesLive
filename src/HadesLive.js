import axios from 'axios'
import parseJwk from 'jose/jwk/parse'
import SignJWT from 'jose/jwt/sign'
import './tmi.min.js'


const Hades = (function () {
  const Hades = {}
  const _cb_arrs = {}
  
  let _socket = null
  let _searching = false
  
  const _dot = document.getElementById('hades__dot')
  const _status = document.getElementById('hades__status')
  const _connection = document.getElementById('hades__connection')
  
  _connection.onclick = () => {
    _searching = !_searching
    if (_searching) search()
    else _socket && _socket.close() && (_socket = null)
  }
  
  function error_cb (e) {
    _socket = null
    _status.textContent = 'Error'
    _dot.className = 'connection__dot connection__dot--disconnected'
  }
  
  function open_cb () {
    _status.textContent = 'Connected'
    _dot.className = 'connection__dot connection__dot--connected'
  }
  
  function close_cb () {
    _socket = null
    _status.textContent = 'Disconnected'
    _dot.className = 'connection__dot connection__dot--disconnected'
    if (_searching) search()
  }
  
  function message_cb (event) {
    const data = JSON.parse(event.data)
    if (!data.target) {
      console.warn('HadesLive: target property missing from message.')
      return
    }
    const cb_arr = _cb_arrs[data.target]
    if (cb_arr === undefined) return
    for (const cb of cb_arr) {
      cb(data)
    }
  }
  
  function search () {
    if (_socket) return
    _status.textContent = 'Scanning...'
    _dot.className = 'connection__dot connection__dot--scanning'
    _socket = new WebSocket("ws://localhost:55666", 'HadesLive')
    _socket.addEventListener('open', open_cb)
    _socket.addEventListener('close', close_cb)
    _socket.addEventListener('message', message_cb)
    _socket.addEventListener('error', error_cb)
  }
  
  Hades.send = function (config) {
    if (_socket && _socket.readyState === WebSocket.OPEN) {
      _socket.send(JSON.stringify(config))
    }
  }

  Hades.on = function (target, callback) {
    const cb_arr = _cb_arrs[target] || (_cb_arrs[target] = [])
    cb_arr.push(callback)
    return () => {
      const i = cb_arr.indexOf(callback)
      if (i !== -1) cb_arr.splice(i, 1)
    }
  }

  return Hades
})()


const Twitch = (function() {
  const Twitch = {}
  const tmi = window.tmi
  const twitch__channel_name = document.getElementById('twitch__channel_name')
  twitch__channel_name.addEventListener('focus', () => twitch__channel_name.select())
  twitch__channel_name.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      twitch__channel_name.blur()
      e.stopPropagation()
    }
  })

  const _dot = document.getElementById('twitch__dot')
  const _status = document.getElementById('twitch__status')
  const _connection = document.getElementById('twitch__connection')
  const _twitch_error = document.getElementById('twitch__error')
  const message_cbs = []
  const raw_message_cbs = []
  
  Twitch.onMessage = function (callback) {
    message_cbs.push(callback)
    return () => {
      const i = message_cbs.indexOf(callback)
      if (i !== -1) message_cbs.splice(i, 1)
    }
  }
  function message_cb () {
    for (const cb of message_cbs)
      cb(...arguments)
  }

  Twitch.onRawMessage = function (callback) {
    raw_message_cbs.push(callback)
    return () => {
      const i = raw_message_cbs.indexOf(callback)
      if (i !== -1) raw_message_cbs.splice(i, 1)
    }
  }
  function raw_message_cb () {
    for (const cb of raw_message_cbs)
      cb(...arguments)
  }
  
  // const _client_id = "5yjdlxjg4nkz8cuw7youghmfi3s2gp"
  // const oauth_secret = "1pway03aps2dnnwkodad51qvisdmyl"
  // let oauth_token = null
  // let _nonce = null
  let _client = null
  let _channel_name = null
  let _channel_id = null
  
  _connection.onclick = () => {
    if (_client) {
      _client.disconnect()
      _client = null
      _status.textContent = 'Disconnected'
      _dot.className = 'connection__dot connection__dot--disconnected'
      return
    }

    _twitch_error.textContent = ''
    _status.textContent = 'Connecting...'
    _dot.className = 'connection__dot connection__dot--scanning'
    _channel_name = twitch__channel_name.value

    axios({
      method: 'GET',
      url: `https://api.twitch.tv/kraken/users?login=${ _channel_name }`,
      headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Client-ID': '5yjdlxjg4nkz8cuw7youghmfi3s2gp',
      }
    })
    .then((res) => {
      console.log(res)
      _channel_id = res.data.users[0]._id

      _client = new tmi.Client({
        options: { debug: true },
        connection: { reconnect: true },
        channels: [ _channel_name ],
      })
      _client.connect()
      _client.on('message', message_cb)
      _client.on('raw_message', raw_message_cb)
      _status.textContent = 'Connected'
      _dot.className = 'connection__dot connection__dot--connected'
      window.client = _client
    })
    .catch((err) => {
      _twitch_error.textContent = err.res.data.message
      _status.textContent = 'Disconnected'
      _dot.className = 'connection__dot connection__dot--disconnected'
    })
  }

  // -owner-id "190203785"
  const kty = 'oct'
  const alg = 'HS256'
  const k = "ftZ2A19ipimxDcFyb1JPhRtMTr9hwjZPRSSGx-lOSU4" // base64url.. from my mod..
  const replaceB64URL = (ch) => (ch === '+') ? '-' : '_'

  Twitch.send = async function (config) {
    if (!config.client_id || !config.secret) {
      _twitch_error.textContent = 'Twitch.send requires a client_id and secret.'
      return
    }
    
    try {
      const k = config.secret.replace(/(\+|\.)/g, replaceB64URL)
      const jwk = await parseJwk({ kty, alg, k })
      const jwt = await new SignJWT({
        exp: Math.floor(Date.now() / 1000) + 30,
        channel_id: _channel_id,
        role: 'external',
        pubsub_perms: { send: ['broadcast'] },
      })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(jwk).catch(console.log)
      
      return await axios({
        url: `https://api.twitch.tv/extensions/message/${_channel_id}`,
        method: 'post',
        headers: {
          'Client-Id': config.client_id,
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt, 
        },
        data: {
          content_type: 'application/json',
          targets: [ 'broadcast' ],
          message: JSON.stringify(message),
        },
      })
    } catch (err) {
      if (err.response)
        _twitch_error.textContent = `${e.response.status} ${e.response.data}`
      else
        _twitch_error.textContent = err

      for (const k in err)
        console.log(k, err[k])
    }   
  }

  // Acquires extension oauth token
  // const oauth_secret = "1pway03aps2dnnwkodad51qvisdmyl"
  // const testToken = document.getElementById('twitch_token')
  // testToken.addEventListener('click', (e) => {
  //   const url = `https://id.twitch.tv/oauth2/token?_client_id=${_client_id}&client_secret=${oauth_secret}&grant_type=client_credentials`
  //   axios({
  //     url,
  //     method: 'post',
  //     // headers,
  //     // data: body,
  //   }).then((res) => {
  //     console.log(res)
  //   }).catch((e) => {
  //     for (const k in e) {
  //       console.log(k, e[k])
  //     }
  //   })
  // })

  return Twitch
})()


Twitch.onMessage((channel, tags, message, self) => {
  console.log('forwarding message', channel, tags, message)
  Hades.send({ target: 'twitch', channel, tags, message })
})
Twitch.onRawMessage((messageCloned, message) => {
  if (messageCloned.command === "PONG") return
  console.log('forwarding raw message:', messageCloned)
  Hades.send({ target: 'twitch_raw', message: messageCloned })
})
Hades.on('twitch', (data) => {
  Twitch.send(message)
})