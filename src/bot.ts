import * as fs from "fs";
import * as path from "path";
import { parse } from "yaml";

import { Client, Intents } from "discord.js";
import {
    rollAttack,
    rollDefense,
    rollIndex,
    parseOathAttack,
    readPcts,
    getChances,
} from "./oath_utils";

type BotConfig = {
    discord: { token: string };
};

const config: BotConfig = parse(
    fs.readFileSync(path.join(".", "config.yml"), {
        encoding: "utf8",
    })
);

readPcts((pctsArr) => {
    const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES];
    const client = new Client({
        intents,
    });

    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on("messageCreate", (msg) => {
        if (msg.content.startsWith("oath-battle")) {
            // console.log(values);
            const battle = parseOathAttack(msg.content.split(" ").slice(1));

            const attack = rollAttack(battle.attackWarbands);
            const defense =
                rollDefense(battle.defenseDice) + battle.defenseWarbands;

            const rollResults = `Attack: ${attack.swords}, Defense: ${defense}`;

            let result: string;
            if (attack.swords > defense) {
                result = "Attacker Wins!";
            } else {
                let sacrifice = defense - attack.swords + 1;
                if (battle.attackWarbands - attack.skulls >= sacrifice) {
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
        } else if (msg.content.startsWith("oath-chance")) {
            const battle = parseOathAttack(msg.content.split(" ").slice(1));
            msg.reply(getChances(pctsArr, battle));
        }
    });

    client.login(config.discord.token);
});
