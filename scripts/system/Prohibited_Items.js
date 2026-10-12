import { system, world, EquipmentSlot } from "@minecraft/server";
import { default as config } from "../config";

// 持ち物全体を確認する間隔(tick)。全員の全スロットを毎tick確認するとTPS低下の大きな原因になる
// （2026-10 計測でスクリプト時間の約2割）。手とオフハンドは毎tick確認するので、使える状態の禁止アイテムはすぐ没収される
const FULL_SCAN_INTERVAL = 20;

function isProhibited(item) {
    return !!item && config.prohibitedItems.some(p => p.id === item.typeId.replace("minecraft:", ""));
}

system.runInterval(() => {
    const fullScan = system.currentTick % FULL_SCAN_INTERVAL === 0;
    world.getPlayers().forEach((player) => {
        const inv = player.getComponent("inventory").container;

        // 手とオフハンドに禁止アイテムが無ければ、持ち物全体の確認は FULL_SCAN_INTERVAL ごとにする
        // （見つかったときは全体を数え直すので、原材料を返却する個数は変わらない）
        if (!fullScan
            && !isProhibited(inv.getItem(player.selectedSlotIndex))
            && !isProhibited(player.getComponent("equippable")?.getEquipment(EquipmentSlot.Offhand))) {
            return;
        }

        // インベントリ内の全スロットを確認
        let confiscatedCounts = {}; // { itemName: totalAmount }

        const size = inv.size;
        for (let i = 0; i < size; i++) {
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

        // オフハンドのアイテムも確認
        const equippable = player.getComponent("equippable");
        if (equippable) {
            const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
            if (offhandItem) {
                const itemName = offhandItem.typeId.replace("minecraft:", "");
                const prohibitedItem = config.prohibitedItems.find(p => p.id === itemName);
                if (prohibitedItem) {
                    if (!confiscatedCounts[itemName]) confiscatedCounts[itemName] = 0;
                    confiscatedCounts[itemName] += offhandItem.amount;
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