# HadesLive

This Hades mod provides a communication channel between Hades and scripts running in a local web browser. This can be used for debugging, twitch integration, or any other browser-based Hades extension one might think of.
&nbsp;
### Dependencies
- [Mod Importer](https://www.nexusmods.com/hades/mods/26)
- [Mod Utility](https://www.nexusmods.com/hades/mods/27)

&nbsp;
### Base Installation
Warning! Backup save files before using.
1. Copy the `HadesLive` mod directory to `...\Steam\steamapps\common\Hades\Content\Mods` or equivalent.
1. Run the Hades [Mod Importer](https://www.nexusmods.com/hades/mods/26).
1. Open `dist\index.html` in a browser.
1. Click on the connection status bar in the Hades section to start scanning for a hades connection.
1. Launch the x86 executable at `...\Steam\steamapps\common\Hades\x86\Hades.exe` or equivalent.
1. Load a save file and start playing.

&nbsp;

## API
```lua
HadesLive.send(message_config)
HadesLive.on(event_name, callback)
```


## Base Functionality

HadesLive provides the ability to communicate between Hades and a locally-opened webpage.

### Lua
```lua
-- send data to browser
HadesLive.send{
  target = 'my-event',
  message = 'Hello Browser'
}

-- log data in browser console
HadesLive.send{
  target = 'console',
  message = 'I am logged in the browser console.'
}

-- listen for messages from browser
local callback = function () return end
local off = HadesLive.on('other-event', callback)

-- stop listening
off()
```

### Javascript
```js
// send message to Hades
Hades.send({
  target: 'other-event',
  message: 'Hello Hades',
})

// receive messages from Hades
function callback(message) { }
const off = Hades.on('my-event', callback)

// stop listening
off()
```

## Twitch

HadesLive provides the ability to receive messages from a twitch chat channel, as well as to send messages to the twitch pubsub api using your twitch extension credentials.  Mod/Extension authors will need to include their extension credentials when sending to the pubsub api.

### Installation

1. After following the base installation steps, enter your twitch user name into the browser interface.
1. Click the Twitch connection status to connect to the twitch IRC server and initialize the pubsub config.

### MyMod.lua
```lua
-- Send Message to Twitch

HadesLive.send{
  target = 'twitch',
  client_id = my_extension_client_id,
  secret = my_extension_secret,
  message = 'hello twitch',
}


--[[ 
Receive chat messages from Twitch
Message:
{
  target = 'twitch',
  channel = { channel name },
  userstate = { twitch user information },
  message = { the message data }
}
]]

HadesLive.on('twitch', function (message) end)


--[[
Receive raw chat messages from Twitch:
{
  target = 'twitch_raw',
  message = { raw message data },
}
]]

HadesLive.on('twitch_raw', function (raw_message) end)
```
