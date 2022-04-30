import * as fs from "fs";
import * as path from "path";
import { parse } from "yaml";

import { Client, Intents } from "discord.js";
import { rollAttack, rollDefense, rollIndex } from "./oath_utils";

type BotConfig = {
    discord: { token: string };
};

const config: BotConfig = parse(
    fs.readFileSync(path.join("..", "config.yml"), {
        encoding: "utf8",
    })
);

const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES];
const client = new Client({
    intents,
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

function getIntValue(values: string[], index: number) {
    if (values.length > index) {
        return parseInt(values[index]);
    }
    return 0;
}

client.on("messageCreate", (msg) => {
    if (msg.content.startsWith("oath-battle")) {
        const values = msg.content.split(" ");

        // console.log(values);
        const attackWarbands = getIntValue(values, 1);
        const defenseDice = getIntValue(values, 2);
        const defenseWarbands = getIntValue(values, 3);

        const attack = rollAttack(attackWarbands);
        const defense = rollDefense(defenseDice) + defenseWarbands;

        const rollResults = `Attack: ${attack.swords}, Defense: ${defense}`;

        let result: string;
        if (attack.swords > defense) {
            result = "Attacker Wins!";
        } else {
            let sacrifice = defense - attack.swords + 1;
            if (attackWarbands - attack.skulls >= sacrifice) {
                result = `Attacker wins if they sacrifice ${sacrifice}`;
            } else {
                result = "Defender Wins!";
            }
        }
        let skulls = "";
        for (let ii = 0; ii < attack.skulls; ii++) {
            skulls += "\u{1F480}";
        }
        msg.reply(`${rollResults} --> ${result}  ${skulls}`);
    } else if (msg.content.startsWith("oath-end")) {
        msg.reply(`${rollIndex() + 1}`);
    }
});

client.login(config.discord.token);
