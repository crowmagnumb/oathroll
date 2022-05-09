import * as fs from "fs";

export const MAX_PRECALC_NUM = 10;
export const MIN_DICE = 1;
// const DIE_SPACER = " \u{2012} ";
const DIE_SPACER = " \u{2B1E} ";
// const ATT_DEF_SPACER = "   \u{27FA}   ";
const ATT_DEF_SPACER = "  vs.  ";
const THEREFORE = "   \u{27FE}   ";
const GLYPH_SKULL = "\u{1F480}";
const GLYPH_SHIELD = "\u{1F6E1}";
const GLYPH_BLANK = "\u{25FB}";
const GLYPH_SWORD = "\u{1F5E1}";
const GLYPH_HALF = "\u{00BD}";
const GLYPH_DOUBLER = "\u{2715}2";
// const GLYPH_DOUBLE_SWORD = "\u{2694}";
const GLYPH_DOUBLE_SWORD = GLYPH_SWORD + GLYPH_SWORD;

type OathBattle = {
    attackWarbands: number;
    defenseDice: number;
    defenseWarbands: number;
    cards: string[];
};

//
// Sort double shields -> shields -> X2 -> empty
//
type DefenseFace = {
    shields: number;
    doubles?: boolean;
    glyph: string;
    sort: number;
};

type AttackFace = {
    swords: number;
    skulls?: number;
    glyph: string;
};

const DEF_BLANK = {
    shields: 0,
    glyph: GLYPH_BLANK,
    sort: 3,
} as DefenseFace;

const DEF_SINGLE = {
    shields: 1,
    glyph: GLYPH_SHIELD,
    sort: 1,
} as DefenseFace;

const DEFENSE_DIE: DefenseFace[] = [
    DEF_BLANK,
    DEF_BLANK,
    DEF_SINGLE,
    DEF_SINGLE,
    { shields: 2, glyph: GLYPH_SHIELD + GLYPH_SHIELD, sort: 0 },
    { shields: 0, doubles: true, glyph: GLYPH_DOUBLER, sort: 2 },
];

const ATT_HALF = { swords: 0.5, glyph: GLYPH_HALF + GLYPH_SWORD } as AttackFace;
const ATT_WHOLE = { swords: 1, glyph: GLYPH_SWORD } as AttackFace;
const ATTACK_DIE: AttackFace[] = [
    ATT_HALF,
    ATT_HALF,
    ATT_HALF,
    ATT_WHOLE,
    ATT_WHOLE,
    { swords: 2, skulls: 1, glyph: GLYPH_DOUBLE_SWORD + GLYPH_SKULL },
];

function getIntValue(values: string[], index: number) {
    if (values.length > index) {
        const value = values[index];
        if (!isNaN(parseFloat(value))) {
            return parseInt(value);
        } else {
            return 0;
        }
    }
    return 0;
}

function parseOathAttack(values: string[]) {
    return {
        attackWarbands: getIntValue(values, 0),
        defenseDice: getIntValue(values, 1),
        defenseWarbands: getIntValue(values, 2),
        cards: values.slice(3),
    } as OathBattle;
}

function rollIndex() {
    return Math.floor(Math.random() * 6);
}

function rollDefense(num: number) {
    const faces: DefenseFace[] = [];
    for (let ii = 0; ii < num; ii++) {
        faces.push(DEFENSE_DIE[rollIndex()]);
    }
    return faces;
}

function sumDefense(
    faces: DefenseFace[],
    defensiveWarbands: number,
    cards: string[]
) {
    let shields = 0;
    let doubles = 0;
    for (const face of faces) {
        const ignore =
            face.shields === 2 && cards?.includes("wartortoise-attack");
        if (!ignore) {
            shields += face.shields || 0;
        }
        if (face.doubles) {
            doubles++;
        }
    }
    return (shields *= Math.pow(2, doubles)) + defensiveWarbands;
}

function rollAttack(num: number) {
    const faces: AttackFace[] = [];
    for (let ii = 0; ii < num; ii++) {
        faces.push(ATTACK_DIE[rollIndex()]);
    }
    return faces;
}

function sumAttack(faces: AttackFace[], cards: string[]) {
    let swords = 0;
    for (const face of faces) {
        const ignore =
            (face.swords === 0.5 && cards?.includes("rustingray")) ||
            (face.swords === 2 && cards?.includes("wartortoise-defense"));
        if (!ignore) {
            swords += face.swords;
        }
    }
    return Math.floor(swords);
}

function countSkulls(faces: AttackFace[]) {
    return faces.reduce((skulls, face) => (skulls += face.skulls || 0), 0);
}

function getChances(pctsArr: number[][][][], battle: OathBattle) {
    let pcts: number[];
    if (
        battle.attackWarbands > MAX_PRECALC_NUM ||
        battle.defenseDice > MAX_PRECALC_NUM ||
        battle.defenseWarbands > MAX_PRECALC_NUM ||
        battle.attackWarbands < MIN_DICE ||
        battle.defenseDice < MIN_DICE ||
        battle.cards.length > 0
    ) {
        pcts = calcPercents(battle);
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
        .join(",  ");
}

export function calcPercents(battle: OathBattle, iters = 10000000) {
    let chance: number[] = [];
    for (let ii = 0; ii <= battle.attackWarbands; ii++) {
        chance.push(0);
    }
    for (let ii = 0; ii < iters; ii++) {
        const faces = rollAttack(battle.attackWarbands);
        const attack = sumAttack(faces, battle.cards);
        const skulls = countSkulls(faces);
        const defense = sumDefense(
            rollDefense(battle.defenseDice),
            battle.defenseWarbands,
            battle.cards
        );
        const result = attack - defense;

        for (let jj = skulls; jj <= battle.attackWarbands; jj++) {
            if (result + jj - skulls > 0) {
                chance[jj]++;
            }
        }
    }
    const avg = (num: number) => Math.round((num * 1000) / iters) / 10;
    return chance.map(avg);
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

function attackGlyphs(faces: AttackFace[]) {
    return faces
        .sort((a, b) => {
            return b.swords - a.swords;
        })
        .map((face) => face.glyph)
        .join(DIE_SPACER);
}

function defenseGlyphs(faces: DefenseFace[]) {
    return faces
        .sort((a, b) => {
            return a.sort - b.sort;
        })
        .map((face) => face.glyph)
        .join(DIE_SPACER);
}

export function runCommand(
    pctsArr: number[][][][],
    cmd: string,
    callback: (result: string) => void
) {
    const bits = cmd.split(" ");
    const fn = bits[0];
    const params = bits.slice(1);

    switch (fn) {
        case "battle": {
            // console.log(values);
            const battle = parseOathAttack(params);

            const attackFaces = rollAttack(battle.attackWarbands);
            const attack = sumAttack(attackFaces, battle.cards);
            const skulls = countSkulls(attackFaces);

            const defenseFaces = rollDefense(battle.defenseDice);
            const defense = sumDefense(
                defenseFaces,
                battle.defenseWarbands,
                battle.cards
            );

            let result: string;
            if (attack > defense) {
                result = "Attacker Wins!";
            } else {
                let sacrifice = defense - attack + 1;
                if (battle.attackWarbands - skulls >= sacrifice) {
                    result = `Attacker wins if they sacrifice ${sacrifice}`;
                } else {
                    result = "Defender Wins!";
                }
            }
            let skullGlyphs: string;
            if (skulls) {
                skullGlyphs = " + ";
                for (let ii = 0; ii < skulls; ii++) {
                    skullGlyphs += GLYPH_SKULL;
                }
            } else {
                skullGlyphs = "";
            }
            const cards = battle.cards?.length
                ? " + " + battle.cards.join(", ")
                : "";
            callback(
                `( ${attackGlyphs(
                    attackFaces
                )} )${ATT_DEF_SPACER}( ${defenseGlyphs(
                    defenseFaces
                )} )${cards}${THEREFORE}(${attack} - ${defense})${THEREFORE}${result}${skullGlyphs}`
            );
            break;
        }
        case "end":
            callback(`${rollIndex() + 1}`);
            break;
        case "chance": {
            const battle = parseOathAttack(params);
            callback(getChances(pctsArr, battle));
            break;
        }
        case "rollattack": {
            let dice = getIntValue(params, 0);
            callback(attackGlyphs(rollAttack(dice)));
            break;
        }
        case "rolldefense": {
            let dice = getIntValue(params, 0);
            callback(defenseGlyphs(rollDefense(dice)));
            break;
        }
        case "help": {
            const helps: string[] = [];
            helps.push(
                "rollattack <#dice>\n\tRolls that number of attack dice."
            );
            helps.push(
                "rolldefense <#dice>\n\tRolls that number of defense dice."
            );
            helps.push(
                "battle <#attackWarbands> <#defenseDice> <#defenseWarbands> <cards?>\n\tRolls for an attack. e.g. 'battle 4 2 3', 'battle 6 3 0 rustingray'. Where cards is a space delimited list of special cards in play, one of 'rustingray', 'wartortoise-attack', 'wartortoise-defense"
            );
            helps.push(
                "chance <#attackWarbands> <#defenseDice> <#defenseWarbands> <cards?>\n\tGives you percent chances of success for given battle conditions.\n\te.g. chance 4 2 3\n\t100% -> 4,  99.4% -> 3,  91.9% -> 2,  67.6% -> 1,  22.6% -> 0\n\tYou have a 100% chance of winning if you are willing to lose 4 or more units (to skulls and/or sacrifice), a 91.9% chance of winning while losing 2 units, and you have a 22.6% chance of succeeding without losing any units."
            );
            helps.push("end\n\tRolls a D6 for end game check.");
            callback(helps.join("\n\n"));
            break;
        }
    }
}
