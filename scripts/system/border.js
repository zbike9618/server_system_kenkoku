import * as ui from "@minecraft/server-ui";
import { system, world } from "@minecraft/server";
import { default as config } from "../config.js";

// --- 警告とダメージ処理 ---
system.runInterval(() => {
    const players = world.getAllPlayers();
    const radius = config.border.radius;
    const center = config.border.center;
    const damageMultiplier = config.border.damageMultiplier || 0.5;
    const warningSeconds = config.border.warningSeconds || 10;
    const enabledDimensions = config.border.enabledDimensions || ["minecraft:overworld"];

    for (const player of players) {
        if (!enabledDimensions.includes(player.dimension.id)) continue;
        if (player.getGameMode() === "creative" || player.getGameMode() === "spectator") {
            player.setDynamicProperty("borderWarningTime", 0);
            continue;
        }

        const location = player.location;
        const dx = Math.abs(location.x - center.x);
        const dz = Math.abs(location.z - center.z);
        const distance = Math.max(dx, dz);

        if (distance > radius) {
            const diff = distance - radius;
            const damage = Math.ceil(diff * damageMultiplier);

            // 経過時間を計測
            let currentWarningTime = (player.getDynamicProperty("borderWarningTime") || 0) + 1;
            player.setDynamicProperty("borderWarningTime", currentWarningTime);

            const remainingTime = Math.max(0, warningSeconds - currentWarningTime);

            // 警告表示
            player.onScreenDisplay.updateSubtitle(`§c残り ${remainingTime}秒`);
            player.onScreenDisplay.setTitle("§cエリア外警告！");
            player.onScreenDisplay.setActionBar(`§c戻ってください！ 残り${Math.round(diff)}ブロック`);

            // タイムアウトでキル
            if (remainingTime <= 0) {
                world.sendMessage(`§c${player.name} はエリア外で力尽きた...(タイムアウト)`);
                player.kill();
                player.setDynamicProperty("borderWarningTime", 0); // リセット
            } else {
                player.applyDamage(damage, { cause: "void" });
            }
        } else {
            // エリア内に戻ったらリセット
            if (player.getDynamicProperty("borderWarningTime") > 0) {
                player.setDynamicProperty("borderWarningTime", 0);
                player.onScreenDisplay.setTitle("");
                player.onScreenDisplay.updateSubtitle("");
                player.sendMessage("§a安全なエリアに戻りました");
            }
        }
    }
}, 20); // 警告・ダメージ判定: 20 tick (1秒)

// --- ボーダー可視化処理 ---
system.runInterval(() => {
    const players = world.getAllPlayers();
    const radius = config.border.radius;
    const center = config.border.center;
    const enabledDimensions = config.border.enabledDimensions || ["minecraft:overworld"];

    // 境界線に近い場合、パーティクルを表示
    const VISUAL_DISTANCE = config.border.visualDistance; // 境界線が見える距離
    const PARTICLE = "minecraft:basic_flame_particle"; // パーティクル種類
    const renderRange = config.border.renderRange;

    for (const player of players) {
        if (!enabledDimensions.includes(player.dimension.id)) continue;

        const location = player.location;
        const pY = location.y;
        const pZ = location.z;
        const pX = location.x;

        // X軸の境界 (East/West)
        const distToEast = Math.abs(location.x - (center.x + radius));
        const distToWest = Math.abs(location.x - (center.x - radius));

        // Z軸の境界 (South/North)
        const distToSouth = Math.abs(location.z - (center.z + radius));
        const distToNorth = Math.abs(location.z - (center.z - radius));

        // East Border (X = center + radius)
        if (distToEast < VISUAL_DISTANCE) {
            spawnWallParticles(player.dimension, center.x + radius, pY, pZ, "z", renderRange, PARTICLE);
        }
        // West Border (X = center - radius)
        if (distToWest < VISUAL_DISTANCE) {
            spawnWallParticles(player.dimension, center.x - radius, pY, pZ, "z", renderRange, PARTICLE);
        }
        // South Border (Z = center + radius)
        if (distToSouth < VISUAL_DISTANCE) {
            spawnWallParticles(player.dimension, center.z + radius, pY, pX, "x", renderRange, PARTICLE);
        }
        // North Border (Z = center - radius)
        if (distToNorth < VISUAL_DISTANCE) {
            spawnWallParticles(player.dimension, center.z - radius, pY, pX, "x", renderRange, PARTICLE);
        }
    }
}, 5); // 可視化判定: 10 tick (0.5秒)

/**
 * 
 * @param {import("@minecraft/server").Dimension} dimension 
 * @param {number} fixedPos 固定軸の座標
 * @param {number} centerY プレイヤーのY座標
 * @param {number} varyCenter 変動軸のプレイヤー中心座標
 * @param {string} axis 変動する軸 "x" or "z"
 * @param {number} range 描画範囲
 * @param {string} particle 
 */
function spawnWallParticles(dimension, fixedPos, centerY, varyCenter, axis, range, particle) {
    for (let i = -range; i <= range; i += 2) { // 2ブロック間隔
        for (let y = -2; y <= 4; y += 2) { // 高さ方向
            try {
                if (axis === "z") {
                    // X固定、Z変動
                    dimension.spawnParticle(particle, { x: fixedPos, y: centerY + y, z: varyCenter + i });
                } else {
                    // Z固定、X変動
                    dimension.spawnParticle(particle, { x: varyCenter + i, y: centerY + y, z: fixedPos });
                }
            } catch (e) { }
        }
    }
}
