local socket = HadesLive.Lib.socket
local json = HadesLive.Lib.json
local bit = HadesLive.Lib.bit
local encode_b64 = HadesLive.Tools.base64.encode
local sha1 = HadesLive.Tools.sha1
local log = HadesLive.Log
local char = string.char
local byte = string.byte
local rshift = bit.rshift
local lshift = bit.lshift
local band = bit.band
local bxor = bit.bxor

local guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
local MAX_MESSAGE_SIZE = 0xffffffff
local client
local server = assert(socket.bind("*", 55666))
local ip, port = server:getsockname()
server:settimeout(0)
log("Listening for connections at: "..ip..":"..port)

local Connection = { Status = 'closed' }
local ch, line, sent, err


local makeHandshake = function ()
  line, err = client:receive('*l')
  if line ~= 'GET / HTTP/1.1'
  then
    log("Invalid HTTP Upgrade Request")
    Connection.Close()
    return
  end

  local key
  while line ~= "" do
    line, err = client:receive('*l')
    local name,val = line:match('([^%s]+)%s*:%s*([^\r\n]+)')
    if name then
      if name:match('Sec%-WebSocket%-Key') then
        key = val
      end
    end
  end

  local res = {
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    'Sec-WebSocket-Accept: '..encode_b64(sha1(key..guid)),
    'Sec-WebSocket-Protocol: HadesLive',
  }

  sent, err = client:send(table.concat(res, '\r\n')..'\r\n\r\n')
  if sent then
    Connection.Status = 'open'
    log('Handshake successful: '..sent)
  else
    Connection.Status = 'closed'
    log('Handshake err: '..err)
  end
end


Connection.Open = function ()
  client, err = server:accept()
  if client then
    Connection.Status = 'connecting'
    client:settimeout(0)
    log("Accepting connection from: "..client:getpeername())
    makeHandshake()
  end
end


Connection.Close = function ()
  if Connection.Status == 'closed' then return end
  Connection.Status = 'closing'
  repeat ch, err = client:receive(1)
  until err
  client:send(char(136, 0))
  client:close()
  Connection.Status = 'closed'
  log('Connection Closed: '..err)
end


Connection.Send = function (msg)
  local msg_len = #msg
  if msg_len > MAX_MESSAGE_SIZE then
    log('Warning: Exceeded Max Message size. Message not sent.')
    return
  end
  -- log('sending websocket frame')
  sent, err = client:send(char(129))
  if not err then
    if msg_len < 126 then
      sent, err = client:send(char(msg_len))
    elseif msg_len < 0xffff then
      -- log('sending medium message')
      client:send(char(
        126,
        band(rshift(msg_len, 8), 0xff),
        band(msg_len, 0xff)
      ))
    else
      -- log('sending large message')
      sent, err = client:send(char(
        127, 0, 0, 0, 0,
        band(rshift(msg_len, 24), 0xff),
        band(rshift(msg_len, 16), 0xff),
        band(rshift(msg_len, 8), 0xff),
        band(msg_len, 0xff)
      ))
    end
    sent, err = client:send(msg)
    if sent then
      log('sent: '..sent..' bytes.')
    end
  end
  if err then Connection.Close() end
end


Connection.Receive = function ()
  ch, err = client:receive(1)
  if err then return end
  if ch == char(0x88) then  -- Close
    Connection.Close()
    return
  end
  -- if ch == 0x89 -- Ping
  -- if ch == 0x8a -- Pong
  if ch ~= char(0x81) then
    log('INVALID FRAME HEADER')
    Connection.Close()
    return
  end -- Make sure this is a text frame

  ch, err = client:receive(1)
  if band(byte(ch), 0x80) == 0 then return end -- Masking bit not flipped
  local n = band(byte(ch), 0x7f)

  local msg_len
  if n < 126 then
    msg_len = n
  elseif n == 126 then
    msg_len, err = client:receive(2)
    msg_len = band(
      lshift(byte(msg_len), 8),
      byte(msg_len, 2)
    )
  else
    msg_len, err = client:receive(8)
    msg_len = band(
      lshift(byte(msg_len, 5), 24),
      lshift(byte(msg_len, 6), 16),
      lshift(byte(msg_len, 7), 8),
      byte(msg_len, 8)
    )
  end

  -- Receive the mask
  local mask
  mask, err = client:receive(4)
  mask = {
    byte(mask, 1),
    byte(mask, 2),
    byte(mask, 3),
    byte(mask, 4)
  }

  -- Apply the mask
  local msg = {}
  for i = 0, msg_len - 1, 1 do
    ch, err = client:receive(1)
    msg[i + 1] = char(bxor(
      byte(ch),
      mask[(i % 4) + 1]
    ))
  end

  if err then
    log('ERROR RECEIVING MESSAGE: CLOSING CONNECTION')
    Connection.Close()
    return
  end

  return json.decode(table.concat(msg))
end


HadesLive.Connection = Connection
log('loaded Connection.lua')
