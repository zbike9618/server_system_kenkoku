import { world, system } from "@minecraft/server";
import { default as config } from "../config.js";

world.afterEvents.playerSpawn.subscribe(ev => {
    const player = ev.player;

    // 初回スポーン かつ サーバーで初めての参加かどうか（DynamicPropertyで判定）
    if (!ev.initialSpawn) return;

    // すでに受け取っているかチェック
    if (player.getDynamicProperty("hasReceivedFirstItems")) return;

    // アイテム付与
    const items = config.firstItems || [];
    if (items.length > 0) {
        system.run(() => {
            for (const itemStr of items) {
                player.runCommand(`give @s ${itemStr}`);
            }
            player.sendMessage("§a建国鯖への参加ありがとうございます。\nこの鯖はオリジナルの建国アドオン(CountryWars)を使用しています。");
            player.sendMessage("§aサーバー初参加ボーナスを受け取りました！");
            world.sendMessage(`§a§l${player.name}§rがサーバーに初参加しました！\n皆さん挨拶しましょう！`);

            // フラグを立てる
            player.setDynamicProperty("hasReceivedFirstItems", true);
        });
    }
});
