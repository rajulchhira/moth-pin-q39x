$ErrorActionPreference = "Stop"
$rng = New-Object System.Random 20260912
$path = Join-Path $PSScriptRoot "..\js\reviews-data.js"
$raw = [IO.File]::ReadAllText($path)
$json = $raw -replace '^window\.REVIEWS\s*=\s*','' -replace ';\s*$',''
$reviews = $json | ConvertFrom-Json
if ($reviews -isnot [System.Array]) { $reviews = @($reviews) }

$jobs = @(
  "software engineer","CA intern","bank PO","school teacher","shop owner","MBA student","pharmacist",
  "civil engineer","marketing exec","BPO lead","govt clerk","freelancer","dentist","nurse","architect",
  "data analyst","sales manager","insurance agent","broker","HR exec","content writer","homemaker",
  "lecturer","graphic designer","CA articleship","mechanic","hotel staff","tuition teacher","driver"
)
$tickers = @("Nifty","Bank Nifty","crude","gold","weekly options","Finnifty","a small SIP","midcaps","USDINR","silver")
$whens = @(
  "after 9 pm","before office","on the local","during lunch","once kids sleep","only Sundays",
  "after shift","in the cab","between meetings","late night"
)
$whensHi = @(
  "raat 9 ke baad","subah office se pehle","local mein","lunch pe","bacchon ke sone ke baad",
  "sirf Sunday","shift ke baad","cab mein","tuition ke baad","meeting ke beech"
)
$teachers = @{
  "breakout"="Aarav Mehta"; "income"="Neha Kapoor"; "price-action"="Vikram Singh"; "opening-range"="Kabir Joshi"
  "long-term"="Ananya Rao"; "mf-guide"="Rohan Desai"; "sip"="Priya Nair"; "opt-start"="Meera Iyer"
  "spreads"="Neha Kapoor"; "first-month"="Aarav Mehta"; "charts-101"="Vikram Singh"; "candles"="Kabir Joshi"
  "levels"="Meera Iyer"; "hindi-ta"="Ananya Rao"; "hindi-swing"="Rohan Desai"; "crypto-lab"="Priya Nair"
  "ema-swing"="Vikram Singh"; "vwap"="Aarav Mehta"
}

$enOpen = @(
  "Bought this after blowing two small accounts on YouTube setups.",
  "Honestly I almost closed the payment page.",
  "Ok this is after finishing, not after two videos.",
  "My cousin in {city} dumped the link. I ignored it for a week.",
  "Work as a {job}. No time for two hour live rants.",
  "Third market course I have paid for. This one actually stuck.",
  "Didnt expect much at this price. Journal part surprised me.",
  "Started on a Sunday with leftover dinner and a cheap notebook.",
  "Still trade {ticker} badly. Just a smaller clown now.",
  "Not a full time trader. I just wanted to stop guessing.",
  "Preview felt calm, not salesy. That is why I paid.",
  "Came here after a friend lost money copying telegram calls.",
  "Paid from salary and felt guilty till module three.",
  "Usually bounce off courses. Replayed this twice, weirdly.",
  "Needed a written plan more than a guru voice.",
  "Watching {when} on the phone. Not ideal. Still works.",
  "Picky about teachers who hide their losing weeks. They showed one.",
  "Quiet month at work so I actually finished the homework.",
  "Hindi brain, English course. Language stayed simple so I stayed.",
  "Almost ignored it. Sample lesson was not shouty. Paid.",
  "Look, I wanted tips. They made me write a stop first.",
  "Small {ticker} book plus a day job. Needed structure, not noise.",
  "Finished slower than I planned. That was probably the point.",
  "No guru energy. Thank god.",
  "Took it because the free clip did not overpromise.",
  "I keep a red diary now. App notes never lasted.",
  "Muted two tip groups after lesson four. House is quieter.",
  "Lot size went down. Ego took the hit, account did not.",
  "Support replied without selling another course. Mentioning it.",
  "Captions on, house noisy, 25 min timer. That is the whole system.",
  "Kept a losing screenshot on purpose. Feels more useful than a win.",
  "One chart. One notebook. Tea going cold. Fine.",
  "Cousin asked for the PDF. I sent the checklist. He was annoyed.",
  "Watch at 1.5x except psychology. That one needs slow.",
  "SIP hopping stopped. Funds look boring. Good.",
  "Wanted crypto leverage. They said no. I listened once.",
  "Opening range is not magic. I still miss the first 15.",
  "Left a WhatsApp tips chat. Nobody noticed. Peaceful.",
  "Two blown accounts later I got tired of being clever.",
  "See I thought I needed more indicators. I needed a stop.",
  "Right so this is not a highlight reel. I still skip homework.",
  "After Budget week I was restless. This slowed me down.",
  "Before you ask, no I am not profitable. I am organised.",
  "During exams I watched half of it. Came back. Finished.",
  "Phone battery died twice mid lesson. Still finished the notes.",
  "Journal is messy. That is new. Earlier I had nothing.",
  "Stop goes on paper before the order window now. Took months.",
  "Size examples are dry on purpose. I needed dry.",
  "Tips? None. First week I was angry. Then I got it.",
  "Live class made sense only after module three. Timing.",
  "Chart looks empty now. I used to have 12 things on it.",
  "Idk why I waited. Should have started after the first loss.",
  "Yaar the psychology module is a bit filmy. I still wrote it.",
  "Bro I wanted a signal. Got a checklist. Annoying then useful.",
  "Short one: checklist is on the kettle. That is the review.",
  "Fine, I sped up a few slow videos. Content still ok.",
  "This is the first course I did not abandon at 40%.",
  "I screenshot less now. I write three lines. Progress.",
  "Roommate still wants tips. I keep saying no. Tiring.",
  "Paid, felt dumb, then the invalidation habit stuck.",
  "I am a {job} in {city}. Lessons fit in gaps. That sold me.",
  "Tried {course} because the name was honest, not sexy.",
  "Nobody in my family gets markets. They think I am doing MBA.",
  "I overtrade on {ticker} still. Less often. That is the update.",
  "Audio is clear. I watch in bed which is a bad habit. Works.",
  "A few slides are text heavy. I paused. Copied anyway.",
  "They repeat size like a broken record. I used to skip it.",
  "Indian examples, not some 2014 NYSE clip. Helped.",
  "Wanted quizzes. Did not get many. Still better than a 6hr dump.",
  "I told two colleagues. One enrolled. One still wants calls.",
  "Will update if I blow up. So far no.",
  "Might look expensive until you count the YouTube hours wasted.",
  "Simple buy. No regret. Not shouting five stars for fun.",
  "Keeping four because a few videos could be tighter.",
  "I still lose. Smaller. That is the whole story.",
  "If you want magic entries, skip. If you want a desk, ok.",
  "Going to sit with {ticker} a quarter before I add anything.",
  "Worth it for the journal template alone.",
  "Good for people who already tried and got hurt.",
  "Done for now. Next module slowly.",
  "Four stars. Video lagged once, support replied next day.",
  "I fold the lot and feel poor for a day. Then expiry is quieter.",
  "I do not screenshot every slide. Three lines. Enough.",
  "Using a 20 rupee copy, not a fancy app. Stays on the desk.",
  "I set a timer. Two lessons. Stop. Or I binge and forget.",
  "FOMO on expiry still comes. Finger is slower. That counts.",
  "Fee receipt is in the journal. Reminds me to finish.",
  "I skip chat groups. New for me. Also boring. Also better.",
  "Tried to watch like Netflix. Does not work. I pause a lot.",
  "The boring videos are the ones I replay. Funny that.",
  "I marked levels on paper for a week, TradingView closed. Humbling.",
  "No three screens. I am not a movie villain.",
  "I asked one doubt. They did not upsell. Rare so I wrote this.",
  "I still close the app when a tip ping comes. Count is falling.",
  "I wanted a louder teacher. Got a calm one. Mixed, then fine.",
  "Some lessons overlap. I skipped. Homework still useful.",
  "A bit dry. I still finished. That says something.",
  "Expected more expiry stuff. Kept it for {ticker} anyway.",
  "3 stars from me because I knew half. Beginners may like it more.",
  "Okay course. One slow support reply. I wanted more live hours.",
  "I paused a lot. Maybe on me. Content is decent, not electric.",
  "Not my favourite energy. Notes are clean. That pulled it up.",
  "I came in spicy, left quieter. That is a review I guess."
)

$hiOpen = @(
  "Pehle YouTube pe random setups try karta tha, thoda jal gaya.",
  "Office ke baad dimag nahi rehta, short videos hi chahiye the.",
  "Dost ne bola tips mat lo, plan lo. Maine socha dekh leti hoon.",
  "Hindi mein sochta hoon. English course chal gaya, language simple thi.",
  "Main {job} hoon, trading side se, koi bada fund nahi.",
  "Telegram calls follow kiye, phir socha khud padhna padega.",
  "Mummy ko nahi bataaya pehle. Journal dikhaya to laga padhai hai.",
  "{city} se hoon. Yahan log market ko serious nahi lete.",
  "Course liya {when}. Slow slow complete kiya, koi race nahi.",
  "Options se darti thi. Risk defined dikha isliye start kiya.",
  "Salary se payment kata, socha waste na ho jaye.",
  "Bhai ke losses dekh ke khud baith gayi padhne.",
  "English thodi weak hai, examples phir bhi samajh aa gaye.",
  "Full time nahi hoon. {ticker} pe discipline chahiye tha.",
  "Indicator 12 laga ke baitha tha. Ab chart saaf lagta hai.",
  "Yaar tips nahi mile. Pehle gussa aaya, ab theek lagta hai.",
  "Abhi profit nahi, galti choti ho gayi. Yahi likhna tha.",
  "Gharwale has rahe the jab checklist fridge pe chipkaya.",
  "Ab overconfident nahi hua, yeh important tha beginner ke liye.",
  "Psychology wali thodi filmy hai. Example Indian market ka tha, chalega.",
  "Phone pe {when} dekhta hoon, audio clear hai.",
  "Losing week bhi dikhaya unhone. Rare hai yeh.",
  "CA exam ke saath nahi ho pata tha. Ab job ke baad time hai.",
  "Size wala part dry laga, baad mein samajh aaya kyun repeat kiya.",
  "Journal 5 line ka hai. Usse zyada main likh nahi pata.",
  "Live ke baad thoda clear hua, recording se hi chal raha hai.",
  "{ticker} pe overtrade kam kiya, wahi sabse bada change.",
  "Kuch videos slow, 1.25x. Content theek.",
  "Stop pehle skip karta tha. Ab pehle likhta hoon, phir order.",
  "Hindi course jaisa feel, even when English mein bolte hai.",
  "Checklist desk pe hai. Wahi product hai soch ke dekho.",
  "Main still beginner. Theek hai. Overhype nahi kiya unhone.",
  "{teacher} baar baar skip bolo agar setup nahi. Force karna meri aadat thi.",
  "Bhai ko PDF mang raha tha, checklist bhej di. Khush nahi.",
  "1.5x pe dekhta hoon, psychology slow. Wahi zaroori.",
  "SIP hop karna band. Funds boring, achha hai.",
  "Crypto mein leverage chahiye tha, na bola. Ek baar maan gaya.",
  "Opening range magic nahi. Pehle 15 miss. Rule clear.",
  "Lesson 4 ke baad WhatsApp tips nikal di. Kisi ne pucha nahi.",
  "Teen screen chhod diye. Ek chart, ek copy, chai thandi.",
  "Size kaata to gareeb feel hua ek din. Expiry shaant rahi.",
  "Captions on, ghar shor. Do lesson, timer. Yahi system.",
  "Loss ka screenshot rakha jaan ke. Jeet se kaam ka hai.",
  "Tip group ping aaye to app band. Count kam ho raha hai.",
  "Support ne naya course nahi becha. Isliye review likha.",
  "Jo video boring lagi wahi dubara. Flashy ek baar.",
  "Preview ne hype nahi kiya, isliye paise diye.",
  "Copy mein notes, app mein nahi. Hafte mein ek baar phir zyada ho jata hai.",
  "Theek hai. Support ek baar late. Live hours aur chahiye the.",
  "3 star. Thoda beginner wala tha, mujhe half pata tha.",
  "Repeat videos. Skip. Checklist useful.",
  "Expiry pe aur chahiye tha. {ticker} ke liye chalega.",
  "Teacher energy flat do video mein. Notes acche.",
  "Theek-thaak. {city} se slow net pe bhi chal gaya.",
  "Beech mein bored hua, checklist fir bhi rakha.",
  "Kuch classes lambi. Notes kaam ke, energy kam.",
  "Paisa waste nahi laga. Slow seekh raha hoon.",
  "4 star isliye, thoda repeat. Overall worth.",
  "Doston ko bola tips wali group se nikalne ko.",
  "Magic chahiye to mat lo. Plan chahiye to lo.",
  "Dubara course yahi se lunga shayad.",
  "Simple language, simple rules. Kaam ka.",
  "{ticker} ka size pichle mahine se chota. That is good.",
  "Recommend. Overhype nahi.",
  "Ghar pe journal start kiya. Wahi win.",
  "Idk yaar, maine socha ek aur YouTube channel hai. Nahi tha.",
  "Dekho seedha: main {city} se {job} hoon. Time kam tha, mila fit.",
  "Pehle order, pehle stop. Yeh habit nayi hai, ajeeb lagti hai.",
  "Sunday ko module dubara dekha, tab jake click hua.",
  "Tip group leave. Pehle nahi hota tha yeh.",
  "Fee ki receipt journal mein. Finish karne ke liye rakhi.",
  "Office mein log sochte hai MBA. Theek hai, explain nahi karta.",
  "25 minute timer, do video, band. Nahi to binge.",
  "Expiry pe FOMO aata hai, click dheere hota hai ab.",
  "Mehnga notebook nahi, 20 wala copy. Desk pe rehta hai.",
  "Har slide ka photo nahi, 3 line. Bas.",
  "Net kharab ho to do lesson download. Wahi kaam aaya.",
  "Jo boring lagi wahi kaam ki. Ajeeb but true.",
  "TradingView band karke copy pe levels. Ego ko laga.",
  "Main {course} isliye liya kyunki naam seedha tha, filmy nahi.",
  "Koi ghar mein nahi samajhta. Unko lagta hai exam ki padhai.",
  "Seedha bolun to main tips dhoondne aaya tha. Checklist mil gayi.",
  "Abhi slow hoon ads se. Honest hai yeh.",
  "Bache hue module is mahine. Jaldi nahi.",
  "Yahi review hai: magic nahi, galti choti.",
  "Main thoda spicy aaya, shaant nikal. Review yahi hai."
)

$enMid = @(
  "{teacher} keeps saying skip if the level is not there. I used to force it.",
  "Position size examples bored me. Then they saved a week.",
  "Lessons are short. Two before dinner is realistic.",
  "They make you write invalidation before entry. I skipped that for years.",
  "No indicator soup. Structure plus a checklist. That's it.",
  "I still get greedy on {ticker}. At least there is a stop now.",
  "Weekly review template is what I use. Fancy stuff I ignore.",
  "Some videos slow. I sped up. Still useful.",
  "They do not pretend every week is a winner. Rare.",
  "Homework is five lines. I can actually do that.",
  "Live tie-in clicked after module three, not before.",
  "Psychology was cheesy. I wrote it anyway.",
  "I wanted more quizzes. Didn't get them.",
  "I replay the boring risk video. Flashy ones once.",
  "I folded size after the risk class. Hurt, then expiry was quieter.",
  "I screenshot less. Three lines in a copy. That's the habit.",
  "Audio is fine on phone. I watch in bed, bad habit, still ok.",
  "A couple of slides are dense. I paused and stole the checklist.",
  "Indian market examples, not some old NYSE clip. That helped.",
  "I still close the app when a tip ping comes. Less often.",
  "I asked one doubt. They did not upsell. That's why I wrote this.",
  "I left a chat group after lesson four. Nobody noticed.",
  "I mark levels on paper some weeks. TradingView stays closed. Ego thing.",
  "I set a 25 min timer or I binge and remember nothing.",
  "FOMO on expiry still shows up. Finger is slower now.",
  "I paid, felt dumb for a day, then the stop habit stuck.",
  "I wanted a louder teacher. Got a calm one. Took time to like it.",
  "A few lessons overlap. I skipped ahead. Homework still ok.",
  "I keep a losing screenshot. More useful than the wins.",
  "One chart, one notebook. I am not running a spaceship."
)
$hiMid = @(
  "{teacher} skip bolo agar setup nahi. Force karna meri aadat thi.",
  "Size wala hissa sookha laga, kaam baad mein aaya.",
  "Short videos. Dinner se pehle do ho jati hai.",
  "Invalidation pehle likho. Saal se skip karta tha.",
  "Indicator ka soup nahi. Checklist hai, khatam.",
  "{ticker} pe greed rehti hai. Stop ab kam se kam hai.",
  "Weekly template use karta hoon, baaki skip.",
  "Slow videos 1.25x. Chal gaya.",
  "Har week winner nahi dikhaya. Rare.",
  "5 line homework. Itna ho pata hai.",
  "Live baad mein samajh aaya, pehle nahi.",
  "Psychology filmy. Likh liya.",
  "Quiz kam the. Chalta hai.",
  "Boring risk wali dubara. Baaki ek baar.",
  "Risk class ke baad size kaata. Dil pe laga, expiry shaant.",
  "Ab har slide ka photo nahi, 3 line copy mein.",
  "Phone pe audio theek. Bed pe dekhta hoon, galat, chal raha.",
  "Do slide bhari thi, pause karke checklist nikaal li.",
  "Desi example, koi purana US clip nahi. Kaam ka.",
  "Tip ping aaye to app band. Pehle nahi karta tha.",
  "Ek sawal poocha, upsell nahi kiya. Isliye likha.",
  "Lesson 4 ke baad group nikal di. Kisi ne notice nahi kiya.",
  "Kabhi kabhi copy pe levels, app band. Ego ko chubhta hai.",
  "25 min timer nahi lagaya to binge, kuch yaad nahi.",
  "Expiry pe FOMO aata hai, ungli dheere hai ab.",
  "Pay karke ek din dumb laga, phir stop ki aadat lagi.",
  "Loud teacher chahiye tha, shaant mila. Time laga pasand aane mein.",
  "Kuch lesson overlap, skip kiya, homework fir bhi ok.",
  "Loss ka screenshot rakha. Jeet se kaam ka.",
  "Ek chart, ek copy. Rocket nahi chala raha hoon."
)
$enClose = @(
  "Would buy another here.",
  "Not shouting 5 stars for no reason.",
  "Solid. I still lose, just smaller.",
  "Want a desk, not a signal group? Ok.",
  "If you want magic, skip.",
  "Journal alone is worth it.",
  "Told two people. One enrolled.",
  "Not flashy. Point hai yahi.",
  "I am not profitable yet. Organised, which is new.",
  "Simple buy. No regret.",
  "Good if you already got hurt once.",
  "That's it from me."
)
$hiClose = @(
  "Paisa waste nahi laga.",
  "Slow seekh raha hoon, theek hai.",
  "Desk chahiye to lo, signal nahi.",
  "Magic chahiye to skip.",
  "Journal se hi paisa wapas.",
  "Do doston ko bola.",
  "Overhype nahi.",
  "Profit nahi, organisation hai. Naya hai yeh.",
  "Simple. Pachtawa nahi.",
  "Jo pehle jala chuka hai uske liye.",
  "Bas itna."
)
$crumbs = @(
  "Notes still on the desk.",
  "Sticky note near the kettle.",
  "20 rs copy, nothing fancy.",
  "I watch with captions.",
  "I mute YouTube gurus now.",
  "Small win: left one telegram group.",
  "Wrote this after dinner.",
  "This is from a cheap phone speaker.",
  "No fancy setup here.",
  "Copy fridge pe tape hai.",
  "Yeh baat kettle ke paas sticky pe hai.",
  "Sasta copy, koi app nahi.",
  "Ghar shor, captions on.",
  "Ek telegram group nikal diya.",
  "Dinner ke baad likha yeh.",
  "I folded size and felt broke for a day.",
  "This March I actually finished homework.",
  "No three screens. I am not in a movie.",
  "I still skip homework twice a month.",
  "That's the honest bit."
)

$nudgeEn = @(
  "Quick note from a small desk.",
  "Alright, one honest take.",
  "See, I was sceptical.",
  "Hmm. Did not think I would finish it.",
  "Update after using it a while.",
  "Finished last night.",
  "Writing this a bit late.",
  "Not a long review.",
  "Putting this here before I forget.",
  "Came back to write this.",
  "Was going to skip the review box.",
  "Posting because a friend asked.",
  "This is after the shiny feeling faded.",
  "Sitting with tea, that's all.",
  "No speech, just this."
)
$nudgeHi = @(
  "Seedha likh raha hoon.",
  "Lambi review nahi.",
  "Chai ke saath likha.",
  "Bhool jata isliye abhi type kiya.",
  "Dost ne pucha tab likha.",
  "Hype utar gaya, tab socha likhun.",
  "Short hai, padh lena.",
  "Late hai, phir bhi type kar diya.",
  "Pehle skip karne wala tha yeh box.",
  "Abhi dimag mein hai to likh diya.",
  "Overthink nahi, itna hi.",
  "Bas itna yaad rakhna tha.",
  "Review box khali nahi chhodna tha.",
  "Ek baar mein nahi likha, doosri baar aaya.",
  "Itna hi bolna tha."
)

function Fill([string]$t, $city, $job, $ticker, $when, $teacher, $course) {
  return $t.Replace("{city}", $city).Replace("{job}", $job).Replace("{ticker}", $ticker).Replace("{when}", $when).Replace("{teacher}", $teacher).Replace("{course}", $course)
}

function Apply-Typo([string]$text) {
  $map = @{
    "definitely"="definately"; "recommend"="reccomend"; "because"="becuase"; "journal"="jounral"
    "really"="relly"; "until"="untill"; "necessary"="neccessary"; "grateful"="greatful"
  }
  $keys = @($map.Keys | Where-Object { $text -match $_ })
  if ($keys.Count -eq 0) {
    if ($text -match "don't") { return ($text -replace "don't","dont") }
    if ($text -match "didn't") { return ($text -replace "didn't","didnt") }
    if ($text -match "I'm") { return ($text -replace "I'm","Im") }
    return $text
  }
  $pick = $keys[$rng.Next(0, $keys.Count)]
  return [regex]::Replace($text, [regex]::Escape($pick), $map[$pick], 1)
}

$used = @{}
$usedStart = @{}
$out = New-Object System.Collections.Generic.List[object]
$nEnO = $enOpen.Count
$nHiO = $hiOpen.Count

for ($i = 0; $i -lt $reviews.Count; $i++) {
  $r = $reviews[$i]
  $city = [string]$r.city
  $course = [string]$r.course
  $cid = [string]$r.courseId
  $name = [string]$r.name
  $lang = [string]$r.lang
  $stars = [int]$r.stars
  $job = $jobs[$i % $jobs.Count]
  $ticker = $tickers[$i % $tickers.Count]
  $when = if ($lang -eq "en") { $whens[$i % $whens.Count] } else { $whensHi[$i % $whensHi.Count] }
  $teacher = $teachers[$cid]
  if (-not $teacher) { $teacher = "the teacher" }

  $hi = ($lang -ne "en")
  $opens = if ($hi) { $hiOpen } else { $enOpen }
  $mids = if ($hi) { $hiMid } else { $enMid }
  $closes = if ($hi) { $hiClose } else { $enClose }
  $open = Fill $opens[(($i * 13) + [int]($stars * 3)) % $opens.Count] $city $job $ticker $when $teacher $course
  $mid = Fill $mids[(($i * 17) + 5) % $mids.Count] $city $job $ticker $when $teacher $course
  $close = Fill $closes[(($i * 5) + 1) % $closes.Count] $city $job $ticker $when $teacher $course
  $crumb = $crumbs[($i * 11) % $crumbs.Count]

  $shape = $i % 6
  if ($stars -le 3) {
    $text = switch ($shape) {
      0 { "$open $close" }
      1 { "$open $mid" }
      2 { "$open" }
      3 { "$open $crumb" }
      4 { "$open $mid $close" }
      5 { "$open $crumb" }
    }
  } else {
    $text = switch ($shape) {
      0 { "$open $mid $close" }
      1 { "$open $close" }
      2 { "$open $mid $crumb" }
      3 { "$open $crumb $close" }
      4 { "$open $mid $close $crumb" }
      5 { "$open $mid" }
    }
  }

  $text = ($text -replace "\s+", " ").Trim()
  if ($rng.Next(0, 100) -lt 16) { $text = Apply-Typo $text }

  $startKey = {
    param($s)
    $t = ($s -replace '\s+',' ').Trim()
    if ($t.Length -ge 40) { $t.Substring(0, 40) } else { $t }
  }
  $start = & $startKey $text
  $guard = 0
  $nudges = if ($hi) { $nudgeHi } else { $nudgeEn }
  while (($used.ContainsKey($text) -or $usedStart.ContainsKey($start)) -and $guard -lt 60) {
    $guard++
    $open = Fill $opens[($i * 47 + $guard * 19) % $opens.Count] $city $job $ticker $when $teacher $course
    $nudge = $nudges[($i + $guard) % $nudges.Count]
    $mid2 = Fill $mids[($i + $guard * 3) % $mids.Count] $city $job $ticker $when $teacher $course
    $text = switch ($guard % 4) {
      0 { "$nudge $open" }
      1 { "$nudge $mid2" }
      2 { "$open $nudge $mid2" }
      default { "$nudge $open $close" }
    }
    $text = ($text -replace "\s+", " ").Trim()
    $start = & $startKey $text
  }
  if ($used.ContainsKey($text) -or $usedStart.ContainsKey($start)) {
    $nudge = $nudges[$i % $nudges.Count]
    $text = "$nudge $name, $course. $close"
    $text = ($text -replace "\s+", " ").Trim()
    $start = & $startKey $text
  }
  $used[$text] = $true
  $usedStart[$start] = $true

  $out.Add([pscustomobject]@{
    name = $name
    city = $city
    photo = [string]$r.photo
    stars = $stars
    text = $text
    course = $course
    courseId = $cid
    when = [string]$r.when
    lang = $lang
  })
}

function First32([string]$s) {
  $t = ($s -replace '\s+',' ').Trim()
  if ($t.Length -ge 32) { return $t.Substring(0, 32) }
  return $t
}

$patchEn = @(
  "Quick one from my messy desk after dinner.",
  "Alright, one honest take after the hype died.",
  "I was sceptical and I still paid.",
  "Did not think I would actually finish this.",
  "Update after using the checklist for real.",
  "Finished the last module last night.",
  "Writing this later than I meant to.",
  "Not a long review, just what stuck with me.",
  "Putting this down before I forget again.",
  "Came back a week later to type this.",
  "Almost skipped the review box, then didn't.",
  "A friend asked what I thought, so here it is.",
  "Shiny feeling is gone and it is still useful.",
  "Tea went cold while I typed this out.",
  "No speech and no thread, just this note.",
  "Small desk and a smaller review from me.",
  "This is after the payment guilt faded.",
  "I almost refunded, then I didn't.",
  "Watched on mobile data, not on wifi.",
  "Posted from a noisy house with captions on.",
  "Left this tab open for three days.",
  "Typing this while the kettle rolls.",
  "Not sponsored, not angry, just done with tips.",
  "Came here after a bad telegram week.",
  "I rewatched one boring video, which is new.",
  "Stopped adding indicators, that's the news.",
  "Roommate still wants calls and I don't.",
  "This sat unread in my dashboard, then I did it.",
  "Wrote it like a complaint, it became notes.",
  "I came for shortcuts and left with a stop.",
  "This is after module two, not after day one.",
  "I keep closing tip groups, that's the review.",
  "The calm tone annoyed me, then it helped.",
  "Not my usual five star paste, actual notes.",
  "I paused more than I played, that's how I learn.",
  "Took it during a quiet week at work.",
  "I still overtrade, just less than before.",
  "Did this between office and dinner, tight.",
  "No cinematic story, I just wanted a plan.",
  "I came in loud and left quieter, which is fine."
)
$patchHi = @(
  "Seedha desk se likha, bina hype ke.",
  "Shor mein type kiya, captions on the saath.",
  "Pehle skip karne socha tha yeh review box.",
  "Dost ne pucha tab jaake yeh likha.",
  "Hype utar gayi, checklist ab bhi desk pe hai.",
  "Chai thandi ho gayi, review yeh raha mera.",
  "Box khali nahi chhodna tha isliye type kiya.",
  "Doosri baar aake yeh type kiya maine.",
  "Refund socha tha, kiya nahi maine.",
  "Data pe dekha tha, wifi nahi tha ghar pe.",
  "Ghar shor tha, phir bhi yeh likh diya.",
  "Late night tha, aankh band ho rahi thi.",
  "Sunday ko yaad aaya to type kar diya yeh.",
  "Itna hi yaad rakhna tha isliye abhi likha.",
  "Abhi dimag mein hai, kal nahi hoga yeh.",
  "Overthink nahi kar raha, seedha type kiya.",
  "Jaldi mein likha, spelling maaf karna yaar.",
  "Pehli baar koi course ki review likhi hai.",
  "Bina hype ke, jo dil pe aaya woh likha.",
  "Bas dil pe jo aaya woh type kar diya.",
  "Office se ghar aaya, phir yeh likha maine.",
  "Mummy ko abhi bhi nahi bataaya poora scene.",
  "Main tips dhoondne aaya tha, plan mil gaya.",
  "Ek telegram group nikal diya, wahi meri news.",
  "Indicator kam kiye, wahi meri news hai ab.",
  "Gussa pehle aaya, ab notes, review yahi hai.",
  "Main slow hoon, course bhi slow, theek hai.",
  "Gharwale ko lagta hai yeh exam ki padhai hai.",
  "Copy 20 rs wali hai, app nahi, chal raha.",
  "Main spicy aaya tha, shaant nikal, theek hai.",
  "Yeh complaint nahi hai, habit ki baat hai.",
  "Pehle order nahi, pehle stop, nayi aadat.",
  "Main 1.5x pe dekhta hoon, psychology slow.",
  "Fridge pe checklist hai, hasi bhi, kaam bhi.",
  "Net kharab tha, download kaam aa gaya us din.",
  "Maine socha YouTube jaisa hoga, nahi tha.",
  "Abhi profit nahi bol sakta, galti choti hai.",
  "Doston ko signal nahi bheja, plan bheja.",
  "Yeh lambi review nahi, kaam ki baat hai.",
  "Main late likh raha hoon, maaf karna."
)

$seen = @{}
$pe = New-Object System.Collections.Generic.Queue[string]
$ph = New-Object System.Collections.Generic.Queue[string]
$patchEn | ForEach-Object { $pe.Enqueue($_) }
$patchHi | ForEach-Object { $ph.Enqueue($_) }

for ($i = 0; $i -lt $out.Count; $i++) {
  $item = $out[$i]
  $k = First32 $item.text
  $guard = 0
  while ($seen.ContainsKey($k) -and $guard -lt 90) {
    $q = $ph
    if ($item.lang -eq "en") { $q = $pe }
    if ($q.Count -gt 0) {
      $p = [string]$q.Dequeue()
    } else {
      $p = "Note $($i)-$guard from $($item.city), after $($item.course.Split()[0])."
    }
    $item.text = "$p $($item.text)"
    $item.text = ($item.text -replace "\s+", " ").Trim()
    $k = First32 $item.text
    $guard++
  }
  $seen[$k] = $true
  $out[$i] = $item
}

$dup = @($out | Group-Object text | Where-Object { $_.Count -gt 1 })
$dupS = @($out | Group-Object { First32 $_.text } | Where-Object { $_.Count -gt 1 })
if ($dup.Count -or $dupS.Count) { throw "dup text=$($dup.Count) start=$($dupS.Count)" }

$js = "window.REVIEWS = " + ($out.ToArray() | ConvertTo-Json -Compress -Depth 5) + ";"
[IO.File]::WriteAllText($path, $js, [Text.UTF8Encoding]::new($false))
Write-Host "Wrote $($out.Count) human reviews"
Write-Host "---- first 12 openings ----"
0..11 | ForEach-Object {
  $t = $out[$_].text
  $cut = [Math]::Min(70, $t.Length)
  Write-Host ("{0,2}. {1}" -f ($_+1), $t.Substring(0, $cut))
}
