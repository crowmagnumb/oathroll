import * as readline from "readline";
import { parseOathAttack, getChances, readPcts } from "./oath_utils";

readPcts((pctsArr) => {
    process.stdout.write(
        "Enter <attack warbands> <defense dice> <defense warbands>, or 'q' to quit.\n"
    );
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    function prompt() {
        rl.question("> ", (value: string) => {
            if (value === "q") {
                process.exit();
            }

            const battle = parseOathAttack(value.split(" "));

            // if (battle.attackWarbands < 1 || battle.defenseDice < 1) {
            //     process.stdout.write(
            //         "Must have at least one attack and one defense die.\n"
            //     );
            //     prompt();
            //     return;
            // }

            process.stdout.write(getChances(pctsArr, battle) + "\n");
            prompt();
        });
    }

    prompt();
});
