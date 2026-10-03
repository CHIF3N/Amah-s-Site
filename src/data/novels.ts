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
  tags: string[];
  chif3nNote: string;
  novelUpdatesUrl: string;
  chapters: NovelChapter[];
}

export const PRELOADED_NOVELS: CuratedNovel[] = [
  {
    id: 'apothecary-diaries',
    title: 'The Apothecary Diaries (Kusuriya no Hitorigoto)',
    japaneseTitle: '薬屋のひとりごと',
    author: 'Natsu Hyuuga',
    illustrator: 'Touko Shino',
    coverUrl: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg',
    synopsis: 'In an imperial court rife with whispers and deadly concubine rivalries, Maomao, an eccentric young pharmacist from the pleasure district, finds herself drafted into service. Her insatiable obsession with poisons and medicinal herbs becomes the rear palace\'s greatest salvation.',
    tags: ['Apothecary', 'Court Mystery', 'Historical', 'Romance', 'Medical Alchemist'],
    chif3nNote: 'Our absolute favorite! Dedicated to Leslye: your cleverness, quiet grace, and fierce spirit mirror Maomao in every single chapter. 🌿✨',
    novelUpdatesUrl: 'https://www.novelupdates.com/series/kusuriya-no-hitorigoto/',
    chapters: [
      {
        id: 'ad-prologue',
        chapterNumber: 0,
        title: 'Prologue: The Pharmacist of the Red-Light District',
        wordCount: 820,
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
        wordCount: 1150,
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
        wordCount: 1040,
        content: `Under the shroud of the midnight moon, Maomao crept toward the apothecary supply storehouse. 

Because she was on night laundry duty, the eunuch night watch paid little attention to the thin silhouette slipping past the willow trees. She slipped through the side window with the agility of a stray cat.

She did not steal precious musk or pearls. She merely retrieved a scrap of bleached linen, a piece of dry charcoal, and a tiny dab of crushed red cinnabar paste.

On the linen scrap, she pressed her thoughts in neat, elegant imperial script—the calligraphy Luomen had drilled into her hands since she was five years old:

*『The white face powder contains the poison of lead. It seeps through the skin and settles in the milk. If you value the precious life of the young royal flower, wash your skin clean with pure spring water. Discard the alabaster cosmetics at once.』*

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
        wordCount: 1220,
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

She looked at the wooden slip. The characters read: *『Arsenic, aconite, belladonna, lead.』*

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
        wordCount: 1300,
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
        wordCount: 1450,
        content: `Winter arrived in full force, blanketing the palace rooftops with pristine jade-tinted snow.

Late one evening, Jinshi summoned Maomao to his private receiving chambers in the outer court. The room was heated by a low charcoal brazier, casting dancing amber shadows across the silk wall hangings.

"Sit, Maomao," Jinshi said, pouring her a cup of hot fermented barley tea.

Maomao sat at the edge of the mat, keeping a cautious two-meter buffer between them. "If Lord Jinshi has a headache, I can brew willow bark. If you have trouble sleeping, dried valerian will do. If you have called me here to test another plate of confections, I am ready."

Jinshi set down his porcelain cup, his face growing uncharacteristically solemn.

"A eunuch in the imperial kitchen died three nights ago. He was found collapsed beside a wooden bowl of powdered sugar and dried marshmallow root. The physicians declared it a sudden heart failure, but I have reason to suspect murder."

Maomao's eyes narrowed. "Marshmallow root? *Althaea officinalis*?"

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
        wordCount: 950,
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
        wordCount: 1100,
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
        wordCount: 980,
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
        wordCount: 1120,
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
  }
];
