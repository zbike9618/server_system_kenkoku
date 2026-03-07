import { system, world } from "@minecraft/server";
import { default as config } from "../config";

system.runInterval(() => {
    world.getPlayers().forEach((player) => {
        const inv = player.getComponent("inventory").container;

        // インベントリ内の全スロットを確認
        let confiscatedCounts = {}; // { itemName: totalAmount }

        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);

            if (item) {
                // アイテムIDから "minecraft:" を消して、設定ファイルと同じ形式にする
                const itemName = item.typeId.replace("minecraft:", "");

                // そのアイテムが禁止リストに含まれているか確認
                const prohibitedItem = config.prohibitedItems.find(p => p.id === itemName);
                if (prohibitedItem) {
                    if (!confiscatedCounts[itemName]) confiscatedCounts[itemName] = 0;
                    confiscatedCounts[itemName] += item.amount;
                }
            }
        }

        // 記録した禁止アイテムを没収し、設定されていれば原材料を返却する
        for (const itemName in confiscatedCounts) {
            const amount = confiscatedCounts[itemName];
            const prohibitedItem = config.prohibitedItems.find(p => p.id === itemName);

            try {
                player.runCommand(`clear @s ${itemName}`);
            } catch (e) {}

            if (prohibitedItem.name !== "") {
                player.sendMessage(`§c${prohibitedItem.name}は禁止アイテムのため没収されました`);
            }

            // config内で returnItems が設定されている場合 (原材料返却)
            if (prohibitedItem.returnItems && Array.isArray(prohibitedItem.returnItems)) {
                for (const retItemStr of prohibitedItem.returnItems) {
                    // "iron_ingot 1" などの文字列をスペースで分割
                    const parts = retItemStr.split(" ");
                    const retId = parts[0];
                    const retCount = parts.length > 1 ? parseInt(parts[1], 10) : 1;
                    
                    const totalRetCount = retCount * amount; // 没収した個数分掛ける
                    
                    if (totalRetCount > 0 && !isNaN(totalRetCount)) {
                        try {
                            player.runCommand(`give @s ${retId} ${totalRetCount}`);
                        } catch (e) {}
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