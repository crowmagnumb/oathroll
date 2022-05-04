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

-   Add service to ensure bot is always running on beta after reboot.
