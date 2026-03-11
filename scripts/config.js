export default {
    dailyBonus: [
        { name: "経験値瓶", item: "experience_bottle 32", weight: 50 },
        { name: "ダイヤモンド", item: "diamond 5", weight: 10 },
        { name: "鉄インゴット", item: "iron_ingot 10", weight: 40 },
        { name: "オークの原木", item: "oak_log 64", weight: 70 }
    ],
    border: {
        radius: 10000,
        center: { x: 0, z: 0 },
        damageMultiplier: 0.5, // 1ブロック離れるごとの追加ダメージ
        visualDistance: 32,
        renderRange: 7,
        warningSeconds: 15, // 範囲外に出てから死ぬまでの秒数
        enabledDimensions: ["minecraft:overworld"] // 有効なディメンション
    },
    firstItems: [
        "stone_sword 1",
        "stone_pickaxe 1",
        "bread 16",
        "iron_chestplate 1",
        "cw:toyphone 1",
        "trenbankai:glock17 1",
        "trenbankai:glock_mag 8"
    ],
    prohibitedItems: [
        // returnItemsを配列で追加することで、没収時にそのアイテムを付与（原材料返却）できます。
        // （各アイテム名の後ろにスペースを空けて個数を指定します）
        { id: "enchanted_golden_apple", name: "§c§lエンチャントされた金のリンゴ", returnItems: ["gold_block 8", "apple 1"] },
        { id: "totem_of_undying", name: "§c§l不死のトーテム" },
        // 例: 盾が没収されたら、鉄インゴット1個と木材6個を返却する
        { id: "shield", name: "§c§l盾", returnItems: ["iron_ingot 1", "planks 6"] },
        { id: "trenbankai:rpg7", name: "§c§lRPG7" },
        { id: "trenbankai:rpg7_rocket", name: "§c§lRPG7ロケット" },
        { id: "trenbankai:mossberg", name: "§c§lショットガン" },
        { id: "trenbankai:bullet_12gauge", name: "§c§lショットガンシェル" },
        { id: "trenbankai:m1014", name: "§c§lショットガン" }
    ],
    tips: [
        
        "[tips] スマホはshopから購入可能です",
        "[tips] ワールドボーダーの外に出るとダメージを喰らいます",
        "[tips] /admincallで運営を呼び出せます\n※緊急の用件でのみ使用してください",
        "[tips] webページはこちらから↓\nhttps://zbike9618.github.io/docs/\n不具合報告やお知らせを見ることができます。",
        "[tips] マイクラ鯖の名前募集中です\nwebページから送信できます。\nhttps://zbike9618.github.io/docs/",
        "[tips] !ai [質問内容] でAIに質問ができます",
        "[tips] 現金化は /bankまたはスマホからできます",
        "[tips] SeedMapの使用は禁止です",
        "[tips] 戦争中以外で許可なく人をキルすることは禁止です",
        "[tips] 2/24日よりも前に参加してバグが起きている方はロビーよりプレイヤーデータをリセットしてください",
        
        //"[tips] §l§c§l現在メンテナンス中§r§lです\n§4§l§l予告なく再起動する場合があります§r"
    ]
}