local Config = {
  PollInterval = 1,
  Debug = true,
}

ModUtil.RegisterMod("HadesLive")
HadesLive.Config = Config

local path = package.path
local cpath = package.cpath
package.path = "../Content/Mods/HadesLive/lua/?.lua;" .. package.path
package.cpath = "../Content/Mods/HadesLive/clibs/?.dll;" .. package.cpath
HadesLive.Lib = {
  bit = require'bit',
  mime = require'mime',
  socket = require'socket',
  json = require'json', -- https://github.com/rxi/json.lua
}
package.path = path
package.cpath = cpath

HadesLive.Log = function (...)
  if Config.Debug then
    print('HadesLive:', ...)
  end
end

HadesLive.Log('loaded Config.lua')
