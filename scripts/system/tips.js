import { world, system } from "@minecraft/server";
import { default as config } from "../config.js";

let tipIndex = 0;

system.runInterval(() => {
    if (config.tips && config.tips.length > 0) {
        world.sendMessage(config.tips[tipIndex]);
        tipIndex++;
        if (tipIndex >= config.tips.length) {
            tipIndex = 0;
        }
    }
}, 1 * 20 * 30);