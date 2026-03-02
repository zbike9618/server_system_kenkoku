import { system, world } from "@minecraft/server";
import { default as config } from "../config";

system.runInterval(() => {
    world.getPlayers().forEach((player) => {
        const inv = player.getComponent("inventory").container;

        // インベントリ内の全スロットを確認
        let clearedItemNames = new Set();

        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);

            if (item) {
                // アイテムIDから "minecraft:" を消して、設定ファイルと同じ形式にする
                const itemName = item.typeId.replace("minecraft:", "");

                // そのアイテムが禁止リストに含まれているか確認
                const prohibitedItem = config.prohibitedItems.find(p => p.id === itemName);
                if (prohibitedItem) {
                    player.runCommand(`clear @s ${itemName}`);

                    // 同じアイテムで何度もメッセージが出ないように制御し、名前が設定されている場合のみ表示
                    if (prohibitedItem.name !== "" && !clearedItemNames.has(itemName)) {
                        player.sendMessage(`§c${prohibitedItem.name}は禁止アイテムのため没収されました`);
                        clearedItemNames.add(itemName);
                    }
                }
            }
        }
    });
    try {
        world.getDimension("overworld").runCommand(`clear @a[tag=!host] trenbankai:settings_menu`);
    } catch (e) {
        console.error(e);
    }
}, 1);