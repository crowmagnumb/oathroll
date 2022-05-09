import * as readline from "readline";
import { runCommand, readPcts } from "./oath_utils";

readPcts((pctsArr) => {
    process.stdout.write("Enter a command, 'help', or 'q' to quit.\n");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    function prompt() {
        rl.question("> ", (value: string) => {
            if (value === "q") {
                process.exit();
            }

            // if (battle.attackWarbands < 1 || battle.defenseDice < 1) {
            //     process.stdout.write(
            //         "Must have at least one attack and one defense die.\n"
            //     );
            //     prompt();
            //     return;
            // }
            runCommand(pctsArr, value, (result) =>
                process.stdout.write(result + "\n")
            );
            prompt();
        });
    }

    // console.log(
    //     "\u{2694}\u{1F480} \u{2012} \u{1F5E1} \u{2012} \u{00BD}\u{1F5E1}   \u{27FA}   \u{1F6E1}\u{1F6E1} \u{2012} \u{1F6E1} \u{2012} \u{2715} 2 \u{2012} \u{2715}2 \u{2012} \u{25FB} \u{2012} \u{25FB}"
    // );
    // console.log(
    //     "\u{27FB}   \u{27FC}  \u{27FD}   \u{27FE}    \u{27FF}   \u{27EF}   \u{27EE}   \u{27ED}"
    // );
    prompt();
});
