# OathRoll

## Configure

Make file `config.yml` like the following...

```
discord:
    token: <bot_token>
```

## Precalculate common array of attack/defense dice for speed

```
npx tsc src/prep/oath_precalc.ts
node src/prep/oath_precalc.js
```

## Discord Developer Portal

https://discord.com/developers/applications

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
