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
  novelUpdatesUrl?: string;
  externalReadUrl?: string;
  chapters: NovelChapter[];
}

export const PRELOADED_NOVELS: CuratedNovel[] = [
  // =========================================================================
  // 1. LIGHT NOVELS (EXPANDED COMPLETE SAGAS)
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
    novelUpdatesUrl: 'https://www.novelupdates.com/series/kusuriya-no-hitorigoto/',
    externalReadUrl: 'https://j-novel.club/series/the-apothecary-diaries',
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

She had no desire for imperial glory, no dreams of catching a nobleman's fleeting eye. She merely wanted to return to her apothecary shop in one piece.

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

Maomao hid behind a stone pillar, watching with narrowed eyes.

Both mothers were weeping softly. And both mothers wore identical makeup: thick, alabaster-white powder dusted lavishly across their faces, necks, and exposed shoulders.

Maomao's nostrils flared. Her apothecary instincts flared like dry tinder catching a spark.

*White lead powder.*

The palace concubines craved snow-white complexions to please His Imperial Majesty. They slathered themselves in the imported face powder from dawn until dusk. When they cradled their infants, breastfed them, or kissed their delicate cheeks, the babies inhaled and ingested microscopic flakes of toxic white lead.

Lead poisoning in adults caused abdominal cramps, tooth decay, and dull headaches. In fragile newborns, it caused brain swelling, uncontrollable convulsions, projectile vomiting, and inevitable death.

*It isn't a supernatural curse at all. They are poisoning their own children with vanity.*

Maomao bit her lower lip until it bled. As a low-ranking scullery maid, stepping forward to instruct high consorts would be branded as insolence punishable by fifty cane lashes or public execution.

Yet she could not stand by and allow two innocent babies to suffocate in their cribs.

"Forgive me, Luomen," she muttered beneath her breath. "My curiosity—and my conscience—refuse to remain quiet."`
      },
      {
        id: 'ad-ch2',
        chapterNumber: 2,
        title: 'Chapter 2: An Anonymous Message in Cinnabar',
        wordCount: 1520,
        content: `Under the shroud of the midnight moon, Maomao crept toward the apothecary supply storehouse. 

Because she was on night laundry duty, the eunuch night watch paid little attention to the thin silhouette slipping past the willow trees. She slipped through the side window with the agility of a stray cat.

She did not steal precious musk or pearls. She merely retrieved a scrap of bleached linen, a piece of dry charcoal, and a tiny dab of crushed red cinnabar paste.

On the linen scrap, she pressed her thoughts in neat, elegant imperial script—the calligraphy Luomen had drilled into her hands since she was five years old:

『The white face powder contains the poison of lead. It seeps through the skin and settles in the milk. If you value the precious life of the young royal flower, wash your skin clean with pure spring water. Discard the alabaster cosmetics at once.』

She tied the parchment securely around a fragrant stalk of winter chrysanthemum.

She knew approaching the Crystal Pavilion was suicide; Lady Lifa's head maid was notorious for beating lower servants without trial. But the Jade Pavilion of Lady Gyokuyou was reputed to have a warmer, more compassionate mistress.

Reaching the wooden balustrade of the Jade Pavilion, Maomao tied the ribbon to a carved lattice window and slipped away like a ghost into the misty palace mist.

Three days later, news struck the Rear Palace like a thunderclap.

At the Crystal Pavilion, Lady Lifa's head maid had discovered a similar warning, laughed it off as jealous slander, and tossed it into the brazier. The imperial prince's condition deteriorated rapidly. By dawn, the child had ceased breathing. Wailing echoed from the Crystal Pavilion across the palace lakes.

At the Jade Pavilion, however, Lady Gyokuyou had taken the message seriously. 

She had immediately ordered all face powder washed away with well water and prohibited cosmetics in the nursery. Within forty-eight hours, Princess Lingli's fever broke. Her crimson sores began to heal.

And at the center of the Jade Pavilion, an ethereal figure stood contemplating the linen strip.

Jinshi, the palace administrator whose otherworldly beauty caused both men and women to swoon in stupor, touched the elegant calligraphy with his long, manicured fingers.

"Whoever wrote this saved the Emperor's only remaining heir," Jinshi murmured, his purple-tinged eyes gleaming with razor-sharp curiosity. "Find her. I want to meet this miraculous little maid who knows more than the Imperial Physicians."`
      },
      {
        id: 'ad-ch3',
        chapterNumber: 3,
        title: 'Chapter 3: Summoned by the Celestial Eunuch',
        wordCount: 1740,
        content: `Maomao was on her knees washing grease from iron stewpots when a pair of black satin slippers with silver cloud embroidery stopped directly in front of her pail.

She lifted her chin slowly.

Before her stood an attendant eunuch holding a royal vermilion tablet. Behind him loomed Jinshi himself, his lustrous black hair tumbling over robes of imperial violet silk, his smile radiant enough to blossom lotus flowers in mid-winter.

Any normal palace maid would have dropped to her knees, flushed crimson, or fainted in ecstasy. 

Maomao, however, felt a cold bead of sweat roll down her spine. Her face involuntarily twitched into an expression of sheer revulsion, as if someone had handed her an overripe slug.

*Ah. I've been caught.*

"Are you the maid called Maomao?" Jinshi asked, his voice melodic, smooth as warm honey poured over snow.

"This humble servant is called Maomao, my Lord," she replied, pitching her voice into a dull, monotonous squeak.

Jinshi chuckled softly, crouching down to her eye level. The scent of sandalwood and white orchids drifted from his sleeves. He held up a wooden slip upon which several characters were carved.

"Tell me, little one. Can you read what is inscribed here?"

Maomao knew the trap. If she read it, her cover as an illiterate peasant girl was blown. If she lied, Jinshi's keen gaze would tear through her deception.

She looked at the wooden slip. The characters read: 『Arsenic, aconite, belladonna, lead.』

Her eyes sparkled for an involuntary fraction of a second at the names of her beloved poisons before she quickly dulled her gaze. "This servant cannot read official court script, My Lord."

Jinshi's smile widened. He pulled out the scrap of bleached linen tied with the chrysanthemum ribbon.

"Strange. The ink matches the cinnabar used in the laundry ledger you checked out last Tuesday. And when you wrote 'lead', you used the ancient northern brushstroke variant that only scholars trained in the capital understand. Come with me, Maomao. Lady Gyokuyou wishes to express her gratitude."

Two hours later, Maomao was stripped of her threadbare rough hemp clothes, bathed in warm rosewater, and dressed in emerald silk. 

She was officially appointed as Lady Gyokuyou's personal lady-in-waiting—and imperial poison tester.`
      },
      {
        id: 'ad-ch4',
        chapterNumber: 4,
        title: 'Chapter 4: The Art of the Poison Tester',
        wordCount: 1890,
        content: `To an ordinary mortal, being appointed as an imperial poison tester was equivalent to receiving a slow-motion death sentence. Every bowl of bird's nest soup, every steamed dumpling, every cup of aged plum wine could contain lethal doses of cyanide, powdered toad venom, or wolfsbane.

To Maomao, it was the greatest banquet in the mortal realm.

The Jade Pavilion was a tranquil sanctuary compared to the noisy laundry quarters. Lady Gyokuyou was a graceful beauty with jade-green hair and eyes the color of amber syrup. She treated Maomao not as a dispensable servant, but as a prized guardian.

"Maomao, today His Majesty sent braised pork belly glazed with star anise and rare mountain truffles," the consort smiled warmly from her divan. "Please, inspect it."

Maomao stepped forward. Her fingers were steady as she drew her set of silver tasting needles from her sleeve. 

She dipped the first needle into the sauce. Silver remained bright; no sulfur-based compounds were present. 

Next, she drew a pair of chopsticks, plucked a morsel of the savory pork, and placed it upon her tongue.

She closed her eyes, rolling the food across her palate like a connoisseur savoring fine vintage nectar. Her heart rate, tongue numbness, saliva secretion—she monitored every bodily reflex with clinical precision.

"Hmm... ginger, cinnamon, sweet wine, aged soy..." 

A faint flush of ecstasy rose to her cheeks. Her lips curved upward into a dreamy, entranced smile that looked almost terrifyingly unhinged.

"No trace of belladonna, no bitter almond cyanides, perfectly cooked and delightfully seasoned. Safe for consumption, My Lady!"

Lady Gyokuyou's other three maids exchanged bewildered glances. 

"She... she looked genuinely disappointed that there was no poison," whisper-giggled Yinghua behind her fan.

"I have never seen someone look so crestfallen at clean food," agreed Guiyuan.

Just then, Jinshi entered the pavilion, followed by his stoic military guard Gaoshun. Catching sight of Maomao wiping pork glaze from her lips with a blissfully manic expression, Jinshi stopped in his tracks.

"Gaoshun," Jinshi whispered without looking back.

"Yes, Master Jinshi?"

"Is it my imagination, or does our new poison taster look at lethal venom the way starving men look at golden roast pheasants?"

"It is not your imagination, My Lord. I recommend keeping the medicine cabinet firmly locked at all times."`
      },
      {
        id: 'ad-ch5',
        chapterNumber: 5,
        title: 'Chapter 5: The Mystery of the Powdered Marshmallow',
        wordCount: 1980,
        content: `Winter arrived in full force, blanketing the palace rooftops with pristine jade-tinted snow.

Late one evening, Jinshi summoned Maomao to his private receiving chambers in the outer court. The room was heated by a low charcoal brazier, casting dancing amber shadows across the silk wall hangings.

"Sit, Maomao," Jinshi said, pouring her a cup of hot fermented barley tea.

Maomao sat at the edge of the mat, keeping a cautious two-meter buffer between them. "If Lord Jinshi has a headache, I can brew willow bark. If you have trouble sleeping, dried valerian will do. If you have called me here to test another plate of confections, I am ready."

Jinshi set down his porcelain cup, his face growing uncharacteristically solemn.

"A eunuch in the imperial kitchen died three nights ago. He was found collapsed beside a wooden bowl of powdered sugar and dried marshmallow root. The physicians declared it a sudden heart failure, but I have reason to suspect murder."

Maomao's eyes narrowed. "Marshmallow root? Althaea officinalis?"

"Yes. It was intended for the banquet dessert of the senior imperial ministers." Jinshi opened a lacquered box and withdrew a small pouch containing fine white powder. "Can you tell me what this is?"

Maomao leaned forward, her earlier reticence evaporating in an instant. She dipped the tip of her pinky finger into the powder, brought it to her nose, and sniffed gently.

*Sweet... faintly aromatic... but with a subtle acrid undertone reminiscent of crushed bitter melon seeds.*

Before Jinshi could cry out in alarm, Maomao touched her pinky to the tip of her tongue.

"Maomao, wait!" Jinshi lunged across the low table, grabbing her wrist with startling speed. His hand was warm, his grip firm. "Are you mad? If it is lethal poison—"

"I only took a milligram, My Lord," Maomao said calmly, not even flinching at his touch. She concentrated, feeling the mild tingle at the left edge of her tongue. 

"The numbness is localized. Salivation slightly reduced. It is not white arsenic, nor is it monkshood. This is powdered oleander leaf, combined with dried pufferfish liver."

Jinshi stared at her in utter astonishment. "You can identify that from a microscopic taste?"

"Pufferfish tetrodotoxin produces a distinct icy chill across the tongue within four heartbeats," Maomao explained, her eyes glowing with absolute brilliance. "Oleander brings a bitter aftertaste that burns the back of the throat. Whoever mixed this was clever; the sweet marshmallow root was meant to disguise the bitterness until the victim consumed enough to paralyze their diaphragm."

Jinshi slowly released her wrist. A look of profound respect—and something much deeper and softer—softened his striking gaze.

"You really are a treasure, Maomao," he whispered, his voice catching slightly.

Maomao quickly pulled her sleeve down and bowed low. "This servant merely knows herbs, My Lord. If there are no further poisons to sample, I shall return to Lady Gyokuyou."

As she turned to leave, Jinshi watched her small, purposeful steps disappear into the lantern-lit snow. 

*A treasure indeed,* he thought with a quiet, lingering smile. *And one I intend to protect with my life.*`
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
    novelUpdatesUrl: 'https://www.novelupdates.com/series/sousou-no-frieren-ln/',
    chapters: [
      {
        id: 'fr-prelude',
        chapterNumber: 0,
        title: 'Prelude: The Half-Century Meteor Shower',
        wordCount: 1250,
        content: `The war against the Demon King had lasted ten grueling years. 

To the humans of the party—the heroic swordsman Himmel and the devout priest Heiter—it was an epic struggle that consumed their youth. To the dwarf warrior Eisen, it was a memorable decade of battle.

To the elven mage Frieren, ten years was merely a blip. An eye blink in a lifespan spanning well over a millennium.

"Look, Frieren," Himmel said, pointing toward the night sky above the royal capital. 

Streaks of blue-white light rained down through the clouds—the Era Meteors, which appeared only once every fifty years. The crowds in the streets cheered, lanterns glowing across the festival squares.

"It looks a bit obstructed by the city buildings from here," Frieren commented flatly, her porcelain face showing little emotion. "I know a place on the northern ridge where the view is much clearer. If you want, I'll take you all there next time."

Himmel turned to her. His deep blue hair fluttered in the autumn breeze. His sword rested gently at his hip. A soft, tender smile touched his lips—the kind of smile he only ever directed at her.

"Next time, huh?" Himmel chuckled quietly. "Fifty years from now. That's a promise, then."

Frieren merely nodded. Fifty years was nothing to her. She packed her luggage the following morning, bid her companions a casual farewell, and set off alone across the continent to collect esoteric grimoires and folk spells: magic to create sweet shaved ice, magic to turn red apples blue, magic to remove rust from bronze statues.

She never considered what fifty years meant to a human being.`
      },
      {
        id: 'fr-ch1',
        chapterNumber: 1,
        title: 'Chapter 1: The Tears of an Elf',
        wordCount: 1540,
        content: `Fifty years passed.

Frieren returned to the capital carrying a satchel filled with bizarre magical scrolls. The city walls were rebuilt in newer stone; the children she once passed were now grandparents.

When she knocked on the modest manor door, the man who answered was not the dashing, handsome hero of legend. 

Himmel was now a small, frail old man with a bald head, thick spectacles, and a silver mustache. He walked with a wooden cane, yet his bright blue eyes shone with the exact same radiance when he saw her standing on his porch.

"You haven't changed at all, Frieren," Himmel said warmly. "You're as beautiful as the day we parted."

"You've shrunk, Himmel," Frieren said objectively.

"Hahaha! Cruel as ever!"

True to their promise, the four companions reunited. Eisen looked slightly grayer; Heiter smelled perpetually of sacred altar wine. Together, they hiked up the northern ridge under a canopy of starlight.

The Era Meteors fell like cascading liquid diamonds across the midnight velvet sky. 

Himmel watched the shooting stars, his aged face illuminated by celestial fire. Then, he looked away from the sky and looked at Frieren. He kept his eyes on her until the final star faded behind the mountain peaks.

"Thank you, Frieren," Himmel whispered softly. "Because of you, my life was truly an adventure."

One week later, Himmel passed away peacefully in his sleep.

At the state funeral, hundreds of mourners wept openly. Bells tolled throughout the kingdom. Soldiers knelt in reverent silence.

Frieren stood before the flower-draped casket, her eyes wide, her hands hanging loosely at her sides. She felt nothing. No tears, no pain, just an empty hollow curiosity.

"Look at her," someone in the crowd whispered disdainfully. "She traveled with him for ten years, yet she hasn't shed a single tear. Cold-hearted elf."

The words struck Frieren like a physical blow.

She looked down at Himmel's peaceful face. She remembered how he picked blue moon-weed flowers for her hair. She remembered how he spent hours posing for statues so she wouldn't forget him when he was gone. She remembered his warm hand touching hers in the quiet snowy evenings by the campfire.

*Ten years... I had ten entire years to get to know him.*

*And I never even asked him what his favorite food was. I never asked him what he wanted.*

Tears suddenly surged to Frieren's eyes, hot and uncontrollable, spilling down her pale cheeks like a broken dam. She fell to her knees before the casket, clutching the cold wood.

"I didn't know," Frieren sobbed, her voice trembling with a heartbreak ten centuries in the making. "Human lives are so short... Why didn't I try to know him better?!"

Heiter placed a gentle hand on her trembling shoulder. Eisen bowed his head in quiet sorrow.

From that day forward, Frieren's true journey began: not to conquer monsters or amass power, but to understand the fragile, precious hearts of mortals.`
      }
    ]
  },
  {
    id: 'bookworm-ascendance',
    title: 'Ascendance of a Bookworm (Honzuki no Gekokujou)',
    japaneseTitle: '本好きの下剋上',
    author: 'Miya Kazuki',
    illustrator: 'You Shiina',
    category: 'light-novel',
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1301/102222.jpg',
    synopsis: 'A book-obsessed university student dies in an earthquake under an avalanche of books and reincarnates as Myne, a sickly five-year-old girl in a medieval world where books are luxury items reserved only for high nobility. Determined to read again, she resolves to invent paper and print books with her own hands.',
    tags: ['Isekai', 'Crafting', 'Family Devotion', 'Libraries', 'Determination'],
    chif3nNote: 'Dedicated to Leslye: Your boundless passion for learning, creating, and conquering obstacles inspires me every day. 📖✨',
    novelUpdatesUrl: 'https://www.novelupdates.com/series/ascendance-of-a-bookworm/',
    chapters: [
      {
        id: 'bw-prologue',
        chapterNumber: 0,
        title: 'Prologue: Reborn in a World Without Paper',
        wordCount: 1300,
        content: `Motosu Urano loved books more than breathing itself. 

She loved the crisp smell of freshly cut wood pulp, the rough grain of antique leather bindings, the whisper of turn pages in a quiet university library. Her dying wish, as an earthquake caused shelves of heavy encyclopedias to collapse over her, was simple:

*Gods of literature, if I am reborn, please let me be surrounded by books forever.*

When she opened her eyes, she was not in a grand library. 

She was lying on a scratchy straw mattress inside a dim, soot-stained bedroom. Her arms were tiny, emaciated twigs. Her breath wheezed through her lungs with a terrifying, feverish rattle known as the Devouring.

"Myne, sweetheart, are you awake?" a tired woman in a coarse hemp dress asked, wiping her forehead with a damp rag. This was Effa, her new mother. Beside her stood Gunther, a boisterous city gatekeeper with teary eyes, and Tuuli, her sweet older sister.

Urano—now named Myne—scanned the room frantically. 

No bookshelves. No paper. No newspapers. Not even a stray scrap of writing on the wooden walls.

When she finally regained enough strength to stumble into the city market of Ehrenfest, the grim reality crushed her soul:

In this medieval fantasy world, books were hand-copied onto expensive sheepskin vellum, bound with gold leaf, and purchased exclusively by high-ranking arch-nobles. A single volume cost the equivalent of a soldier's annual salary.

"If there are no books," Myne declared through clenched teeth, her golden eyes burning with divine fury, "then I will simply make them myself from scratch!"`
      },
      {
        id: 'bw-ch1',
        chapterNumber: 1,
        title: 'Chapter 1: The First Wooden Tablet & Plant Fibers',
        wordCount: 1420,
        content: `Making paper in a medieval city when you are a sickly five-year-old who faints after walking twenty paces is an exercise in pure stubbornness.

Myne's first experiment was ancient Egyptian papyrus. She dragged herself to the riverbank with Tuuli, gathered bundles of wild reeds, and attempted to weave and press them. 

Result: The neighborhood goats devoured them overnight.

Her second experiment was clay tablets like the ancient Sumerians. She molded river clay into flat slates, carved letters with a wooden stylus, and placed them in her mother's wood-fired cooking stove.

Result: The moisture inside expanded rapidly; the tablets exploded into ceramic shrapnel, ruining dinner and earning her a stern lecture from Gunther.

"Why do you keep obsessing over these strange scratches, Myne?" Tuuli asked gently, bandaging Myne's blistered fingers.

"Because words are how human souls talk across centuries, Tuuli," Myne said, leaning her fever-hot cheek against her sister's warm shoulder. "When you read a book, you are never truly alone. The author's mind is whispering directly into yours."

Tuuli didn't fully comprehend, but she smiled and squeezed Myne's hand. "Then I'll help you gather more wood tomorrow."

With the support of her loving family and a young merchant apprentice named Lutz, Myne set her sights on true bast fiber paper—steaming the bark of the local volrin tree, boiling it in wood ash lye, and straining the slurry through a bamboo mesh screen.

The road ahead was long, fraught with greedy merchant guilds and haughty nobles, but nothing in this world or the next could extinguish the flame of a true bookworm.`
      }
    ]
  },

  // =========================================================================
  // 2. VIRAL FACEBOOK STORIES (COMPLETE BINGEABLE DRAMA SAGAS)
  // =========================================================================
  {
    id: 'fb-billionaire-pharmacist',
    title: 'The Concealed Heiress: The CEO’s Secret Herbalist Wife',
    author: 'Imperial Web Sagas (Facebook Viral Collection)',
    category: 'facebook-story',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Married for three years to Ethan Vance, the ruthless billionaire CEO of the Vance Financial Syndicate, Clara was treated by his family as a dispensable country orphan who ran a modest herbal tea shop. Little did they know, Clara was the sole living heir to the ancient Miracle Doctor Lin clan. When the matriarch is poisoned by a rival, only Clara can save the empire.',
    tags: ['Facebook Viral', 'Hidden Identity', 'Medical Miracle', 'Billionaire Romance', 'Sweet Revenge'],
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
        title: 'Part 2: The Silver Needle in the Dark',
        wordCount: 1780,
        content: `Within seconds, Dr. Jonathan Hayes, the head physician of the Capital City Central Hospital, rushed through the crowd with his medical bag.

"Clear a perimeter! Give her air!" Dr. Hayes barked, checking Madam Vance’s carotid artery. His face drained of color. "Arrhythmia! Blood pressure dropping precipitously! Her airway is swelling from an acute neurotoxic shock! Prepare an emergency epinephrine injection!"

"Wait!" Clara’s clear, commanding voice cut through the chaos like a silver scalpel.

She stepped through the ring of trembling billionaires, kneeling directly beside the unconscious elderly matriarch.

"It is not an allergic reaction," Clara said, lifting Madam Vance’s limp wrist. With two fingers on the radial artery, Clara’s expression sharpened into that of a master general assessing a battlefield. "Her pulse is scattering like wild geese in a blizzard. Look at the corners of her fingernails—purple-black striations. She drank the celebratory blue cordial, which was brewed with wild mountain honeysuckle that had been harvested near toxic wolfsbane."

"Get away from my grandmother, you madwoman!" Linda Vance shrieked, reaching out to shove Clara aside. "You're a country quack! Dr. Hayes is an internationally certified specialist!"

"Shut up, Linda!" Ethan’s voice boomed like rolling thunder across the ballroom.

For the first time in three years, Ethan Vance looked at his quiet wife not with indifference, but with absolute intensity. He caught Linda’s arm, freezing his cousin in place.

"Clara," Ethan’s voice dropped low, his gaze boring into hers. "Can you save her?"

"If Dr. Hayes injects epinephrine right now, the heightened heart contraction will accelerate the wolfsbane toxin to her brain within sixty seconds," Clara stated without blinking. "I need my mahogany box. Now."

Ethan didn't hesitate. He grabbed the wooden box from the buffet table and placed it into her hands.

Opening the secret velvet latch at the bottom of the box, Clara revealed nine silver acupuncture needles, each engraved with the sacred double-dragon crest of the Miracle Doctor Lin clan—the legendary medical dynasty that had vanished from public eye two decades ago.

Dr. Hayes gasped, stumbling backward. "The... the Nine Dragon Needles of Master Lin?! That’s impossible! The Lin family went into seclusion!"

Clara did not answer. Her fingers moved with blinding precision. 

*Flick. Tap. Strike.*

Three needles entered the Tianquan and Neiguan acupoints. A fourth needle struck the Renying artery with surgical delicacy.

Within ten seconds, a trickle of dark, foul-smelling blood seeped from the tip of Madam Vance’s index finger. 

The old woman suddenly gasped, taking in a massive, ragged lungful of oxygen. The horrifying blue hue around her lips faded back to soft pink. Her eyes fluttered open.

"E-Ethan..." Madam Vance rasped weakly.

Silence—deafening, stunned silence—swallowed the ballroom. The elite guests stared at Clara Vance as if she were a celestial deity descending from the clouds.`
      },
      {
        id: 'fb1-part3',
        chapterNumber: 3,
        title: 'Part 3: The True Heiress Unveiled',
        wordCount: 1820,
        content: `Three days after the banquet, the atmosphere in Capital City underwent a seismic shift.

Dr. Jonathan Hayes, renowned for his arrogance, waited outside Clara’s modest herbal shop on Willow Lane for five hours in the pouring rain, holding an antique medical treatise above his head, begging for five minutes of instruction from the "Supreme Divine Needle."

Inside the shop, Clara sat behind an antique counter made of cedar wood, calmly weighing dried angelica and licorice root on a brass balance scale.

The brass chimes above the door jingled.

Ethan Vance walked in. Gone was his usual entourage of six bodyguards in black suits. He wore a simple black cashmere sweater, his coat damp with rain. He stopped before the counter, his gaze drinking in the sight of her slender, elegant hands.

"You never told me," Ethan spoke softly, the usual icy fortress of his persona completely melted.

"You never asked," Clara answered calmly, without lifting her head. "Three years ago, Old Master Vance took a bullet in his lung during a trade expedition in the northern mountains. My grandfather, Master Lin Sheng, pulled that bullet out and healed his pulmonary lining with herbal steam. In exchange, your grandfather insisted on our betrothal."

She set down the brass weights and looked straight into Ethan’s piercing amber eyes.

"You believed I was an uneducated country orphan who clung to you for Vance wealth. But the Lin Medical Group owns seventy percent of the pharmaceutical supply lines throughout East Asia. My personal foundation holds more liquid capital than your entire conglomerate, Ethan."

Ethan flinched as if struck. A bitter, self-deprecating smile touched his handsome lips.

"So all those times my mother complained about your simple clothing... all those times Cynthia bragged about her family’s five-million-dollar clinics..."

"I simply didn't care for vanity," Clara shrugged gently. "To an apothecary, diamond necklaces cannot cure a fever, and prestige cannot stop internal hemorrhaging. I stayed for three years because I promised your grandfather I would protect your family through Madam Vance’s eightieth milestone."

She slid a neat, stamped envelope across the wooden counter.

*Agreement of Mutual Divorce.*

Ethan’s chest constricted with an ache so sharp and foreign that it left him breathless. He looked from the white paper to Clara’s calm, radiant face.

For three years, he had been blind. He had owned the rarest, most dazzling diamond in the world and treated it like a common river pebble.

Ethan reached out. But instead of signing the paper, his long, warm fingers gently closed over the document and tore it cleanly in half.

"I won't sign it, Clara," Ethan whispered, his eyes burning with fierce, unshakable resolve. "You honored your grandfather’s promise. Now it’s my turn to court the woman I was too stupid to see."`
      },
      {
        id: 'fb1-part4',
        chapterNumber: 4,
        title: 'Part 4: The Demigod CEO’s Royal Repentance',
        wordCount: 1910,
        content: `News of Ethan Vance’s daily pilgrimage to the modest herbal shop on Willow Lane became the hottest topic across the financial district.

Every morning at precisely seven o'clock, the CEO of Vance Syndicate arrived not with ostentatious roses or sports cars, but with sacks of organic fertile soil, bundles of rare dried ginseng roots imported from the Changbai Mountains, and fresh steamed meat buns from Clara’s favorite breakfast cart.

"Mr. Vance," Clara sighed on the seventh morning, leaning against the doorframe with a bundle of dried mugwort in her apron. "You have a board meeting in thirty minutes that will decide a four-billion-dollar port acquisition. Why are you sweeping my front porch?"

"The board can wait," Ethan replied smoothly, leaning the broom against the brick wall. His sleeves were rolled up to his forearms, revealing strong, muscular tendons. He handed her a thermos of hot osmanthus tea. "Your wrist was strained yesterday after pounding twenty mortar bowls of cinnabar. Drink this; I had our private chef brew it according to your exact herbal recipe."

Clara looked at the warm thermos, her heart fluttering with an involuntary spark she had fought hard to suppress.

That evening, Cynthia Moore made her final desperate play.

Convinced that Clara was using illicit narcotics to enchant Ethan, Cynthia arrived at Willow Lane accompanied by the city’s Chief Health Inspector and four news reporters.

"Inspect this unlicensed hovel immediately!" Cynthia demanded loudly, pointing her manicure at Clara’s shelves of clay jars. "This woman is distributing counterfeit unregulated medicines! She nearly killed Madam Vance at the gala and covered it up with parlor tricks!"

Before the health inspector could take a single step forward, three sleek black armored Maybachs screeched to a halt along the cobblestone street.

Out stepped Madam Vance herself, walking tall with a jade cane, flanked by the city’s Chief of Police and the Minister of Health.

"Who dares touch my savior's apothecary?!" Madam Vance’s voice rang with the fury of an imperial empress.

The Health Inspector froze, trembling violently. "M-Madam Vance! Minister Chen?!"

Minister Chen stepped forward, holding a gold-embossed decree bearing the National Cultural Heritage crest. 

"Clara Lin is the Grand Patron of the National Medical Academy and the chief consultant to the State Healthcare Commission. Every prescription formulated in this shop is protected under Class-A National State Secret status. Miss Moore, you are under immediate arrest for malicious corporate espionage and attempting to poison Madam Vance's birthday cordial."

Cynthia’s face turned paper-white. Her knees buckled; she collapsed onto the wet cobblestones in complete ruin as the police escorted her away.

Under the glowing paper lanterns of the herbal shop, Ethan walked to Clara’s side. He didn't say a word. He simply slipped his warm, strong hand into hers, his fingers intertwining with hers naturally, as if they were made to fit together for eternity.`
      },
      {
        id: 'fb1-part5',
        chapterNumber: 5,
        title: 'Part 5: An Imperial Wedding under Starlight (Finale)',
        wordCount: 2100,
        content: `One year later.

The southern coast of the private island of Asteria was blanketed in fragrant white jasmine and blooming night-lotus flowers. 

There was no press, no corporate sponsors, no gossiping socialites. Only the gentle whisper of ocean waves and the warm golden glow of a thousand floating paper lanterns drifting into the twilight sky.

Ethan Vance stood at the edge of the seaside pavilion, dressed in a bespoke midnight-blue tuxedo embroidered with faint silver cloud filigree. When the music began—a soft, sweeping melody played on traditional bamboo flute and harp—his breath caught in his throat.

Clara walked down the jasmine-strewn aisle.

Her wedding gown was a masterwork: ivory silk infused with botanical dyes that shimmered with subtle emerald reflections under the moonlight. In her hair rested a haircomb carved from thousand-year-old fragrant sandalwood, crowned with delicate pearls.

When she reached him, Ethan took both of her hands. His fingers were trembling slightly—the fearless titan of commerce, brought to reverent awe before the woman he adored.

"Three years ago, I thought I knew what success looked like," Ethan spoke, his voice thick with deep emotion. "I thought it was numbers on a balance sheet, tall towers, and commanding boardrooms. But I was an empty shell until you taught me how to truly see."

He raised her left hand to his lips, kissing the soft skin above her silver jade bracelet.

"You heal the broken world with quiet patience, Clara. From this night forward, until the stars run out of light, my empire, my heart, and my very soul belong to you alone."

Tears shimmered in Clara’s emerald eyes—not tears of sorrow, but of radiant, unburdened happiness. 

"I used to think love was a toxic substance that caused only vulnerability and pain," Clara smiled, her fingers gently caressing Ethan’s cheek. "You proved to me that true love is the only universal remedy that cures every wound. I love you, Ethan Vance."

Under the celestial canopy of stars, Ethan pulled her into his arms, dipping her slightly as their lips met in a breathtaking, passionate kiss. 

Floating lanterns rose like newborn constellations over the sapphire sea, celebrating the forever reign of the Divine Apothecary and her devoted Demigod Protector.`
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
    tags: ['Facebook Viral', 'Medical Drama', 'Sweet Revenge', 'Alpha Protector', 'Second Chance'],
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
        title: 'Part 2: The Dying Titan & The Begging Vice-Director',
        wordCount: 1850,
        content: `The helicopter blades slowly spun to a halt. 

Out stumbled a dozen armed security personnel in tactical vests, followed by several doctors in frantic disarray. At the front was Vice-Director Bradley himself, his designer suit drenched in mud, his face gray with terror.

And carried on an emergency mobile gurney was Alexander Sterling—the legendary 32-year-old defense contractor and titan of the Sterling Global Aerospace conglomerate.

Alexander was convulsing, his skin burning with a lethal 106-degree neurotoxic fever, his monitors shrieking with cardiac collapse.

"Master Doctor! Please, have mercy!" Bradley wailed, throwing himself flat onto the muddy gravel before Maya’s wooden porch. "Mr. Sterling was exposed to an experimental neurotoxin in the northern test grounds! All three chief neurosurgeons at St. Jude gave up! The National Defense Council informed us that only the hermit physician of Mist Valley holds the antidote!"

Bradley lifted his tear-stained face—and his breath hitched. The words died in his throat.

Standing on the porch with a wicker basket of dried sage was Maya Cole.

"M-Maya?! You... you are the Miracle Doctor of Mist Valley?!" Bradley stammered, his eyes bulging with sheer horror.

Maya looked down at him as if inspecting an insignificant insect crawling on a stone.

"Five years ago, Vice-Director Bradley, you told me I would never practice medicine again. Why are you on your knees in my lavender field?"

"I was blind! I was a fool!" Bradley sobbed, slapping his own cheeks repeatedly. "Forgive me, Dr. Cole! If Alexander Sterling dies on our watch, the entire Bradley clan will be court-martialed and imprisoned for treason! Save him! I will give you anything—the hospital, ten million dollars, my own resignation!"

Maya ignored Bradley completely. Her eyes shifted to the man on the gurney.

Alexander Sterling, even while unconscious and on the brink of death, possessed an aura of immense power. His broad shoulders strained against the straps, his chiseled face taut with agony. As their eyes momentarily met through his half-lidded haze of fever, he weakly reached out, his calloused hand brushing her fingers.

"Help... me..." Alexander whispered with his dying breath.

Maya’s pulse leaped. "Bring him into my treatment room. Bradley, stay outside in the rain. If you take one step onto my porch, I will leave your patient to fate."`
      },
      {
        id: 'fb2-part3',
        chapterNumber: 3,
        title: 'Part 3: The Midnight Revival & His Vow',
        wordCount: 1980,
        content: `For six grueling hours, the wood-fired stove inside Maya’s clinic burned with wild mountain mint, crushed camphor, and steamed wolfberry resin.

Maya worked without pause. She inserted twenty-four silver needles along Alexander’s spine, systematically draining the blackened neurotoxic fluid from his lymphatic nodes. When his pulse dipped dangerously near zero, she fed him a dark, concentrated tincture of century-old snow lotus drop by drop.

By 3:00 AM, the shrieking heart monitor stabilized into a strong, rhythmic, steady beep.

Alexander’s fever broke. A deep, natural sleep settled over him.

Exhausted, Maya slumped into the wooden rocking chair beside the bed, her forehead resting against her arm.

When dawn painted the mountain mist in shades of rose and amber, Alexander Sterling opened his eyes.

His mind was razor-sharp, his senses clearer than they had been in years. The agonizing fire that had consumed his veins was completely gone. 

He turned his head. Sleeping beside him was the young woman whose soft, fearless hands had pulled him back from the gates of death. Sunlight illuminated the gentle curve of her eyelashes and a faint smear of dried herbal paste on her cheek.

Alexander’s heart thumped with a ferocious, protective warmth he had never experienced in his life of war and boardrooms.

He gently pulled his military jacket over her shoulders so she wouldn't catch cold.

Just then, Bradley cautiously peered through the window, waving frantic hand signals.

Alexander quietly stepped out onto the porch, shutting the timber door behind him. The moment he faced Bradley, his expression became that of a merciless apex predator.

"Bradley," Alexander’s voice was as cold as dry ice. "I heard everything you said yesterday before I passed out. You blacklisted my savior five years ago to protect your corrupt nephew?"

Bradley turned white as chalk, his knees shaking uncontrollably. "M-Mr. Sterling, it was an administrative misunderstanding—"

"By noon today," Alexander decreed, staring down at the terrified administrator, "your medical license is permanently revoked. Your nephew is handed over to the Supreme Anti-Corruption Commission. And St. Jude Hospital? I’m buying it out entirely. Dr. Maya Cole will be appointed Chief Executive Director and Dean of Medicine."

Alexander turned back toward the quiet lodge, a rare, tender smile touching his handsome lips.

"She gave me my life back. Now I’m going to give her the entire medical world."`
      }
    ]
  }
];
