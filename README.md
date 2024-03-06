# OathRoll

## Configure

Make file `config.yml` like the following...

```
discord:
    token: <bot_token>
```

## Deploy

Currently hosting on beta.happywhale.com in my /home/ken/dev/oathroll. There is a service on that machine to run it.
Because I didn't yet add my ssh key to the repo. I currently have to delete the old. do ...

```sh
cd ~/dev
rm -rf oathroll_backup
mv oathroll oathroll_backup
git clone https://github.com/crowmagnumb/oathroll.git
cp oathroll_backup/config.yml oathroll
cd oathroll
npm i
npm run build:bot
sudo systemctl restart oathroll
```

## Precalculate common array of attack/defense dice for speed

```
npx tsc src/prep/oath_precalc.ts
node src/prep/oath_precalc.js
```

## Discord Developer Portal

https://discord.com/developers/applications

To install the bot into your server add this link...

```
https://discord.com/api/oauth2/authorize?client_id=969401641285591040&permissions=2048&scope=bot
```

It was obtained by going to the oathroll app in the developer section and selecting the OAuth2 --> URL Generator in the menu. Then select ...

scopes --> bot
bot permissions --> Send Messages

and it should provide you with the above url to copy.

## TODO

-   Vassal Module
    -   HOW TO
        -   Try creating a Vassal modlue from scratch to see how that is done.
        -   Use github to store Vassal module for sharing with others.
        -   What is the Vassal Module Editor. Where do you get that?
        -   https://vassalengine.org/wiki/Module:Oath:_Chronicles_of_Empire_and_Exile
        -   https://forum.vassalengine.org/t/editing-a-module/7485
        -   https://vassalengine.org/doc/latest/ReferenceManual/index.html#toc
    -   Need to be able to put cards back on the bottom of the world deck.
