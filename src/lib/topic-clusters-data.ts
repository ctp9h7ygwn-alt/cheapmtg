export interface ClusterCard {
  oracle_id: string;
  name: string;
  mana_value: number;
  type_line: string;
  oracle_text: string;
  price_usd: number;
  image_uri: string;
  color_identity: string[];
  colors: string[];
  tags: string[];
  tcgplayer_url: string;
  manapool_url: string;
}

export interface ClusterMeta {
  slug: string;
  title: string;
  shortTitle: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  roleDescription: string;
  targetTags: string[];
  fallbackKeywords: string[];
  keyExpensiveStaples: { name: string; slug: string; price: number; reason: string }[];
  subcategories: {
    title: string;
    description: string;
    tags: string[];
    maxPrice?: number;
  }[];
  faqs: { question: string; answer: string }[];
}

export const TOPIC_CLUSTERS: Record<string, ClusterMeta> = {
  'card-draw': {
    slug: 'card-draw',
    title: 'Budget Card Draw for Commander',
    shortTitle: 'Card Draw',
    metaTitle: 'Best Budget Card Draw for Commander (Under $1 & $2 Options) | MTGCheap',
    metaDescription: 'Discover the top budget card draw spells, engines, and burst draw staples for Commander. Find cheap alternatives to Rhystic Study, Esper Sentinel, and The One Ring.',
    heroHeadline: 'Best Budget Card Draw for Commander',
    heroSubheadline: 'Never run out of gas. Discover high-efficiency card advantage engines, burst draw spells, and cantrips under $2 for every color identity in EDH.',
    roleDescription: 'Card draw is the lifeblood of Commander. While staples like Rhystic Study ($40+) and The One Ring ($100+) command premium prices, dozens of budget alternatives deliver comparable card velocity for 95% less.',
    targetTags: ['card-draw', 'repeatable-pure-draw', 'burst-draw', 'loot', 'impulse-draw', 'cantrip', 'draw-tax'],
    fallbackKeywords: ['draw', 'draws', 'draw a card', 'draw two cards', 'draw three cards'],
    keyExpensiveStaples: [
      { name: 'Rhystic Study', slug: 'budget-options-for-rhystic-study', price: 42.0, reason: 'Continuous tax-based card draw' },
      { name: 'The One Ring', slug: 'budget-options-for-the-one-ring', price: 105.0, reason: 'Protection + compounding burst draw' },
      { name: 'Esper Sentinel', slug: 'budget-options-for-esper-sentinel', price: 34.0, reason: 'Turn-one creature-based noncreature draw tax' },
      { name: 'Sylvan Library', slug: 'budget-options-for-sylvan-library', price: 28.0, reason: 'Top-of-deck filtering and multi-card draw engine' },
    ],
    subcategories: [
      { title: 'Burst Draw', description: 'Immediate, high-volume draw spells to refill an empty hand in the mid-to-late game.', tags: ['burst-draw'] },
      { title: 'Repeatable Engines', description: 'Permanents that draw cards every turn cycle through combat, spells, or passive triggers.', tags: ['repeatable-pure-draw', 'draw-tax'] },
      { title: 'Looting & Impulse Draw', description: 'Red and Blue hand filtering and temporary card advantage.', tags: ['loot', 'impulse-draw'] },
    ],
    faqs: [
      { question: 'What is the best cheap card draw in Commander?', answer: 'Top budget draw engines include Mystic Remora ($6), Unifying Theory ($0.44), Night’s Whisper ($1.20), Painful Truths ($0.35), Chart a Course ($0.25), and Beast Whisperer ($1.50).' },
      { question: 'How much card draw should a budget Commander deck run?', answer: 'A balanced Commander deck should run at least 10 to 12 dedicated card advantage sources, mixing repeatable draw engines with cheap 1–3 CMC burst card draw.' },
      { question: 'What are the best White card draw cards under $1?', answer: 'Secret Rendezvous ($0.25), Welcoming Vampire ($1.25), Tocasia’s Welcome ($1.90), Cut a Deal ($0.30), and Your Temple Is Under Attack ($0.35) are premier budget White draw spells.' },
    ],
  },

  'ramp': {
    slug: 'ramp',
    title: 'Budget Ramp & Mana Rocks for Commander',
    shortTitle: 'Ramp & Mana Rocks',
    metaTitle: 'Best Budget Ramp & Cheap Mana Rocks for Commander | MTGCheap',
    metaDescription: 'Find the best budget ramp spells, cheap mana rocks, and land acceleration for EDH. Affordable alternatives to Mana Crypt, Mox Diamond, and Dockside Extortionist.',
    heroHeadline: 'Best Budget Ramp & Mana Rocks for Commander',
    heroSubheadline: 'Accelerate your game plan without spending a fortune. Top 2-drop mana rocks, green land ramp spells, and mana dorks under $1.50.',
    roleDescription: 'Ramp allows you to cast your Commander ahead of curve and out-mana your opponents. You don’t need $100 fast mana when efficient 2-mana rocks and basic land fetchers get the job done reliably.',
    targetTags: ['mana-rock', 'ramp-land', 'mana-dork', 'treasure', 'cost-reducer', 'mana-accelerator'],
    fallbackKeywords: ['search your library for a basic land', 'add {', 'add one mana of any color', 'create a treasure token'],
    keyExpensiveStaples: [
      { name: 'Mana Crypt', slug: 'budget-options-for-mana-crypt', price: 180.0, reason: 'Zero-mana explosive 2-mana rock' },
      { name: 'Dockside Extortionist', slug: 'budget-options-for-dockside-extortionist', price: 90.0, reason: 'Massive treasure burst scaling with opponent permanents' },
      { name: 'Chrome Mox', slug: 'budget-options-for-chrome-mox', price: 95.0, reason: 'Zero-mana colored fast mana artifact' },
      { name: 'Ancient Tomb', slug: 'budget-options-for-ancient-tomb', price: 85.0, reason: 'Repeatable 2-mana land on turn one' },
    ],
    subcategories: [
      { title: '2-CMC Mana Rocks', description: 'The gold standard of non-green ramp for fixing and accelerating on turn two.', tags: ['mana-rock'] },
      { title: 'Land Fetchers', description: 'Permanent, untargetable land acceleration that thins your library.', tags: ['ramp-land'] },
      { title: 'Treasure Generators', description: 'Burst ramp producing flexible colored mana tokens for explosive turns.', tags: ['treasure'] },
    ],
    faqs: [
      { question: 'What are the best mana rocks under $1 for Commander?', answer: 'Arcane Signet ($0.45), Sol Ring ($1.25), Mind Stone ($0.25), Fellwar Stone ($0.65), Talisman cycles ($0.50–$1.50), and Signet cycles ($0.30–$0.75) are the top budget mana rocks.' },
      { question: 'Is 3-mana ramp good in budget Commander?', answer: 'While 2-mana ramp is generally optimal, 3-mana rocks with utility (like Commander’s Sphere, Decanter of Endless Water, and Cultivate/Kodama’s Reach for land ramp) are great in budget 3+ color decks.' },
      { question: 'How many ramp spells should be in a budget EDH deck?', answer: 'We recommend 10 to 14 ramp sources in the average Commander deck to consistently hit 4+ mana by turn 3.' },
    ],
  },

  'removal': {
    slug: 'removal',
    title: 'Budget Removal Spells for Commander',
    shortTitle: 'Removal Spells',
    metaTitle: 'Best Budget Removal Spells for Commander (Exile & Instant Speed) | MTGCheap',
    metaDescription: 'Explore the best cheap removal spells for Commander. Affordable instant-speed creature, artifact, and enchantment answers under $1.00.',
    heroHeadline: 'Best Budget Removal Spells for Commander',
    heroSubheadline: 'Answer any threat on the board. The top budget single-target removal, exile spells, and flexible interaction in Magic: The Gathering.',
    roleDescription: 'Targeted removal keeps combo players in check and eliminates game-ending threats. Efficient 1-to-2 mana interaction is widely available at common and uncommon prices.',
    targetTags: ['removal', 'creature-removal', 'artifact-removal', 'enchantment-removal', 'exile-target', 'fight'],
    fallbackKeywords: ['destroy target', 'exile target', 'destroy target creature', 'exile target permanent'],
    keyExpensiveStaples: [
      { name: 'Deadly Rollick', slug: 'budget-options-for-deadly-rollick', price: 24.0, reason: 'Free instant-speed creature exile with Commander out' },
      { name: 'Force of Vigor', slug: 'budget-options-for-force-of-vigor', price: 22.0, reason: 'Free instant 2-for-1 artifact/enchantment removal' },
      { name: 'Assassin\'s Trophy', slug: 'budget-options-for-assassins-trophy', price: 4.5, reason: 'Unconditional 2-mana permanent destruction' },
      { name: 'Toxic Deluge', slug: 'budget-options-for-toxic-deluge', price: 9.0, reason: 'Flexible life-based creature removal' },
    ],
    subcategories: [
      { title: 'Spot Creature Removal', description: 'Instant-speed answers to commanders and dangerous combat threats.', tags: ['creature-removal'] },
      { title: 'Disenchant & Naturalize Effects', description: 'Cheap answers to problem artifacts, enchantments, and value engines.', tags: ['artifact-removal', 'enchantment-removal'] },
      { title: 'Flexible Universal Removal', description: 'Spells that can hit any nonland permanent or multiple permanent types.', tags: ['removal'] },
    ],
    faqs: [
      { question: 'What is the best budget removal in Commander?', answer: 'Swords to Plowshares ($1.20), Path to Exile ($1.00), Infernal Grasp ($0.45), Feed the Swarm ($0.25), Chaos Warp ($0.85), Generous Gift ($0.65), Beast Within ($0.95), and Pongify ($2.00).' },
      { question: 'Why is instant-speed removal critical in EDH?', answer: 'Instant speed lets you respond to opponent combo attempts on their turn, eliminate attackers during combat, and hold open mana for bluffing or optional interaction.' },
    ],
  },

  'board-wipes': {
    slug: 'board-wipes',
    title: 'Budget Board Wipes for Commander',
    shortTitle: 'Board Wipes',
    metaTitle: 'Best Budget Board Wipes for Commander (Sweepers Under $1 & $2) | MTGCheap',
    metaDescription: 'Find top budget board wipes and mass creature sweepers for EDH. Inexpensive alternatives to Cyclonic Rift, Toxic Deluge, and Farewell.',
    heroHeadline: 'Best Budget Board Wipes for Commander',
    heroSubheadline: 'Hit the reset button when behind. Top budget mass removal spells, asymmetrical sweepers, and damage board wipes under $1.50.',
    roleDescription: 'Board wipes reset runaway board states and give slower decks a chance to stabilize. Great sweepers do not have to cost $15–$40.',
    targetTags: ['board-wipe', 'mass-bounce', 'mass-damage', 'asymmetrical-bounce', 'wrath'],
    fallbackKeywords: ['destroy all creatures', 'exile all creatures', 'return all nonland permanents', 'each player sacrifices'],
    keyExpensiveStaples: [
      { name: 'Cyclonic Rift', slug: 'budget-options-for-cyclonic-rift', price: 38.0, reason: 'Instant-speed one-sided nonland board wipe' },
      { name: 'Farewell', slug: 'budget-options-for-farewell', price: 12.0, reason: 'Modal mass exile hitting creatures, artifacts, enchantments, graveyards' },
      { name: 'Meathook Massacre', slug: 'budget-options-for-the-meathook-massacre', price: 40.0, reason: 'Scalable -X/-X wipe that doubles as an aristocrat drain engine' },
    ],
    subcategories: [
      { title: '4-CMC Clean Sweepers', description: 'The gold standard unconditional wraths that destroy all creatures.', tags: ['board-wipe'] },
      { title: 'One-Sided & Asymmetrical Wipes', description: 'Sweepers that leave your own board intact while devastating opponents.', tags: ['asymmetrical-bounce', 'mass-bounce'] },
      { title: 'Exile & Anti-Indestructible', description: 'Sweepers that bypass totem armor, regeneration, and indestructible.', tags: ['board-wipe'] },
    ],
    faqs: [
      { question: 'What is the cheapest board wipe in Magic: The Gathering?', answer: 'Blasphemous Act ($1.80, often costs {R}), Day of Judgment ($0.75), Fumigate ($0.35), Crux of Fate ($0.80), Time Wipe ($0.30), and Evacuation ($0.60) are among the best cheap wipes.' },
      { question: 'How many board wipes should a Commander deck run?', answer: 'Most decks run 2 to 4 board wipes. Control and combo decks often run 4 to 6, while aggressive token decks might run 1 to 2 asymmetrical ones.' },
    ],
  },

  'protection': {
    slug: 'protection',
    title: 'Budget Protection Spells for Commander',
    shortTitle: 'Protection Spells',
    metaTitle: 'Best Budget Protection Spells for Commander (Hexproof & Phasing) | MTGCheap',
    metaDescription: 'Protect your Commander and board on a budget. Cheap alternatives to Teferi\'s Protection, Heroic Intervention, and Fierce Guardianship.',
    heroHeadline: 'Best Budget Protection Spells for Commander',
    heroSubheadline: 'Save your key creatures and board from removal. Top hexproof, indestructible, flicker, and phasing spells under $1.50.',
    roleDescription: 'Investing mana into a Commander is risky without protection. Budget interaction allows you to blow out opponent removal spells for 1–2 mana.',
    targetTags: ['protection', 'hexproof', 'indestructible', 'phasing', 'blink', 'flicker', 'fog'],
    fallbackKeywords: ['gain hexproof', 'gain indestructible', 'phase out', 'prevent all combat damage', 'exile target permanent you control, then return'],
    keyExpensiveStaples: [
      { name: 'Teferi\'s Protection', slug: 'budget-options-for-teferis-protection', price: 38.0, reason: 'Complete phasing + protection from all damage and life loss' },
      { name: 'Heroic Intervention', slug: 'budget-options-for-heroic-intervention', price: 9.5, reason: '2-mana instant hexproof + indestructible for your whole board' },
      { name: 'Fierce Guardianship', slug: 'budget-options-for-fierce-guardianship', price: 42.0, reason: 'Free noncreature counterspell with Commander out' },
      { name: 'Flawless Maneuver', slug: 'budget-options-for-flawless-maneuver', price: 11.0, reason: 'Free indestructible board protection with Commander' },
    ],
    subcategories: [
      { title: 'Single-Target Protection', description: '1-mana instant hexproof, shroud, or indestructible spells to protect your commander.', tags: ['protection', 'hexproof'] },
      { title: 'Board-Wide Shielding', description: 'Spells that protect your entire permanent array from opponent wraths and damage.', tags: ['indestructible', 'phasing'] },
      { title: 'Flicker & Blink Evasion', description: 'Instant blinks that dodge removal, reset counters, and re-trigger enter-the-battlefield abilities.', tags: ['blink', 'flicker'] },
    ],
    faqs: [
      { question: 'What is the best budget alternative to Teferi\'s Protection?', answer: 'Clever Concealment ($2.50), Your Temple Is Under Attack ($0.35), Guardian of Faith ($2.00), Make a Stand ($0.20), and Rootborn Defenses ($0.25) provide incredible budget protection.' },
      { question: 'What are the best 1-mana protection spells in Green and Blue?', answer: 'Tamiyo\'s Safekeeping ($0.45), Tyvar\'s Stand ($0.50), Snakeskin Veil ($0.25), Slip Out the Back ($1.10), and Shore Up ($0.15).' },
    ],
  },

  'counterspells': {
    slug: 'counterspells',
    title: 'Budget Counterspells for Commander',
    shortTitle: 'Counterspells',
    metaTitle: 'Best Budget Counterspells for Commander (Under $1.00) | MTGCheap',
    metaDescription: 'Find the most efficient budget counterspells in EDH. Inexpensive alternatives to Force of Will, Mana Drain, and Fierce Guardianship.',
    heroHeadline: 'Best Budget Counterspells for Commander',
    heroSubheadline: 'Dictate the stack on a budget. Top hard counters, tax counterspells, and surprise off-color answers under $1.',
    roleDescription: 'Counterspells are the ultimate insurance against opposing combos, board wipes, and game-winning spells. You don’t need $80 Force of Wills to stop game-winning threats.',
    targetTags: ['counterspell', 'tax-counter', 'negate', 'soft-counter'],
    fallbackKeywords: ['counter target spell', 'counter target noncreature spell', 'unless its controller pays'],
    keyExpensiveStaples: [
      { name: 'Force of Will', slug: 'budget-options-for-force-of-will', price: 65.0, reason: 'Free pitch counterspell on any turn' },
      { name: 'Mana Drain', slug: 'budget-options-for-mana-drain', price: 40.0, reason: '2-mana hard counter that converts opponent CMC into colorless mana' },
      { name: 'Fierce Guardianship', slug: 'budget-options-for-fierce-guardianship', price: 42.0, reason: 'Free noncreature counterspell with Commander' },
      { name: 'Pact of Negation', slug: 'budget-options-for-pact-of-negation', price: 13.0, reason: 'Zero-mana counterspell with upkeep payment' },
    ],
    subcategories: [
      { title: '2-CMC Hard & Semi-Hard Counters', description: 'The core interactive suite that stops noncreature spells, commanders, or wincons for {1}{U} or {U}{U}.', tags: ['counterspell'] },
      { title: '1-CMC Tactical Counters', description: 'Ultra-lean interaction to win counter wars and protect your own combo turns.', tags: ['counterspell'] },
      { title: 'Off-Color Counterspells', description: 'Surprise counter magic in Red, White, and Green (e.g. Tibalt\'s Trickery, Pyroblast, Reprieve).', tags: ['counterspell'] },
    ],
    faqs: [
      { question: 'What is the best budget counterspell for Commander?', answer: 'Counterspell ($1.25), Negate ($0.20), Arcane Denial ($1.40), Delay ($1.50), Disdainful Stroke ($0.20), An Offer You Can\'t Refuse ($1.50), and Spell Pierce ($0.30).' },
      { question: 'Why is Arcane Denial considered great in budget EDH?', answer: 'Arcane Denial only costs {1}{U}, hard counters any spell regardless of type or CMC, and replaces itself by drawing you a card on the next upkeep.' },
    ],
  },

  'tutors': {
    slug: 'tutors',
    title: 'Budget Tutors & Consistency Helpers for Commander',
    shortTitle: 'Tutors & Consistency',
    metaTitle: 'Best Budget Tutors for Commander (Find Key Cards Cheaply) | MTGCheap',
    metaDescription: 'Discover budget tutors, transmute cards, and search consistency engines in Magic: The Gathering. Cheap alternatives to Demonic Tutor and Vampiric Tutor.',
    heroHeadline: 'Best Budget Tutors & Consistency Helpers',
    heroSubheadline: 'Find your win conditions and answers on command. Top budget tutors, transmute spells, and type-specific search cards under $2.50.',
    roleDescription: 'Tutors increase deck consistency and allow you to find the right answer at the right time. While Demonic Tutor and Vampiric Tutor cost $40+, targeted tutors and transmute cards offer immense value on a budget.',
    targetTags: ['tutor', 'creature-tutor', 'artifact-tutor', 'enchantment-tutor', 'transmute'],
    fallbackKeywords: ['search your library for a card', 'search your library for a creature card', 'transmute'],
    keyExpensiveStaples: [
      { name: 'Demonic Tutor', slug: 'budget-options-for-demonic-tutor', price: 42.0, reason: 'Unconditional 2-mana tutor directly to hand' },
      { name: 'Vampiric Tutor', slug: 'budget-options-for-vampiric-tutor', price: 38.0, reason: '1-mana instant tutor to the top of library' },
      { name: 'Worldly Tutor', slug: 'budget-options-for-worldly-tutor', price: 16.0, reason: '1-mana instant creature tutor to top of library' },
      { name: 'Enlightened Tutor', slug: 'budget-options-for-enlightened-tutor', price: 20.0, reason: '1-mana instant artifact/enchantment tutor' },
    ],
    subcategories: [
      { title: 'Transmute Cards', description: 'Uncounterable ability-based tutors that find any card sharing the exact same mana value.', tags: ['transmute'] },
      { title: 'Type-Specific Tutors', description: 'Targeted search cards that find specific archetypes like enchantments, artifacts, or creatures.', tags: ['creature-tutor', 'artifact-tutor'] },
      { title: 'Top-Deck & Reveal Tutors', description: 'Budget search spells with slight delays or casting conditions.', tags: ['tutor'] },
    ],
    faqs: [
      { question: 'What is the best budget black tutor in Commander?', answer: 'Diabolic Intent ($4.50), Wishclaw Talisman ($2.80), Profane Tutor ($1.90), Beseech the Queen ($2.00), and Diabolic Tutor ($0.75).' },
      { question: 'How does Transmute work as a budget tutor?', answer: 'Transmute is an activated ability from your hand: pay 3 mana, discard the card, and search your library for any card with the exact same mana value (e.g. Muddle the Mixture searches for any 2-CMC card).' },
    ],
  },

  'lands': {
    slug: 'lands',
    title: 'Best Budget Lands for Commander',
    shortTitle: 'Budget Lands',
    metaTitle: 'Best Budget Lands for Commander (Utility & Fixing Under $1) | MTGCheap',
    metaDescription: 'Upgrade your Commander land base on a budget. Top utility lands, untapped fixing, and graveyard hate lands under $1.50.',
    heroHeadline: 'Best Budget Lands for Commander',
    heroSubheadline: 'Maximized utility without the fetchland price tag. Discover the highest-value budget utility lands and color fixing in EDH.',
    roleDescription: 'Lands produce mana every turn without consuming a spell slot. Leveraging utility lands with built-in card draw, removal, and recursion dramatically elevates budget deck power.',
    targetTags: ['land', 'utility-land', 'fetch-land', 'dual-land', 'tri-land'],
    fallbackKeywords: ['{t}: add', 'enters the battlefield tapped', 'search your library for a basic land card'],
    keyExpensiveStaples: [
      { name: 'Ancient Tomb', slug: 'budget-options-for-ancient-tomb', price: 85.0, reason: 'Repeatable 2-mana land acceleration' },
      { name: 'Urza\'s Saga', slug: 'budget-options-for-urzas-saga', price: 38.0, reason: 'Land that creates constructs and tutors 0/1 mana artifacts' },
      { name: 'Boseiju, Who Endures', slug: 'budget-options-for-boseiju-who-endures', price: 36.0, reason: 'Uncounterable channel artifact/enchantment/nonbasic removal' },
      { name: 'Cavern of Souls', slug: 'budget-options-for-cavern-of-souls', price: 35.0, reason: 'Uncounterable tribal creature mana fixing' },
    ],
    subcategories: [
      { title: 'Essential Colorless Utility', description: 'Lands that fit in any deck regardless of color identity for card draw, protection, and removal.', tags: ['utility-land'] },
      { title: 'Graveyard & Threat Interaction', description: 'Lands like Demolition Field and Scavenger Grounds that interact with opponent strategies.', tags: ['utility-land'] },
      { title: 'Color Fixing & Multi-Color Staples', description: 'Command Tower, Exotic Orchard, and Path of Ancestry that fix all colors.', tags: ['land'] },
    ],
    faqs: [
      { question: 'What is the single best budget land in Commander?', answer: 'Command Tower ($0.25) and Exotic Orchard ($0.20) are the undisputed best budget lands, tapping for any color your commander needs with zero drawbacks.' },
      { question: 'What budget utility lands should every deck run?', answer: 'Demolition Field ($0.30) to kill dangerous opponent lands, Scavenger Grounds ($0.45) for graveyard wipe, and Rogue\'s Passage ($0.35) for unblockable lethal attacks.' },
    ],
  },

  'dual-lands': {
    slug: 'dual-lands',
    title: 'Cheap Dual Lands for Commander',
    shortTitle: 'Cheap Dual Lands',
    metaTitle: 'Cheap Dual Lands for Commander (Ranked by Speed & Budget) | MTGCheap',
    metaDescription: 'Find the best budget untapped dual lands for Commander. Complete guide to Pain Lands, Check Lands, Tango Lands, and Bounce Lands under $1–$2.',
    heroHeadline: 'Cheap Dual Lands for Commander',
    heroSubheadline: 'Fix your colors without breaking the bank. Complete rankings of budget untapped dual land cycles for 2, 3, 4, and 5-color decks.',
    roleDescription: 'Original Dual Lands ($400+) and Fetch Lands ($15–$30) are not required to build a smooth, fast mana base. Painlands, Checklands, and Tango lands offer 90% of the speed for a fraction of the cost.',
    targetTags: ['dual-land', 'pain-land', 'check-land', 'tango-land', 'bounce-land', 'filter-land'],
    fallbackKeywords: ['enters the battlefield tapped unless', 'pay 1 life: add', 'return a land you control to its owner\'s hand'],
    keyExpensiveStaples: [
      { name: 'Volcanic Island', slug: 'budget-options-for-volcanic-island', price: 650.0, reason: 'ABUR dual land with zero drawback' },
      { name: 'Scalding Tarn', slug: 'budget-options-for-scalding-tarn', price: 22.0, reason: 'Fetches any Island or Mountain untapped' },
      { name: 'Steam Vents', slug: 'budget-options-for-steam-vents', price: 16.0, reason: 'Shock land with basic land types' },
      { name: 'Morphic Pool', slug: 'budget-options-for-morphic-pool', price: 14.0, reason: 'Battlebond crowd land entering untapped in multiplayer' },
    ],
    subcategories: [
      { title: 'Pain Lands (Top Speed)', description: 'Enter untapped on turn 1 unconditionally and tap for colorless mana for free or colored mana for 1 life.', tags: ['pain-land', 'dual-land'] },
      { title: 'Check Lands & Tango Lands', description: 'Enter untapped if you control matching basic land types.', tags: ['check-land', 'tango-land'] },
      { title: 'Bounce Lands (Card Advantage)', description: 'Provide two mana per land drop, effectively acting as free card advantage in slower decks.', tags: ['bounce-land'] },
    ],
    faqs: [
      { question: 'What is the cheapest untapped dual land cycle in MTG?', answer: 'Pain Lands (e.g. Caves of Koilos, Yavimaya Coast, Shivan Reef, Llanowar Wastes) regularly cost between $0.40 and $1.00 and enter untapped 100% of the time.' },
      { question: 'How many dual lands should a 3-color budget deck run?', answer: 'A 3-color budget deck should run roughly 9–12 dual lands (3 of each pair), 3 Tri-lands/Panoramas, 4–5 utility lands, and 12–15 basic lands.' },
    ],
  },

  'mana-rocks': {
    slug: 'mana-rocks',
    title: 'Best Budget Mana Rocks for Commander',
    shortTitle: 'Mana Rocks',
    metaTitle: 'Best Budget Mana Rocks for Commander (Under $1 & $2 Options) | MTGCheap',
    metaDescription: 'Discover the top budget mana rocks and fast artifact ramp for EDH. Inexpensive alternatives to Mana Crypt, Mox Opal, Jeweled Lotus, and Grim Monolith.',
    heroHeadline: 'Best Budget Mana Rocks for Commander',
    heroSubheadline: 'Fix your colors and accelerate on turn two. The top budget 2-drop artifact rocks, signets, talismans, and utility rocks under $1.50.',
    roleDescription: 'Mana rocks ensure non-green decks can ramp reliably on curve without relying on $100+ fast mana staples. Efficient 2-mana rocks like Talismans, Signets, Mind Stone, and Fellwar Stone provide 90% of the acceleration for pennies.',
    targetTags: ['mana-rock', 'treasure', 'cost-reducer', 'fast-mana'],
    fallbackKeywords: ['{t}: add', 'add one mana of any color', 'add {c}{c}'],
    keyExpensiveStaples: [
      { name: 'Mana Crypt', slug: 'budget-options-for-mana-crypt', price: 180.0, reason: 'Zero-mana explosive 2-mana rock' },
      { name: 'Mox Opal', slug: 'budget-options-for-mox-opal', price: 75.0, reason: 'Zero-mana colored fast mana artifact' },
      { name: 'Grim Monolith', slug: 'budget-options-for-grim-monolith', price: 240.0, reason: '2-mana artifact tapping for 3 colorless mana' },
      { name: 'Chrome Mox', slug: 'budget-options-for-chrome-mox', price: 95.0, reason: 'Zero-mana imprint colored fast mana' },
    ],
    subcategories: [
      { title: '2-CMC Untapped Color Fixing', description: 'Talismans and Fellwar Stone that produce colored mana the turn they enter.', tags: ['mana-rock'] },
      { title: 'Generic Mana Rocks with Utility', description: 'Mind Stone and Thought Vessel that ramp early and provide late-game utility.', tags: ['mana-rock'] },
      { title: '3-CMC Color Fixing & Draw', description: 'Commander\'s Sphere and Decanter of Endless Water for 3+ color decks.', tags: ['mana-rock'] },
    ],
    faqs: [
      { question: 'What is the single best budget mana rock in Commander?', answer: 'Sol Ring ($1.25) and Arcane Signet ($0.45) are the undisputed best budget mana rocks, providing untapped fixing with zero drawback.' },
      { question: 'Why are 2-mana rocks better than 3-mana rocks?', answer: '2-mana rocks let you curve out on turn two, enabling you to cast 4-mana commanders and spells on turn three.' },
      { question: 'What are the cheapest untapped mana rocks in MTG?', answer: 'Fellwar Stone ($0.65), Mind Stone ($0.25), and the 10-card Talisman cycle ($0.40–$1.20) are the top cheap untapped rocks.' },
    ],
  },
};

// Mana Base Recommendation Calculator (Client Safe)
export interface ManaBaseRecommendation {
  colorCount: number;
  totalLands: number;
  basics: { name: string; count: number; color: string }[];
  dualLands: { name: string; type: string; price: number; entersUntapped: boolean; colors: string[] }[];
  utilityLands: { name: string; role: string; price: number }[];
  triLands: { name: string; price: number; colors: string[] }[];
  summaryNote: string;
}

const COLOR_MAP: Record<string, { basic: string; painLand: string; checkLand: string; tangoLand: string; bounceLand: string }> = {
  WU: { basic: 'Plains / Island', painLand: 'Adarkar Wastes', checkLand: 'Glacial Fortress', tangoLand: 'Prairie Stream', bounceLand: 'Azorius Chancery' },
  UB: { basic: 'Island / Swamp', painLand: 'Underground River', checkLand: 'Drowned Catacomb', tangoLand: 'Sunken Hollow', bounceLand: 'Dimir Aqueduct' },
  BR: { basic: 'Swamp / Mountain', painLand: 'Sulfurous Springs', checkLand: 'Dragonskull Summit', tangoLand: 'Smoldering Marsh', bounceLand: 'Rakdos Carnarium' },
  RG: { basic: 'Mountain / Forest', painLand: 'Karplusan Forest', checkLand: 'Rootbound Crag', tangoLand: 'Cinder Glade', bounceLand: 'Gruul Turf' },
  GW: { basic: 'Forest / Plains', painLand: 'Brushland', checkLand: 'Sunpetal Grove', tangoLand: 'Canopy Vista', bounceLand: 'Selesnya Sanctuary' },
  WB: { basic: 'Plains / Swamp', painLand: 'Caves of Koilos', checkLand: 'Isolated Chapel', tangoLand: 'Shineshadow Snarl', bounceLand: 'Orzhov Basilica' },
  BG: { basic: 'Swamp / Forest', painLand: 'Llanowar Wastes', checkLand: 'Woodland Cemetery', tangoLand: 'Necroblossom Snarl', bounceLand: 'Golgari Rot Farm' },
  GU: { basic: 'Forest / Island', painLand: 'Yavimaya Coast', checkLand: 'Hinterland Harbor', tangoLand: 'Vineglimmer Snarl', bounceLand: 'Simic Growth Chamber' },
  UR: { basic: 'Island / Mountain', painLand: 'Shivan Reef', checkLand: 'Sulfur Falls', tangoLand: 'Frostboil Snarl', bounceLand: 'Izzet Boilerworks' },
  RW: { basic: 'Mountain / Plains', painLand: 'Battlefield Forge', checkLand: 'Clifftop Retreat', tangoLand: 'Furycalm Snarl', bounceLand: 'Boros Garrison' },
};

export function generateBudgetManaBase(selectedColors: string[]): ManaBaseRecommendation {
  const colors = Array.from(new Set(selectedColors)).filter((c) => ['W', 'U', 'B', 'R', 'G'].includes(c.toUpperCase()));
  const colorCount = colors.length;
  const totalLands = 37;

  if (colorCount === 0) {
    return {
      colorCount: 0,
      totalLands: 37,
      basics: [{ name: 'Wastes', count: 20, color: 'C' }],
      dualLands: [],
      triLands: [],
      utilityLands: [
        { name: 'Demolition Field', role: 'Target land destruction', price: 0.30 },
        { name: 'Scavenger Grounds', role: 'Mass graveyard wipe', price: 0.45 },
        { name: 'Rogue\'s Passage', role: 'Unblockable finisher', price: 0.35 },
        { name: 'Reliquary Tower', role: 'No maximum hand size', price: 1.20 },
        { name: 'Tyrite Sanctum', role: 'Commander counters & indestructible', price: 0.45 },
        { name: 'Bonders\' Enclave', role: 'Repeatable card draw', price: 0.50 },
        { name: 'War Room', role: 'Colorless life-for-card draw', price: 1.80 },
        { name: 'Geier Reach Sanitarium', role: 'Looting filter', price: 0.40 },
      ],
      summaryNote: 'Colorless decks rely heavily on utility lands since they do not require colored mana fixing.',
    };
  }

  if (colorCount === 1) {
    const color = colors[0];
    const basicName = color === 'W' ? 'Plains' : color === 'U' ? 'Island' : color === 'B' ? 'Swamp' : color === 'R' ? 'Mountain' : 'Forest';
    return {
      colorCount: 1,
      totalLands: 37,
      basics: [{ name: basicName, count: 28, color }],
      dualLands: [],
      triLands: [],
      utilityLands: [
        { name: 'Myriad Landscape', role: 'Ramps 2 matching basics for 2 mana', price: 0.25 },
        { name: 'Demolition Field', role: 'Removes opponent utility lands and fixes basics', price: 0.30 },
        { name: 'Scavenger Grounds', role: 'Emergency mass graveyard exile', price: 0.45 },
        { name: 'Rogue\'s Passage', role: 'Make your commander unblockable', price: 0.35 },
        { name: 'War Room', role: 'Draws a card for 3 mana and only 1 life in mono-color', price: 1.80 },
        { name: 'Bonders\' Enclave', role: 'Draws a card if you control a 4+ power creature', price: 0.50 },
        { name: 'Command Beacon', role: 'Bypasses commander tax', price: 2.20 },
      ],
      summaryNote: 'Mono-colored decks require almost no fixing. Run 26–30 basics and maximize powerful utility lands.',
    };
  }

  // Multi-color generation (2, 3, 4, 5 colors)
  const pairs: string[] = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const p1 = colors[i] + colors[j];
      const p2 = colors[j] + colors[i];
      if (COLOR_MAP[p1]) pairs.push(p1);
      else if (COLOR_MAP[p2]) pairs.push(p2);
    }
  }

  const dualLands: any[] = [];
  for (const p of pairs) {
    const entry = COLOR_MAP[p];
    if (entry) {
      dualLands.push({ name: entry.painLand, type: 'Pain Land', price: 0.65, entersUntapped: true, colors: [p[0], p[1]] });
      dualLands.push({ name: entry.tangoLand, type: 'Tango / Snarl', price: 0.40, entersUntapped: true, colors: [p[0], p[1]] });
      dualLands.push({ name: entry.bounceLand, type: 'Bounce Land', price: 0.30, entersUntapped: false, colors: [p[0], p[1]] });
      if (colorCount <= 3) {
        dualLands.push({ name: entry.checkLand, type: 'Check Land', price: 1.40, entersUntapped: true, colors: [p[0], p[1]] });
      }
    }
  }

  const triLands: any[] = [];
  if (colorCount >= 3) {
    if (colorCount === 3) {
      triLands.push({ name: 'Matching Tri-Land (e.g. Seaside Citadel / Nomad Outpost)', price: 0.35, colors });
      triLands.push({ name: 'Matching Panorama / New Capenna Fetch', price: 0.25, colors });
    } else if (colorCount >= 4) {
      triLands.push({ name: 'Path of Ancestry', price: 0.25, colors });
      triLands.push({ name: 'The World Tree / Exotic Orchard', price: 0.30, colors });
    }
  }

  const utilityLands = [
    { name: 'Command Tower', role: 'Best land in Commander — taps for all colors untapped', price: 0.25 },
    { name: 'Exotic Orchard', role: 'Taps for any opponent color with zero drawback', price: 0.20 },
    { name: 'Demolition Field', role: 'Checks opponent Cabal Coffers / Gaea\'s Cradle and searches basic', price: 0.30 },
    { name: 'Scavenger Grounds', role: 'Stops graveyard combos on land slot', price: 0.45 },
  ];

  if (colorCount >= 3) {
    utilityLands.push({ name: 'Path of Ancestry', role: 'All-color fixing + Scry 1 on Commander cast', price: 0.25 });
  }

  const fixedLandsCount = dualLands.length + triLands.length + utilityLands.length;
  const basicCountTotal = Math.max(12, totalLands - fixedLandsCount);
  const perBasic = Math.floor(basicCountTotal / colorCount);

  const basicNamesMap: Record<string, string> = { W: 'Plains', U: 'Island', B: 'Swamp', R: 'Mountain', G: 'Forest' };
  const basics = colors.map((c, idx) => ({
    name: basicNamesMap[c] || 'Basic',
    count: idx === 0 ? basicCountTotal - perBasic * (colorCount - 1) : perBasic,
    color: c,
  }));

  const speedRating = colorCount === 2 ? 'Fast (85%+ Untapped)' : colorCount === 3 ? 'Medium-Fast (75%+ Untapped)' : 'Consistent Budget Fixing';

  return {
    colorCount,
    totalLands,
    basics,
    dualLands,
    triLands,
    utilityLands,
    summaryNote: `Recommended budget mana base for ${colorCount}-color Commander. Optimized for ${speedRating} under a total land budget of ~$15–$20.`,
  };
}
