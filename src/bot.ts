import * as fs from "fs";
import * as path from "path";
import { parse } from "yaml";

import { Client, Intents } from "discord.js";
import { readPcts, runCommand } from "./oath_utils";

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
        const message = msg.content.toLowerCase();
        if (!message.startsWith("oath-")) {
            return;
        }
        //
        // Strip off the leading "oath-"
        //
        runCommand(pctsArr, message.substring(5), (result) =>
            msg.reply(result)
        );
    });

    client.login(config.discord.token);
});
