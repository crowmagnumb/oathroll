import * as fs from "fs";

export const MAX_PRECALC_NUM = 10;
export const MIN_DICE = 1;

type OathBattle = {
    attackWarbands: number;
    defenseDice: number;
    defenseWarbands: number;
};

type DefenseValue = {
    shields?: number;
    doubles?: boolean;
};

type AttackValue = {
    swords?: number;
    skulls?: number;
};

const defenseFaces: DefenseValue[] = [
    {},
    {},
    { shields: 1 },
    { shields: 1 },
    { shields: 2 },
    { doubles: true },
];

const attackFaces: AttackValue[] = [
    { swords: 0.5 },
    { swords: 0.5 },
    { swords: 0.5 },
    { swords: 1 },
    { swords: 1 },
    { swords: 2, skulls: 1 },
];

function getIntValue(values: string[], index: number) {
    if (values.length > index) {
        return parseInt(values[index]);
    }
    return 0;
}

export function parseOathAttack(values: string[]) {
    return {
        attackWarbands: getIntValue(values, 0),
        defenseDice: getIntValue(values, 1),
        defenseWarbands: getIntValue(values, 2),
    } as OathBattle;
}

export function readPcts(fn: (pctsArr: number[][][][]) => void) {
    fs.readFile("src/assets/pcts.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        fn(JSON.parse(data) as number[][][][]);
    });
}

export function rollIndex() {
    return Math.floor(Math.random() * 6);
}

export function rollDefense(num: number) {
    let shields = 0;
    let doubles = 0;
    for (let ii = 0; ii < num; ii++) {
        const roll = defenseFaces[rollIndex()];

        shields += roll.shields || 0;
        if (roll.doubles) {
            doubles++;
        }
    }
    return (shields *= Math.pow(2, doubles));
}

export function rollAttack(num: number) {
    let swords = 0;
    let skulls = 0;
    for (let ii = 0; ii < num; ii++) {
        const roll = attackFaces[rollIndex()];

        swords += roll.swords || 0;
        skulls += roll.skulls || 0;
    }
    return { swords: Math.floor(swords), skulls } as AttackValue;
}

export function calcPercents(
    attackWarbands: number,
    defenseDice: number,
    defenseWarbands: number,
    iters = 10000000
) {
    let chance: number[] = [];
    for (let ii = 0; ii <= attackWarbands; ii++) {
        chance.push(0);
    }
    for (let ii = 0; ii < iters; ii++) {
        const attack = rollAttack(attackWarbands);
        const defense = rollDefense(defenseDice) + defenseWarbands;
        const result = attack.swords - defense;

        for (let jj = 0; jj <= attackWarbands; jj++) {
            if (result + jj - attack.skulls > 0) {
                chance[jj]++;
            }
        }
    }
    const avg = (num: number) => Math.round((num * 1000) / iters) / 10;
    return chance.map(avg);
}

export function getChances(pctsArr: number[][][][], battle: OathBattle) {
    let pcts: number[];
    if (
        battle.attackWarbands > MAX_PRECALC_NUM ||
        battle.defenseDice > MAX_PRECALC_NUM ||
        battle.defenseWarbands > MAX_PRECALC_NUM ||
        battle.attackWarbands < MIN_DICE ||
        battle.defenseDice < MIN_DICE
    ) {
        pcts = calcPercents(
            battle.attackWarbands,
            battle.defenseDice,
            battle.defenseWarbands
        );
    } else {
        pcts =
            pctsArr[battle.attackWarbands - 1][battle.defenseDice - 1][
                battle.defenseWarbands
            ];
    }
    type SacrificeChance = {
        units: number;
        chance: number;
    };

    let scs = pcts.map((pct, index) => {
        return { units: index, chance: pct } as SacrificeChance;
    });

    //
    // Once we've reached 100% don't bother reporting sacrifices greater than that.
    //
    let reached100 = false;
    scs = scs.filter((sc) => {
        if (reached100) {
            return false;
        }
        if (sc.chance <= 0) {
            return false;
        }
        if (sc.chance === 100) {
            reached100 = true;
        }
        return true;
    });
    if (scs.length == 0) {
        return "You cannot win this fight.";
    }
    return scs
        .reverse()
        .map((sc) => `${sc.chance}% -> ${sc.units}`)
        .join(", ");
}
