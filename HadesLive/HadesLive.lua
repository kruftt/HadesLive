local log = HadesLive.Log
local json = HadesLive.Lib.json
local Connection = HadesLive.Connection
local interval = HadesLive.Config.PollInterval
local cb_arrs = {}


local monitorConnection = function ()
  while true do
    wait(interval)
    if Connection.Status == 'closed' then
      Connection.Open()
    elseif Connection.Status == 'open' then
      local payload = Connection.Receive()
      if payload then
        local cb_arr = cb_arrs[payload.target]
        if cb_arr then
          for i, cb in ipairs(cb_arr) do
            cb(payload.message)
          end
        end
      end
    end
  end
end

thread(monitorConnection)


HadesLive.send = function (target, message)
  if Connection.Status ~= 'open' then
    log('WARNING - Failed to send message, connection closed.')
    return
  end

  Connection.Send(json.encode({ target = target, message = message }))
end

HadesLive.listen = function (target, callback)
  local cb_arr = cb_arrs[target] or {}
  table.insert(cb_arr, callback)
  cb_arrs[target] = cb_arr
end

HadesLive.unlisten = function (target, callback)
  local cb_arr = cb_arrs[target]
  if not cb_arr then return end
  for i, cb in ipairs(cb_arr) do
    if cb == callback then
      table.remove(cb_arr, i)
      return
    end
  end
end



twitch_cb_arrs = {}

HadesLive.sendTwitch = function (target, message)
  HadesLive.Send('twitch-send', { target = target, message = message })
end

HadesLive.listenTwitch = function (target, callback)
  local cb_arr = twitch_cb_arrs[target] or {}
  table.insert(cb_arr, callback)
  cb_arrs[target] = cb_arrs
  HadesLive.send('twitch-listen', target)
end

local twitchCallback = function (payload)
  local cb_arr = twitch_cb_arrs[payload.target]
  if not cb_arr then return end
  for i, cb in ipairs(cb_arr) do
    cb(payload.message)
  end
end

HadesLive.listen('twitch', twitchCallback)

HadesLive.unlistenTwitch = function (target, callback)
  local cb_arr = twitch_cb_arrs[target]
  if not cb_arr then return end
  for i, cb in ipairs(cb_arr) do
    if cb == callback then
      table.remove(cb_arr, i)
      return
    end
  end
  HadesLive.send('twitch-unlisten', target)
end