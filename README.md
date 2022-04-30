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

-   Make repo for oathroll code. But leave token out of it. Read from disk.
-   Add "oath-chance" to it that calculates your odds before you do the roll.
-   Then all of the code can be in this one place.
-   Add service to ensure bot is always running on beta after reboot.
