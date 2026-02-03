import * as server from "@minecraft/server";
import { system } from "@minecraft/server";
import { show_form } from "../daily_bounus.js";

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name:"sv:resetdailybonus",
        description:"デイリーボーナスをリセット",
        permissionLevel : server.CommandPermissionLevel.Admin,
        mandatoryParameters:[],
        optionalParameters:[]
    },(origin, arg) => {
        const player = origin.sourceEntity;  // ★ コマンド発行者を取得
        if (!player || player.typeId !== "minecraft:player") return;

        system.run(() => {  // 1tick後で安全
            player.setDynamicProperty("lastDailyBonus", undefined); // ★リセット
            player.sendMessage("§aデイリーボーナスの受け取り履歴をリセットしました！");
        });
    });
});


server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name:"sv:dailybonus",
        description:"デイリーボーナスを受け取る",
        permissionLevel : server.CommandPermissionLevel.Any,
        mandatoryParameters:[
        ],
        optionalParameters:[
        ]
    },(origin, arg) => {
        if (origin.sourceEntity?.typeId === "minecraft:player") {
            let player = origin.sourceEntity;
            system.run(() => {  // 1tick後に安全に実行
                show_form(player);
            });
        }
    });
});