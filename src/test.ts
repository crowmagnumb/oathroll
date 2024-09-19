import { sumDefenseFaces, rollDefense } from "./oath_utils";

console.log("Defense Dice: Avg.");
const count = 10000000;
for (let dice = 1; dice < 13; dice++) {
    let result = 0;
    for (let ii = 0; ii < 10000000; ii++) {
        result += sumDefenseFaces(rollDefense(dice));
    }
    console.log(`${dice}: ${(result/count).toFixed(1)}`);
}
