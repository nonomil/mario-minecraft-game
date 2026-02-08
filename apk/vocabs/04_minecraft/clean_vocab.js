const fs = require('fs');
const path = require('path');

// Minecraft 中文翻译映射
const translations = {
    // 基础词汇
    'dig': '挖掘', 'mine': '挖矿', 'craft': '合成', 'build': '建造',
    'place': '放置', 'break': '破坏', 'attack': '攻击', 'defend': '防御',
    'explore': '探索', 'survive': '生存', 'adventure': '冒险',

    // 方块
    'stone': '石头', 'dirt': '泥土', 'grass': '草方块', 'wood': '木头',
    'planks': '木板', 'cobblestone': '圆石', 'bedrock': '基岩',
    'sand': '沙子', 'gravel': '沙砾', 'clay': '粘土',
    'iron': '铁', 'gold': '金', 'diamond': '钻石', 'emerald': '绿宝石',
    'coal': '煤炭', 'redstone': '红石', 'lapis': '青金石',

    // 工具
    'pickaxe': '镐', 'axe': '斧', 'shovel': '铲', 'hoe': '锄',
    'sword': '剑', 'bow': '弓', 'arrow': '箭',

    // 生物
    'zombie': '僵尸', 'skeleton': '骷髅', 'creeper': '苦力怕', 'spider': '蜘蛛',
    'enderman': '末影人', 'villager': '村民', 'pig': '猪', 'cow': '牛',
    'sheep': '羊', 'chicken': '鸡', 'wolf': '狼',

    // 维度
    'overworld': '主世界', 'nether': '下界', 'end': '末地',

    // 其他
    'health': '生命值', 'hunger': '饥饿值', 'experience': '经验',
    'enchant': '附魔', 'potion': '药水', 'chest': '箱子',
    'furnace': '熔炉', 'crafting': '合成', 'table': '台'
};

function getTranslation(word) {
    const lower = word.toLowerCase();
    if (translations[lower]) return translations[lower];

    // 如果没有翻译，保持英文
    return word;
}

function cleanVocabFile(filePath) {
    console.log(`Processing: ${filePath}`);

    const content = fs.readFileSync(filePath, 'utf8');

    // 提取变量名和数组内容
    const match = content.match(/const\s+(\w+)\s*=\s*(\[[\s\S]*\]);?/);
    if (!match) {
        console.log(`  Skipped: Not a valid vocab file format`);
        return;
    }

    const varName = match[1];
    const arrayContent = match[2];

    try {
        // 解析 JSON 数组
        const words = eval(arrayContent);
        let modified = 0;

        words.forEach(word => {
            // 1. 清理 imageURLs，只保留第一个
            if (word.imageURLs && Array.isArray(word.imageURLs) && word.imageURLs.length > 1) {
                word.imageURLs = [word.imageURLs[0]];
                modified++;
            }

            // 2. 补充缺失或损坏的中文翻译
            const chineseText = word.chinese || '';
            // 检查是否为空、只有问号、或包含乱码
            if (!chineseText.trim() || /^\?+$/.test(chineseText.trim()) || chineseText.includes('?')) {
                const englishWord = word.standardized || word.word || '';
                const newTranslation = getTranslation(englishWord);
                if (newTranslation !== word.chinese) {
                    word.chinese = newTranslation;
                    modified++;
                }
            }

            // 同样处理 phraseTranslation
            if (word.phraseTranslation && (/^\?+$/.test(word.phraseTranslation.trim()) || word.phraseTranslation.includes('?'))) {
                word.phraseTranslation = '';
                modified++;
            }
        });

        // 生成新的文件内容，使用 JSON.stringify 并保留 Unicode 字符
        const jsonStr = JSON.stringify(words, null, 2);
        const newContent = `const ${varName} = ${jsonStr};\n`;

        // 使用 Buffer 确保 UTF-8 编码正确写入
        const buffer = Buffer.from(newContent, 'utf8');
        fs.writeFileSync(filePath, buffer);

        console.log(`  Modified ${modified} entries`);
    } catch (error) {
        console.error(`  Error: ${error.message}`);
    }
}

// 处理所有 minecraft 词库文件
const vocabDir = __dirname;
const files = [
    'minecraft_advanced.js',
    'minecraft_advancements.js',
    'minecraft_basic.js',
    'minecraft_biomes.js',
    'minecraft_blocks.js',
    'minecraft_enchantments.js',
    'minecraft_entities.js',
    'minecraft_environment.js',
    'minecraft_intermediate.js',
    'minecraft_items.js',
    'minecraft_items_2.js',
    'minecraft_status_effects.js',
    'minecraft_words_full.js'
];

files.forEach(file => {
    const filePath = path.join(vocabDir, file);
    if (fs.existsSync(filePath)) {
        cleanVocabFile(filePath);
    } else {
        console.log(`File not found: ${file}`);
    }
});

console.log('\nDone!');
