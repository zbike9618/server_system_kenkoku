import * as server from "@minecraft/server";
import { system } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { default as config } from "../config.js";

function getTodayString() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`; // 例：2025-10-06
}


export function show_form(player) {
    const today = getTodayString();
    const lastBonusDate = player.getDynamicProperty("lastDailyBonus");

    const canReceive = (lastBonusDate !== today); // 今日まだもらってなければOK

    const form = new ui.ActionFormData();
    form.title("デイリーボーナス");
    form.body(canReceive ? "毎日ログインしてボーナスをもらおう！" : "今日はすでに受け取り済みです。");

    if (canReceive) {
        form.button("ボーナスを受け取る");
    } else {
        form.button("閉じる");
    }

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (canReceive && response.selection === 0) {
            player.setDynamicProperty("lastDailyBonus", today);

            // 確率計算
            const bonuses = config.dailyBonus;
            let totalWeight = 0;
            for (const bonus of bonuses) {
                totalWeight += bonus.weight;
            }

            let random = Math.random() * totalWeight;
            let selectedBonus = null;

            for (const bonus of bonuses) {
                if (random < bonus.weight) {
                    selectedBonus = bonus;
                    break;
                }
                random -= bonus.weight;
            }

            if (selectedBonus) {
                const command = `give @s ${selectedBonus.item}`;
                player.runCommand(command);
                player.sendMessage(`§a今日のボーナス: ${selectedBonus.name} を獲得しました！\n§r引いた確率: ${(selectedBonus.weight / totalWeight * 100).toFixed(1)}%%`);
            } else {
                player.sendMessage("§cエラー: ボーナスの取得に失敗しました。");
            }
        }
    });
}



// プレイヤー参加時にチェック
server.world.afterEvents.playerSpawn.subscribe(ev => {
    const player = ev.player;
    if (!ev.initialSpawn) return; // 初回ログイン時のみ

    const today = getTodayString();
    const lastBonusDate = player.getDynamicProperty("lastDailyBonus");

    if (lastBonusDate !== today) {
        player.sendMessage("§eデイリーボーナスを受け取れます！ §a/dailybonus §rで受け取りましょう！");
    }
});