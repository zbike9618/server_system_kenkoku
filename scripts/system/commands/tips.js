import * as server from "@minecraft/server";
import { system } from "@minecraft/server";
import { showTipsForm } from "../tips.js";

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "sv:tips",
        description: "Tips（お役立ち情報）の受け取り設定",
        permissionLevel: server.CommandPermissionLevel.Any,
        mandatoryParameters: [],
        optionalParameters: []
    }, (origin, arg) => {
        if (origin.sourceEntity?.typeId === "minecraft:player") {
            const player = origin.sourceEntity;
            system.run(() => {
                showTipsForm(player);
            });
        }
    });
});