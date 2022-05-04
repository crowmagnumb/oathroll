import * as fs from "fs";
import { calcPercents, MIN_DICE, MAX_PRECALC_NUM } from "../oath_utils";

//
// Note: awb starts at zero so that array storage is more efficient BUT
// you cannot make an attack with zero warbands. So zero actually means 1 warband.
// See the (awb + 1) when calling percents. Same with dfd, there is always at least one.
//
let pcts: number[][][][] = [];
for (let awb = MIN_DICE - 1; awb < MAX_PRECALC_NUM; awb++) {
    pcts[awb] = [];
    for (let dfd = MIN_DICE - 1; dfd < MAX_PRECALC_NUM; dfd++) {
        pcts[awb][dfd] = [];
        for (let dwb = 0; dwb <= 10; dwb++) {
            process.stdout.write(`${awb} - ${dfd} - ${dwb}`.padEnd(50) + "\r");
            pcts[awb][dfd][dwb] = calcPercents(awb + 1, dfd + 1, dwb);
            // console.log(awb, dfd, dwb, pcts[awb][dfd][dwb]);
        }
    }
}

fs.writeFileSync("src/assets/pcts.json", JSON.stringify(pcts));
