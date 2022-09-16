
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">
<img src="https://is4-ssl.mzstatic.com/image/thumb/Purple113/v4/79/ce/6f/79ce6fee-b4a1-2170-ff96-b9e342fd4492/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-85-220.png/460x0w.png" width="150">

</p>


# Homebridge Foobot Multi Plugin

This plugin for [Homebridge][1] supports multiple [Foobot][2] air quality monitors. It will automatically create HomeKit accessories for each device registered with to your user at [api.foobot.io][3].

This plugin does not require your password, only your API key. It supports the lastest Homebridge features and does not slow down Homebridge. It requires a recent version of Homebridge and node.js.

## Install 

Using the web UI, search for `foobot` in plugins. Click `Install` next to the `Homebridge Foobot Multi` plugin search result.

Using a terminal, run this command to install this plugin:

```
npm install -g homebridge-foobot-multi
```

## Update config.json

Open the [`config.json`](./config.json) and change the following attributes:

* `userName` - your username/email address for api.foobot.io
* `apiKey` - your API key from api.foobot.io
* `co2limit` - CO2 level in PPM to trigger detection
* `co2off` - do not create a CO2 sensor in HomeKit



# License
Homebridge Foobot Multi Plugin is available under the [Apache License, Version 2.0][4].

  [1]: https://homebridge.io
  [2]: https://foobot.io/features/
  [3]: http://api.foobot.io/apidoc/index.html
  [4]: https://github.com/keithws/homebridge-foobot-multi/blob/master/LICENSE
