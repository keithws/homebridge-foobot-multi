
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge Foobot Multi Plugin

This plugin for Homebridge supports multiple Foobot air quality monitors. It will automatically create HomeKit accessories for each device registered with to your user at api.foobot.io.

It supports the lastest Homebridge features and does not slow down Homebridge. It requires a recent version of Homebridge and node.js.

## Install 

Using the web UI, search for `foobot` in plugins. Click `Install` next to the `Homebridge Foobot Multi` plugin search result.

Using a terminal, run this command to install this plugin:

```
npm install -g homebridge-foobot-multi
```

## Update config.json

Open the [`config.json`](./config.json) and change the following attributes:

* `username` - your username/email address for api.foobot.io
* `password` - your password for api.foobot.io
* `apiKey` - your API key from api.foobot.io


## Customise Plugin

You can now start customising the plugin template to suit your requirements.

* [`src/platform.ts`](./src/platform.ts) - this is where your device setup and discovery should go.
* [`src/platformAccessory.ts`](./src/platformAccessory.ts) - this is where your accessory control logic should go, you can rename or create multiple instances of this file for each accessory type you need to implement as part of your platform plugin. You can refer to the [developer documentation](https://developers.homebridge.io/) to see what characteristics you need to implement for each service type.
* [`config.schema.json`](./config.schema.json) - update the config schema to match the config you expect from the user. See the [Plugin Config Schema Documentation](https://developers.homebridge.io/#/config-schema).

## Publish Package

When you are ready to publish your plugin to [npm](https://www.npmjs.com/), make sure you have removed the `private` attribute from the [`package.json`](./package.json) file then run:

```
npm publish
```

If you are publishing a scoped plugin, i.e. `@username/homebridge-xxx` you will need to add `--access=public` to command the first time you publish.

#### Publishing Beta Versions

You can publish *beta* versions of your plugin for other users to test before you release it to everyone.

```bash
# create a new pre-release version (eg. 2.1.0-beta.1)
npm version prepatch --preid beta

# publsh to @beta
npm publish --tag=beta
```

Users can then install the  *beta* version by appending `@beta` to the install command, for example:

```
sudo npm install -g homebridge-example-plugin@beta
```


