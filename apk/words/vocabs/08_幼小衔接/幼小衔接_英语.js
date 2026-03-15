(() => {
  const BRIDGE_STAGE = "bridge";
  const BRIDGE_DIFFICULTY = "basic";

  function uniqueList(items) {
    return Array.from(new Set(items.filter(Boolean)));
  }

  function createEnglishEntry(word, moduleName, options = {}) {
    return {
      subject: "english",
      module: moduleName,
      word,
      english: word,
      mode: "english",
      phonics: options.phonics || "",
      difficulty: BRIDGE_DIFFICULTY,
      stage: BRIDGE_STAGE,
      examples: []
    };
  }

  const EXTRA_WORDS = uniqueList([
    "red", "yellow", "blue", "green", "black", "white", "purple", "orange", "pink", "brown",
    "circle", "square", "triangle", "star", "heart", "rectangle", "oval", "diamond",
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "mom", "dad", "sister", "brother", "grandma", "grandpa", "family", "baby",
    "school", "teacher", "student", "classroom", "desk", "chair", "book", "pencil", "eraser",
    "apple", "banana", "orange", "grape", "watermelon", "milk", "bread", "rice", "noodle", "egg",
    "cat", "dog", "bird", "fish", "rabbit", "duck", "panda", "tiger", "lion", "monkey",
    "sun", "moon", "star", "cloud", "rain", "snow", "wind", "sky", "tree", "flower",
    "run", "walk", "jump", "play", "read", "write", "sing", "dance", "draw", "sleep",
    "happy", "sad", "angry", "scared", "tired", "brave", "kind", "funny", "polite",
    "car", "bus", "train", "bike", "boat", "plane", "road", "bridge", "station",
    "morning", "noon", "night", "today", "tomorrow", "yesterday", "week", "month",
    "big", "small", "tall", "short", "long", "round", "fast", "slow", "hot", "cold",
    "warm", "cool", "new", "old", "clean", "dirty", "strong", "weak", "quiet", "loud",
    "head", "hair", "face", "eye", "ear", "nose", "mouth", "tooth", "hand", "arm",
    "leg", "foot", "finger", "toe", "back", "neck", "heart", "stomach", "body", "bone",
    "shirt", "pants", "dress", "skirt", "coat", "hat", "cap", "shoes", "socks", "gloves",
    "ball", "doll", "kite", "robot", "puzzle", "block", "truck", "train", "toy", "game",
    "park", "home", "house", "garden", "zoo", "farm", "store", "shop", "library", "hospital",
    "river", "lake", "sea", "ocean", "mountain", "hill", "forest", "grass", "sand", "stone",
    "water", "juice", "tea", "soup", "cake", "cookie", "candy", "meat", "fish", "cheese",
    "brother", "sister", "friend", "neighbor", "teacher", "doctor", "police", "driver", "farmer", "worker",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"
  ]);

  const ACTION_PHONICS = uniqueList([
    "go", "do", "see", "look", "hear", "say", "make", "take", "come", "give",
    "help", "open", "close", "clean", "wash", "cook", "drink", "eat", "play", "learn",
    "sit", "stand", "stop", "start", "wait", "smile", "laugh", "cry", "clap", "count",
    "draw", "write", "read", "sing", "dance", "sleep", "wake", "push", "pull", "carry"
  ]);

  const extraEnglishEntries = [
    ...EXTRA_WORDS.map((word) => createEnglishEntry(word, "拓展单词")),
    ...ACTION_PHONICS.map((word) => createEnglishEntry(word, "动作词", { phonics: word }))
  ];

  const target = (typeof BRIDGE_VOCAB_ENGLISH !== "undefined" && Array.isArray(BRIDGE_VOCAB_ENGLISH))
    ? BRIDGE_VOCAB_ENGLISH
    : [];
  extraEnglishEntries.forEach((item) => target.push(item));
  if (typeof BRIDGE_VOCAB_ENGLISH === "undefined") {
    window.BRIDGE_VOCAB_ENGLISH = target;
  }
  if (typeof BRIDGE_VOCAB_FULL !== "undefined" && Array.isArray(BRIDGE_VOCAB_FULL)) {
    extraEnglishEntries.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
  }
})();
