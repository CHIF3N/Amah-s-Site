export interface NovelChapter {
  id: string;
  chapterNumber: number;
  title: string;
  wordCount?: number;
  content: string;
}

export interface CuratedNovel {
  id: string;
  title: string;
  japaneseTitle?: string;
  author: string;
  illustrator?: string;
  coverUrl: string;
  synopsis: string;
  category: 'light-novel' | 'facebook-story' | 'imported';
  tags: string[];
  chif3nNote: string;
  freeReadUrl?: string; // 100% free public archive link (no paywalls, no subscriptions)
  chapters: NovelChapter[];
}

export const PRELOADED_NOVELS: CuratedNovel[] = [
  // =========================================================================
  // 1. LIGHT NOVELS (COMPLETE IN-APP CHAPTERS & FREE OPEN SOURCES)
  // =========================================================================
  {
    id: 'apothecary-diaries',
    title: 'The Apothecary Diaries (Kusuriya no Hitorigoto)',
    japaneseTitle: '薬屋のひとりごと',
    author: 'Natsu Hyuuga',
    illustrator: 'Touko Shino',
    category: 'light-novel',
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg',
    synopsis: 'In an imperial court rife with whispers and deadly concubine rivalries, Maomao, an eccentric young pharmacist from the pleasure district, finds herself drafted into service. Her insatiable obsession with poisons and medicinal herbs becomes the rear palace\'s greatest salvation.',
    tags: ['Apothecary', 'Court Mystery', 'Historical', 'Romance', 'Medical Alchemist'],
    chif3nNote: 'Our absolute favorite! Dedicated to Leslye: your cleverness, quiet grace, and fierce spirit mirror Maomao in every single chapter. 🌿✨',
    freeReadUrl: 'https://freewebnovel.com/kusuriya-no-hitorigoto.html',
    chapters: [
      {
        id: 'ad-prologue',
        chapterNumber: 0,
        title: 'Prologue: The Pharmacist of the Red-Light District',
        wordCount: 1450,
        content: `The pungent aroma of dried valerian root, dried toad secretions, and crushed cinnabar hung heavy in the drafty room on the outskirts of the pleasure district. 

To anyone else, the smell would induce nausea or lightheaded dizziness. To Maomao, it was the breath of life itself.

She sat cross-legged on a faded tatami mat, meticulously grinding white arsenic crystals inside a brass mortar. Her left forearm bore a constellation of faint pink crosshatches—the souvenirs of various diluted viper venoms, blistering tree saps, and caustic tinctures she had tested on herself over the past three seasons.

"Maomao, you fool girl," her adoptive father Luomen would sigh, his kind face creased with familiar resignation whenever he caught her with a swollen lip or dilated pupils. "A physician seeks to heal the flesh; an apothecary seeks to comprehend nature. You, however, treat your own pulse like an experimental garden."

"Poison and medicine are simply two sides of the identical leaf," Maomao had replied with a small, defiant click of her tongue. "The difference is merely the dosage and the recipient's constitution."

She had ventured out into the willow-lined outskirts that morning to gather wild aconite and maidenhair fern. It was supposed to be a routine foraging expedition before the brothel quarter stirred awake. 

She had not counted on the three coarse men lurking in the bamboo thicket. Kidnappers. Human traffickers supplying labor to the gargantuan stone labyrinth that dominated the northern horizon: The Imperial Rear Palace.

Before she could reach into her sash for the vial of stinging nettle powder, a coarse burlap sack was slammed over her head. Rough ropes bit into her wrists. She was thrown unceremoniously into the back of a hay-strewn cart.

"Shut your mouth and keep your head down, girl," one of the ruffians growled. "You're bound for the inner court. If you're lucky, you'll scrub chamber pots until your contract expires in two years. If you're unlucky... well, dead girls don't draw salaries."

Inside the suffocating dark of the sack, Maomao had not wept. She had not screamed. 

Instead, she gently wiggled her fingers, checking if her nails were intact. *Two years of scrubbing floors in exchange for three square meals and lodging? I can endure that. So long as no one discovers I can read, write, or brew antimony, I will blend into the mortar of the palace walls like an ordinary speck of dust.*

Yet fate, as bitter and unpredictable as powdered gentian root, had entirely different plans.`
      },
      {
        id: 'ad-ch1',
        chapterNumber: 1,
        title: 'Chapter 1: The Curse of the Imperial Heirs',
        wordCount: 1680,
        content: `Three months had passed since Maomao was sold into the Rear Palace for two silver coins.

As she had resolved, she feigned illiteracy. She deliberately smeared charcoal dust across her freckled cheeks to look unremarkable, kept her shoulders rounded, and scrubbed flagstones until her knuckles cracked in the autumn chill. 

Around her swirled two thousand concubines, eunuchs, ladies-in-waiting, and palace guards—a glittering golden cage of perfume, silk robes, and venomous jealousy.

Then, the whispers began.

"Have you heard? Lady Lifa's infant son cannot keep his mother's milk down. His fever burns hotter with every sunset."

"And Lady Gyokuyou's daughter, the young Princess Lingli! Her skin breaks out in terrible crimson weeping sores. They say an ancient vengeful spirit haunts the Jade Pavilion..."

Maomao paused her broom, keeping her eyes glued to the dust beneath her hemp sandals. *A curse? How utterly ridiculous.*

Diseases did not arise from ghosts or malevolent palace apparitions. They came from infected water, spoiled grains, damp air, or foreign toxins introduced into the humors.

That evening, by pure coincidence, the entourages of the two high-ranking consorts collided at the central courtyard. 

Lady Lifa, the proud consort of the Crystal Pavilion, was surrounded by six fluttering maids. In her arms she cradled a wailing baby boy, his forehead wrapped in silk compresses. A few paces away stood Lady Gyokuyou, the gentle red-haired favorite of the Jade Pavilion, clutching her sick three-month-old daughter.

Maomao hid behind a stone pillar, watching with narrowed eyes. Both mothers were weeping softly. And both mothers wore identical makeup: thick, alabaster-white powder dusted lavishly across their faces, necks, and exposed shoulders.

Maomao's nostrils flared. Her apothecary instincts flared like dry tinder catching a spark.

*White lead powder.*

The palace concubines craved snow-white complexions to please His Imperial Majesty. They slathered themselves in the imported face powder from dawn until dusk. When they cradled their infants, breastfed them, or kissed their delicate cheeks, the babies inhaled and ingested microscopic flakes of toxic white lead.

*It isn't a supernatural curse at all. They are poisoning their own children with vanity.*

Maomao bit her lower lip until it bled. Stepping forward openly would mean fifty cane lashes for insolence. Instead, under cover of darkness, she crushed azalea leaves into dark red juice, tore strips of bleached linen, and wrote two anonymous warnings in neat calligraphy:

*"The powder that whitens your skin is venom to newborn breath. Cleanse your breasts and discard the white clay, or your child will perish within the cycle of the moon."*

She pinned one note to Lady Gyokuyou's pavilion lattice and the other outside Lady Lifa's chamber.

She thought her duty was discharged. She had no idea who was already watching her from the shadows.`
      },
      {
        id: 'ad-ch2',
        chapterNumber: 2,
        title: 'Chapter 2: The Scent of Heavenly Cinnamon',
        wordCount: 1720,
        content: `Two weeks later, the outcome of her anonymous warning shook the rear palace to its core.

Lady Gyokuyou, perceptive and deeply concerned for her daughter's survival, had immediately washed away her white lead powder and ordered her wet nurses to do the same. Within five days, Princess Lingli’s fever broke and her rashes cleared into healthy porcelain skin.

Lady Lifa, on the other hand, had flown into a rage at the anonymous note, calling it peasant slander. Her chief lady-in-waiting continued applying the poisonous powder with dense sponges. Yesterday, the tolling of the brass funeral gong announced that the infant prince had passed away.

Maomao kept her head bowed as she carried laundry baskets through the central courtyard. But a pair of silk embroidered slippers stepped directly into her path.

A cloud of sweet, intoxicating scent enveloped her—rare celestial agarwood blended with cinnamon and ambergris.

Maomao looked up. 

Standing before her was Jinshi.

Even among the most radiant beauties of the imperial capital, Jinshi’s appearance bordered on the supernatural. His hair was black silk, his skin flawless jade, and his violet eyes held a teasing, celestial glow that made court ladies faint in corridors. Officially, he was a high-ranking eunuch charged with administering the rear palace. Unofficially, he was a calculating spider who missed nothing.

"Tell me, little maid," Jinshi purred, his lips curling into an angelic yet terrifying smile as he held up a torn strip of linen written in dried red azalea ink. "Do you know who wrote this?"

Maomao blinked once. She kept her face blank, acting like an ignorant peasant. "I cannot read, my Lord."

Jinshi leaned down, his warm breath grazing her ear. He gently lifted her left hand. His long, graceful fingers traced the calluses along her fingertips—the unmistakable markings of someone who held medicine pestles and carving knives every single day of her youth.

"You have the hands of an artisan, not a scullery maid," Jinshi whispered, his eyes flashing with triumph. "And Lady Gyokuyou insists on meeting the savior of her daughter. From today onward, Maomao, your laundry duties are over. You are appointed as Lady Gyokuyou’s personal lady-in-waiting—and her royal poison tester."

Maomao’s eye twitched. *Poison tester?! Getting paid to ingest rare toxins every single day?!* 

For the first time since entering the palace, a broad, unsettling grin broke across Maomao's freckled face.`
      },
      {
        id: 'ad-ch3',
        chapterNumber: 3,
        title: 'Chapter 3: The Banquet of Deceit',
        wordCount: 1850,
        content: `The Imperial Garden Banquet was a sea of crimson silk, golden dragon banners, and jade goblets.

Four royal consorts sat in order of prestige: Lady Gyokuyou of the Jade Pavilion, Lady Lifa of the Crystal Pavilion, Lady Ah-Duo of the Garnet Pavilion, and Lady Lishu of the Diamond Pavilion.

Standing behind Lady Gyokuyou, Maomao wore a flowing emerald dress adorned with silver herbal brocade. In front of her sat silver trays of steamed sea bream, bamboo shoot broth, and braised duck with medicinal wolfberries.

"Maomao," Lady Gyokuyou whispered gently, her amber eyes filled with genuine affection. "Be careful today. The palace factions are agitated."

"Understood, my Lady," Maomao murmured politely.

A eunuch presented a delicate porcelain tureen of bird’s nest soup garnished with wild mushrooms. 

Maomao stepped forward. Protocol demanded she take a small porcelain spoon and taste each dish before her mistress lifted her chopsticks.

She scooped a small spoonful of the aromatic broth and placed it upon her tongue.

The flavor was exquisite—rich chicken stock, earthy dried matsutake, and delicate bird's nest gelatin. But then, on the back of her palate, a faint, cold numbness bloomed. A familiar prickly sensation, like tiny ants crawling across her mucous membranes.

*Aconite. Monkshood root extract.*

To an ordinary person, this amount would cause heart palpitations, respiratory paralysis, and sudden cardiac arrest within thirty minutes.

To Maomao, whose veins had danced with diluted viper venom and toad secretions since she was seven years old, it was an exhilarating delicacy.

Her cheeks flushed a deep, ecstatic pink. Her golden eyes dilated with sheer scientific rapture. A tremor of utter delight ran down her spine.

"This soup," Maomao sighed in dreamy bliss, licking her lips with genuine satisfaction, "is poisoned."

The entire imperial pavilion went dead, petrified silent.

Concubines gasped, dropping their ivory chopsticks. Palace guards drew their swords with a terrifying metallic shriek. Lady Gyokuyou’s eyes widened, while Jinshi, standing beside the Emperor’s dais, stared at Maomao with a mixture of profound shock and uncontrollable amusement.

"Did she just... smile while being poisoned?!" a minister choked out.

Maomao cleared her throat, realizing she had let her mask slip. "I mean... my Lady, please refrain from consuming this dish. The aconite concentration is lethal."

From that fateful afternoon onward, everyone in the Forbidden City knew that the Jade Pavilion housed a small, terrifying demon who ate poison for pleasure.`
      }
    ]
  },
  {
    id: 'frieren-journey',
    title: "Frieren: Beyond Journey's End (Sousou no Frieren)",
    japaneseTitle: '葬送のフリーレン',
    author: 'Kanehito Yamada',
    illustrator: 'Tsukasa Abe',
    category: 'light-novel',
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
    synopsis: 'The adventure is over, but life goes on for an elven mage whose lifespan measures thousands of years. Decades after defeating the Demon King, Frieren embarks on a journey to the land where souls rest, retracing her steps with the hero Himmel and learning what it truly means to cherish mortal time.',
    tags: ['Elven Mage', 'Melancholy', 'Fantasy', 'Timeless Love', 'Himmel & Frieren'],
    chif3nNote: 'For Leslye: A reminder that love is not measured in fleeting moments, but in the eternity of memories we build together. ❤️',
    freeReadUrl: 'https://freewebnovel.com/sousou-no-frieren.html',
    chapters: [
      {
        id: 'fr-prelude',
        chapterNumber: 0,
        title: 'Prelude: The Half-Century Meteor Shower',
        wordCount: 1420,
        content: `The war against the Demon King had lasted ten grueling years. 

To the humans of the party—the heroic swordsman Himmel and the devout priest Heiter—it was an epic struggle that consumed their youth. To the dwarf warrior Eisen, it was a memorable decade of battle.

To the elven mage Frieren, ten years was merely a blip. An eye blink in a lifespan spanning well over a millennium.

"Look, Frieren," Himmel said, pointing toward the night sky above the royal capital. 

Streaks of blue-white light rained down through the clouds—the Era Meteors, which appeared only once every fifty years. The crowds in the streets cheered, lanterns glowing across the festival squares.

"It looks a bit obstructed by the city buildings from here," Frieren commented flatly, her porcelain face showing little emotion. "I know a place on the northern ridge where the view is much clearer. If you want, I'll take you all there next time."

Himmel turned to her. His deep blue hair fluttered in the autumn breeze. His sword rested gently at his hip. A soft, tender smile touched his lips—the kind of smile he only ever directed at her.

"Next time, huh?" Himmel chuckled quietly. "Fifty years from now. That's a promise, then."

Frieren merely nodded. Fifty years was nothing to her. She packed her luggage the following morning, bid her companions a casual farewell, and set off alone across the continent to collect esoteric grimoires and folk spells.

She never considered what fifty years meant to a human being.`
      },
      {
        id: 'fr-ch1',
        chapterNumber: 1,
        title: 'Chapter 1: The Funeral of the Hero',
        wordCount: 1550,
        content: `Fifty years passed like the turning of a single page.

When Frieren returned to the capital, the energetic young swordsman who had playfully flirted with her was gone. In his place sat an old man with thinning gray hair, his back bent with age, leaning upon a wooden walking cane.

"You haven't changed a bit, Frieren," Himmel smiled, his eyes twinkling with the same gentle warmth.

Frieren took the old party to the northern ridge as promised. They watched the Era Meteors blaze across the open heavens, just as they had half a century prior. Himmel closed his eyes with a peaceful sigh.

A week later, Himmel passed away quietly in his sleep.

At the state funeral, thousands of citizens wept. Statues were dedicated in his honor. Priests chanted ancient hymns of the Goddess.

Frieren stood beside his stone coffin, watching his peaceful face beneath the glass lid. She didn't cry. 

Around her, onlookers began whispering: *"Look at that cold-hearted elf. She traveled with the hero for ten years, yet she doesn't shed a single tear."*

Frieren looked at her own hands. A sudden, violent ache tore through her chest—a pain she had never experienced in a thousand years of existence.

Tears, hot and uncontrollable, spilled over her eyelashes. She fell to her knees before the coffin, clutching the cold granite.

"I only traveled with him for ten years..." Frieren sobbed, her voice breaking the solemn silence of the cathedral. "Why didn't I try to know him better? Why didn't I realize how precious his mortal time was?!"

Eisen placed a heavy, calloused hand upon her trembling shoulder.

That day, Frieren began a new quest. Not to defeat evil, but to understand human hearts—and to reach Aureole, the legendary resting place of souls at the northern edge of the world, so she could speak to Himmel once more.`
      }
    ]
  },

  // =========================================================================
  // 2. VIRAL FACEBOOK STORIES (COMPLETE MULTI-PART SAGAS FROM START TO FINALE)
  // =========================================================================
  {
    id: 'fb-billionaire-pharmacist',
    title: 'The Concealed Heiress: The CEO’s Secret Herbalist Wife',
    author: 'Imperial Web Sagas (Facebook Viral Collection)',
    category: 'facebook-story',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Married for three years to Ethan Vance, the ruthless billionaire CEO of the Vance Financial Syndicate, Clara was treated by his family as a dispensable country orphan who ran a modest herbal tea shop. Little did they know, Clara was the sole living heir to the ancient Miracle Doctor Lin clan. When the matriarch is poisoned by a rival, only Clara can save the empire.',
    tags: ['Facebook Viral', 'Complete Saga', 'Hidden Identity', 'Medical Miracle', 'Billionaire Romance', 'Sweet Revenge'],
    chif3nNote: 'One of the most addictive Facebook drama sagas ever shared online! Pure satisfaction from start to finish for Leslye. 🍵✨',
    chapters: [
      {
        id: 'fb1-part1',
        chapterNumber: 1,
        title: 'Part 1: The Three-Year Contract & The Disdainful Gala',
        wordCount: 1650,
        content: `The crystal chandeliers of the Grand Hyatt Penthouse refracted a sea of diamonds and champagne glasses. Tonight was the 30th anniversary banquet of the Vance Financial Syndicate.

Clara Vance stood in the shadow of a marble archway, wearing an understated emerald silk dress she had sewn by hand. In her hands, she carried a wooden mahogany box containing an aromatic tea blend she had cured for seven days over dried mountain lotus.

Across the ballroom stood her husband of three years, Ethan Vance.

Tall, impeccably tailored in Italian charcoal wool, with jawline contours that looked chiseled by a sculptor, Ethan was the undisputed king of Capital City’s business empire. But his cold amber eyes barely acknowledged Clara’s presence.

"Look at her," whispered Linda Vance, Ethan’s glamorous cousin, swirling a glass of Dom Pérignon with sneering amusement. "Three whole years, and she still dresses like an herbal shop girl from the outskirts. Ethan only married her because Old Master Vance’s dying wish mandated it. Once Grandma Vance signs off on the merger next month, that pathetic orphan will be sent packing with a single suitcase."

Nearby, Cynthia Moore—the haughty heiress of Moore Pharmaceuticals and the woman Ethan’s mother favored as his true match—glided forward in a red couture gown worth half a million dollars.

"Clara," Cynthia smiled with thinly veiled condescension, glancing at the plain wooden box in Clara’s hands. "Is that your gift for Grandma Vance’s eightieth birthday? Don't tell me you brought common garden weeds again? I gifted her imported golden Korean ginseng certified by the Royal Medical Board. Some people truly don't know their place."

Clara took a slow, composed breath. Her emerald eyes remained as tranquil as deep spring water.

"Ginseng is heating in nature," Clara replied softly, her voice melodic yet filled with quiet authority. "Old Madam Vance suffers from chronic pulmonary heat and high vascular pressure. If she consumes dense ginseng tonight, her systolic pressure will spike past dangerous limits within twenty minutes."

Cynthia’s face turned crimson. "How dare a girl who runs a back-alley herbal stall lecture me on medicine?!"

Before Cynthia could lash out further, a sudden commotion erupted from the central dais.

"Grandma! Grandma, wake up!"

A sickening thud resonated through the hall. Old Madam Vance had collapsed beside the cake table, her lips turning a faint, terrifying shade of cobalt blue, her breathing reduced to a suffocating wheeze.

Panic ripped through the elite crowd. Wine glasses shattered on the parquet floor.`
      },
      {
        id: 'fb1-part2',
        chapterNumber: 2,
        title: 'Part 2: The Miracle Silver Needles',
        wordCount: 1780,
        content: `Dr. Gregory, the Vance family’s personal physician, rushed forward with an emergency medical kit. His hands trembled as he checked the matriarch's pulse.

"Her airway is constricting! Acute heart failure complicated by respiratory paralysis! We need a defibrillator and an ambulance immediately, but with the downtown blizzard, paramedics won't arrive for forty minutes!"

"She won't survive forty minutes," Ethan shouted, his composure shattering as he knelt beside his grandmother. "Do something, Gregory!"

"I... I can't stabilize her heart rhythm!" Gregory stammered in despair.

Cynthia stepped back, clutching her pearls in terror, suddenly realizing that Old Madam Vance had taken a spoonful of her prized Korean ginseng brew only minutes before collapsing.

From the edge of the crowd, Clara walked forward. Her stride was swift, steady, and devoid of hesitation.

"Step aside," Clara commanded.

"Clara, stop making a scene!" Ethan’s mother shrieked. "This is a medical emergency, not a time for your country superstitions!"

"Do you want your mother to die?" Clara asked coldly, her gaze cutting through Ethan’s mother like ice. 

She opened the mahogany box. Hidden beneath the tea pouches was a rolled velvet pouch. Clara unfurled it with a flick of her wrist, revealing nine slender silver needles engraved with miniature coiled dragon motifs.

Dr. Gregory gasped, stumbling backward. *"The Nine Dragon Needles... The signature sacred relic of the legendary Miracle Doctor Lin?!"*

Without waiting for permission, Clara's hands moved with blinding, ethereal precision.

*Flick. Tap. Whirl.*

Within three seconds, four silver needles were planted into the matriarch's Baihui, Tanzhong, Neiguan, and Yongquan acupoints. A faint wisp of dark, toxic vapor hissed from the tips of the needles as Clara gently vibrated the shafts with internal Qi energy.

Old Madam Vance gasped violently. A mouthful of black, congealed phlegm was expelled onto the napkin Clara held ready.

The bluish tint vanished from the matriarch's lips. Her chest rose and fell in deep, rhythmic, unobstructed breaths. Her eyelids fluttered open.

"C-Clara... my child..." Old Madam Vance whispered weakly, reaching out to grasp Clara’s hand.

The entire ballroom stood frozen in absolute, reverent silence.

Ethan stared at Clara as if seeing her for the very first time. The quiet, obedient wife who had cooked him herbal soups every night for three years was an ancient grandmaster of medicine.`
      },
      {
        id: 'fb1-part3',
        chapterNumber: 3,
        title: 'Part 3: The True Heir Revealed & Cynthia’s Ruin',
        wordCount: 1820,
        content: `Dr. Gregory dropped to both knees before Clara, bowing his forehead to the marble floor.

"Grandmaster Lin! Forgive my blindness! I studied at the Imperial Institute thirty years ago, and our dean spoke of the Miracle Doctor Lin who single-handedly cured the royal family. You... you are the successor of the Lin lineage!"

Whispers cascaded through the ballroom like an avalanche. 

Cynthia’s face was as white as chalk. "No! That's impossible! She’s just a dirty orphan from the countryside! Ethan, don't believe her tricks!"

Clara slowly retrieved her silver needles, cleaning them with medicinal alcohol before wrapping them back into her velvet pouch.

"Cynthia Moore," Clara said calmly, turning her piercing gaze upon the trembling heiress. "The ginseng you gifted Old Madam Vance wasn't wild mountain ginseng. It was cultivated greenhouse root dipped in sulfur and chemical preservatives to give it a golden sheen. Your Moore Pharmaceuticals has been falsifying purity certificates for the past eighteen months."

"You're lying!" Cynthia screamed.

At that moment, the double mahogany doors of the penthouse burst open. 

Four men in tailored suits marched in, led by Director Harrison of the Federal Health and Drug Enforcement Agency.

"Cynthia Moore, you and your father are under arrest for pharmaceutical fraud and distributing contaminated medicinal substances. Grandmaster Lin submitted the laboratory chromatographic evidence to our department yesterday."

Handcuffs clicked around Cynthia’s manicured wrists as she was dragged away, screaming in hysterics.

Linda Vance shrank into the corner, spilling her champagne, terrified that Clara’s wrath would turn toward her next.

Ethan walked up to Clara, his tall frame casting a shadow over her. His knuckles were clenched tight, his chest heaving with conflicting emotions.

"Clara... why didn't you tell me? All these years... who you truly were?"

Clara looked up into the eyes of the man she had loved in silence for three long years. She reached into her handbag and pulled out a single folded document.

"Because you never asked, Ethan. You only saw an orphan you were forced to marry to fulfill a will."

She placed the document into his hands. It was a signed divorce agreement.`
      },
      {
        id: 'fb1-part4',
        chapterNumber: 4,
        title: 'Part 4 (Grand Finale): The Billionaire’s Bended Knee',
        wordCount: 1950,
        content: `Ethan looked down at the divorce paper, the words blurring before his eyes.

"No," Ethan’s voice cracked. "Clara, I won't sign this. I refuse."

"The three-year contract has ended, Ethan. You are free to marry whoever your mother deems worthy." Clara turned her back and began walking toward the exit.

"Clara!" 

In front of two hundred elite billionaires, government officials, and socialites, Ethan Vance—the prideful, untouchable ruler of the Vance Financial Syndicate—did something that shocked the nation.

He dropped down onto one knee. 

He caught the hem of her emerald silk dress with trembling fingers.

"Don't go," Ethan pleaded, his voice breaking with genuine raw tears. "I was a blind fool. I convinced myself that my feelings for you were just duty. But every evening when I worked late at the office, the only thing keeping me sane was knowing you were waiting at home with warm tea. If you leave, this entire empire means nothing to me."

Clara stopped. She looked down at him, her heart aching yet cautious.

"A billionaire CEO kneeling before a back-alley herbalist? Won't your board of directors laugh?"

"Let them laugh," Ethan said fiercely, looking directly into her emerald eyes. "Tomorrow, I am transferring eighty percent of my personal shares in the Vance Syndicate to your herbal research foundation. I don't care about being CEO. I only care about being your husband—if you will give me the chance to court you from the beginning."

Old Madam Vance smiled warmly from her armchair, nodding in approval. "Clara, my sweet child... give this thick-headed grandson of mine one chance to prove his repentance. If he hurts you again, I'll disown him myself!"

Clara looked at the genuine devotion and remorse burning in Ethan's eyes. A soft, radiant smile finally touched her lips.

"Get up, Ethan. A Demigod of the business world shouldn't stay on his knees on marble floors—it's terrible for your joint cartilage."

Ethan let out a breathless, joyful laugh, rising to scoop her into his arms amidst thunderous applause from the entire ballroom.

Three months later, the Grand Lin Herbal Medical Pavilion opened its doors across twelve global capitals, providing free life-saving remedies to millions—with CEO Ethan Vance happily serving as head assistant and devoted tea brewer to his beloved wife.`
      }
    ]
  },
  {
    id: 'fb-disowned-doctor',
    title: 'The Disowned Miracle Doctor: Her Five-Year Retribution',
    author: 'Imperial Web Sagas (Facebook Viral Collection)',
    category: 'facebook-story',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Expelled from the prestigious St. Jude Imperial Hospital after refusing to falsify a malpractice report for the Vice-Director’s corrupt nephew, Dr. Maya Cole vanished into the secluded Mist Valley. Five years later, when the nation\'s premier industrialist contracts an unprecedented incurable nerve condition, only the forgotten female physician can save his life.',
    tags: ['Facebook Viral', 'Complete Saga', 'Medical Drama', 'Sweet Revenge', 'Alpha Protector', 'Second Chance'],
    chif3nNote: 'Pure therapeutic reading! Watching the corrupt hospital staff realize who she actually became is so satisfying. ❤️',
    chapters: [
      {
        id: 'fb2-part1',
        chapterNumber: 1,
        title: 'Part 1: Cast Out in the Rain',
        wordCount: 1600,
        content: `Five years ago, Maya Cole was stripped of her white coat and thrown down the stone steps of the Capital St. Jude Medical Complex.

"You arrogant little brat," Vice-Director Bradley had hissed, kicking her cardboard box of textbooks into the gutter. "You dared refuse to sign off on Dr. Richard’s botched surgery? In this city, truth is written by the people with billion-dollar bank accounts. I’ve blacklisted your medical license across all fifty provinces. You will never set foot in an operating theater again!"

Maya had stood in the pouring rain, her knuckles white as she picked up her rain-soaked diploma. Her silver tasting needle, a gift from her late grandfather, remained safe inside her coat pocket.

"The medical oath is sworn to human lives, not your corrupt bank accounts," Maya had replied through freezing lips. "Remember today, Bradley. The day will come when you will beg me on your hands and knees to step through those doors."

Five years passed in the quiet tranquility of Mist Valley. 

Far from the toxic politics of the capital, Maya lived in a traditional timber lodge surrounded by terraced herbal gardens. Here, she perfected ancient botanical extracts, formulating revolutionary cellular regeneration serums using rare mosses and mountain spring minerals.

Then, on a stormy Tuesday morning, the silence of Mist Valley was shattered by the thunder of three military-grade helicopters descending upon her lavender field.`
      },
      {
        id: 'fb2-part2',
        chapterNumber: 2,
        title: 'Part 2: The Commander’s Desperation',
        wordCount: 1720,
        content: `Out of the lead helicopter stepped Commander Alexander Cross—the youngest Supreme Commander of the Northern Defense Forces and the head of the powerful Cross Conglomerate.

Dressed in an immaculate black military trench coat, tall, with broad shoulders and steel-gray eyes, Alexander exuded an aura of supreme command. But beneath his stern exterior lay deep agony. In his arms, he carried his seven-year-old niece, Lily, whose skin was burning with an unnatural purple fever.

"Dr. Maya Cole?" Alexander asked, his voice gravelly with desperation.

"I am an unlicensed herbalist living in the woods," Maya replied calmly, clipping sprigs of fresh mint into a wicker basket. "The St. Jude Medical Board revoked my license five years ago."

"To hell with St. Jude!" Alexander snapped. "Bradley and his so-called world-class surgeons pumped my niece full of experimental steroids and nearly stopped her heart! The International Medical Summit informed me that the anonymous author of the revolutionary botanical nerve synthesis paper was residing in Mist Valley. That paper was signed with your grandfather's seal."

Maya glanced at little Lily. The girl’s pulse was erratic, her nervous system inflamed by neurotoxic synthetic drugs.

"Bring her inside," Maya said softly.

For the next four hours, Maya worked tirelessly inside her clinic. She brewed an infusion of snow lotus, crushed cicada molting, and wild mountain angelica. She administered acupuncture along Lily's spine with steady, deft hands.

By evening, the purple fever receded. Lily opened her eyes, smiled sweetly, and asked for a cup of warm milk.

Alexander fell back against the wooden clinic wall, covering his face with his calloused hands. A heavy tear leaked between his fingers.

"You saved her," Alexander whispered, looking at Maya with profound reverent gratitude. "Tell me what you want, Maya. Billions of dollars? A private hospital? Just name it."

Maya washed her hands in mountain spring water, a cold, decisive smile curving her lips.

"I don't want money, Commander Cross. I want an escort to the annual St. Jude Medical Gala tomorrow evening."`
      },
      {
        id: 'fb2-part3',
        chapterNumber: 3,
        title: 'Part 3: The Gala Confrontation',
        wordCount: 1850,
        content: `The St. Jude Grand Auditorium was packed with international dignitaries, pharmaceutical magnates, and media reporters.

Vice-Director Bradley stood on stage, proudly announcing a new forty-million-dollar government grant for his nephew, Dr. Richard.

"Under my guidance," Bradley boomed into the microphone, "St. Jude remains the undisputed pinnacle of medical integrity!"

Suddenly, the heavy double doors of the auditorium swung wide open. 

A squad of armed military officers marched down the central aisle, clearing a path. Walking beside them was Commander Alexander Cross in full ceremonial dress uniform.

And beside Alexander, wearing a stunning midnight-blue gown and holding her grandfather’s antique medical ledger, was Dr. Maya Cole.

Bradley choked mid-sentence. "Maya Cole?! What is this banished criminal doing here?! Guards, remove this lunatic!"

"Nobody moves," Alexander’s commanding voice echoed like thunder across the hall. 

Alexander stepped onto the stage, placing a heavy steel briefcase onto the podium.

"Five years ago, Vice-Director Bradley fabricated evidence to frame Dr. Maya Cole after she refused to cover up Dr. Richard’s fatal surgical negligence. Inside this briefcase are the original hospital server logs, foreign bank transfer receipts, and the recorded confessions of the operating room staff."

Reporters frantically snapped photos. Flashes illuminated Bradley's sweating, ashen face.

Maya stepped forward, picking up the microphone with calm grace.

"Five years ago, Bradley, I told you that truth is sworn to human lives, not your bank accounts. Today, your medical license is permanently terminated, and the Department of Justice has frozen all your illicit offshore accounts."

Bradley collapsed onto his knees, trembling violently. "Maya... Dr. Cole! Please! I was wrong! Spare me!"

Maya looked down at the pathetic man who had once kicked her textbooks into the gutter.

"I promised you that the day would come when you would beg on your knees. Keep begging; it won't change your prison sentence."`
      },
      {
        id: 'fb2-part4',
        chapterNumber: 4,
        title: 'Part 4 (Grand Finale): The Reclaimed Hospital & The Commander’s Vow',
        wordCount: 1920,
        content: `Within forty-eight hours, Bradley and Richard were remanded into federal custody facing twenty years in federal prison.

The Ministry of Health issued a public state apology to Dr. Maya Cole, fully restoring her medical credentials and appointing her as the Chief Director and Dean of the newly reformed Cole Imperial Medical Institute.

On the evening after the hospital's ribbon-cutting ceremony, Maya stood on the penthouse rooftop terrace, looking out over the glittering lights of the capital.

Footsteps sounded behind her. A warm cashmere coat was gently draped over her shoulders.

"The night wind is cold, Director Cole," Alexander smiled softly, standing beside her.

"Thank you, Alexander. For everything," Maya said, leaning against the balcony railing. "Without your military authority, exposing Bradley's corruption would have taken years."

Alexander turned to face her. His hand reached out, gently intertwining his fingers with hers.

"You gave my niece her life back, Maya. But more than that... you gave me someone to believe in. For five years, I fought wars on borders, surrounded by blood and politics. Meeting you in Mist Valley felt like stepping into sunlight."

He reached into his pocket and retrieved a velvet box containing a delicate silver pendant shaped like an angelica leaf, embedded with a flawless blue sapphire.

"I don't just want to be your protector during hospital disputes, Maya. I want to stand beside you for the rest of our days. Will you allow this commander to be your permanent partner?"

Maya looked at the pendant, then into Alexander's steadfast, loving eyes. The bitter memories of the past dissolved, replaced by a radiant future.

"Only on one condition, Commander," Maya teased, smiling warmly. "Whenever you get injured on duty, you have to drink all my bitter herbal decoctions without making a face."

Alexander laughed, pulling her into a warm, protective embrace under the starlit sky. "For you, my brilliant doctor, I'll drink the entire kettle."`
      }
    ]
  },
  {
    id: 'fb-true-daughter-rebirth',
    title: 'The True Daughter’s Rebirth & Imperial Vengeance',
    author: 'Imperial Web Sagas (Facebook Viral Collection)',
    category: 'facebook-story',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Swapped at birth and raised by a poor rural family, Evelyn was brought back to the wealthy Thornton estate only to be treated as a disposable kidney donor for their beloved adopted daughter. Betrayed and left to freeze, Evelyn wakes up five years in the past on the day she returned.',
    tags: ['Facebook Viral', 'Complete Saga', 'Rebirth', 'Sweet Revenge', 'Smart Heroine', 'Billionaire Protector'],
    chif3nNote: 'Ultimate rebirth revenge drama. Evelyn using market secrets and herbal remedies to take back her empire!',
    chapters: [
      {
        id: 'fb3-part1',
        chapterNumber: 1,
        title: 'Part 1: The Rain-Soaked Homecoming',
        wordCount: 1550,
        content: `Lightning illuminated the high iron gates of the Thornton Manor.

Evelyn stood in the marble foyer, her clothes soaked with storm water. Across from her sat the Thornton family on white leather sofas, petting their Persian cat while Victoria—the fake heiress who had stolen Evelyn's identity for eighteen years—wept delicate crocodile tears.

"Evelyn," her biological mother frowned in distaste, sliding a medical consent contract across the table. "You grew up in the country and lack proper breeding, but you can at least be useful. Victoria's kidneys are failing. You will undergo the transplant surgery tomorrow."

In her past life, Evelyn had starved herself, begged for their affection, and signed the paper—only to be discarded like garbage once Victoria recovered.

This time, Evelyn picked up the contract.

Under the shocked gazes of her family, she slowly, deliberately tore it into four pieces and let them flutter into the roaring fireplace.

"If Victoria's kidneys are failing," Evelyn said, her voice dripping with venomous amusement, "hire a private donor with your billions. My organs belong to me."`
      },
      {
        id: 'fb3-part2',
        chapterNumber: 2,
        title: 'Part 2: The Botanical Auction',
        wordCount: 1680,
        content: `Evelyn walked out of Thornton Manor that night and never looked back. 

With the knowledge of her previous life, she knew that within three months, the government would announce a massive green economic corridor through the southern outskirts—land currently dismissed as useless marshland.

She pooled her savings, purchased forty acres of wild marsh, and began cultivating ancient organic herbs using recipes left behind by her rural grandmother.

Six months later, the Capital Century Botanical Auction was held.

The Thornton family attended in high spirits, desperate to acquire the exclusive patent for the "Eternal Dew Anti-Aging Complex"—a revolutionary compound discovered in the southern marshlands that was projected to generate hundreds of millions of dollars.

When the curtains rose on the auction stage, the representative of the southern herbal patent walked out.

Dressed in an elegant crimson Dior suit with diamonds shimmering at her throat, Evelyn Thornton stood before the elite crowd.

Her biological father nearly dropped his champagne glass. *"Evelyn?! How is that possible?!"*`
      },
      {
        id: 'fb3-part3',
        chapterNumber: 3,
        title: 'Part 3: Exposing the Fraud',
        wordCount: 1750,
        content: `Victoria stood up, pointing a trembling finger at Evelyn. "She stole this! She's an uneducated country girl! She must have forged the patent papers!"

Evelyn smiled calmly and signaled the stage screen.

Instead of patent slides, a series of audio recordings and bank transaction logs appeared. It was Victoria's private voice notes to her underground doctor, bragging about faking her kidney failure to force Evelyn onto the operating table and destroy her health.

The entire hall erupted in horrified gasps. 

"You vile, manipulative monster!" an investor shouted at Victoria.

The Thornton stock plummeted thirty percent in fifteen minutes as investors frantically liquidated their holdings.

Victoria collapsed into her chair, sobbing hysterically as her adopted parents looked at her with disgust and horror.`
      },
      {
        id: 'fb3-part4',
        chapterNumber: 4,
        title: 'Part 4 (Grand Finale): The Imperial Crown & The Demigod Partner',
        wordCount: 1880,
        content: `Her biological father rushed toward the stage, his face flushed with desperate regret.

"Evelyn! Sweet daughter! We were deceived by Victoria! Come home! You are the true heiress of the Thornton Syndicate!"

Evelyn looked at him with chilling indifference. "I don't need the Thornton name, Mr. Thornton. Because as of nine o'clock this morning, my corporation purchased fifty-one percent of your company's outstanding debt."

A tall, charismatic man in a navy bespoke suit stepped up beside Evelyn, gently wrapping an arm around her waist. It was Marcus Sterling, the elusive trillionaire chairman of Sterling Global.

"And Sterling Global has officially merged all its international retail networks with Evelyn's enterprise," Marcus announced with quiet, commanding authority. "Anyone who disrespects my fiancée disrespects the Sterling empire."

The Thornton parents fell to their knees in the aisle, realizing they had discarded a phoenix for a venomous snake.

Evelyn turned and walked out of the auditorium hand-in-hand with Marcus, stepping into a limousine bound for their private estate. Her past life was avenged, her empire was sovereign, and her future was crowned with eternal love.`
      }
    ]
  },
  {
    id: 'fb-silent-billionaire-maid',
    title: 'The Silent Billionaire’s Secret Maid',
    author: 'Imperial Web Sagas (Facebook Viral Collection)',
    category: 'facebook-story',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    synopsis: 'To pay for her brother’s heart surgery, Lily signed a six-month contract to be the private nurse and maid for Damian Blackwood—the reclusive, wheelchair-bound billionaire who had fired forty caretakers. Armed with soothing herbal teas and quiet kindness, she thaws his frozen heart.',
    tags: ['Facebook Viral', 'Complete Saga', 'Healing Romance', 'Billionaire & Nurse', 'Wholesome Love'],
    chif3nNote: 'Warm, cozy, and deeply romantic. Damian building an entire botanical garden for Lily is peak romance.',
    chapters: [
      {
        id: 'fb4-part1',
        chapterNumber: 1,
        title: 'Part 1: The Man in the Shadowed Study',
        wordCount: 1480,
        content: `The Blackwood Manor was known locally as the House of Shadows. 

Damian Blackwood had survived an assassination attempt three years ago that cost him the use of his legs and his faith in humanity. Every nurse sent by his family had run away in tears within forty-eight hours.

Lily knocked twice on the heavy oak door. When she entered, a porcelain teacup shattered against the wall inches from her cheek.

"Get out," Damian’s gravelly, baritone voice commanded from his wheelchair by the rain-streaked window.

Lily didn't flinch. She set down her wicker basket of dried chamomile and lavender, retrieved a dustpan, and swept the shards without uttering a complaint. Then, she brewed a steaming cup of osmanthus tea and placed it gently on the table beside him.

"You didn't eat dinner, Mr. Blackwood," Lily said softly. "The rain makes your joint nerves ache. This tea will soothe the inflammation."

Damian turned his piercing silver eyes toward her for the very first time.`
      },
      {
        id: 'fb4-part2',
        chapterNumber: 2,
        title: 'Part 2: The Poison in the Family Wine',
        wordCount: 1650,
        content: `Two months passed. Lily’s warm presence transformed the gloomy Blackwood Manor into a haven of aromatic herbs, fresh flowers, and soothing meals.

One evening, Damian’s stepbrother, Julian, sent a bottle of vintage red wine, claiming it was an olive branch from the family board.

Damian reached for the glass, tired and indifferent.

Lily caught his wrist. "Don't drink that."

"Lily, it's just wine," Damian frowned.

Lily dipped a polished silver testing needle into the glass. Within seconds, the tip turned deep, corroded black.

"It contains diluted digitalis and aconite," Lily whispered, her medical knowledge sharpening. "Not enough to kill instantly, but enough to trigger gradual nerve necrosis in your legs, ensuring you would never walk again."

Damian stared at the blackened needle, his eyes flaring with dangerous, cold fury. All these years, his disability wasn't an unavoidable tragedy—it was systematic poisoning orchestrated by his own family.`
      },
      {
        id: 'fb4-part3',
        chapterNumber: 3,
        title: 'Part 3: Standing Up for Love',
        wordCount: 1780,
        content: `With the poison identified, Lily formulated an intensive detoxification regimen. Using daily hot herbal baths of mugwort, safflower, and camphor, combined with deep meridian stimulation, she revived the dormant nerves in Damian's legs.

At the Blackwood Corporation shareholder meeting, Julian prepared to sign the documents stripping Damian of his chairmanship due to permanent incapacitation.

"Since my brother cannot stand to lead this empire," Julian smirked, "I will assume the mantle."

The heavy boardroom doors clicked open.

Silence fell like a guillotine.

Walking through the doors with confident, measured strides was Damian Blackwood.

Tall, majestic, dressed in an immaculate black bespoke three-piece suit, he walked without a cane, without a tremor. Beside him walked Lily, holding the forensic chemical analysis of the poisoned wine.

Julian collapsed out of his leather chair, trembling in sheer horror. *"D-Damian?! You're walking?!"*

"Guards, federal investigators," Damian announced coldly. "Take Julian into custody for attempted murder."`
      },
      {
        id: 'fb4-part4',
        chapterNumber: 4,
        title: 'Part 4 (Grand Finale): The Glasshouse of Star Jasmines',
        wordCount: 1850,
        content: `With the traitors behind bars, the Blackwood Syndicate flourished under Damian’s unchallenged rule.

One sunny afternoon, Damian blindfolded Lily and led her to the rear grounds of the estate.

When he removed the silk blindfold, Lily gasped.

Standing before her was a breathtaking, Victorian-style glass botanical conservatory spanning two acres. Inside bloomed thousands of rare star jasmines, snow lotuses, and medicinal herbs from across the globe, with sunlight cascading through crystal panes.

"Damian... what is this?" Lily asked, tears glistening in her eyes.

Damian took both of her hands in his, looking at her with unconditional tenderness.

"You brought light and life back into my darkened world, Lily. You healed my body, but more than that, you healed my soul. This botanical sanctuary is registered in your name."

He knelt down before her, presenting a ring crowned with a natural green emerald surrounded by diamonds.

"Will you marry me, Lily, and be the queen of my heart forever?"

Lily threw her arms around his neck, weeping tears of pure joy. "Yes! A thousand times yes!"`
      }
    ]
  },
  {
    id: 'fb-demigod-bride',
    title: 'The Demigod’s Human Bride: An Urban Legend',
    author: 'Imperial Web Sagas (Facebook Viral Collection)',
    category: 'facebook-story',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Living as a quiet university archivist, Sophia accidentally broke the antique jade seal in the imperial museum. Out stepped Lucian—an immortal demigod who had walked the earth for three thousand years, searching for the soul of the mortal queen who had given him her heart.',
    tags: ['Facebook Viral', 'Complete Saga', 'Urban Fantasy', 'Demigod Romance', 'Soulmates Across Time'],
    chif3nNote: 'Dedicated with infinite love to Leslye: Just like Lucian and Sophia, my soul will always find yours in every lifetime. ❤️✨',
    chapters: [
      {
        id: 'fb5-part1',
        chapterNumber: 1,
        title: 'Part 1: The Broken Imperial Seal',
        wordCount: 1520,
        content: `The museum vault was silent after midnight. 

Sophia dusted the antique jade tablet that had baffled archaeologists for half a century. As her fingertips grazed the central carving, a drop of blood from a small papercut seeped into the stone.

The museum lights flared blinding gold. The jade tablet shattered with the sound of chiming bells.

Emerging from a swirling vortex of starlight and celestial wind was a man whose presence commanded the universe. Tall, possessing eyes that burned like liquid gold, he looked down at Sophia.

He knelt on one knee before her, gently taking her trembling hand and resting his forehead against her knuckles.

"After three thousand years of searching the mortal realms," the Demigod whispered, his voice shaking with centuries of longing, "I have finally found you, my Queen."`
      },
      {
        id: 'fb5-part2',
        chapterNumber: 2,
        title: 'Part 2: Memories of Starlight',
        wordCount: 1640,
        content: `Sophia tried to pull away, but the warmth emanating from his hands felt ancient, familiar, and deeply comforting.

"I... I think you have the wrong person," Sophia stammered. "I'm just Sophia Reed, a junior museum archivist."

The Demigod, Lucian, smiled with heartbreaking tenderness. He touched her forehead with two glowing fingertips.

A tidal wave of celestial memories washed over Sophia’s consciousness:
A palace floating above the clouds. A mortal empress who had brewed healing elixirs for fallen warriors. A sacred oath spoken beneath a weeping willow tree: *"Even if the stars burn out and the universe resets, I will find your soul in every mortal lifetime."*

Tears streamed down Sophia’s cheeks as her soul recognized the divine presence before her.

"Lucian...?" she whispered, her voice trembling.

"I am here, my love," Lucian answered, pulling her into a protective embrace that shielded her from all the cold winds of time.`
      },
      {
        id: 'fb5-part3',
        chapterNumber: 3,
        title: 'Part 3: The Battle of Celestial Shadows',
        wordCount: 1780,
        content: `The shattering of the imperial seal did not go unnoticed. Ancient shadowy entities, seeking to consume the mortal soul of the Demigod's beloved, converged upon the city.

The sky above the capital turned obsidian black as storm clouds crackled with demonic red lightning.

"Stay behind me, Sophia," Lucian said, summoning a magnificent blade of celestial starlight into his grip.

"No," Sophia answered, her eyes glowing with ancient herbal wisdom. She retrieved nine sacred jade crystals from the museum vault. "Three thousand years ago, I fought beside you with medicine and wards. Today, I do not hide."

As Lucian swung his celestial blade, cutting through legions of darkness with divine golden fire, Sophia laid down an ancient herbal purification barrier that cleansed the shadows from the earth.

Together, demigod and mortal queen were invincible.`
      },
      {
        id: 'fb5-part4',
        chapterNumber: 4,
        title: 'Part 4 (Grand Finale): The Eternal Sanctuary',
        wordCount: 1910,
        content: `With the darkness banished and the city bathed in radiant golden dawn, Lucian took Sophia to the highest summit above the clouds.

There, nestled between mountain peaks and weeping cherry blossoms, stood a magnificent palace—the Imperial Herbal Sanctuary.

"In every lifetime, mortal life has brought you pain, labor, and fleeting years," Lucian whispered, placing a crown woven from starlight and everlasting lotus blossoms upon her head. "Here, in this sanctuary, no shadow can reach you. No sorrow can touch your heart."

"Will you stay with me forever?" Sophia asked, leaning her head against his chest, listening to the eternal, rhythmic heartbeat of her Demigod.

"Forever is merely the beginning, my Queen," Lucian smiled, kissing her lips as celestial light wrapped them in an eternity of peace, comfort, and boundless love.`
      }
    ]
  }
];
