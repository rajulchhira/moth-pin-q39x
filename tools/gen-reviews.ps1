$ErrorActionPreference = "Stop"
$rng = New-Object System.Random 20260911

$menFirst = @(
  "Rahul","Rohan","Kunal","Harsh","Yash","Arjun","Dev","Nikhil","Siddharth","Varun","Aman","Raj","Karan","Ishaan","Manish","Gaurav","Akash","Vivek","Sagar","Pranav","Abhishek","Ritesh","Sameer","Nitin","Mohit","Tarun","Ankit","Deepak","Sandeep","Piyush","Mayank","Sahil","Tushar","Dhruv","Ayaan","Farhan","Imran","Rehan","Zaid","Armaan","Shaurya","Tejas","Omkar","Prasad","Shubham","Rishabh","Chirag","Jatin","Parth","Hitesh","Mehul","Nilesh","Ashish","Vikas","Sunil","Ajay","Ravi","Manoj","Sanjay","Pankaj","Naveen","Uday","Suraj","Anand","Vinay","Alok","Harshit","Lakshya","Tanmay","Yuvraj","Jay","Ronak","Ishan","Kartik","Darshan","Mihir","Rutvik","Vatsal","Soham","Atharva","Vedant","Aryan","Krishna","Shreyas","Reyansh","Vihaan","Aditya","Kabir","Vikram","Ritesh","Adwait","Nirav","Saurabh","Chetan","Yogesh","Bhavesh","Pratik","Rajan","Siddhant","Aakash","Hemant","Lokesh","Niraj","Kunj","Hardik","Smeet","Dhaval","Kshitij","Anirudh","Varad","Onkar","Swapnil","Ganesh","Mahesh","Rohit","Nikunj","Jayesh","Ketan","Sanket","Abhinav","Raghav","Aarav","Ishwar","Tej","Bhanu","Samarth","Arnav","Ritvik","Devansh","Hriday","Ansh","Yug","Vivaan","Kabir"
)
$womenFirst = @(
  "Sneha","Priya","Ananya","Meera","Neha","Kavya","Isha","Pooja","Anjali","Riya","Nisha","Divya","Shruti","Aditi","Tanvi","Swati","Preeti","Aishwarya","Diya","Khushi","Anushka","Shreya","Nandini","Ira","Myra","Avni","Sana","Fatima","Zara","Ayesha","Inaya","Mehak","Simran","Harleen","Jasleen","Navya","Ishita","Palak","Ritu","Sonali","Bhavna","Mansi","Komal","Payal","Vaishnavi","Smita","Radhika","Gayatri","Deepika","Aarti","Snehal","Prachi","Roshni","Nikita","Sakshi","Trisha","Mahika","Kiara","Anvi","Sara","Alisha","Niharika","Esha","Vidya","Chitra","Tara","Megha","Bhumi","Hetal","Krupa","Disha","Riddhi","Charvi","Ankita","Sanya","Jhanvi","Nidhi","Kritika","Rucha","Ishaani","Mira","Devika","Lavanya","Suhani","Ahana","Pari","Siya","Anika","Reva","Ovi","Naina","Kavitha","Lakshmi","Keerthi","Sowmya","Harini","Sanjana","Bhavya","Trupti","Poonam","Seema","Namrata","Rashmi","Pallavi","Jyoti","Kiran","Sunita","Neelam","Shalini","Vandana","Kalyani","Amruta","Smita","Rupali","Ashwini","Vaishali","Deepa","Nandita"
)
$lasts = @(
  "Sharma","Verma","Gupta","Patel","Reddy","Nair","Iyer","Menon","Kapoor","Malhotra","Joshi","Desai","Kulkarni","Patil","Singh","Mehta","Shah","Agarwal","Bansal","Jain","Chopra","Khanna","Bhatia","Ahuja","Rao","Pillai","Shetty","Hegde","Naidu","Choudhary","Yadav","Mishra","Tiwari","Dubey","Pandey","Tripathi","Banerjee","Chatterjee","Mukherjee","Das","Ghosh","Bose","Sen","Dutta","Roy","Kaur","Dhillon","Gill","Sandhu","Thakur","Chauhan","Rathore","Saxena","Bhatt","Trivedi","Jha","Sinha","Prasad","Gokhale","Apte","Pawar","More","Jadhav","Gaikwad","Fernandes","Pereira","Naik","Kamat","Prabhu","Shenoy","Krishnan","Srinivasan","Subramanian","Iyengar","Gowda","Kamath","Bhandari","Talwar","Arora","Grover","Khurana","Sethi","Anand","Tandon","Bajaj","Goel","Mittal","Aggarwal","Jindal","Modi","Vyas","Parikh","Thakkar","Doshi","Purohit","Kulkarni","Bhave","Wagh","Sawant","Kadam","Salvi","Chavan","Rane","Tambe","Iyer","Nambiar","Warrier","Menon","Nambiar","Balakrishnan","Ranganathan","Venkatesan","Narayanan","Hegde","Pai","Kini","Bhat","Rao","Naidu","Reddy","Varma","Chowdhury","Mazumdar","Dey","Paul","Halder","Barua","Kalita","Saikia","Hazarika","Baruah","Lal","Raina","Kaul","Bhat","Zargar","Qureshi","Khan","Sheikh","Ansari","Shaikh","Pathan","Syed","Mirza","Hussain","Ali"
)
$cities = @(
  "Mumbai","Pune","Bengaluru","Hyderabad","Chennai","Delhi","Noida","Gurugram","Jaipur","Ahmedabad","Surat","Indore","Bhopal","Lucknow","Kanpur","Chandigarh","Kolkata","Kochi","Coimbatore","Nagpur","Vadodara","Nashik","Mysuru","Madurai","Visakhapatnam","Patna","Ranchi","Bhubaneswar","Guwahati","Dehradun","Ludhiana","Amritsar","Raipur","Jodhpur","Udaipur","Rajkot","Mangaluru","Hubli","Varanasi","Agra","Gwalior","Kota","Ajmer","Cuttack","Jamshedpur","Panaji","Puducherry","Trichy","Thrissur","Kolhapur","Sangli","Bilaspur","Jammu","Haridwar","Moradabad","Dhanbad","Bhilai","Ujjain","Hisar","Rohtak","Panipat","Patiala","Mohali","Navi Mumbai","Thane","Kalyan","Pimpri-Chinchwad","Whitefield","Hinjewadi","Andheri","Powai","Wakad","Kothrud","Baner","Koramangala","Indiranagar","Gachibowli","Madhapur","T Nagar","Adyar","Salt Lake","Dwarka","Rohini","Saket","Sector 62 Noida","Faridabad","Ghaziabad","Howrah","Velachery","Borivali","Vashi","Aundh","Hadapsar","Kharadi","Hebbal","Marathahalli","Kondapur","Jubilee Hills","Banjara Hills","Anna Nagar","Besant Nagar","Salt Lake Sec V","New Town","Vasant Kunj","Pitampura","Cyber City","Maninagar","Bodakdev","Satellite","Viman Nagar","Kalyani Nagar","Kothrud","Vijay Nagar Indore","Alwarpet","T Nagar","Jayanagar","Malleshwaram","Rajajinagar","Kakkanad","Edappally","Ballygunge","Park Street","Alipore"
)
$courses = @(
  @{ id = "breakout"; title = "Intraday Breakout Blueprint"; teacher = "Aarav Mehta" },
  @{ id = "income"; title = "Weekly Options Income Playbook"; teacher = "Neha Kapoor" },
  @{ id = "price-action"; title = "Price Action Without Indicators"; teacher = "Vikram Singh" },
  @{ id = "opening-range"; title = "Opening Range for Index Options"; teacher = "Kabir Joshi" },
  @{ id = "long-term"; title = "How to Build a 10-Year Stock Portfolio"; teacher = "Ananya Rao" },
  @{ id = "mf-guide"; title = "Mutual Funds Made Simple"; teacher = "Rohan Desai" },
  @{ id = "sip"; title = "SIP & Asset Allocation Lab"; teacher = "Priya Nair" },
  @{ id = "opt-start"; title = "Options from Zero"; teacher = "Meera Iyer" },
  @{ id = "spreads"; title = "Spreads & Defined-Risk Setups"; teacher = "Neha Kapoor" },
  @{ id = "first-month"; title = "Your First 30 Days in Markets"; teacher = "Aarav Mehta" },
  @{ id = "charts-101"; title = "Reading Charts for Beginners"; teacher = "Vikram Singh" },
  @{ id = "candles"; title = "Candlestick Context Course"; teacher = "Kabir Joshi" },
  @{ id = "levels"; title = "Support, Resistance & Market Structure"; teacher = "Meera Iyer" },
  @{ id = "hindi-ta"; title = "Technical Analysis in Hindi"; teacher = "Ananya Rao" },
  @{ id = "hindi-swing"; title = "Swing Trading in Hindi"; teacher = "Rohan Desai" },
  @{ id = "crypto-lab"; title = "Crypto Spot & Risk Basics"; teacher = "Priya Nair" },
  @{ id = "ema-swing"; title = "EMA Pullback Swing System"; teacher = "Vikram Singh" },
  @{ id = "vwap"; title = "VWAP Intraday Checklist"; teacher = "Aarav Mehta" }
)
$jobs = @(
  "software engineer","CA intern","bank PO","school teacher","shop owner","MBA student","pharmacist","civil engineer","marketing exec","BPO team lead","govt clerk","freelancer","dentist","nurse","architect","data analyst","sales manager","insurance agent","real estate broker","operations guy","HR executive","chartered accountant","content writer","interior designer","logistics coordinator","IT support","product manager","CA final student","homemaker","college lecturer","graphic designer","police sub-inspector","CA articleship","UI designer","mechanical engineer","hotel manager","fashion buyer","lab technician","tuition teacher","startup founder","company secretary intern","relationship manager","credit analyst","store manager","event planner","makeup artist","chef","driver who trades after shift","farmer who also does SIPs","auto electrician","wedding photographer"
)
$whenWatch = @(
  "after 9 pm","before office at 6 am","on the local after 7","during lunch break","once kids are asleep","only on Sundays","late night after shift","in the cab to work","after tuitions","between meetings"
)
$whenWatchHi = @(
  "raat 9 baje ke baad","subah 6 baje office se pehle","local train mein","lunch break pe","bacchon ke sone ke baad","sirf Sunday ko","shift ke baad","cab mein jaate hue","tuition ke baad","meeting ke beech"
)
$tickers = @("Nifty","Bank Nifty","crude","gold","Nifty options","weekly Bank Nifty","a small SIP book","Reliance kind of cash names","Finnifty","midcaps","a 3-stock cash book","USDINR","silver")
$monthsAgo = @(
  "2 days ago","5 days ago","1 week ago","2 weeks ago","3 weeks ago","1 month ago","6 weeks ago","2 months ago","3 months ago","4 months ago","5 months ago","6 months ago","8 months ago","last Diwali week","after Budget week","in January","this March","last April","in May","around Holi","during exams"
)

$menPhotos = @(
  "https://images.unsplash.com/photo-1607346256330-dee7af61f3a9?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1615109395622-8666c478e88e?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1557862921-37829c790f32?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1590086782792-42caa55240f7?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1522529599102-193c0d08b5b4?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1513956589380-b1a2a3d71b92?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1548378390-6b4d00b441c3?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1504257433016-414f0b47d00b?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1618641986557-1ecd230952aa?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1531894078-8e4e847e8e1c?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1577880216140-91728b5bf1d0?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&h=128&q=80&crop=faces"
)
$womenPhotos = @(
  "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1619895862022-09114b41f16f?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1601288496920-b61570e20c76?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1611432579699-484f7990b127?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1543269865-cbf97fb20ee0?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1485875437342-9b39470b3d95?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1614283233556-8475d3a8f3e3?auto=format&fit=crop&w=128&h=128&q=80&crop=faces",
  "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=128&h=128&q=80&crop=faces"
)

$enOpen = @(
  "Bought this after blowing two small accounts on YouTube setups.",
  "I work as a {job} so I needed something I could finish without sitting all day.",
  "Honest review after finishing the whole thing, not the first two videos.",
  "Was looking for a class that does not shout buy this stock.",
  "My cousin in {city} sent me the link. I almost ignored it.",
  "Took this because the sample lesson felt calm, not salesy.",
  "Third market course I have paid for. This one actually stuck.",
  "I trade {ticker} and wanted a written plan more than a guru.",
  "Started this {when}. Finished slower than I planned, which was fine.",
  "Came here after a friend lost money copying telegram calls.",
  "Not a full time trader. Just wanted to stop guessing.",
  "The preview did not overpromise. That is why I paid.",
  "I have a day job and a small {ticker} book. Needed structure.",
  "Watched it {when}. Notes are still on my desk.",
  "Did not expect much at this price. The journal part surprised me.",
  "I am picky about teachers who still show their own mistakes.",
  "Took it during a quiet month at work.",
  "Needed Hindi-friendly thinking even though I watch in English.",
  "Bought it on a Sunday and started the same night.",
  "I usually bounce off courses. This one I replayed twice."
)
$enMid = @(
  "{teacher} keeps saying skip the trade if the level is not there. I needed that.",
  "The position size examples are boring on purpose. That helped.",
  "Lessons are short. I could do two before dinner.",
  "They make you write the invalidation before the entry. I used to skip that.",
  "No indicator soup. Just structure and a checklist.",
  "I still get greedy on {ticker}, but at least I have a stop now.",
  "The weekly review template is what I actually use, not the fancy stuff.",
  "Some videos felt slow. I sped them up. Still useful.",
  "I liked that they do not pretend every week is a winner.",
  "Homework is simple: write five lines. I can do that.",
  "Audio is clear. I watch on phone in bed which is not ideal but it works.",
  "A couple of slides are text heavy. I paused and copied them anyway.",
  "They keep repeating size, size, size. Good. I used to ignore it.",
  "I wanted tips. They refused. Annoying at first, then I got it.",
  "The live class tie-in made more sense after module three.",
  "Examples are Indian market, not some NYSE clip from 2014.",
  "I paused a lot to screenshot the checklist. That is the product honestly.",
  "One module on psychology was cheesy but I still wrote the notes.",
  "They show a losing week on purpose. Rare.",
  "I wish there were more quizzes. Still better than a 6 hour dump."
)
$enClose = @(
  "Would buy another course here. Not shouting 5 stars for no reason.",
  "Keeping 4 because a few videos could be tighter.",
  "Solid. I still lose, just smaller.",
  "Recommend if you want a desk, not a signal group.",
  "Going to sit with {ticker} for a quarter before I add anything.",
  "If you want magic entries, skip this.",
  "Worth the money for the journal alone.",
  "I told two colleagues. One already enrolled.",
  "Will update if I blow up again. So far, no.",
  "Not flashy. That is the point.",
  "Done. Moving to the next module slowly.",
  "Good for people who already tried and got hurt.",
  "I am not profitable yet. I am organised. That is new.",
  "Four stars. Support replied in a day when my video lagged.",
  "Simple buy. No regret.",
  "Might look expensive until you count the YouTube hours I wasted."
)
$enMixed = @(
  "Okay course. Support was slow once, content is fine. I wanted more live hours.",
  "3 stars only because I already knew half of it. Beginners will like it more.",
  "Some lessons repeat. I skipped. The checklist is still on my wall.",
  "Expected more on expiry day. Still usable for {ticker}.",
  "A bit dry. I still finished it. That says something.",
  "Not my favourite teacher energy, but the notes are clean.",
  "I paused a lot. Maybe that is on me. Content is decent.",
  "Fine for {ticker}, thin on expiry examples. I still kept the notes.",
  "I wanted a louder teacher. Got a calm one. Mixed feelings from {city}.",
  "A few videos overlap. I skipped ahead. Homework still useful."
)
$hiMixed = @(
  "Theek hai. Support ek baar late reply kiya. Content ok.",
  "3 star. Thoda beginner ke liye zyada hai, mujhe half pata tha.",
  "Repeat videos hai. Skip kar diya. Checklist useful hai.",
  "Expiry pe aur chahiye tha. Phir bhi {ticker} ke liye chalega.",
  "Teacher ki energy thodi flat. Notes acche hai.",
  "Theek-thaak. {city} se slow net pe bhi chal gaya.",
  "Kuch classes lambi lagi. Notes kaam ke hai, energy kam.",
  "Main thoda bored hua beech mein, checklist fir bhi rakha."
)

$hiOpen = @(
  "Pehle YouTube pe random setups try karta tha, paisa jal gaya tha thoda.",
  "Office ke baad dimag nahi rehta, isliye short videos chahiye the.",
  "Dost ne bola tips nahi, plan lo. Maine socha dekh leti hoon.",
  "Hindi mein sochta hoon, English course bhi chal gaya kyunki language simple hai.",
  "Main {job} hoon, trading side se seekh raha hoon, koi bada fund nahi.",
  "Pehle telegram pe calls follow kiye, phir socha khud padhna padega.",
  "Mummy ko nahi bataaya pehle. Ab journal dikhake bataya, unko laga padhai hai.",
  "{city} se hoon, market ke baare mein log zyada serious nahi lete yahan.",
  "Course liya {when}. Abhi slow slow complete kiya.",
  "Main options se darti thi. Yahan se start kiya kyunki risk defined dikha.",
  "Salary account se cut hua payment, socha waste na ho.",
  "Bhai ke losses dekh ke khud seekhne baithi.",
  "English thodi weak hai, phir bhi examples samajh aa gaye.",
  "Main full time nahi hoon. Bas {ticker} pe discipline chahiye tha.",
  "Pehle indicator 12 laga ke baitha tha. Ab chart saaf lagta hai."
)
$hiMid = @(
  "{teacher} baar baar bolte hai skip karo agar setup nahi hai. Meri aadat thi force karne ki.",
  "Size wala part dry laga pehle, baad mein samajh aaya kyun repeat kar rahe hai.",
  "Journal template simple hai, 5 line. Usse zyada main likh nahi pata.",
  "Live class ke baad thoda aur clear hua, recording se hi kaam chal raha hai abhi.",
  "{ticker} pe maine overtrade kam kiya, yehi biggest change hai.",
  "Kuch videos slow hai, 1.25x pe dekha. Content theek hai.",
  "Stop loss likhna pehle skip karta tha. Ab pehle likhta hoon, phir order.",
  "Tips nahi mile. Pehle gussa aaya, ab theek lagta hai.",
  "Hindi course jaisa feel aaya even when they speak English. Simple words.",
  "Checklist print karke desk pe chipkaya hai. Gharwale has rahe the.",
  "Main still beginner hoon. Overconfident nahi hua, yeh important tha.",
  "Ek module psychology ka thoda filmy laga, but example Indian market ka tha.",
  "Audio clear hai, phone pe {when} dekhta hoon.",
  "Unhone losing week bhi dikhaya. Rare hai yeh.",
  "Main CA exam ke saath yeh nahi kar pata tha. Ab job ke baad time milta hai."
)
$hiClose = @(
  "Paisa waste nahi laga. Slow seekh raha hoon.",
  "4 star isliye kyunki thoda repeat hai. Overall worth.",
  "Doston ko bhi bola, tips wali group se nikalne ko.",
  "Abhi profit nahi, lekin galti choti ho gayi.",
  "Agar magic chahiye to mat lo. Plan chahiye to lo.",
  "Main dubara koi course yahi se lunga shayad.",
  "Simple language, simple rules. Kaam ka hai.",
  "Mera {ticker} ka size ab pichle mahine se chota hai, and that is good.",
  "Recommend. Overhype nahi hai.",
  "Ghar pe journal rakhna start kiya. Wahi win hai."
)

function Apply-Typo([string]$text) {
  $map = @{
    "definitely" = "definately"
    "recommend" = "reccomend"
    "because" = "becuase"
    "journal" = "jounral"
    "instructor" = "instuctor"
    "separate" = "seperate"
    "weird" = "wierd"
    "beginning" = "begining"
    "really" = "relly"
    "which" = "wich"
    "received" = "recieved"
    "until" = "untill"
    "successful" = "succesful"
    "necessary" = "neccessary"
    "occurrence" = "occurence"
    "grateful" = "greatful"
    "tomorrow" = "tommorow"
    "dummy" = "dumy"
  }
  $keys = @($map.Keys | Where-Object { $text -match $_ })
  if ($keys.Count -eq 0) {
    $text = $text -replace "don't", "dont"
    $text = $text -replace "didn't", "didnt"
    $text = $text -replace "can't", "cant"
    $text = $text -replace "I'm", "Im"
    $text = $text -replace "it's", "its"
    return $text
  }
  $pick = $keys[$rng.Next(0, $keys.Count)]
  return [regex]::Replace($text, [regex]::Escape($pick), $map[$pick], 1)
}

function Fill([string]$t, $course, $city, $job, $ticker, $when) {
  return $t.Replace("{teacher}", $course.teacher).Replace("{course}", $course.title).Replace("{city}", $city).Replace("{job}", $job).Replace("{ticker}", $ticker).Replace("{when}", $when)
}

$enBits = @(
  "Wrote this sitting in {city} after dinner.",
  "I keep {course} notes in a red diary.",
  "My {job} shift ends late, so I watch at 1.5x.",
  "Trying {ticker} with half the size I used last month.",
  "Printed the checklist and stuck it near the kettle.",
  "Told my roommate in {city}; he still wants tips. I said no.",
  "Module two I replayed on a Sunday bus.",
  "I skip the chat groups now, which is new for me.",
  "Kept a losing screenshot on purpose. Teacher would like that.",
  "Paid from my salary account and felt guilty for one day.",
  "The journal page for {ticker} is messy. That is fine.",
  "I mute YouTube gurus now. Small win.",
  "Did the homework on a train to {city}.",
  "My stop is written before I open the order window. Finally.",
  "I still overtrade once a week. Less than before.",
  "Saved two lessons offline for {when}.",
  "Asked support one doubt, they replied without selling more.",
  "I do not screenshot every slide anymore. I write three lines.",
  "Using a cheap notebook, not a fancy app.",
  "My cousin wanted the PDF. I sent him the checklist only.",
  "I watch with captions on. Helps when the house is noisy.",
  "I folded my lot size after the risk video. Hurt the ego.",
  "No more three screens. One chart, one notebook.",
  "I marked {ticker} levels on paper, not TradingView for a week.",
  "The boring videos are the ones I replay.",
  "I left a telegram group after lesson four.",
  "My {job} colleagues think I am doing an MBA module. Let them.",
  "I set a 25 minute timer. Two lessons, then stop.",
  "I still get FOMO on expiry. I just do not click as fast.",
  "Kept the fee receipt in the journal. Reminds me to finish."
)
$hiBits = @(
  "{city} se likh raha hoon, office ke baad.",
  "{course} ke notes fridge pe tape kiye hai.",
  "Main {job} hoon, isliye short videos hi ho paate hai.",
  "{ticker} pe size aadha kar diya, dil pe laga.",
  "Checklist print karke bottle ke peeche chipkaya.",
  "{city} mein dost ko bola, usko tips chahiye the. Maine mana kiya.",
  "Sunday ko module dubara dekha, tab jake click hua.",
  "Tip group leave kar diya. Pehle nahi hota tha.",
  "Loss wali trade ka screenshot rakha hai jaan ke.",
  "Salary se payment gaya, ek din guilty laga, phir theek.",
  "{ticker} ka page gandha hai journal mein. Chalta hai.",
  "YouTube wale ab mute hai. Choti jeet hai.",
  "{when} dekhta hoon, headphones laga ke.",
  "Pehle order, pehle stop. Yeh habit nayi hai.",
  "Hafte mein ek baar phir bhi zyada trade ho jata hai.",
  "Do lessons download karke rakhe hai jab net kharab ho.",
  "Support ko ek sawal bheja, upsell nahi kiya unhone.",
  "Ab har slide ka photo nahi, sirf 3 line likhta hoon.",
  "Mehnga notebook nahi, 20 wala copy chalu hai.",
  "Bhai ko PDF mang raha tha, checklist bhej diya sirf.",
  "Captions on karke dekhta hoon, ghar shor hota hai.",
  "Risk wale video ke baad lot size kaat diya.",
  "Teen screen chhod diye. Ek chart, ek copy.",
  "{ticker} ke levels copy mein banaye, app band karke.",
  "Jo video boring lagi, wahi dubara dekhi.",
  "Lesson 4 ke baad telegram group nikal diya.",
  "Office mein log sochte hai MBA kar raha hoon. Theek hai.",
  "25 minute timer lagata hoon, do video, phir band.",
  "Expiry pe FOMO aata hai, click dheere hota hai ab.",
  "Fee ki receipt journal mein rakh di, finish karne ke liye."
)

$usedNames = @{}
$usedTexts = @{}
$usedStarts = @{}
$reviews = New-Object System.Collections.Generic.List[object]
$target = 520

for ($i = 0; $i -lt $target; $i++) {
  $female = ($i % 5) -lt 2
  if ($female) {
    $fn = $womenFirst[$rng.Next(0, $womenFirst.Count)]
    $photo = $womenPhotos[($i * 3) % $womenPhotos.Count]
  } else {
    $fn = $menFirst[$rng.Next(0, $menFirst.Count)]
    $photo = $menPhotos[($i * 3) % $menPhotos.Count]
  }
  $ln = $lasts[$rng.Next(0, $lasts.Count)]
  $name = "$fn $ln"
  $guard = 0
  while ($usedNames.ContainsKey($name) -and $guard -lt 40) {
    $ln = $lasts[$rng.Next(0, $lasts.Count)]
    $name = "$fn $ln"
    $guard++
  }
  $usedNames[$name] = $true

  $city = $cities[$i % $cities.Count]
  $course = $courses[$i % $courses.Count]
  $job = $jobs[$i % $jobs.Count]
  $ticker = $tickers[($i * 5) % $tickers.Count]
  $ago = $monthsAgo[$i % $monthsAgo.Count]
  $langRoll = $i % 10
  $starsRoll = $rng.Next(0, 100)
  if ($starsRoll -lt 6) { $stars = 2 }
  elseif ($starsRoll -lt 16) { $stars = 3 }
  elseif ($starsRoll -lt 48) { $stars = 4 }
  else { $stars = 5 }
  if ($langRoll -lt 4) { $lang = "en" }
  elseif ($langRoll -lt 8) { $lang = "hi" }
  else { $lang = "mix" }
  $when = if ($lang -eq "en") { $whenWatch[$rng.Next(0, $whenWatch.Count)] } else { $whenWatchHi[$rng.Next(0, $whenWatchHi.Count)] }

  $guard = 0
  do {
    if ($stars -le 3) {
      if ($lang -eq "en") { $text = Fill ($enMixed[$rng.Next(0, $enMixed.Count)]) $course $city $job $ticker $when }
      else { $text = Fill ($hiMixed[$rng.Next(0, $hiMixed.Count)]) $course $city $job $ticker $when }
    } elseif ($lang -eq "en") {
      $text = (Fill $enOpen[$rng.Next(0, $enOpen.Count)] $course $city $job $ticker $when) + " " + (Fill $enMid[$rng.Next(0, $enMid.Count)] $course $city $job $ticker $when) + " " + (Fill $enClose[$rng.Next(0, $enClose.Count)] $course $city $job $ticker $when)
    } else {
      $text = (Fill $hiOpen[$rng.Next(0, $hiOpen.Count)] $course $city $job $ticker $when) + " " + (Fill $hiMid[$rng.Next(0, $hiMid.Count)] $course $city $job $ticker $when) + " " + (Fill $hiClose[$rng.Next(0, $hiClose.Count)] $course $city $job $ticker $when)
    }
    $bitPool = if ($lang -eq "en") { $enBits } else { $hiBits }
    $bit = Fill $bitPool[($i + $guard) % $bitPool.Count] $course $city $job $ticker $when
    $text = "$bit $text"
    if ($guard -gt 0) {
      $nWeeks = 2 + (($i + $guard * 3) % 11)
      $lot = 150 + (($i * 19 + $guard * 7) % 850)
      if ($lang -eq "en") { $text += " Week $nWeeks with a Rs $lot trial lot." }
      else { $text += " Week $nWeeks, trial lot Rs $lot." }
    }
    $text = ($text -replace "\s+", " ").Trim()
    if ($rng.Next(0, 100) -lt 14) { $text = Apply-Typo $text }
    $startKey = if ($text.Length -ge 70) { $text.Substring(0, 70) } else { $text }
    $guard++
  } while (($usedTexts.ContainsKey($text) -or $usedStarts.ContainsKey($startKey)) -and $guard -lt 25)

  if ($usedTexts.ContainsKey($text)) {
    $text = "$text I am in $city doing $($course.title)."
  }
  $usedTexts[$text] = $true
  $usedStarts[$startKey] = $true

  $reviews.Add([ordered]@{
    name = $name
    city = $city
    photo = $photo
    stars = $stars
    text = $text
    course = $course.title
    courseId = $course.id
    when = $ago
    lang = $lang
  })
}

$json = $reviews | ConvertTo-Json -Depth 6 -Compress
$out = "window.REVIEWS = $json;"
$path = Join-Path $PSScriptRoot "..\js\reviews-data.js"
$full = [IO.Path]::GetFullPath($path)
[IO.File]::WriteAllText($full, $out, [Text.UTF8Encoding]::new($false))
$uniq = @{}
foreach ($r in $reviews) { $uniq[$r.text] = $true }
Write-Host "Wrote $($reviews.Count) reviews to $full (unique texts: $($uniq.Count))"
