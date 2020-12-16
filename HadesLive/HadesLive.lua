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
            cb(payload)
          end
        end
      end
    end
  end
end

thread(monitorConnection)


HadesLive.send = function (config)
  if Connection.Status ~= 'open' then
    log('WARNING - Failed to send message, connection closed.')
    return
  end
  Connection.Send(json.encode(config))
end

HadesLive.on = function (target, callback)
  local cb_arr = cb_arrs[target] or {}
  table.insert(cb_arr, callback)
  cb_arrs[target] = cb_arr
  return function ()
    for i, cb in ipairs(cb_arr) do
      if cb == callback then
        table.remove(cb_arr, i)
        return
      end
    end
  end  
end
