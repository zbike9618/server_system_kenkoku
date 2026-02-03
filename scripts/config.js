export default {
    dailyBonus: [
        { name: "経験値瓶", item: "experience_bottle 32", weight: 50 },
        { name: "ダイヤモンド", item: "diamond 5", weight: 10 },
        { name: "鉄インゴット", item: "iron_ingot 10", weight: 40 }
    ],
    border: {
        radius: 1000,
        center: { x: 0, z: 0 },
        damageMultiplier: 0.1, // 1ブロック離れるごとの追加ダメージ
        visualDistance: 32,
        renderRange: 7,
        warningSeconds: 45, // 範囲外に出てから死ぬまでの秒数
        enabledDimensions: ["minecraft:overworld", "minecraft:the_nether", "minecraft:the_end"] // 有効なディメンション
    },
    firstItems: [
        "wooden_sword 1",
        "wooden_pickaxe 1",
        "bread 16",
        "leather_chestplate 1"
    ]
}