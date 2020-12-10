# HadesLive

This Hades mod provides a communication channel between Hades and scripts running in a local web browser. This can be used for debugging, twitch integration, or any other browser-based Hades extension one might think of.
&nbsp;
### Dependencies
- [Mod Importer](https://www.nexusmods.com/hades/mods/26)
- [Mod Utility](https://www.nexusmods.com/hades/mods/27)

&nbsp;
### Installation
Warning! Backup save files before using.
1. Copy the `HadesLive` mod directory to `...\Steam\steamapps\common\Hades\Content\Mods` or equivalent.
1. Run the Hades [Mod Importer](https://www.nexusmods.com/hades/mods/26).
1. Open `test.html` in a browser or navigate to a page which integrates `HadesLive.js`.
1. Launch the x86 executable at `...\Steam\steamapps\common\Hades\x86\Hades.exe` or equivalent.
1. Load a save file and start playing.

&nbsp;

## API

HadesLive provides an api for communication between Hades and local javascript and implements basic twitch integration. The twitch wrapper functions can be used to communicate with the twitch PubSub api, provided HadesLive.js is running locally in a twitch environment (In the streamer's twitch dashboard via an extension).

### Lua
```lua
local target = 'my-topic'
local message = 'Hello World'
function callback(message) end

HadesLive.send(target, message) -- send data to browser
HadesLive.listen(target, callback) -- listen for messages from browser
HadesLive.unlisten(target, callback)

HadesLive.sendTwitch(target, message) -- send message to twitch PubSub
HadesLive.listenTwitch(target, callback) -- listen for messages from twitch PubSub
HadesLive.unlistenTwitch(target, callback)
```

### Javascript
```js
const target = 'my-topic'
const message = 'Hello World'
function callback(message) { }

HadesLive.send(target, message) // send message to Hades
HadesLive.listen(target, callback) // receive messages from Hades
HadesLive.unlisten(target, callback)

// To send messages via twitch PubSub, use the twitch extension helper
// twitch.ext.send: function(target: String, contentType: String, message: String || Object)
```

