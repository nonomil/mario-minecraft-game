const fs = require('fs');
const path = require('path');

// Minecraft 中文翻译映射
const translations = {
    // 基础词汇
    'dig': '挖掘', 'mine': '挖矿', 'craft': '合成', 'build': '建造',
    'place': '放置', 'break': '破坏', 'attack': '攻击', 'defend': '防御',
    'explore': '探索', 'survive': '生存', 'adventure': '冒险',

    // 基础方块
    'air': '空气', 'stone': '石头', 'granite': '花岗岩', 'polished': '磨制的',
    'diorite': '闪长岩', 'andesite': '安山岩', 'grass': '草方块', 'dirt': '泥土',
    'coarse': '砂土', 'podzol': '灰化土', 'cobblestone': '圆石', 'bedrock': '基岩',
    'sand': '沙子', 'red sand': '红沙', 'gravel': '沙砾', 'clay': '粘土',
    'glass': '玻璃', 'obsidian': '黑曜石', 'sponge': '海绵', 'wet': '湿的',

    // 木头相关
    'oak': '橡木', 'spruce': '云杉', 'birch': '白桦', 'jungle': '丛林',
    'acacia': '金合欢', 'dark': '深色', 'wood': '木头', 'log': '原木',
    'plank': '木板', 'planks': '木板', 'sapling': '树苗', 'leaves': '树叶',

    // 矿石
    'ore': '矿石', 'coal': '煤炭', 'iron': '铁', 'gold': '金',
    'diamond': '钻石', 'emerald': '绿宝石', 'redstone': '红石',
    'lapis': '青金石', 'lazuli': '青金石', 'quartz': '石英',

    // 建筑方块
    'brick': '砖', 'bricks': '砖块', 'sandstone': '砂岩', 'chiseled': '錾制的',
    'smooth': '平滑的', 'slab': '台阶', 'stairs': '楼梯', 'fence': '栅栏',
    'wall': '墙', 'gate': '门', 'door': '门', 'trapdoor': '活板门',
    'bookshelf': '书架', 'mossy': '苔藓', 'moss': '苔藓',

    // 颜色
    'white': '白色', 'orange': '橙色', 'magenta': '品红色', 'light': '淡',
    'blue': '蓝色', 'yellow': '黄色', 'lime': '黄绿色', 'pink': '粉红色',
    'gray': '灰色', 'cyan': '青色', 'purple': '紫色', 'brown': '棕色',
    'green': '绿色', 'black': '黑色', 'red': '红色',

    // 羊毛和染料
    'wool': '羊毛', 'carpet': '地毯', 'terracotta': '陶瓦', 'concrete': '混凝土',
    'stained': '染色的', 'glazed': '带釉的',

    // 植物
    'flower': '花', 'dandelion': '蒲公英', 'poppy': '虞美人', 'orchid': '兰花',
    'allium': '绒球葱', 'azure': '蓝色', 'tulip': '郁金香', 'daisy': '雏菊',
    'oxeye': '滨菊', 'mushroom': '蘑菇', 'shrub': '灌木', 'dead': '枯萎的',
    'bush': '灌木丛', 'tallgrass': '草', 'fern': '蕨', 'vine': '藤蔓',
    'lily': '睡莲', 'pad': '荷叶', 'cactus': '仙人掌', 'sugar': '甘蔗',
    'cane': '甘蔗', 'wheat': '小麦', 'crops': '作物', 'farmland': '耕地',

    // 红石相关
    'redstone': '红石', 'torch': '火把', 'lever': '拉杆', 'button': '按钮',
    'pressure': '压力板', 'plate': '板', 'rail': '铁轨', 'powered': '动力',
    'detector': '探测', 'activator': '激活', 'golden': '金质',
    'piston': '活塞', 'sticky': '粘性', 'dispenser': '发射器', 'dropper': '投掷器',
    'hopper': '漏斗', 'repeater': '中继器', 'comparator': '比较器',
    'observer': '侦测器', 'note': '音符', 'block': '方块',

    // 装饰方块
    'bed': '床', 'painting': '画', 'sign': '告示牌', 'ladder': '梯子',
    'banner': '旗帜', 'carpet': '地毯', 'flower pot': '花盆', 'pot': '盆',
    'item frame': '物品展示框', 'frame': '框', 'armor stand': '盔甲架',

    // 光源
    'torch': '火把', 'lantern': '灯笼', 'glowstone': '荧石', 'sea': '海',
    'lantern': '灯笼', 'lamp': '灯', 'fire': '火', 'burning': '燃烧的',
    'lit': '点燃的', 'campfire': '营火',

    // 工具
    'pickaxe': '镐', 'axe': '斧', 'shovel': '铲', 'hoe': '锄',
    'sword': '剑', 'bow': '弓', 'arrow': '箭', 'shield': '盾',
    'fishing': '钓鱼', 'rod': '竿', 'shears': '剪刀', 'flint': '打火石',
    'steel': '钢', 'bucket': '桶', 'compass': '指南针', 'clock': '钟',
    'map': '地图', 'lead': '拴绳', 'name': '命名', 'tag': '牌',

    // 盔甲
    'helmet': '头盔', 'chestplate': '胸甲', 'leggings': '护腿', 'boots': '靴子',
    'armor': '盔甲', 'chainmail': '锁链', 'leather': '皮革',

    // 食物
    'apple': '苹果', 'bread': '面包', 'porkchop': '猪排', 'beef': '牛肉',
    'chicken': '鸡肉', 'mutton': '羊肉', 'rabbit': '兔肉', 'fish': '鱼',
    'salmon': '鲑鱼', 'cod': '鳕鱼', 'tropical': '热带鱼', 'pufferfish': '河豚',
    'cooked': '熟的', 'raw': '生的', 'rotten': '腐烂的', 'flesh': '肉',
    'carrot': '胡萝卜', 'potato': '马铃薯', 'baked': '烤', 'poisonous': '有毒的',
    'melon': '西瓜', 'slice': '片', 'pumpkin': '南瓜', 'pie': '派',
    'cookie': '曲奇', 'cake': '蛋糕', 'golden': '金', 'enchanted': '附魔的',

    // 生物
    'zombie': '僵尸', 'skeleton': '骷髅', 'creeper': '苦力怕', 'spider': '蜘蛛',
    'enderman': '末影人', 'villager': '村民', 'pig': '猪', 'cow': '牛',
    'sheep': '羊', 'chicken': '鸡', 'wolf': '狼', 'cat': '猫', 'ocelot': '豹猫',
    'horse': '马', 'donkey': '驴', 'mule': '骡', 'llama': '羊驼',
    'bat': '蝙蝠', 'squid': '鱿鱼', 'dolphin': '海豚', 'turtle': '海龟',
    'slime': '史莱姆', 'magma': '岩浆', 'cube': '怪', 'ghast': '恶魂',
    'blaze': '烈焰人', 'wither': '凋灵', 'ender': '末影', 'dragon': '龙',
    'shulker': '潜影贝', 'guardian': '守卫者', 'elder': '远古',
    'witch': '女巫', 'husk': '尸壳', 'stray': '流浪者', 'phantom': '幻翼',
    'drowned': '溺尸', 'pillager': '掠夺者', 'ravager': '劫掠兽',
    'vindicator': '卫道士', 'evoker': '唤魔者', 'vex': '恼鬼',

    // 生物掉落物
    'bone': '骨头', 'string': '线', 'spider eye': '蜘蛛眼', 'gunpowder': '火药',
    'ender pearl': '末影珍珠', 'pearl': '珍珠', 'slimeball': '粘液球',
    'feather': '羽毛', 'egg': '蛋', 'leather': '皮革', 'ink': '墨囊',
    'sac': '囊', 'prismarine': '海晶', 'shard': '碎片', 'crystal': '晶体',
    'nautilus': '鹦鹉螺', 'shell': '壳', 'heart': '心', 'membrane': '膜',
    'phantom membrane': '幻翼膜', 'scute': '鳞甲',

    // 下界相关
    'nether': '下界', 'netherrack': '下界岩', 'soul': '灵魂', 'soulsand': '灵魂沙',
    'glowstone': '荧石', 'quartz': '石英', 'wart': '疣', 'fortress': '要塞',
    'blaze': '烈焰', 'magma': '岩浆', 'basalt': '玄武岩', 'blackstone': '黑石',
    'ancient': '远古', 'debris': '残骸', 'netherite': '下界合金', 'scrap': '碎片',
    'crying': '哭泣的', 'respawn': '重生', 'anchor': '锚',

    // 末地相关
    'end': '末地', 'endstone': '末地石', 'purpur': '紫珀', 'chorus': '紫颂',
    'fruit': '果', 'plant': '植物', 'shulker': '潜影', 'elytra': '鞘翅',
    'dragon': '龙', 'egg': '蛋', 'crystal': '水晶',

    // 附魔和药水
    'enchant': '附魔', 'enchantment': '附魔', 'potion': '药水', 'splash': '喷溅',
    'lingering': '滞留', 'bottle': '瓶', 'brewing': '酿造', 'stand': '台',
    'experience': '经验', 'level': '等级', 'anvil': '铁砧', 'grindstone': '砂轮',
    'enchanting': '附魔', 'table': '台',

    // 其他物品
    'chest': '箱子', 'trapped': '陷阱', 'ender chest': '末影箱', 'barrel': '桶',
    'furnace': '熔炉', 'blast': '高炉', 'smoker': '烟熏炉', 'crafting': '合成',
    'stonecutter': '切石机', 'loom': '织布机', 'cartography': '制图',
    'smithing': '锻造', 'cauldron': '炼药锅', 'composter': '堆肥桶',
    'lectern': '讲台', 'bell': '钟', 'beacon': '信标', 'conduit': '潮涌核心',
    'tnt': 'TNT', 'dynamite': '炸药', 'firework': '烟花', 'rocket': '火箭',
    'book': '书', 'paper': '纸', 'writable': '可写的', 'written': '成书',
    'knowledge': '知识之书', 'enchanted book': '附魔书',

    // 交通工具
    'minecart': '矿车', 'boat': '船', 'saddle': '鞍', 'carrot': '胡萝卜',
    'stick': '钓竿', 'warped': '诡异', 'fungus': '菌',

    // 杂项
    'spawn': '生成', 'mob': '生物', 'spawner': '刷怪笼', 'monster': '怪物',
    'cobweb': '蜘蛛网', 'web': '网', 'double': '双层', 'wooden': '木质',
    'wire': '线', 'head': '头', 'skull': '头颅', 'banner': '旗帜',
    'pattern': '图案', 'dye': '染料', 'lapis lazuli': '青金石',
    'bone meal': '骨粉', 'meal': '粉', 'cocoa': '可可豆', 'beans': '豆',
    'ink sac': '墨囊', 'rose': '玫瑰', 'dandelion yellow': '蒲公英黄',

    // 维度
    'overworld': '主世界', 'dimension': '维度', 'portal': '传送门',

    // 游戏机制
    'health': '生命值', 'hunger': '饥饿值', 'saturation': '饱和度',
    'damage': '伤害', 'protection': '保护', 'durability': '耐久',
    'efficiency': '效率', 'fortune': '时运', 'silk': '精准', 'touch': '采集',
    'unbreaking': '耐久', 'mending': '经验修补', 'infinity': '无限',
    'flame': '火矢', 'power': '力量', 'punch': '冲击', 'sharpness': '锋利',
    'smite': '亡灵杀手', 'bane': '节肢杀手', 'arthropods': '节肢动物',
    'knockback': '击退', 'looting': '抢夺', 'sweeping': '横扫', 'edge': '之刃',
    'thorns': '荆棘', 'respiration': '水下呼吸', 'aqua': '水下', 'affinity': '亲和',
    'depth': '深海', 'strider': '行者', 'frost': '冰霜', 'walker': '行者',
    'feather': '摔落', 'falling': '保护', 'blast': '爆炸', 'projectile': '弹射物',
    'curse': '诅咒', 'vanishing': '消失', 'binding': '绑定',

    // 状态和形容词
    'flowing': '流动的', 'still': '静止的', 'water': '水', 'lava': '熔岩',
    'standing': '站立的', 'wall-mounted': '墙上的', 'glowing': '发光的',
    'off': '关闭', 'on': '开启', 'unlit': '未点燃', 'inactive': '未激活',
    'active': '激活的', 'unpowered': '无动力', 'cracked': '裂纹的',
    'snow': '雪', 'layer': '层', 'ice': '冰', 'packed': '浮冰',
    'frosted': '霜冰', 'mycelium': '菌丝', 'waterlily': '睡莲',
    'tripwire': '绊线', 'hook': '钩', 'command': '命令',
    'carrots': '胡萝卜', 'potatoes': '马铃薯', 'beetroots': '甜菜根',
    'weighted': '测重', 'heavy': '重质', 'daylight': '阳光', 'sensor': '传感器',
    'pillar': '柱', 'hardened': '硬化', 'barrier': '屏障',
    'slime block': '粘液块', 'prismarine': '海晶石', 'rough': '粗糙',
    'bricks': '砖', 'dark prismarine': '暗海晶石',
    'hay': '干草', 'bale': '捆', 'terracotta': '陶瓦', 'hardened clay': '硬化粘土',
    'coal block': '煤炭块', 'packed ice': '浮冰', 'sunflower': '向日葵',
    'lilac': '丁香', 'rose bush': '玫瑰丛', 'peony': '牡丹',
    'tall': '高', 'large': '大型', 'pane': '板', 'bars': '栏杆',
    'stem': '茎', 'attached': '连接的', 'vines': '藤蔓',
    'glow': '发光', 'jack': '南瓜灯', 'jukebox': '唱片机',
    'canes': '甘蔗', 'reeds': '芦苇', 'nether rack': '下界岩',
    'trap door': '活板门', 'stone brick': '石砖',
    't': '', 'blue t': '蓝色郁金香',

    // 更多词汇
    'pris': '海晶', 'marine': '石', 'of': '', 'free-standing': '独立的',
    'inverted': '反向的', 'beetroot': '甜菜根', 'path': '小径',
    'gateway': '折跃门', 'repeating': '循环型', 'chain': '锁链',
    'structure': '结构', 'void': '虚空', 'box': '盒', 'silver': '银',
    'powder': '粉', 'and': '', 'charcoal': '木炭', 'ingot': '锭',
    'bowl': '碗', 'stew': '煲', 'seeds': '种子', 'tunic': '外套',
    'pants': '裤子', 'snowball': '雪球', 'milk': '牛奶', 'ball': '球',
    'with': '', 'dust': '粉', 'clownfish': '小丑鱼', 'sack': '囊',
    'coco': '可可', 'filled': '填充的', 'steak': '牛排', 'tear': '泪',
    'nugget': '粒', 'eye': '眼', 'fermented': '发酵的', 'cream': '奶油',
    'glistering': '闪烁的', 'speckled': '斑点的', 'pigman': '猪人',
    'cave': '洞穴', 'silverfish': '蠹虫', 'mite': '螨', 'polar': '北极',
    'bear': '熊', 'parrot': '鹦鹉', 'charge': '充能', 'quill': '羽毛',
    'item': '物品', 'disc': '唱片', 'record': '唱片', 'music': '音乐',
    'wait': '等待', 'cat': '猫', 'blocks': '方块', 'chirp': '唧唧',
    'far': '远', 'mall': '商场', 'mellohi': '悠悠', 'stal': '石碑',
    'strad': '弦', 'ward': '守卫', 'eleven': '11', 'pigstep': '猪步',
    'otherside': '彼岸', 'relic': '遗物', 'creator': '创造者',
    'precipice': '悬崖', 'bottle o': '附魔瓶', 'enchanting': '附魔',
    'experience bottle': '经验瓶', 'star': '星', 'firework star': '烟火之星',
    'nether star': '下界之星', 'carrot on': '胡萝卜钓竿',
    'warped fungus': '诡异菌钓竿', 'banner pattern': '旗帜图案',
    'pottery': '陶片', 'netherite upgrade': '下界合金升级模板',
    'upgrade': '升级', 'template': '模板', 'armor trim': '盔甲纹饰',
    'trim': '纹饰', 'smithing template': '锻造模板',
    'angler': '钓手', 'archer': '射手', 'arms': '武装', 'blade': '刀刃',
    'brew': '酿造', 'burn': '燃烧', 'danger': '危险', 'dune': '沙丘',
    'eye': '眼', 'flow': '流动', 'friend': '朋友', 'host': '主人',
    'howl': '嚎叫', 'miner': '矿工', 'mourner': '哀悼者', 'plenty': '富饶',
    'prize': '奖品', 'raiser': '饲养者', 'rib': '肋骨', 'sentry': '哨兵',
    'shaper': '塑形者', 'sheaf': '束', 'shelter': '庇护所', 'silence': '寂静',
    'snout': '鼻', 'spire': '尖顶', 'tide': '潮汐', 'vex': '恼鬼',
    'wayfinder': '寻路者', 'wild': '野性', 'coast': '海岸',
    'sniffer': '嗅探兽', 'raiser': '饲养者', 'shaper': '塑形者',
    'wayfinder': '寻路者', 'host': '主人', 'wild': '野性',
    'bolt': '螺栓', 'coast': '海岸', 'dune': '沙丘', 'eye': '眼',
    'flow': '流动', 'friend': '朋友', 'host': '主人', 'howl': '嚎叫',
    'miner': '矿工', 'mourner': '哀悼者', 'plenty': '富饶', 'prize': '奖品',
    'rib': '肋骨', 'sentry': '哨兵', 'sheaf': '束', 'shelter': '庇护所',
    'silence': '寂静', 'snout': '鼻', 'spire': '尖顶', 'tide': '潮汐',
    'wayfinder': '寻路者', 'wild': '野性'
};

function getTranslation(word) {
    const lower = word.toLowerCase();
    if (translations[lower]) return translations[lower];

    // 处理复合词（用空格分隔）
    const words = lower.split(/\s+/);
    if (words.length > 1) {
        // 尝试翻译每个单词
        const translated = words.map(w => translations[w] || w);
        // 如果至少有一个单词被翻译了，返回组合结果
        if (translated.some((t, i) => t !== words[i])) {
            return translated.join('');
        }
    }

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
            const englishWord = word.standardized || word.word || '';

            // 检查是否需要翻译：空、只有问号、包含乱码、或者中文等于英文
            const needsTranslation = !chineseText.trim() ||
                                    /^\?+$/.test(chineseText.trim()) ||
                                    chineseText.includes('?') ||
                                    chineseText === englishWord;

            if (needsTranslation && englishWord) {
                const newTranslation = getTranslation(englishWord);
                // 只有当翻译不同于当前值时才更新
                if (newTranslation !== chineseText) {
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
