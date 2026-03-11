import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { default as config } from "../config.js";

let tipIndex = 0;

// 30秒ごとにTipsを配信する処理
system.runInterval(() => {
    if (config.tips && config.tips.length > 0) {
        const message = config.tips[tipIndex];
        
        for (const player of world.getAllPlayers()) {
            // "sv:hide_tips" というタグを持っていない人だけに送信
            if (!player.hasTag("sv:hide_tips")) {
                player.sendMessage(message);
            }
        }

        tipIndex++;
        if (tipIndex >= config.tips.length) {
            tipIndex = 0;
        }
    }
}, 1 * 20 * 30);

/**
 * Tipsの表示設定を切り替えるフォームを表示する
 */
export function showTipsForm(player) {
    const isHidden = player.hasTag("sv:hide_tips");
    const statusText = isHidden ? "§c受け取らない設定になっています" : "§a受け取る設定になっています";

    const form = new ActionFormData()
        .title("§eTips（お役立ち情報）の設定§r")
        .body(`${statusText}\n\nTipsの配信を切り替えますか？`)
        .button(isHidden ? "§a配信を開始する" : "§c配信を停止する")
        .button("閉じる");

    form.show(player).then(response => {
        if (response.canceled || response.selection === 1) return;

        if (response.selection === 0) {
            if (isHidden) {
                // 非表示タグを消す（＝表示する）
                player.removeTag("sv:hide_tips");
                player.sendMessage("§eTipsの配信を §a[ON] §eにしました。§r");
            } else {
                // 非表示タグを付ける（＝隠す）
                player.addTag("sv:hide_tips");
                player.sendMessage("§eTipsの配信を §c[OFF] §eにしました。§r");
            }
            player.playSound("random.orb");
        }
    });
}