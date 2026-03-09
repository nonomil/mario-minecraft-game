// Pokemon Basic - å®å¯æ¢¦åºç¡è¯æ±åº
// åå«å®å¯æ¢¦ç³»åä¸­çåºç¡å®å¯æ¢¦åç®åè¯æ±
const POKEMON_BASIC = [
  // === ç»å¸å®å¯æ¢¦ ===
  {
    "word": "Pikachu",
    "standardized": "Pikachu",
    "chinese": "皮卡丘",
    "phonetic": "/ˈpiːkətʃuː/",
    "phrase": "Pikachu the electric mouse",
    "phraseTranslation": "电老鼠皮卡丘",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "çµå±æ§èé¼ å®å¯æ¢¦",
    "special_features": "yellow_color",
    "type": "Electric",
    "imageURLs": [
      {
        "filename": "Pikachu.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Eevee",
    "standardized": "Eevee",
    "chinese": "伊布",
    "phonetic": "/ˈiːviː/",
    "phrase": "Eevee the evolution Pokemon",
    "phraseTranslation": "进化宝可梦伊布",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "æ®éå±æ§çç¸å®å¯æ¢¦",
    "special_features": "brown_color",
    "type": "Normal",
    "imageURLs": [
      {
        "filename": "Eevee.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Charmander",
    "standardized": "Charmander",
    "chinese": "小火龙",
    "phonetic": "/ˈtʃɑːrmændər/",
    "phrase": "Charmander the fire lizard",
    "phraseTranslation": "火蜥蜴小火龙",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "ç«å±æ§è¥è´å®å¯æ¢¦",
    "special_features": "orange_color",
    "type": "Fire",
    "imageURLs": [
      {
        "filename": "Charmander.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Squirtle",
    "standardized": "Squirtle",
    "chinese": "杰尼龟",
    "phonetic": "/ˈskwɜːrtəl/",
    "phrase": "Squirtle the water turtle",
    "phraseTranslation": "水龟杰尼龟",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "æ°´å±æ§ä¹é¾å®å¯æ¢¦",
    "special_features": "blue_color",
    "type": "Water",
    "imageURLs": [
      {
        "filename": "Squirtle.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Bulbasaur",
    "standardized": "Bulbasaur",
    "chinese": "妙蛙种子",
    "phonetic": "/ˈbʌlbəsɔːr/",
    "phrase": "Bulbasaur the grass dinosaur",
    "phraseTranslation": "草恐龙妙蛙种子",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "èå±æ§æé¾å®å¯æ¢¦",
    "special_features": "green_color",
    "type": "Grass",
    "imageURLs": [
      {
        "filename": "Bulbasaur.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },

  // === å¯ç±å®å¯æ¢¦ ===
  {
    "word": "Jigglypuff",
    "standardized": "Jigglypuff",
    "chinese": "胖丁",
    "phonetic": "/ˈdʒɪɡlipʌf/",
    "phrase": "Jigglypuff the balloon Pokemon",
    "phraseTranslation": "气球宝可梦胖丁",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "æ®éå±æ§æ°çå®å¯æ¢¦",
    "special_features": "pink_color",
    "type": "Normal",
    "imageURLs": [
      {
        "filename": "Jigglypuff.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Meowth",
    "standardized": "Meowth",
    "chinese": "喵喵",
    "phonetic": "/miːaʊθ/",
    "phrase": "Meowth the cat Pokemon",
    "phraseTranslation": "猫咪宝可梦喵喵",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "æ®éå±æ§ç«åªå®å¯æ¢¦",
    "special_features": "yellow_color",
    "type": "Normal",
    "imageURLs": [
      {
        "filename": "Meowth.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Psyduck",
    "standardized": "Psyduck",
    "chinese": "可达鸭",
    "phonetic": "/ˈsaɪdʌk/",
    "phrase": "Psyduck the duck Pokemon",
    "phraseTranslation": "鸭子宝可梦可达鸭",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "æ°´å±æ§é¸­å­å®å¯æ¢¦",
    "special_features": "yellow_color",
    "type": "Water",
    "imageURLs": [
      {
        "filename": "Psyduck.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Snorlax",
    "standardized": "Snorlax",
    "chinese": "卡比兽",
    "phonetic": "/ˈsnɔːrlæks/",
    "phrase": "Snorlax the sleeping Pokemon",
    "phraseTranslation": "睡觉宝可梦卡比兽",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "æ®éå±æ§ç¡è§å®å¯æ¢¦",
    "special_features": "blue_color",
    "type": "Normal",
    "imageURLs": [
      {
        "filename": "Snorlax.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Mew",
    "standardized": "Mew",
    "chinese": "梦幻",
    "phonetic": "/mjuː/",
    "phrase": "Mew the mythical Pokemon",
    "phraseTranslation": "神话宝可梦梦幻",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "è¶è½åå±æ§ç¥è¯å®å¯æ¢¦",
    "special_features": "pink_color",
    "type": "Psychic",
    "imageURLs": [
      {
        "filename": "Mew.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },

  // === æ´å¤ç»å¸å®å¯æ¢¦ ===
  {
    "word": "Togepi",
    "standardized": "Togepi",
    "chinese": "波克比",
    "phonetic": "/ˈtoʊɡəpi/",
    "phrase": "Togepi the egg Pokemon",
    "phraseTranslation": "蛋宝可梦波克比",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "æ®éå±æ§èå®å¯æ¢¦",
    "special_features": "white_color",
    "type": "Normal",
    "imageURLs": [
      {
        "filename": "Togepi.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Clefairy",
    "standardized": "Clefairy",
    "chinese": "皮皮",
    "phonetic": "/ˈkleferi/",
    "phrase": "Clefairy the fairy Pokemon",
    "phraseTranslation": "妖精宝可梦皮皮",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "å¦ç²¾å±æ§äººå½¢å®å¯æ¢¦",
    "special_features": "pink_color",
    "type": "Fairy",
    "imageURLs": [
      {
        "filename": "Clefairy.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Squirtle",
    "standardized": "Squirtle",
    "chinese": "杰尼龟",
    "phonetic": "/ˈskwɜːrtəl/",
    "phrase": "Squirtle the water turtle",
    "phraseTranslation": "水龟杰尼龟",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "æ°´å±æ§ä¹é¾å®å¯æ¢¦",
    "special_features": "blue_color",
    "type": "Water",
    "imageURLs": [
      {
        "filename": "Squirtle.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
];

// åºäº 52poke ç File:åç¼è§£æåºå¨å½å¾é´ç¼å·ï¼ç»ä¸æ¿æ¢ä¸º PokeAPI å®æ¹ç¨³å®ç´é¾
(function enhancePokemonImageURLsForBasic() {
  try {
    const OFFICIAL_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
    const DREAM_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/";
    const FILE_RE = /File:(\d{3,4})[^.]*\.(png|jpg|svg)/i;

    function enhance(list) {
      if (!Array.isArray(list)) return;
      list.forEach(item => {
        if (!item || !Array.isArray(item.imageURLs)) return;
        // å°è¯ä»ç¬¬ä¸æ¡é¾æ¥ä¸­è§£æå¨å½å¾é´ç¼å·
        let firstEntry = item.imageURLs[0];
        let firstUrl = firstEntry && typeof firstEntry.url === 'string' ? firstEntry.url : (typeof firstEntry === 'string' ? firstEntry : null);
        let id = null;
        if (firstUrl) {
          const m = firstUrl.match(FILE_RE);
          if (m) {
            id = parseInt(m[1], 10);
          }
        }
        if (!id || isNaN(id)) return; // æ æ³è§£æåè·³è¿

        const newList = [];
    const newList = [];
    "word": "Charmander",
    "standardized": "Charmander",
    "chinese": "小火龙",
    "phonetic": "/ˈtʃɑːrmændər/",
    "phrase": "Charmander the fire lizard",
    "phraseTranslation": "火蜥蜴小火龙",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "ç«å±æ§è¥è´å®å¯æ¢¦",
    "special_features": "orange_color",
    "type": "Fire",
    "imageURLs": [
      {
        "filename": "Charmander.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  },
  {
    "word": "Bulbasaur",
    "standardized": "Bulbasaur",
    "chinese": "妙蛙种子",
    "phonetic": "/ˈbʌlbəsɔːr/",
    "phrase": "Bulbasaur the grass dinosaur",
    "phraseTranslation": "草恐龙妙蛙种子",
    "difficulty": "basic",
    "category": "pokemon",
    "age_group": "3-6",
    "game_source": "Pokemon",
    "character_context": "èå±æ§æé¾å®å¯æ¢¦",
    "special_features": "green_color",
    "type": "Grass",
    "imageURLs": [
      {
        "filename": "Bulbasaur.png",
        "url": "https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg",
        "type": "Default"
      }
    ]
  }
        // ä¼åï¼å®æ¹åç» PNG
        newList.push({ filename: `${id}.png`, url: `${OFFICIAL_BASE}${id}.png`, type: "OfficialArtwork" });
        // å¶æ¬¡ï¼Dream World SVGï¼é¨åç¼å·å¯è½ç¼ºå¤±ï¼ä½ä¸ºåéï¼
        newList.push({ filename: `${id}.svg`, url: `${DREAM_BASE}${id}.svg`, type: "DreamWorld" });

        const seen = new Set(newList.map(x => x.url));
        // ä¿çåæé¾æ¥ä½ä¸ºååºï¼å»éï¼
        item.imageURLs.forEach(u => {
          const uObj = (u && typeof u === 'object') ? u : { url: String(u || ""), filename: "", type: "Legacy" };
          if (uObj.url && !seen.has(uObj.url)) {
            newList.push({ filename: uObj.filename || "", url: uObj.url, type: uObj.type || "Legacy" });
            seen.add(uObj.url);
          }
        });
        item.imageURLs = newList;
      });
    }

    enhance(POKEMON_BASIC);
  } catch (e) {
    // éé»å¤±è´¥ï¼é¿åå½±åé¡µé¢å¶å®åè½
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Enhance Pokemon image URLs (basic) failed:', e);
    }
  }
})();

// å»éï¼æ standardized/word ä¿çé¦ä¸ªåºç°ï¼é¿åéå¤è¯æ¡
(function dedupPokemonBasic(){
  try {
    if (!Array.isArray(POKEMON_BASIC)) return;
    const seen = new Set();
    for (const item of POKEMON_BASIC) {
      const key = String((item && (item.standardized || item.word)) || '').trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      newList.push(item);
    }
    // åå°æ¿æ¢ï¼ä¿æå¼ç¨ä¸å
    POKEMON_BASIC.length = 0;
    Array.prototype.push.apply(POKEMON_BASIC, newList);
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Dedup Pokemon basic failed:', e);
    }
  }
})();

// Export vocabulary data
if (typeof module !== 'undefined' && module.exports) {
  module.exports = POKEMON_BASIC;
} else if (typeof window !== 'undefined') {
  window.POKEMON_BASIC = POKEMON_BASIC;
}
