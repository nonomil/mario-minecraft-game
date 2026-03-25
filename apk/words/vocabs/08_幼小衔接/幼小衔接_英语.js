(() => {
  const BRIDGE_STAGE = "bridge";
  const BRIDGE_DIFFICULTY = "basic";

  function uniqueList(items) {
    return Array.from(new Set(items.filter(Boolean)));
  }

  function getEnglishEntryKey(item) {
    const moduleName = String(item?.module || "").trim();
    const word = String(item?.word || item?.english || "").trim().toLowerCase();
    return `${moduleName}::${word}`;
  }

  function uniqueEnglishEntries(items) {
    const seen = new Set();
    return (Array.isArray(items) ? items : []).filter((item) => {
      const key = getEnglishEntryKey(item);
      if (!key || key.endsWith("::")) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function createEnglishEntry(word, moduleName, options = {}) {
    return {
      subject: "english",
      module: moduleName,
      word,
      english: word,
      mode: "english",
      phonics: options.phonics || "",
      gradeBand: String(options.gradeBand || "").trim(),
      difficulty: BRIDGE_DIFFICULTY,
      stage: BRIDGE_STAGE,
      examples: []
    };
  }

  const CORE_WORDS = uniqueList([
    "hello", "goodbye", "please", "sorry", "thanks", "yes", "no", "this", "that", "here", "there", "what", "where", "who",
    "red", "yellow", "blue", "green", "black", "white", "purple", "orange", "pink", "brown",
    "circle", "square", "triangle", "star", "heart",
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "mom", "dad", "sister", "brother", "grandma", "grandpa", "family", "baby", "boy", "girl",
    "school", "teacher", "student", "classroom", "desk", "chair", "book", "pencil", "eraser", "pen", "bag", "door", "window", "bed", "cup", "clock", "plate",
    "apple", "banana", "orange", "grape", "watermelon", "milk", "bread", "rice", "noodle", "egg",
    "cat", "dog", "bird", "fish", "rabbit", "duck", "panda", "tiger", "lion", "monkey",
    "sun", "moon", "star", "cloud", "rain", "snow", "wind", "sky", "tree", "flower",
    "run", "walk", "jump", "play", "read", "write", "sing", "dance", "draw", "sleep",
    "happy", "sad", "angry", "scared", "tired", "brave", "kind", "funny", "polite",
    "car", "bus", "train", "bike", "boat", "plane", "road",
    "morning", "night", "today", "tomorrow",
    "big", "small", "tall", "short", "long", "round", "fast", "slow", "hot", "cold",
    "warm", "cool", "new", "old", "clean", "dirty", "strong", "weak",
    "head", "hair", "face", "eye", "ear", "nose", "mouth", "tooth", "hand", "arm",
    "leg", "foot", "finger", "toe", "back", "body",
    "shirt", "pants", "dress", "skirt", "coat", "hat", "shoes", "socks",
    "ball", "doll", "kite", "robot", "puzzle", "block", "truck", "train", "toy", "game",
    "park", "home", "house", "garden", "zoo", "farm", "store", "shop",
    "river", "lake", "sea", "hill", "grass", "sand",
    "water", "juice", "tea", "soup", "cake", "cookie", "candy",
    "friend", "teacher", "doctor", "farmer",
    "monday", "tuesday", "friday", "saturday", "sunday",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen"
  ]);

  const GRADE12_WORDS = uniqueList([
    "rectangle", "oval", "diamond", "yesterday", "week", "month", "bridge", "noon",
    "neck", "heart", "cap", "gloves", "library", "hospital",
    "driver", "quiet", "loud", "mountain", "forest", "stone", "meat",
    "kitchen", "bedroom", "bathroom", "picture", "computer", "notebook", "calendar",
    "wednesday", "thursday", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"
  ]);

  const CORE_ACTION_WORDS = uniqueList([
    "go", "do", "see", "look", "hear", "say", "make", "take", "come", "give",
    "help", "open", "close", "clean", "wash", "cook", "drink", "eat", "play", "learn",
    "sit", "stand", "stop", "start", "wait", "smile", "laugh", "cry", "clap", "count",
    "draw", "write", "read", "sing", "dance", "sleep", "wake", "push", "pull", "carry"
  ]);

  const GRADE12_ACTION_WORDS = uniqueList([
    "share", "follow", "listen", "answer", "compare", "choose", "finish", "remember"
  ]);

  const BLOCKED_ENGLISH_WORDS = new Set([
    "brain", "cardigan", "leggings", "earmuffs", "beanie", "hoodie", "overalls", "sphere", "pyramid", "zigzag",
    "ce", "ci", "cu", "ge", "gi", "gu", "vu", "yu", "zu",
    "igh", "tch", "est", "ad", "ag", "eg", "og",
    "compare", "remember", "follow"
  ]);

  function shouldKeepEnglishEntry(item) {
    const word = String(item?.word || item?.english || "").trim().toLowerCase();
    if (!word) return false;
    return !BLOCKED_ENGLISH_WORDS.has(word);
  }

  const extraEnglishEntries = [
    ...CORE_WORDS.map((word) => createEnglishEntry(word, "启蒙单词", { gradeBand: "学前-一年级" })),
    ...GRADE12_WORDS.map((word) => createEnglishEntry(word, "拓展单词", { gradeBand: "一年级-二年级" })),
    ...CORE_ACTION_WORDS.map((word) => createEnglishEntry(word, "动作词", { phonics: word, gradeBand: "学前-一年级" })),
    ...GRADE12_ACTION_WORDS.map((word) => createEnglishEntry(word, "动作词", { phonics: word, gradeBand: "一年级-二年级" }))
  ];

  const target = (typeof BRIDGE_VOCAB_ENGLISH !== "undefined" && Array.isArray(BRIDGE_VOCAB_ENGLISH))
    ? BRIDGE_VOCAB_ENGLISH
    : [];
  extraEnglishEntries.forEach((item) => target.push(item));
  const normalizedTarget = uniqueEnglishEntries(target).filter(shouldKeepEnglishEntry);
  target.length = 0;
  normalizedTarget.forEach((item) => target.push(item));
  if (typeof BRIDGE_VOCAB_ENGLISH === "undefined") {
    window.BRIDGE_VOCAB_ENGLISH = target;
  }
  if (typeof BRIDGE_VOCAB_FULL !== "undefined" && Array.isArray(BRIDGE_VOCAB_FULL)) {
    extraEnglishEntries.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
    const englishEntries = uniqueEnglishEntries(BRIDGE_VOCAB_FULL.filter((item) => item?.subject === "english")).filter(shouldKeepEnglishEntry);
    const others = BRIDGE_VOCAB_FULL.filter((item) => item?.subject !== "english");
    BRIDGE_VOCAB_FULL.length = 0;
    others.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
    englishEntries.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
  }
})();
