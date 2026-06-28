import { pick } from "./helpers";
import type { Season, Player } from "./types";

const POOL: Record<string, string[]> = {
  ballon: [
    "Untouchable. The whole sport bends around you.",
    "A season for the ages — the best player alive.",
    "You didn't just win games, you redefined them.",
    "No one on the planet played like you this year.",
    "They'll be showing your highlights in ten years' time.",
    "You made it look easy, which made it look unfair.",
    "A generation-defining performance. Your name is everywhere.",
    "Some seasons you don't win the award. This wasn't one of them.",
    "The debate is over. There's you, then there's everyone else.",
    "Every coach, every pundit, every fan — they all agree. The award was yours.",
  ],

  injury: [
    "A cruel injury swallowed half your season.",
    "Stop-start year — the physios saw too much of you.",
    "Your body betrayed you at the worst time.",
    "Months lost to the treatment room.",
    "You came back from the injury, but the rhythm never fully returned.",
    "The scan changed everything — a season of patience, not football.",
    "Back in training, back out injured. A year to forget.",
    "You fought to get back. That counts for something.",
    "The injury robbed you of your best months.",
    "Long days in the gym. Longer days watching your teammates play.",
    "A setback that tested your head as much as your body.",
    "You returned, but this season belonged to the treatment table.",
    "Injury-hit — a year of what-ifs and half-seasons.",
    "The frustration of watching from the stands when you should be playing.",
    "You kept your spirits up in the treatment room. That's harder than it looks.",
  ],

  breakout: [
    "The breakout. Scouts across Europe are circling.",
    "Something clicked — you look a level above.",
    "From prospect to problem-for-defenders overnight.",
    "The year people started saying your name properly.",
    "Every week a new highlight. Every week a bigger audience.",
    "Coaches across Europe are pulling up your tape.",
    "You stopped being a name to remember and became one to fear.",
    "The leap. The one everyone suspected was coming.",
    "Overnight sensation — except it took years of work to get here.",
    "This is what potential looks like when it arrives.",
    "The step up everyone was waiting for. You didn't disappoint.",
    "It's like something switched. Every game felt inevitable.",
    "From talented to elite — the gap closed in one season.",
    "The rest of the squad noticed it first. Then the league did.",
  ],

  bench: [
    "Barely featured — mostly a view from the bench.",
    "Game time dried up. The whispers started.",
    "A frustrating, forgettable year on the fringes.",
    "You trained well. You played little.",
    "The manager just didn't fancy you.",
    "Warm-up after warm-up. Barely a competitive minute.",
    "The hardest thing in football: being good enough but not chosen.",
    "Your boots barely got muddy this year.",
    "A season of watching, waiting, and wondering.",
    "You could see the team needed you. The manager disagreed.",
    "Cameo appearances don't build careers. Something has to change.",
    "Three starts all season. This simply can't continue.",
    "Invisible. Frustrated. Time to make a decision.",
    "Carrying water bottles and watching others live your dream.",
    "The minutes weren't there — and your career can't afford too many more of these.",
    "Every week on the bench is a week your career isn't moving forward.",
  ],

  benchElite: [
    "Squad player at one of the biggest clubs in the world — the hardest role in football.",
    "The competition for places here is brutal. That's just what it is at this level.",
    "Even getting on the pitch puts you ahead of most professionals. But you want more.",
    "A season in and out of the side at the very top of the game.",
    "Bench at a top club, or starting for a smaller one — that question is getting louder.",
    "The squad depth here is frightening. You're still fighting for your place in it.",
    "The quality around you is extraordinary. So is your frustration.",
    "They didn't sign you to warm the bench forever. Make your case.",
  ],

  benchVet: [
    "At your age, minutes drying up sends a message. You have to be honest with yourself.",
    "A difficult season. The game doesn't slow down to wait for anyone.",
    "The body is fine. The manager has just moved on.",
    "You've earned too much to accept this quietly. Something has to give.",
    "The career is winding down — but on your terms or someone else's?",
    "Watching from the bench at this stage of your career hurts. Do something about it.",
    "The years of experience count for nothing if you're not on the pitch.",
  ],

  youth: [
    "Tearing it up in the youth ranks.",
    "The academy staff can't stop talking about you.",
    "Catching the first team's eye in training.",
    "A standout year in the reserves.",
    "You're already doing things that have the senior players watching.",
    "Goals, performances, attitude — ticking every box in the academy.",
    "Quietly becoming the most talked-about youngster at the club.",
    "The youth coaches have never seen one develop this fast.",
    "You're not supposed to make it look this easy at this age.",
    "Every time the first-team staff watch you, they leave impressed.",
    "The senior squad are whispering your name. It won't be long now.",
    "A youth season that felt like a statement.",
    "Dominating your age group — the next level beckons.",
    "The academy has produced good players. You might be the best of them.",
    "Every training ground session is an audition. You keep getting the part.",
    "Technically ahead of where you should be. The coaches are taking note.",
  ],

  ucl: [
    "European glory under the lights. Unforgettable.",
    "Champions of Europe. Nothing tops that night.",
    "You conquered the continent.",
    "The biggest stage, your finest hour.",
    "That night in the final — you'll be telling that story forever.",
    "They'll be making documentaries about this run for decades.",
    "From group stage to the roof of European football.",
    "You held the biggest trophy in club football. Let it sink in.",
    "Nights like that are why you started playing.",
    "The anthem. The final. The trophy. Yours.",
    "The Champions League. The one everyone chases. You caught it.",
    "Europe conquered. The greatest night in club football, and you were there.",
    "The whole continent watched. Only one team won. Yours.",
  ],

  league: [
    "Champions. You delivered when it mattered most.",
    "Title secured — the city throws a party.",
    "Top of the pile. A deserved crown.",
    "Unbeaten when it counted. Champions.",
    "The title race was tight. You made the difference.",
    "Medal around your neck. Season done right.",
    "The table doesn't lie. You were the best.",
    "Every training session paid off on the day you clinched it.",
    "They tried to catch you. Nobody could.",
    "A title season. Every player's dream, your reality.",
    "League champions — the grind of a full season, paid off in a single afternoon.",
    "First place, final day. The purest feeling in football.",
    "Consistency won it. You showed up every week, and the table shows it.",
  ],

  cup: [
    "Cup glory — the one they said you couldn't win.",
    "Final day drama, and you came out on top.",
    "Silverware. Not the biggest, but it counts.",
    "A cup run that captured everyone's attention.",
    "The day the squad came together and won something real.",
    "Domestic cup winners. Your name on the trophy.",
    "Wembley, or wherever — the feeling is the same. Winner.",
    "Cups aren't the league, but they're not nothing. Ask anyone who's lifted one.",
    "A one-off occasion and you delivered. That's what matters.",
  ],

  worldcupwin: [
    "World champions. The biggest there is.",
    "You've done what millions never will. World Cup winner.",
    "That summer belonged to you. To all of you.",
    "No medal is heavier. No night more electric.",
    "The whole country screaming your name. Nothing compares.",
    "Immortal. A World Cup winner's medal doesn't tarnish.",
    "They'll be talking about that tournament for a generation.",
    "Not everyone from your country wins a World Cup. You did.",
    "The golden trophy, the golden summer. Yours.",
    "The moment every child dreams about. You lived it.",
  ],

  continentalwin: [
    "Continental champions. A summer to define careers.",
    "You and your nation — on top of your region.",
    "They'll sing about this victory back home for years.",
    "Tournament football suits you. Crowned continental champions.",
    "The best team in the continent. You proved it.",
    "International glory — the country celebrated like it meant everything. It did.",
    "Tournament winners. The whole squad in pieces at the final whistle.",
    "Every qualifier, every group game, every knockout — it led to this. Worth it.",
  ],

  fwdHot: [
    "Goals, goals, goals — the fans chant your name.",
    "You couldn't stop scoring this year.",
    "Defenders had nightmares about you.",
    "Every shot felt like it had a chance. Most of them found the net.",
    "A striker in this kind of form is almost impossible to stop.",
    "Your movement. Your finishing. Your season.",
    "The golden boot conversation has your name at the top.",
    "Ruthless. Clinical. Unplayable.",
    "The goals came in twos and threes. The season came together.",
    "Every defender in the league is relieved the season's over.",
    "They doubled up on you. It didn't matter.",
    "The net rippled so often it barely had time to settle.",
    "You didn't just score — you scored the important ones too.",
    "A striker's season that will be remembered long after the last whistle.",
    "Your instinct in the box this year was something else entirely.",
  ],

  midHot: [
    "You ran the midfield from whistle to whistle.",
    "Every good move went through you.",
    "The metronome — you set the tempo all year.",
    "Assists, interceptions, leadership — your best season yet.",
    "You made the complicated look simple, week after week.",
    "The engine room ran at full power all season.",
    "Covering every blade of grass, then delivering at the end of it.",
    "The passes others wouldn't even attempt — you made them routine.",
    "Box to box, tackle to through ball. You owned the middle of the park.",
    "The kind of season that changes how teams game-plan against you.",
    "Your influence went beyond the assist tally. The team moved differently around you.",
    "The heartbeat of the team — every good spell started with you.",
    "A creator, a destroyer, a leader. Everything a modern midfielder needs to be.",
    "Opposing managers spent all week figuring out how to stop you. Most couldn't.",
  ],

  defHot: [
    "A wall at the back. Strikers bounced off you.",
    "Rock solid — a defender's defender.",
    "Nothing got past you this season.",
    "Set pieces, aerials, one-on-ones — you won them all.",
    "The best attackers in the division barely got a sniff.",
    "Every manager wants a defender like you. There aren't many.",
    "You made your position look like an art form.",
    "Clean, composed, commanding. A masterclass in defending.",
    "Leaders lead from the back. You proved that all season.",
    "Forwards stopped looking forward to games against you.",
    "The backline held because of you. The stats show it.",
    "Your reading of the game at this level is extraordinary.",
    "Tackles, headers, positioning — nothing was left to chance.",
    "Opponents learned fast: this channel is closed.",
    "Disciplined, dominant, decisive at the back. The complete defender.",
  ],

  gkHot: [
    "Save after save — a brick wall in goal.",
    "Clean sheets piled up behind you.",
    "You bailed the team out week after week.",
    "Some games, you were the difference between three points and zero.",
    "The penalty save. The last-minute tip over. The commanding cross claiming.",
    "Goalkeepers don't always get the headlines. You earned them anyway.",
    "Your distribution alone changed how the team played.",
    "They'd have conceded twice as many without you. Maybe more.",
    "Gloves on, head up, shot stopped. Week after week.",
    "The best goalkeeper in your league this season. It wasn't close.",
    "Every time it looked certain to go in, you were there.",
    "Shot-stopper, organiser, leader — you did it all this year.",
    "Your presence between the posts gave the whole team confidence.",
  ],

  highRating: [
    "The stats don't fully capture how well you played this year.",
    "Consistent, sharp, decisive — your rating tells the whole story.",
    "Week in, week out, one of the best performers in the division.",
    "Not the most decorated season, but one of your most consistent.",
    "Player of the month conversations had your name all year.",
    "Clean performances every week — the mark of a complete player.",
    "Seven-out-of-ten seasons don't happen by accident. This was closer to nine.",
    "Your manager could set his watch by your performances.",
    "No trophies this time — but in terms of form, you were excellent.",
    "The quiet excellence season — everyone around you noticed.",
    "Not flashy. Just relentlessly, impressively good.",
  ],

  rotation: [
    "An impact player year — short bursts, meaningful contributions.",
    "Off the bench more than you'd like, but making it count.",
    "Rotation is its own art. You played it well.",
    "Not always starting, always ready. Professional.",
    "Limited minutes, but you left a mark when called upon.",
    "The squad role this year — you accepted it and excelled within it.",
    "Twenty minutes here, thirty there. You made them count.",
    "The manager knew you could be trusted in any situation.",
    "A rotation player who never dropped the intensity. Valuable.",
    "The squad relies on players like you, even when the name isn't on the teamsheet.",
    "Impact sub, squad glue, reliable pro. Not glamorous — essential.",
    "You never sulked, never complained, always delivered when needed.",
  ],

  youngDebut: [
    "Not many players make the senior game look straightforward at your age.",
    "One of the youngest in the squad, one of the most reliable.",
    "The kid they said wasn't ready. The results say otherwise.",
    "Playing senior football at your age — most are still in the reserves.",
    "A debut season that exceeded every expectation.",
    "Youth is usually an excuse. You made it an advantage.",
    "At your age, this level of performance is almost unheard of.",
    "The senior game came quickly. You made it look like you'd always been here.",
    "A teenager holding their own — soon, they'll be watching out for you.",
    "They gave you a chance early. You made sure they didn't regret it.",
    "Barely old enough for this level, already too good for most to handle.",
    "The dressing room welcomed you as a youngster. By season's end you were just a player.",
  ],

  youngProspect: [
    "Still only young — the ceiling is somewhere most players can't see.",
    "Getting better every single week. It shows.",
    "The raw talent is obvious. The improvement is relentless.",
    "Good now, frightening later. Everyone in the building knows it.",
    "Playing like you've been in the first team for years — and you've barely started.",
    "The development curve is steep and you're climbing it fast.",
    "Young, hungry, ambitious — the best combination in football.",
    "A player in the middle of becoming something special.",
    "At this age, the best thing you can be is this good. And improving.",
    "The future is yours. The question is just how big it gets.",
  ],

  prePeak: [
    "Approaching your best years — and you're already hard to handle.",
    "The prime is close. Every game you look a step sharper.",
    "In your mid-twenties and still improving. That's a rare thing.",
    "The experience is starting to match the ability. Dangerous combination.",
    "You're not at your peak yet. That should frighten the rest of them.",
    "Seasoned enough to be smart, young enough to be relentless.",
    "Still climbing. The top of the mountain is coming into view.",
    "The raw ability was always there. The decision-making is catching up.",
    "A player hitting their stride — and the stride is getting longer.",
    "This is the most exciting time in a footballer's life. Make the most of every game.",
  ],

  peakYears: [
    "Prime years — and you're making every single one count.",
    "The peak of your powers, deployed at full volume.",
    "Everything clicks at this age. You understand the game like never before.",
    "In your prime, and there isn't a defence in the world that fancies it.",
    "This is what you worked for since you were a kid. Own it.",
    "At the very top of your game. Savour every second.",
    "Technically, physically, mentally — all three at their peak at once.",
    "The best version of you, on display every week.",
    "Hard to stop, harder to replace. This is prime time.",
    "You're playing the best football of your life. And you know it.",
    "The peak years are the ones you look back on. You're in them.",
  ],

  veteran: [
    "Still going. The experience shows in every game.",
    "Younger players watching you just to learn how it's done.",
    "Years in the game don't show in your performance. Only in your leadership.",
    "They said the legs would go. They haven't. Not yet.",
    "A season that reminded everyone why longevity isn't luck.",
    "You've been doing this longer than some of your teammates have been alive.",
    "Father time is undefeated. But you're not done fighting.",
    "At this age, just playing is an achievement. Performing is remarkable.",
    "The younger players run more. You just end up in better positions.",
    "Still starting every week at this age. That tells its own story.",
    "Controlling the game rather than chasing it. Wisdom looks good on you.",
    "The grey hairs are coming. The form hasn't gone.",
    "You read the game so well now that your body barely has to work.",
    "They've tried to write you off before. You still don't read those articles.",
    "A masterclass in how to stay relevant when the years stack up.",
  ],

  decline: [
    "The numbers dipped. Time waits for nobody.",
    "A tough season — form and fitness both fell short.",
    "Age starts to take its toll on even the best. A step slower this year.",
    "Your best football may be behind you, but there's still something left.",
    "Not the level of last year. Not easy to accept.",
    "A season of managing rather than performing. The end feels closer.",
    "The body is speaking. The legs are asking questions.",
    "The same football brain — just slightly slower to execute it now.",
    "A gentle decline, but a decline all the same. Hard to ignore.",
    "The manager is starting to rotate you more. That's what it means at this age.",
    "The dip in numbers isn't dramatic. But it's there if you're honest.",
  ],

  newClub: [
    "New club, new chapter — you made them fall in love straight away.",
    "Settling in was never going to be the problem. You were already at home.",
    "First season, full impact. The fans can't imagine the team without you now.",
    "They signed you wondering if it would work. It worked.",
    "The debut campaign answered every question the doubters had.",
    "Hitting the ground running — some players need time to settle. You didn't.",
    "A new home, a new manager, a new start — you made all of them count.",
    "The fans weren't sure. You made them sure.",
    "The move paid off immediately. Some gambles aren't gambles at all.",
    "A fresh start, and you took full advantage of it.",
    "They took a chance on you. You took a chance on them. It paid off.",
    "The dressing room made you feel like you'd been here for years. You repaid that.",
    "Some players need a season to find their feet. Yours were already planted.",
  ],

  loyalServant: [
    "Years of service — the supporters chant your name like a tradition.",
    "You've become part of the club's identity. That's not something they give away.",
    "Season after season of reliability. The ones who stay matter most.",
    "They've seen players come and go. You stayed. The fans notice that.",
    "Your name is in the song they sing on the terraces. Few players ever get that.",
    "Half a decade or more at this club, and you still give everything.",
    "The badge means something to you. The fans can tell.",
    "Some players define a club era. You're well on your way.",
    "The young players look at you and see what dedication looks like.",
    "Club through and through. In an era of constant transfers, that means something.",
    "You could've left for more. You stayed. Legends are made like this.",
    "Long-serving, reliable, loved. The club's spine is built around players like you.",
    "The kit has your name on the back. But it might as well be on the crest.",
  ],

  eliteLevel: [
    "Playing at the very top of club football. You belong here.",
    "Week to week against the best in the game — and holding your own.",
    "Every game televised. Every performance analysed. You don't flinch.",
    "At one of the biggest clubs in the world. This is the life you imagined at fifteen.",
    "There's no hiding place at a club this size. You don't need one.",
    "The pressure at this level would break most. You thrive in it.",
    "Champions League nights, title races, global scrutiny — you take it all in stride.",
    "Playing against the world's best every weekend. And winning.",
    "The biggest shirt in football, and you're filling it well.",
    "You're at the summit of club football. Not everyone handles it. You do.",
    "Every mistake is a headline here. You're not giving them the material.",
    "The calibre of teammate around you pushes you every day. You push them back.",
  ],

  lowerLeagueHero: [
    "A big fish in a smaller pond — but this fish is still growing.",
    "The best player in the division by some distance.",
    "Dominant at this level. The question is whether a bigger club comes calling.",
    "Carrying this club on your back and loving every minute of it.",
    "Lower league, but nobody doubts your quality.",
    "Turning heads above. It's only a matter of time.",
    "You're too good for this level. The scouts are starting to agree.",
    "They came to watch the opposition. They left talking about you.",
    "Making your level look too small — that's a good problem to have.",
    "A standout in this division, which raises the question of whether you should still be in it.",
    "The fans adore you here. But you sense there's a bigger stage waiting.",
    "Every week at this level, you're proving a point to someone up the pyramid.",
  ],

  neutral: [
    "A steady, professional campaign.",
    "Quietly effective — you did your job.",
    "Ups and downs, but you held your place.",
    "Unspectacular, but dependable.",
    "A grind of a season, nothing flashy.",
    "You kept the shirt and little else changed.",
    "Not every season gets a story. This one just got football.",
    "Solid. Reliable. Exactly what the manager needed.",
    "The squad knew what they'd get from you. You delivered it.",
    "Consistent minutes, consistent output. A professional year.",
    "Nothing to write home about, but nothing to regret either.",
    "The quiet seasons are sometimes the ones that matter most.",
    "Tidy work. On to the next.",
    "Some years are bridging years. This was one.",
    "You stayed fit, stayed sharp, stayed in the XI.",
    "Not spectacular, but undroppable.",
    "Your contribution went beyond the stats. The manager knew.",
    "Good enough to start every week. That matters more than it sounds.",
    "No headlines, no controversy, no drama. Just football.",
    "You did what was asked. Week after week. That's not nothing.",
    "The dependable ones carry the squad. This was your turn.",
    "A functional season that kept you moving forward.",
    "Flew under the radar, but the manager had your back all year.",
    "Another year on the shirt, another chapter in the story.",
    "You kept the standards up even when nobody was watching. That's character.",
    "The routine of a long football season, handled with quiet professionalism.",
    "A season of doing the simple things well, all the time.",
  ],
};

const CLUB_LINES: Record<string, string[]> = {
  "Real Madrid": [
    "Under the Bernabéu lights — there's no stage bigger on earth.",
    "The white shirt. The expectations. You're living up to both.",
    "Bernabéu magic. The whole stadium rises when you get the ball.",
    "Real Madrid don't accept ordinary. You're not delivering ordinary.",
    "The history in those walls is overwhelming. You're adding to it.",
    "Hala Madrid. Nights like these are why you came here.",
  ],
  "Barcelona": [
    "Camp Nou roaring. The city wrapped around this club. You belong here now.",
    "Football the Barça way — technical, relentless, beautiful. It's yours.",
    "Més que un club. You feel what that means every single matchday.",
    "The Camp Nou holds ninety thousand. On nights like these, they're all with you.",
    "Playing for Barcelona means something beyond the game. The city reminds you weekly.",
    "La Masia built the tradition. You're the one carrying it forward.",
  ],
  "Man City": [
    "The Etihad at full volume. The best squad in England, and you're in it.",
    "Sky blue and dominant. Another season at the top of English football.",
    "The Etihad faithful expect champions. You've been part of delivering that.",
    "The most complete squad in the country — and you're in the XI every week.",
  ],
  "Liverpool": [
    "Anfield erupted. That noise doesn't exist anywhere else.",
    "You'll Never Walk Alone means something different when it's sung for you.",
    "The Kop in full voice. You earned that this season.",
    "Liverpool pour everything into this club. You gave it back in full.",
    "The history of this ground surrounds you every matchday. You're living up to it.",
  ],
  "Arsenal": [
    "The Emirates is getting louder by the season. You're part of why.",
    "North London's expectations are high. Your standards are higher.",
    "Arsenal football — quick, clinical, relentless. It suits you perfectly.",
    "The red and white. The hunger. The belief that a title is coming.",
    "Highbury had its legends. The Emirates is building new ones. Starting now.",
  ],
  "Man United": [
    "Old Trafford — the Theatre of Dreams. You're performing on its stage.",
    "The shirt has weight to it. United fans remind you of that. You're carrying it well.",
    "Walking out at Old Trafford never gets old. The history is in the walls.",
    "Red is everywhere on matchday in Manchester. The expectation even more so.",
    "The most famous club in English football. And you're playing for them.",
  ],
  "Chelsea": [
    "Stamford Bridge. The blue half of London watching your every game.",
    "Chelsea's ambition is matched only by their expectations. You're meeting them.",
    "The Bridge in blue. Another season under the west London lights.",
    "Chelsea history is built on players who showed up for the big moments. So did you.",
  ],
  "Tottenham": [
    "The Tottenham Hotspur Stadium — one of the finest arenas in England. You're its player.",
    "Spurs football has a flavour — attacking, exciting, alive. You're part of it.",
    "North London in Lilywhite. A solid season in one of football's great shirts.",
  ],
  "Newcastle": [
    "St James' Park — one of the great atmospheres in English football.",
    "The Toon Army behind you every single week. They give everything. So do you.",
    "Newcastle are going somewhere. You're helping get them there faster.",
    "Fifty thousand in black and white, all willing you on. You delivered.",
  ],
  "Aston Villa": [
    "Villa Park — one of the oldest grounds in the country, and the noise still shakes it.",
    "Aston Villa are going places. A season that reminded everyone of that.",
    "The claret and blue, and the history behind it. You wore it with pride.",
  ],
  "Bayern Munich": [
    "Mia san mia — we are who we are. The Allianz Arena never lets you forget it.",
    "The Bundesliga title is expected here. So is everything else. You're delivering.",
    "Bayern don't rebuild — they reload. You're part of the new ammunition.",
    "The Allianz Arena in full voice. This is what football should look like.",
    "Winning is the baseline at Bayern. You've been clearing it.",
  ],
  "Dortmund": [
    "The Yellow Wall — eighty thousand standing, singing, deafening.",
    "Signal Iduna Park vibrating. You've got the whole South Stand behind you.",
    "The most passionate fans in Germany, maybe Europe. They're behind you every step.",
    "Playing for Dortmund under the floodlights. Exactly what you dreamed of.",
    "The Yellow Wall doesn't give you silence to think. You don't need it.",
  ],
  "Leverkusen": [
    "Bayer Leverkusen are no longer just the nearly men. You're part of the proof.",
    "The Bay Arena and a squad that doesn't know when to quit. Good club to be at.",
    "Leverkusen are building something serious. You're part of the blueprint.",
  ],
  "RB Leipzig": [
    "Leipzig are punching well above their weight in German football. So are you.",
    "The Red Bull Arena — modern, sharp, ambitious. A bit like you.",
    "A club still writing its story. You're one of the authors.",
  ],
  "Paris SG": [
    "The Parc des Princes humming. The city of light watching your every move.",
    "Paris expects the very best. You've been giving it all season.",
    "PSG's ambition matches your own. So far, so very good.",
    "The capital club, the capital stage. Made for a player like you.",
    "Galácticos in all but name. You fit right in.",
  ],
  "Marseille": [
    "The Vélodrome — the loudest stadium in France, possibly in Europe.",
    "OM Ultras demand everything. This season, you gave them everything and more.",
    "Marseille, the city and the club, run at a different intensity. You thrive in it.",
    "The Vélodrome at full capacity. A wall of noise you feel in your chest.",
  ],
  "Monaco": [
    "The Stade Louis-II, tucked into the most famous postcode in sport.",
    "Monaco — small club, enormous ambition. The best players have always noticed that.",
    "The Principality is tiny. The stage Monaco provides is anything but.",
  ],
  "Lyon": [
    "Groupama Stadium and a club that has been building for decades.",
    "Lyon have produced some of the best players in French football. You're carrying that on.",
    "One of the pillars of Ligue 1. A season that reminded everyone of that.",
  ],
  "Atlético Madrid": [
    "The Metropolitano — intense, physical, relentless. Just like the club.",
    "Simeone built a mentality here. Maximum effort, no shortcuts. You're built for it.",
    "Atlético don't do pretty. They do effective. You've been delivering both.",
    "Colchoneros through and through — the fight never stops here, and neither do you.",
  ],
  "Inter Milan": [
    "San Siro in nerazzurri blue. One of the cathedrals of Italian football.",
    "Inter's history runs as deep as any club in Europe. You're adding your chapter.",
    "The Milanese derby is the biggest game in Italy. You showed up for it.",
    "Black and blue, the snake and the star. One of the most storied clubs on the continent.",
  ],
  "Juventus": [
    "The Old Lady of Turin — demanding, historic, unforgiving of mediocrity.",
    "The Juventus mentality exists for a reason. You've absorbed it completely.",
    "Black and white, Turin, expectation. You're meeting all three.",
    "The Allianz Stadium — sleek, modern, but the standards inside it are ancient.",
  ],
  "AC Milan": [
    "San Siro in rossoneri red and black. An icon of European football.",
    "AC Milan's tradition doesn't allow for anything less than excellence. Fine by you.",
    "The history at this club could fill a library. You're adding a new chapter.",
    "One of the great clubs of European football, and you're their player.",
  ],
  "Napoli": [
    "The Diego Armando Maradona Stadium. No greater tribute to the sport in Italy.",
    "Naples breathes football. The whole city is wrapped around this club.",
    "Napoli play with a passion that other clubs have to engineer. Here it's natural.",
    "The city of Naples deserves great football. This season, you gave them it.",
  ],
  "Fiorentina": [
    "The Artemio Franchi and the purple of Florence. A proud club with a proud history.",
    "Fiorentina give you everything. You gave it back this season.",
    "A club with a city behind it. You felt that every matchday at the Franchi.",
  ],
  "Lazio": [
    "The Olimpico in biancoceleste. Roman football with sky-blue intensity.",
    "Lazio expect passion and you've been delivering it all season.",
  ],
  "AS Roma": [
    "The Olimpico in giallorossi. Half of Rome watching. You didn't disappoint them.",
    "Roma's connection to the city is unlike most clubs. You've become part of that.",
    "The Stadio Olimpico at full voice — red and gold everywhere you look.",
  ],
  "Ajax": [
    "The Johan Cruyff Arena — a living monument to total football.",
    "Ajax built the modern game. You're playing in its home.",
    "The Ajax way: attack, improve, trust the system. You've made it your own.",
    "Playing at Ajax means carrying football history. This club invented half of it.",
    "Amsterdam loves this club. By the end of the season, the club loves you.",
  ],
  "PSV": [
    "Philips Stadion — one of the most intense atmospheres in Dutch football.",
    "PSV have produced world-class players for decades. You're following the path.",
    "Eindhoven and red and white. A proud club that keeps punching upward.",
  ],
  "Feyenoord": [
    "De Kuip — old, ferocious, and unlike anywhere else in Dutch football.",
    "Feyenoord's identity is built on fight and passion. You've had both in spades.",
    "Rotterdam believes in this club. This season, you gave them reason to.",
    "De Kuip in full voice. One of Europe's great atmospheres, and you're its player.",
  ],
  "Benfica": [
    "The Estádio da Luz. The Eagles of Lisbon, and a century of football tradition.",
    "Benfica have produced stars the world over. The city expects you to be one.",
    "The red of Benfica means something different in Lisbon. You understand that now.",
  ],
  "Porto": [
    "The Estádio do Dragão — Porto always punch above their weight. You're part of that.",
    "Porto have sent players to the very top of football for decades. You're following them.",
    "Blue and white, the Dragon's lair. Porto's story is never finished.",
  ],
  "Sporting CP": [
    "The Estádio José Alvalade — green and white and loud.",
    "Sporting have built one of Europe's best academies. You're proving why.",
    "Lisbon's green half, loud and proud. A good club to be giving your best for.",
  ],
  "Flamengo": [
    "The Maracanã in rubro-negro. The biggest crowd in South American football.",
    "Flamengo have more supporters than some countries. Tonight, they were all there.",
    "The passion at Flamengo is unlike anything else. You fully understand that now.",
    "The Maracanã, a full house, and Flamengo colours everywhere. You delivered.",
  ],
  "Boca Juniors": [
    "La Bombonera — the box that rattles. Nothing prepares you for your first game there.",
    "Boca Juniors and La Bombonera. Everywhere else in football feels quieter now.",
    "The Superclásico alone is worth the contract. You experienced it and delivered.",
    "The noise in La Bombonera is physical. You learned to play through it.",
  ],
  "Al-Nassr": [
    "Saudi football is growing fast — and you're growing with it.",
    "The project at Al-Nassr is serious. You've been taking it seriously.",
    "Al-Nassr have built something ambitious. You're at the centre of it.",
  ],
  "Al-Hilal": [
    "The most decorated club in Saudi football. Standards are set from day one.",
    "Al-Hilal expect trophies. That expectation is exactly what keeps you sharp.",
    "Saudi football is evolving and Al-Hilal are leading it. You're helping.",
  ],
  "Al-Ittihad": [
    "Al-Ittihad — the most passionate fanbase in the Saudi Pro League. You feel it weekly.",
    "The Tiger is awake, and you've been part of the reason why.",
  ],
  "Al-Ahli": [
    "Al-Ahli's project is real and growing. You're part of the evidence.",
    "The green and white of Jeddah. A club that backs its ambition with real action.",
  ],
  "Inter Miami": [
    "Fort Lauderdale sun, pink kits, and serious football. The combination works.",
    "MLS is growing up — and Inter Miami are growing the fastest. You're riding that wave.",
    "Inter Miami are building something real here. You're part of the foundation.",
  ],
  "LAFC": [
    "The BMO Stadium — one of the best matchday atmospheres in US soccer.",
    "LAFC are redefining what MLS can look like. You're part of that story.",
    "Black and gold in Los Angeles. A club still writing its first great chapter.",
  ],
  "LA Galaxy": [
    "The Galaxy's history in MLS is the longest. So are the expectations.",
    "American soccer royalty, and you're wearing the crest.",
  ],
  "Seattle Sounders": [
    "CenturyLink in Rave Green — one of the loudest and most loyal fanbases in the country.",
    "Seattle Sounders have raised the standard for what a US club can be. You fit right in.",
  ],
  "Peñarol": [
    "Peñarol — one of the most decorated clubs in South American history. You're part of that.",
    "Uruguay's most famous club, and the Montevideo nights are something else entirely.",
  ],
};

export function seasonHeadline(s: Season, p: Player): string {
  // Youth academy years
  if (s.role === "youth") return pick(POOL.youth);

  // Ballon d'Or — peak of individual recognition
  if (s.ballon) return pick(POOL.ballon);

  // Injury dominated the season
  if (s.injured) return pick(POOL.injury);

  // Bench — contextual by club tier and age
  if (s.role === "bench") {
    if (p.clubTier === 1) return pick(POOL.benchElite);
    if (p.age >= 32) return pick(POOL.benchVet);
    return pick(POOL.bench);
  }

  // Breakout — exceptional growth spike this season
  if (s.breakout) return pick(POOL.breakout);

  // Collective trophies and tournament wins (priority order matters)
  if (s.tourney?.result === "Winner" && s.tourney.isWC) return pick(POOL.worldcupwin);
  if (s.trophies.includes("Champions League")) return pick(POOL.ucl);
  if (s.tourney?.result === "Winner" && !s.tourney.isWC) return pick(POOL.continentalwin);
  if (s.trophies.includes("League Title")) return pick(POOL.league);
  if (s.trophies.includes("Domestic Cup")) return pick(POOL.cup);

  // Exceptional individual stats by position
  if (p.position === "FWD" && s.goals >= 18) return pick(POOL.fwdHot);
  if (p.position === "MID" && s.assists >= 11) return pick(POOL.midHot);
  if (p.position === "DEF" && s.clean >= 13) return pick(POOL.defHot);
  if (p.position === "GK" && s.clean >= 14) return pick(POOL.gkHot);

  // High rating even without headline numbers
  if (s.rating >= 7.8 && s.role === "starter") return pick(POOL.highRating);

  // Club-specific lines — fire ~40% of the time so they stay fresh over many seasons
  const clubLines = CLUB_LINES[p.club];
  if (clubLines && Math.random() < 0.4) return pick(clubLines);

  // Very young senior starter — age-specific debut pool
  if (s.age <= 20 && s.role === "starter") return pick(POOL.youngDebut);

  // Decline: OVR dropped and player is old enough for it to mean something
  if (s.ovr < s.prevOvr && p.age >= 28) return pick(POOL.decline);

  // Veteran: still starting well into the later years
  if (p.age >= 33 && s.role === "starter") return pick(POOL.veteran);

  // Peak years: within 2 years either side of their rolled peak age
  if (Math.abs(p.age - p.peakAge) <= 2 && s.role === "starter") return pick(POOL.peakYears);

  // Loyal servant: many seasons at the same club
  if (p.seasonsAtClub >= 5 && s.role === "starter") return pick(POOL.loyalServant);

  // New club debut: first season after a transfer
  if (p.seasonsAtClub === 1 && s.role === "starter") return pick(POOL.newClub);

  // Elite club: playing at the top tier
  if (p.clubTier === 1 && s.role === "starter") return pick(POOL.eliteLevel);

  // Young prospect: post-debut age, still clearly developing
  if (p.age <= 23 && s.role === "starter") return pick(POOL.youngProspect);

  // Pre-peak: experienced but clearly still improving
  if (p.age >= 21 && p.age < p.peakAge - 1 && s.role === "starter") return pick(POOL.prePeak);

  // Lower league standout: doing well in a smaller pond
  if (p.clubTier >= 3 && s.role === "starter") return pick(POOL.lowerLeagueHero);

  // Rotation player
  if (s.role === "rotation") return pick(POOL.rotation);

  return pick(POOL.neutral);
}

export const TOURN_RESULT: Record<string, { color: string }> = {
  Winner: { color: "var(--gold)" },
  Final: { color: "#ff9d54" },
  "Semi-final": { color: "#7fd4ff" },
  "Quarter-final": { color: "var(--muted)" },
  "Group stage": { color: "var(--muted)" },
};
