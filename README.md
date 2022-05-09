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

## TODO

-   Vassal Module
    -   Try creating a Vassal modlue from scratch to see how that is done.
    -   Use github to store Vassal module for sharing with others.
    -   What is the Vassal Module Editor. Where do you get that?
