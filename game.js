const VERSION = "0.1.0"
document.getElementById("GameTitle").textContent = `Texcity v${VERSION}`

// Variables
var Money = 0
var Time = 420
var Day = 1
var WeekDay = 6
var TotalTime = 420
var OldScene = ""
var CurrentScene = ""
var Playtime = 0
var TopText = ""
var EndText = ""
var LinkSceneOverride = false
var Stats = {"Fatigue": 0, "Health": 100}
var Checks = {}
var Jobs = {}
var OfficeRank = 0
var OfficePromotionXP = 0
var Skills = {"Communication": 0, "Foraging": 0, "Science": 0, "English": 0, "Math": 0, "Business": 0, "History": 0, "Fitness": 0, "Technology": 0, "Lockpicking": 0, "Dexterity": 0, "Fishing": 0}
var SkillXp = structuredClone(Skills)
var Cooldowns = {}
var Inventory = {}
var Playtime = 0
var Debt = 10000
var DebtDue = 0
var Counts = {}
var Owned = {}
var EquippedRod = null
var EquippedBait = null

var ForcedRng = -1

const OFFICE_RANKS = [
    {"Title": "File Sorter", "Pay": 8, "Promotion": 20},
    {"Title": "File Analyzer", "Pay": 10, "Promotion": 30, "Skills": {"Math": 3}},
    {"Title": "Database Analyzer", "Pay": 12, "Promotion": 50, "Skills": {"Math": 4, "Technology": 3}},
    {"Title": "Supervisor", "Pay": 15, "Promotion": 100, "Skills": {"Math": 4, "Technology": 3, "English": 3, "Communication": 6}},
    {"Title": "Assistant Manager", "Pay": 20, "Promotion": 150, "Skills": {"Technology": 5, "English": 4, "Communication": 7}},
    {"Title": "Deputy Manager", "Pay": 23, "Promotion": 200, "Skills": {"English": 5, "Communication": 8, "Business": 4}},
    {"Title": "Manager", "Pay": 27, "Promotion": 10000000, "Skills": {"English": 6, "Communication": 8, "Business": 5}} // Change to 250 when more ranks available
]
const TEXT_COLORS = {
    "money": "006400",
    "xp": "21a8d1",
    "bad": "d90202",
    "good": "2eba04",
    "requirement": "ffa500",
    "important": "ffd700",
    "unavailable": "888888"
}
const LINK_REGEX = new RegExp("\\{([^|{}]+)\\|([^|{}]+)\\|([0-9]+)\\|?([^|{}(]+)?\\(?([^(){}|]+)?\\)?\\}", "g")
const TEXT_SPLITTER = new RegExp("{[^}]{1,}}", "g")
const IMAGE_REGEX = new RegExp("!\\[(.*?)\\]", "g")
const ITEM_DATA = {
    "RedBerry": {"Name": "Red Berries"},
    "BlueBerry": {"Name": "Blue Berries"},
    "GreenBerry": {"Name": "Green Berries"},
    "Moonberry": {"Name": "Moonberries", "Usable": true},
    "PurpleBerry": {"Name": "Purple Berries"},
    "YellowBerry": {"Name": "Yellow Berries"},
    "SeaShell": {"Name": "Sea Shells"},
    "Goldfish": {"Name": "Goldfish"},
    "Salmon": {"Name": "Salmon"},
    "Trout": {"Name": "Trout"},
    "Bass": {"Name": "Bass"},
    "Catfish": {"Name": "Catfish"},
    "Tuna": {"Name": "Tuna"},
    "Shark": {"Name": "Shark"}
}
const SUBJECT_STATS = {
    "Science": {"xp": 10, "Fatigue": 10, "Time": 585},
    "English": {"xp": 10, "Fatigue": 10, "Time": 635},
    "Math": {"xp": 10, "Fatigue": 10, "Time": 715},
    "Business": {"xp": 10, "Fatigue": 10, "Time": 765},
    "History": {"xp": 10, "Fatigue": 10, "Time": 845},
    "PE": {"xp": 10, "Fatigue": 20, "Time": 895},
    "Technology": {"xp": 10, "Fatigue": 5, "Time": 945}
}
const DEBT_SCALING = [0, 100, 200, 300, 500, 750, 1000, 1250, 1500, 1750, 2000, 650]
const RODS = {
    "BasicRod": {"Name": "Basic Rod", "FishMin": 1, "FishMax": 3, "Price": 50},
    "AdvancedRod": {"Name": "Advanced Rod", "FishMin": 2, "FishMax": 5, "Price": 200},
    "MasterRod": {"Name": "Master Rod", "FishMin": 3, "FishMax": 7, "Price": 500}
}
const FISH = [
    {"Name": "Goldfish", "Chance": 0.50, "Price": 2},
    {"Name": "Salmon", "Chance": 0.25, "Price": 3},
    {"Name": "Trout", "Chance": 0.10, "Price": 5},
    {"Name": "Bass", "Chance": 0.05, "Price": 7},
    {"Name": "Catfish", "Chance": 0.03, "Price": 10},
    {"Name": "Tuna", "Chance": 0.01, "Price": 20},
    {"Name": "Shark", "Chance": 0.005, "Price": 30}
]
const BAIT = {
    "Bread": {"Name": "Bread", "Luck": 1, "Price": 3},
    "Worms": {"Name": "Worms", "Luck": 1.3, "Price": 5},
    "Fish": {"Name": "Fish", "Luck": 1.5, "Price": 8}
}

// Scenes
class Scenes {
    static Menu() {
        return "Menu\n{Start|Tutorial|0}\n\n{About|About|0}"
    }
    
    static About() {
        return "Another text based city game. Currently in development.\n\n{Return|Menu|0}"
    }
    
    static Tutorial() {
        return "Welcome to Texcity.\nImportant reminder that this game is not finished yet so there may be changes made in the future. Saving doesn't exist yet.\n\nthe duration of each action is usually shown in brackets after the blue text.\ne.g. Home (1h 15m)\n\nPress the blue text below to continue.\n{Next|Home|0}"
    }
    
    static Home() {
        return `You are in your apartment, it's currently ${GetDayName()} ${GetTimeName(false)}.\n\n![bed.png] {Sleep|Sleep|0}\n\n![leave.png] {Leave (1m)|ApartmentHall|1}`
    }
    
    static Sleep() {
        return "{Sleep for 1 hour|Home|60|Sleep(1)}\n\n{Sleep for 2 hours|Home|120|Sleep(2)}\n\n{Sleep for 3 hours|Home|180|Sleep(3)}\n\n{Sleep for 4 hours|Home|240|Sleep(4)}\n\n{Sleep for 6 hours|Home|360|Sleep(6)}\n\n{Sleep for 8 hours|Home|480|Sleep(8)}\n\n{Sleep for 10 hours|Home|600|Sleep(10)}\n\n{Cancel|Home|0}"
    }
    
    static ApartmentHall() {
        if (Checks['BankerIntro']) {
            return "You are in the hall of your apartment block. One of the lights is constantly flickering and some of the paint on the walls has peeled off.\n\n![wood_door.png] {Your apartment (1m)|Home|1}\n\n![leave.png] {Go outside (1m)|MeadowbrookStreet|1}"
        } else {
            Checks['BankerIntro'] = true
            return "As you step out of your apartment a skinny man with a black bowler hat approaches you.\n\n\"Greetings, we've met before. I'm here to remind you about your outstanding balance of $10000, with a payment of $100 due this week. If you've forgotten, our bank is at " + ColorGen(TEXT_COLORS['important'], "Crestwood Street") + ". You can visit at any time to inquire about the remaining amount you owe.\"\n\n{Next|ApartmentHall|0}"
        }
    }
    
    static MeadowbrookStreet() {
        return "You are on Meadowbrook Street. The street is quiet and lined with small apartments. A convenience store is nearby.\n\n![enter.png] {Apartment block (1m)|ApartmentHall|1}\n![convenience_store.png] {Convenience Store (1m)|ConvenienceStore|1}\n\n![crestwood.png] {Crestwood Street (5m)|CrestwoodStreet|5}\n![lunar.png] {Lunar Road (5m)|LunarRoad|5}"
    }
    
    static ConvenienceStore() {
        let r = "You are inside a small convenience store. Shelves are stocked with snacks and drinks."
        r += Jobs['ConvenienceStore'] ? "\n\n{Work (1h)|ConvenienceStore|60|ConvenienceStoreWork}" : "\n\n![chat.png] {Ask for work (5m)|ConvenienceStoreWorkIntro1|5}"
        r += "\n\n![energy_drink.png] {Energy Drink ($10)|ConvenienceStore|1|ConvenienceStoreBuy(EnergyDrink)}\n\n![leave.png] {Leave (1m)|MeadowbrookStreet|1}"
        return r
    }
    
    static ConvenienceStoreWorkIntro1() {
        return "You patiently wait in the convenience store for five minutes until the manager arrives.\nHe's willing to give you a job on the spot as they are heavily understaffed.\nThe pay is $3/hr which is definitely below minimum wage but at least it's something.\n\n![tick.png] {Accept (10m)|ConvenienceStoreWorkIntro2|10}\n![cross.png] {Refuse|ConvenienceStore|0}"
    }
    
    static ConvenienceStoreWorkIntro2() {
        Jobs['ConvenienceStore'] = true
        return "You listen carefully as he explains what to do.\n{Next|ConvenienceStore|0}"
    }

    static CrestwoodStreet() {
        return "You are on Crestwood Street. There are cars and people moving constantly. There's a bank, office buildings, and a fast food place nearby.\n\n![dollar.png] {Bank (1m)|Bank|1}\n![crestwood.png] {Office (1m)|Office|1}\n![burger.png] {Fast Food Restaurant (1m)|FastFood|1}\n\n![meadowbrook.png] {Meadowbrook Street (5m)|MeadowbrookStreet|5}\n![beach.png] {Shoreline Street (5m)|ShorelineStreet|5}"
    }
    
    static Bank() {
        let r = `You are in the bank. It's well lit with luxurious red carpets and a crystal chandelier. Customers wait in line while tellers handle transactions behind glass windows.\n\nDebt: ${ColorGen(TEXT_COLORS['money'], `$${Debt}`)}\nDue this week: ${ColorGen(TEXT_COLORS['money'], `$${DebtDue}`)}\n\n`
        r += DebtDue == 0 ? ColorGen(TEXT_COLORS['good'], "Debt paid for this week") : "![dollar.png] {Pay debt (15m)|BankPayDebt|15}"
        r += "\n\n![leave.png] {Leave (1m)|CrestwoodStreet|1}"
        return r
    }
    
    static BankPayDebt() {
        let r = "\"Good " + GetTimeName(true) + ", are you here to pay off your debt? We only accept payment for the full week.\"\n\n"
        r += Money >= DebtDue ? "![dollar.png] {Pay|Bank|1|PayDebt}" : ColorGen(TEXT_COLORS['bad'], "Not enough money")
        r += "\n![leave.png] {Leave|Bank|1}"
        return r
    }
    
    static Office() {
        let r = "You are inside a corporate office building. The front desk receptionist barely looks up as people hurry past.\n"
        r += Time <= 570 && Time >= 510 && Jobs['Office'] == true && WeekDay < 6 ? "\n{Work (8h)|OfficeWorkEntry|0}" : 
             Jobs['Office'] == true ? ColorGen(TEXT_COLORS['requirement'], "\nYou can only start work between 8:30 and 9:30 on weekdays.") : ""
        r += "\n![chat.png] {Receptionist (2m)|OfficeReceptionist|2}\n\n![leave.png] {Leave (1m)|CrestwoodStreet|1}"
        return r
    }

    static OfficeReceptionist() {
        let r = `"Good ${GetTimeName(true)}, how may I assist you today?"\n\n`
        if (!Jobs["Office"]) {
            r += "![chat.png] {Inquire about work (1m)|OfficeWO1|1}"
        }
        r += "\n\n![leave.png] {Leave|Office|1}"
        return r
    }
    
    static OfficeWO1() {
        return "The receptionist gives you a few simple tasks to complete to test your ability.\n\n{Next (20m)|OfficeWO2|20}"
    }
    
    static OfficeWO2() {
        if (Skills['Communication'] < 4 && Skills['Math'] < 2) {
            return `You were unable to complete the tasks she provided.\n\n${ColorGen(TEXT_COLORS['important'], "Requires: Communication 4 and Math 2")}\n\n{Leave (1m)|Office|1}`
        }
        Jobs["Office"] = true
        return "Upon completion she gives you some information about your job. \"You will be sorting files for our company. Note that you can only begin working at 8:30 to 9:30 on weekdays.\"\n\n{Next (1m)|Office|1}"
    }
    
    static OfficeWorkEntry() {
        let r = "Since your desk is on the 3rd floor, you take the staircase to get there as it's more efficient.\n"
        r += OfficePromotionXP >= OFFICE_RANKS[OfficeRank]['Promotion'] ? "\n{Request Promotion|OfficePromotion|0}\n" : ""
        r += "\n{Next|Blank|0|OfficeWorkManager(1)}"
        return r
    }

    static OfficeWorkEnd() {
        OfficePromotionXP += 8
        ChangeMoney(8 * OFFICE_RANKS[OfficeRank]['Pay'])
        if (OFFICE_RANKS[OfficeRank]['Promotion'] <= OfficePromotionXP) {
            EndText = "\n\nYou can request a promotion the next time you work if you have the required skills."
        }
        return `You finish your 8 hour shift and head down to the first floor. It is extremely crowded with hundreds of employees leaving the building. You were paid ${ColorGen(TEXT_COLORS['money'], "$" + 8 * OFFICE_RANKS[OfficeRank]['Pay'])} upon leaving the building.\n\n${InfoText("Office")}\n\n{Next|CrestwoodStreet|0}`
    }

    static OfficePromotion() {
        if (SkillCheck(OFFICE_RANKS[OfficeRank + 1]['Skills']).length == 0) {
            OfficePromotionXP = 0
            OfficeRank += 1
            return `You head towards a futuristic looking device that tracks your hours worked and your performance. You have automatically been promoted to: "${OFFICE_RANKS[OfficeRank]['Title']}". You can begin working now.\n\n{Next|Blank|0|OfficeWorkManager(1)}`
        } else {
            var SkillsRequired = SkillCheck(OFFICE_RANKS[OfficeRank + 1]['Skills'])
            var RequiredString = ""
            SkillsRequired.forEach(function(value) {
                RequiredString += `\n - ${value} ${OFFICE_RANKS[OfficeRank + 1]['Skills'][value]}`
            })
            return `You head towards a futuristic looking device that tracks your hours worked and your performance. You do not have the skills required to be promoted.\n\nRequired: ${RequiredString}\n\n{Next|Blank|0|OfficeWorkManager(1)}`
        }
    }

    static FastFood() {
        let r = "You are inside a fast food restaurant. "
        r += Time < 420 ? "It's late, and only a few customers linger under the dim lights." :
             Time < 660 ? "The morning rush has people grabbing coffee and breakfast sandwiches." :
             Time < 1020 ? "The lunch crowd fills the air with chatter and the smell of burgers and fries." : "It's late, and only a few customers linger under the dim lights."
        r += Jobs['FastFood'] ? "\n\n{Work (1h)|FastFood|60|FastFoodWork}" : "\n\n![chat.png] {Ask for work (5m)|FastFoodWorkIntro1|5}"
        r += "\n\n![leave.png] {Leave (1m)|CrestwoodStreet|1}"
        return r
    }
    
    static FastFoodWorkIntro1() {
        return "You inform the cashier that you're looking for a job. They nod and ask you to wait.\n\nAfter 5 minutes, a manager in a black suit arrives and gestures for you to follow.\n\n{Next|FastFoodWorkIntro2|0}"
    }

    static FastFoodWorkIntro2() {
        let r = "The manager leads you into a small office and sits behind a desk. He begins quickly checking your records.\n\n"
        if (Skills["Communication"] >= 3) {
            Jobs['FastFood'] = true
            r += "\"You've got the job. You can begin working at any time.\"\n\n{Next|FastFood|0}"
        } else {
            r += "\"Sorry we're looking for someone with more experience. Come back when you've reached level 3 in communication.\"\n\n{Next|FastFood|0}"
        }
        
        return r
    }

    
    static ShorelineStreet() {
        return "You are on Shoreline Street. It runs parallel to the coast. The sound of waves crashing can be heard in the distance.\n\n![beach.png] {Beach (2m)|Beach|2}\n\n![maple.png] {Maple Street (5m)|MapleStreet|5}\n![crestwood.png] {Crestwood Street (5m)|CrestwoodStreet|5}"
    }

    static Beach() {
        return "You are on the beach. The waves crash against the shore rhythmically, leaving trails of foam on the sand.\n\n![search.png] {Explore (20m)|Beach|20|BeachExplore}\n![fish.png] {Fishing Shop (3m)|FishingShop|3}\n![fish.png] {Dock (1m)|Docks|1}\n\n![beach.png] {Shoreline Street (2m)|ShorelineStreet|2}"
    }

    static FishingShop() {
        return "You are inside a small fishing shop. The walls are filled with various fishing rods and bait.\n\n![dollar.png] {Sell Fish (5m)|FishingShop|5|SellFish}\n![fishing_rod.png] {Fishing rods|FishingShopRod|0}\n![fish.png] {Bait|FishingShopBait|0}\n\n![leave.png] {Leave (3m)|Beach|1}"
    }
    
    static FishingShopRod() {
        let r = "A variety of fishing rods are displayed on the shelves.\n\n"
        for (const [rod, data] of Object.entries(RODS)) {
            if (!Owned[rod]) {
                r += `{${data['Name']} $${data['Price']}|FishingShopRod|1|FishingShopBuyRod(${rod})}\n`
            } else {
                r += ColorGen(TEXT_COLORS['unavailable'], data['Name'] + " owned") + "\n"
            }
        }
        r += "\n{Back|FishingShop|0}"
        return r
    }

    static FishingShopBait() {
        let r = "Different types of bait are stored in boxes.\n\n"
        for (const [bait, data] of Object.entries(BAIT)) {
            r += `{${data['Name']} $${data['Price']}|Blank|1|FishingShopBaitSelection(${bait})}\n`
        }
        r += "\n{Back|FishingShop|0}"
        return r
    }

    static Docks() {
        return `You are standing on a wooden dock. You can hear seagulls cry overhead.\n\n${EquippedBait != null ? `Bait: ${BAIT[EquippedBait]['Name']} (${Owned[EquippedBait]})\n` : ""}${EquippedRod != null ? `Rod: ${RODS[EquippedRod]['Name']}\n\n![fishing_rod.png] {Fish (30m)|Docks|30|DocksFish}\n` : ""}![fishing_rod.png] {Choose Rod|DocksChooseRod|0}\n![fish.png] {Choose Bait|DocksChooseBait|0}\n\n![leave.png] {Leave (1m)|Beach|1}`
    }

    static DocksChooseRod() {
        let r = ""
        for (const [rod, data] of Object.entries(RODS)) {
            if (Owned[rod]) {
                r += `{${data['Name']}|Docks|1|DocksChooseRod(${rod})}\n`
            }
        }

        if (r == "") {
            r = "You have no rods available.\n"
        }
        r += "\n{Back|Docks|0}"
        return r
    }

    static DocksChooseBait() {
        let r = ""
        for (const [bait, data] of Object.entries(BAIT)) {
            if (Owned[bait]) {
                r += `{${data['Name']}|Docks|1|DocksChooseBait(${bait})}\n`
            }
        }

        if (r == "") {
            r = "You have no bait available.\n"
        }
        r += "\n{Back|Docks|0}"
        return r
    }
    
    static MapleStreet() {
        return "You are on Maple Street. filled with trees that sway gently in the breeze. A large hospital is nearby.\n\n![hospital.png] {Hospital (1m)|Hospital|1}\n\n![beach.png] {Shoreline Street (5m)|ShorelineStreet|5}"
    }
    
    static Hospital() {
        return "You are inside the hospital. Nurses and doctors move hastily through the halls.\n\n![leave.png] {Leave (1m)|MapleStreet|1}"
    }
    
    static HospitalUnconscious() {
        return "You wake up in a hospital bed. A doctor stands nearby, checking a clipboard.\n\n\"You pushed yourself too hard. Try to rest more.\" says the doctor.\n\n{Get up (2m)|Hospital|2}"
    }
    
    static Blank() {
        return ""
    }
    
    static LunarRoad() {
        return "You are on Lunar Road. There appears to be nothing besides a forest nearby.\n\n{Forest (10m)|ForestLayer1|10}\n\n![school.png] {Oxford Road (5m)|OxfordRoad|5}\n![meadowbrook.png] {Meadowbrook Street (5m)|MeadowbrookStreet|5}"
    }
    
    static ForestLayer1() {
        return "You are near the entrance of the forest. The trees stand tall but their spacing allows glimpses of sunlight to filter through.\n\n![search.png] {Look for berries (20m)|ForestLayer1|20|ForestGather(1)}\n\n![arrow_right.png] {Walk towards the center (20m)|ForestLayer2|20}\n![lunar.png] {Lunar Road (5m)|LunarRoad|5}"
    }

    static ForestLayer2() {
        let r = "You are in the forest. Trees block the sunlight making the area darker.\n\n"
        r += Skills['Foraging'] >= 3 ? "![search.png] {Look for berries (20m)|ForestLayer2|20|ForestGather(2)}" : ColorGen(TEXT_COLORS['requirement'], "Requires: Foraging 3")
        r += "\n\n![arrow_right.png] {Walk towards the center (20m)|ForestLayer3|20}\n![arrow_left.png] {Walk towards the exit (20m)|ForestLayer1|20}"
        return r
    }

    static ForestLayer3() {
        let r = "You are near the center of the forest. There are trees everywhere. They block most of the sunlight making it hard to see.\n\n"
        r += Skills['Foraging'] >= 6 ? "![search.png] {Look for berries (20m)|ForestLayer3|20|ForestGather(3)}" : ColorGen(TEXT_COLORS['requirement'], "Requires: Foraging 6")
        r += "\n\n![arrow_left.png] {Walk towards the exit (20m)|ForestLayer2|20}"
        return r
    }

    static OxfordRoad() {
        let r = "You are on Oxford Road. A large school stands here."
        r += (Time >= 480 && Time <= 960 && WeekDay <= 5) 
            ? "\n\n![school.png] {School (3m)|SchoolYard|1}" 
            : `\n\n${ColorGen(TEXT_COLORS['unavailable'], "The school gates are locked.")}`
        r += "\n\n![lunar.png] {Lunar Road (5m)|LunarRoad|5}"
        return r
    }
    
    static SchoolYard() {
        return "You are in the school yard. Students are scattered around chatting and playing.\n\n![enter.png] {Enter the building (1m)|SchoolHallway|1}\n![burger.png] {Canteen (1m)|SchoolCanteen|1}\n\n![leave.png] {Leave (1m)|OxfordRoad|1}"
    }
    
    static SchoolHallway() {
        return `You are inside the school hallways. You have ${GetNextClass()} next.\n\n{View Timetable|SchoolTimetable|0}\n\n{Science Classroom (2m)|SchoolScienceClassroom|2}\n{English Classroom (2m)|SchoolEnglishClassroom|2}\n{Math Classroom (2m)|SchoolMathClassroom|2}\n{Business Classroom (2m)|SchoolBusinessClassroom|2}\n{History Classroom (2m)|SchoolHistoryClassroom|2}\n{Physical Education Classroom (2m)|SchoolPEClassroom|2}\n\n![leave.png] {Leave (1m)|SchoolYard|1}`
    }

    static SchoolScienceClassroom() {
        if (Time < 585 && Time > 535) {
            if (Time > 550) {
                TopText = "You're late for class.\n\n"
            }
            return "You are in the science classroom. It has slightly damaged lab equipment and walls filled with posters illustrating scientific concepts." + SchoolClassroomOptionsGen("Science")
        } else {
            return "The door for the science classroom is locked.\n\n{Back|SchoolHallway|0}"
        }
    }

    static SchoolEnglishClassroom() {
        if (Time < 630 && Time > 585) {
            if (Time > 600) {
                TopText = "You're late for class.\n\n"
            }
            return "You are in the english classroom. Every table in this classroom contains a reading lamp." + SchoolClassroomOptionsGen("English")
        } else {
            return "The door for the english classroom is locked.\n\n{Back|SchoolHallway|0}"
        }
    }
    
    static SchoolMathClassroom() {
        if (Time < 710 && Time > 665) {
            if (Time > 680) {
                TopText = "You're late for class.\n\n"
            }
            return "You are in the math classroom. There's a large whiteboard in the front of the room filled with complex equations." + SchoolClassroomOptionsGen("Math")
        } else {
            return "The door for the math classroom is locked.\n\n{Back|SchoolHallway|0}"
        }
    }
    
    static SchoolBusinessClassroom() {
        if (Time < 760 && Time > 715) {
            if (Time > 730) {
                TopText = "You're late for class.\n\n"
            }
            return "You are in the business classroom. There's multiple graphs on the wall that provides examples of a market." + SchoolClassroomOptionsGen("Business")
        } else {
            return "The door for the business classroom is locked.\n\n{Back|SchoolHallway|0}"
        }
    }
    
    static SchoolHistoryClassroom() {
        if (Time < 840 && Time > 795) {
            if (Time > 810) {
                TopText = "You're late for class.\n\n"
            }
            return "You are in the history classroom. It contains multiple maps and timelines of important events in history." + SchoolClassroomOptionsGen("History")
        } else {
            return "The door for the history classroom is locked.\n\n{Back|SchoolHallway|0}"
        }
    }
    
    static SchoolPEClassroom() {
        if (Time < 890 && Time > 845) {
            if (Time > 860) {
                TopText = "You're late for class.\n\n"
            }
            return "You are in the physical education classroom. It's slightly bigger than the other classrooms as extra space is needed for the training equipment." + SchoolClassroomOptionsGen("PE")
        } else {
            return "The door for the physical education classroom is locked.\n\n{Back|SchoolHallway|0}"
        }
    }

    static SchoolTimetable() {
        return "Science 9:00 - 9:45\nEnglish 9:50 - 10:35\nRecess 10:35 - 11:05\nMath 11:05 - 11:55\nBusiness 11:55 - 12:45\nLunch 12:45 - 13:15\nHistory 13:15 - 14:05\nPhysical Education 14:05 - 14:55\n{Back|SchoolHallway|0}"
    }
    
    static SchoolCanteen() {
        let r = "You are in the canteen. Students sit at tables eating and talking."
        r += (Time >= 765 && Time <= 795) ? "\n\n![burger.png] {Order lunch (5m)|Canteen|5|CanteenOrderLunch}" : ""
        r += "\n\n![table.png] {Rest (15m)|SchoolCanteen|15|CanteenRest}" 
        r += "\n\n![leave.png] {Leave (1m)|SchoolYard|1}"
        return r
    }    
}

class SceneFunctions {
    static Sleep(hours) {
        ChangeStat("Fatigue", -10 * hours)
    }
    
    static ConvenienceStoreWork() {
        let rng = GetRng()
        ChangeMoney(3)
        ChangeStat("Fatigue", 7)
        ChangeXp("Communication", 3)

        if (rng < 100) {
            ChangeStat("Fatigue", 5)
            TopText = `The convenience store suddenly had a spike in customers.\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$3")}\n${ColorGen(TEXT_COLORS['bad'], "+12 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+3 Communication XP")}\n\n`
        } else if (rng < 150) {
            ChangeStat("Health", -4)
            TopText = `While stocking the shelves you slip on a puddle of water.\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$3")}\n${ColorGen(TEXT_COLORS['bad'], "+7 Fatigue")}\n${ColorGen(TEXT_COLORS['bad'], "-4 Health")}\n${ColorGen(TEXT_COLORS['xp'], "+3 Communication XP")}\n\n`
        } else if (rng < 250) {
            ChangeMoney(2)
            TopText = `A customer leaves behind some loose change on the counter. You keep it.\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$3")}\n${ColorGen(TEXT_COLORS['money'], "+ $2 (extra)")}\n${ColorGen(TEXT_COLORS['bad'], "+7 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+3 Communication XP")}\n\n`
        } else if (rng < 350) {
            ChangeXp("Fitness", 2)
            ChangeStat("Fatigue", 10)
            TopText = `You help unload a heavy shipment and get some extra practice handling stock.\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$3")}\n${ColorGen(TEXT_COLORS['bad'], "+10 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+3 Communication XP")}\n${ColorGen(TEXT_COLORS['xp'], "+2 Fitness XP")}\n\n`
        } else {
            TopText = `Nothing interesting happened.\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$3")}\n${ColorGen(TEXT_COLORS['bad'], "+7 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+3 Communication XP")}\n\n`
        }
    }
    
    static ConvenienceStoreBuy(item) {
        if (item == "EnergyDrink") {
            if (Money < 10) {
                TopText = "You don't have enough money to purchase this item.\n\n"
                return
            }
            ChangeMoney(-10)
    
            if (Cooldowns['EnergyDrink'] <= TotalTime || !Cooldowns['EnergyDrink']) {
                Cooldowns['EnergyDrink'] = TotalTime + 2400
                ChangeStat("Fatigue", -30)
                TopText = `You bought an energy drink for ${ColorGen(TEXT_COLORS['money'], "$10")}\n${ColorGen(TEXT_COLORS['good'], "-30 Fatigue")}\n${ColorGen(TEXT_COLORS['bad'], "-20 Health\n\n")}`
            } else {
                TopText = `You bought an energy drink for ${ColorGen(TEXT_COLORS['money'], "$10")}\n${ColorGen(TEXT_COLORS['unavailable'], "it's not effective.")}\n${ColorGen(TEXT_COLORS['bad'], "-20 Health\n\n")}`
            }

            ChangeStat("Health", -20)
        }
    }
    
    static BeachExplore() {
        let rng = GetRng()
        let amount = RandomNumber(1, 3)
        ChangeStat("Fatigue", 10)
        if (rng < 800) {
            ChangeInventory("SeaShell", amount)
            TopText = `You found ${amount} sea shells.\n${ColorGen(TEXT_COLORS['bad'], "+10 Fatigue")}\n\n`
        } else {
            TopText = `You found nothing.\n${ColorGen(TEXT_COLORS['bad'], "+10 Fatigue")}\n\n`
        }
    }
    
    static FastFoodWork() {
        let rng = GetRng()
        let tips = RandomNumber(1, 3)
        ChangeMoney(5 + tips)
        ChangeStat("Fatigue", 7)
        ChangeXp("Communication", 4)

        if (rng < 100) {
            ChangeStat("Fatigue", 5)
            TopText = `A sudden rush of customers keeps you busy for hours.\n\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$5")} + ${ColorGen(TEXT_COLORS['money'], `$${tips} (tips)`)}\n${ColorGen(TEXT_COLORS['bad'], "+12 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+4 Communication XP")}\n\n`
        } else if (rng < 200) {
            ChangeXp("Dexterity", 2)
            TopText = `You had to move quickly to keep up with orders.\n\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$5")} + ${ColorGen(TEXT_COLORS['money'], `$${tips} (tips)`)}\n${ColorGen(TEXT_COLORS['bad'], "+7 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+4 Communication XP")}\n${ColorGen(TEXT_COLORS['xp'], "+2 Dexterity XP")}\n\n`
        } else if (rng < 300) {
            ChangeStat("Health", -15)
            TopText = `You accidentally burn your hand while cooking fries.\n\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$5")} + ${ColorGen(TEXT_COLORS['money'], `$${tips} (tips)`)}\n${ColorGen(TEXT_COLORS['bad'], "-5 Health")}\n${ColorGen(TEXT_COLORS['bad'], "+7 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+4 Communication XP")}\n\n`
        } else if (rng < 400) {
            ChangeMoney(5)
            TopText = `A customer leaves behind extra cash as a thank you.\n\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$5")} + ${ColorGen(TEXT_COLORS['money'], `$${tips} (tips)`)} + ${ColorGen(TEXT_COLORS['money'], "$2 (extra)")}\n${ColorGen(TEXT_COLORS['bad'], "+7 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+4 Communication XP")}\n\n`
        } else {
            TopText = `Nothing interesting happened.\n\nYou get paid ${ColorGen(TEXT_COLORS['money'], "$5")} + ${ColorGen(TEXT_COLORS['money'], `$${tips} (tips)`)}\n${ColorGen(TEXT_COLORS['bad'], "+7 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+4 Communication XP")}\n\n`
        }
    }
    
    static PayDebt() {
        ChangeMoney(DebtDue * -1)
        Debt -= DebtDue
        DebtDue = 0
        TopText = "You paid the banker with physical cash.\n\n"
    }
    
    static ForestGather(depth) {
        let rng = GetRng()
        let amount = RandomNumber(depth === 1 ? 2 : 3, depth === 1 ? 5 : 6)
        ChangeStat("Fatigue", 10)
        ChangeXp("Foraging", 5)
        
        let BerryType = null
        let BerryThresholds = []

        if (depth == 1) {
            BerryThresholds = [300, 500, 600]
            BerryType = ["RedBerry", "BlueBerry", "GreenBerry"]
        } else if (depth == 2) {
            BerryThresholds = [200, 400, 500, 600]
            BerryType = ["RedBerry", "BlueBerry", "GreenBerry", "YellowBerry"]
        } else if (depth == 3) {
            BerryThresholds = [200, 400, 500, 600, 650]
            BerryType = ["BlueBerry", "GreenBerry", "YellowBerry", "PurpleBerry"]
        }

        let BerryFound = null
        for (let i = 0; i < BerryThresholds.length; i++) {
            if (rng < BerryThresholds[i]) {
                BerryFound = BerryType[i]
                break
            }
        }
    
        if (BerryFound) {
            ChangeInventory(BerryFound, amount)
            ChangeCount("BerriesHarvested", amount)
            TopText = `You found ${amount} ${ITEM_DATA[BerryFound]['Name'].toLowerCase()}.\n${ColorGen(TEXT_COLORS['bad'], "+10 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+5 Foraging XP")}\n\n`
        } else if (depth == 3 && rng < 650 && Time < 300) {
            BerryFound = "Moonberry"
            ChangeInventory(BerryFound, 1)
            TopText = `You found 1 moonberry.\n${ColorGen(TEXT_COLORS['bad'], "+10 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+5 Foraging XP")}\n\n`
        } else {
            TopText = `You found nothing.\n${ColorGen(TEXT_COLORS['bad'], "+10 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+5 Foraging XP")}\n\n`
        }
    }

    static ClassManager(args) {
        let [Subject, Type] = args
    
        if (SUBJECT_STATS[Subject]) {
            const {xp, fatigue, time} = SUBJECT_STATS[Subject]
            if (Subject == "PE") {
                Subject = "Fitness"
            }
            let XpGain = Type == "Study" ? xp : 2
            let FatigueGain = Type == "Study" ? fatigue : 3
            ChangeXp(Subject, XpGain)
            ChangeStat("Fatigue", FatigueGain)
            ChangeTime(time - Time)
            TopText = `You ${Type == "Study" ? "carefully listened to all the instructions" : "ignored all the instructions"} your teacher gave you. After 45 minutes the bell rang and you left the classroom.\n${ColorGen(TEXT_COLORS['bad'], `+${FatigueGain} Fatigue`)}\n${ColorGen(TEXT_COLORS['xp'], `+${XpGain} ${Subject} XP`)}\n\n`
        }
    } 
    
    static CanteenRest() {
        ChangeStat("Fatigue", -2)
        TopText = `You rest on one of the benches.\n${ColorGen(TEXT_COLORS['good'], "-2 Fatigue")}\n\n`
    }

    static FishingShopBuyRod(rod) {
        if (Money >= RODS[rod]['Price']) {
            ChangeMoney(RODS[rod]['Price'] * -1)
            Owned[rod] = true
            TopText = `You bought a ${RODS[rod]['Name']} for $${RODS[rod]['Price']}\n\n`
        } else {
            TopText = "You don't have enough money to purchase this item.\n\n"
        }
    }

    static SellFish() {
        TopText = ""
        let tempMoney = 0
        for (const data of FISH) {
            if (data['Name'] in Inventory) {
                TopText += `${Inventory[data['Name']]}x ${data['Name']}: ${ColorGen(TEXT_COLORS['money'], "$" + Inventory[data['Name']] * data['Price'])}\n`
                ChangeMoney(Inventory[data['Name']] * data['Price'])
                tempMoney += Inventory[data['Name']] * data['Price']
                ChangeInventory(data['Name'], Inventory[data['Name']] * -1)
            }
        }

        if (tempMoney != 0) {
            TopText += `Total: ${ColorGen(TEXT_COLORS['money'], "$" + tempMoney)}\n\n`
        } else {
            TopText = "You have no fish to sell.\n\n"
        }
    }

    static DocksFish() {
        if (EquippedBait == null || Owned[EquippedBait] == 0) {
            TopText = `${ColorGen(TEXT_COLORS['bad'], "You were unable to catch any fish as you have no bait")}\n\n`
            return
        }
        let fish = FishGen(BAIT[EquippedBait]['Luck'], RandomNumber(RODS[EquippedRod]['FishMin'], RODS[EquippedRod]['FishMax']))
        let CountMap = {}

        for (fish of fish) {
            CountMap[fish] = (CountMap[fish] || 0) + 1
        }

        for (const [key, value] of Object.entries(CountMap)) {
            ChangeInventory(key, value)
        }

        const result = Object.entries(CountMap).map(([key, value]) => `${value}x ${key}`).join(", ")

        ChangeStat("Fatigue", 20)
        ChangeXp("Fishing", 5)
        Owned[EquippedBait] -= 1
        TopText = `You caught: ${result}\n${ColorGen(TEXT_COLORS['bad'], "+20 Fatigue")}\n${ColorGen(TEXT_COLORS['xp'], "+5 Fishing Xp")}\n\n`        
    }

    static DocksChooseRod(rod) {
        EquippedRod = rod
        TopText = `You equipped your ${RODS[rod]['Name']}\n\n`
    }

    static DocksChooseBait(bait) {
        EquippedBait = bait
        TopText = `You equipped your ${BAIT[bait]['Name']}\n\n`
    }

    static FishingShopBaitSelection(bait) {
        TopText = `How much ${bait} would you like to buy? Each one costs $${BAIT[bait]['Price']}\n\n{1|FishingShop|0|FishingShopBuyBait(${bait},1)}\n{5|FishingShop|0|FishingShopBuyBait(${bait},5)}\n{10|FishingShop|0|FishingShopBuyBait(${bait},10)}\n{20|FishingShop|0|FishingShopBuyBait(${bait},20)}\n\n{Back|FishingShopBait|0}`
    }

    static FishingShopBuyBait(args) {
        let [bait, amount] = args
        if (Money >= BAIT[bait]['Price'] * amount) {
            ChangeMoney(BAIT[bait]['Price'] * amount * -1)
            if (Owned[bait]) {
                Owned[bait] += Number(amount)
            } else {
                Owned[bait] = Number(amount)
            }
            TopText = `You bought ${amount}x ${BAIT[bait]['Name']} for $${BAIT[bait]['Price'] * amount}\n\n`
        } else {
            TopText = "You don't have enough money to purchase this.\n\n"
        }
    }

    static OfficeWorkManager(hour) {
        hour = Number(hour)
        let rng = GetRng()
        TopText = `It is currently the ${NumberSuffix(hour)} hour of your day shift.\n`
    
        if (hour < 8) {
            if (rng < 100) {
                ChangeStat("Fatigue", 12)
                TopText += `${ColorGen("d90202", "+12 Fatigue")}\n\nYou had to deliver documents to your manager.`
            } else if (rng < 150) {
                ChangeStat("Fatigue", 3)
                TopText += `${ColorGen("d90202", "+3 Fatigue")}\n\nYou got a short break during your shift.`
            } else if (rng < 250) {
                ChangeStat("Fatigue", 10)
                TopText += `${ColorGen("d90202", "+10 Fatigue")}\n\nYou had to attend an informational meeting for the entire hour.`
            } else {
                ChangeStat("Fatigue", 9)
                TopText += `${ColorGen("d90202", "+9 Fatigue")}\n\nNothing interesting happened.`
            }
            TopText += `\n\n{Next|Blank|60|OfficeWorkManager(${hour + 1})}`
        } else if (hour == 8) {
            ChangeStat("Fatigue", 9)
            TopText = `It is the last hour of your day shift. You can leave after this.\n${ColorGen("d90202", "+9 Fatigue")}\n\nNothing interesting happened.\n\n{Next|OfficeWorkEnd|60}`
        }
    }
    
}

// Text loaders

function ProcessText(text) {
    const SplitText = text.split(TEXT_SPLITTER)
    const SplitLinks = [...text.matchAll(LINK_REGEX)]
    
    SplitText.forEach(function(item, num) {
        let div = document.createElement("div")
        div.className = "MainText"
        div.style.color = "white"
        
        let parts = item.split(IMAGE_REGEX)
        parts.forEach(function(part, index) {
            if (index % 2 == 0) {
                let span = document.createElement("span")
                span.innerHTML = part
                div.appendChild(span)
            } else {
                let img = document.createElement("img")
                img.src = "img/" + part
                img.style.display = "inline-block"
                img.style.width = "1.5em"
                img.style.height = "1.5em"
                img.style.verticalAlign = "middle"
                div.appendChild(img)
            }
        })
        
        document.getElementById("Main").appendChild(div)
        
        if (num < SplitLinks.length) {
            let button = document.createElement("button")
            button.innerHTML = SplitLinks[num][1]
            button.className = "MainLink"
            button.id = "Button" + num
            button.addEventListener("click", function() {
                if (SplitLinks[num][4]) {
                    let params = SplitLinks[num][5] ? (SplitLinks[num][5].includes(",") ? SplitLinks[num][5].split(",") : SplitLinks[num][5]) : undefined
                    SceneFunctions[SplitLinks[num][4]](params)
                }
                ChangeTime(Number(SplitLinks[num][3]))
                if (!LinkSceneOverride) {
                    SceneManager(SplitLinks[num][2])
                } else {
                    LinkSceneOverride = false
                }
                let transition = document.getElementById("MainTransition")
                transition.style.zIndex = 2
                transition.style.opacity = 0
                setTimeout(function () {
                    transition.style.zIndex = 0
                    transition.style.opacity = 1
                }, 300)
            })
            document.getElementById("Main").appendChild(button)
        }
    })
}


function LoadText(text) {
    document.getElementById("Main").innerHTML = ""

    if (TopText) {
        ProcessText(TopText)
        TopText = ""
    }

    ProcessText(text)

    if (EndText) {
        ProcessText(EndText)
        EndText = ""
    }
}


function SceneManager(selected) {
    let timetick = Date.now()
    var thescene = Scenes[selected]()
    LoadText(thescene)
    OldScene = CurrentScene
    CurrentScene = selected
    document.getElementById("Money").textContent = "$" + Money
    console.log("Loaded scene " + selected + " in " + String(Date.now() - timetick) + "ms")
}

// Assisting functions

for (var key of Object.keys(Skills)) {
    div = document.createElement("div")
    div.textContent = key + ": " + Skills[key] + " (0 XP)"
    div.className = "PopupText"
    div.id = "STAT_" + key
    document.getElementById("StatItems").appendChild(div)
}

function ChangeTime(amount) {
    if (Time + amount > 1440) {
        Time += amount - 1440
        Day += 1
        WeekDay += 1
                    
        if (WeekDay >= 8) {
            if (DebtDue != 0) {
                Checks['BankDebt'] = true
                Checks['BankDebtNotice'] = true
            }
            if (Math.floor((Day + 5) / 7) < DEBT_SCALING.length) {
                DebtDue += DEBT_SCALING[Math.floor((Day + 5) / 7)]
            }
            WeekDay = 1
        }
        document.getElementById("Day").textContent = "Day: " + Day + " " + GetDayName().substring(0,3)
    } else {
        Time += amount
    }
    TotalTime += amount
    ChangeStat("Health", amount / 60)
    if (Stats['Fatigue'] > 100) {
        ChangeStat("Health", amount / 60 * -1 * ((Stats['Fatigue'] - 100) / 2))
    }
    let m = Time % 60
    let h = (Time-m)/60
    document.getElementById("Clock").textContent = (h < 10 ? "0" : "") + h.toString() + ":" + (m < 10 ? "0" : "") + m.toString()
}

function GetDayName() {
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][WeekDay - 1]
}

function GetTimeName(person) {
    if (Time < 360) {
        if (person == false) {
            return "night"
        } else {
            return "evening"
        }
    } else if (Time < 721) {
        return "morning"
    } else if (Time < 1081) {
        return "afternoon"
    } else if (Time < 1321) {
        return "evening"
    } else if (Time < 1441) {
        if (person == false) {
            return "night"
        } else {
            return "evening"
        }
    } else {
        return "???"
    }
}

function ChangeStat(stat, amount) {
    if (stat == "Fatigue") {
        Stats['Fatigue'] = Math.max(Stats['Fatigue'] + amount, 0)
        document.getElementById("SidebarFatigue").textContent = "Fatigue: " + Math.round(Stats['Fatigue']) + "/100"
        if (Stats['Fatigue'] > 100) {
            document.getElementById("SidebarFatigue").style.color = "Red"
        } else {
            document.getElementById("SidebarFatigue").style.color = "White"
        }
    } else if (stat == "Health") {
        Stats['Health'] = Math.min(Stats['Health'] + amount, 100)
        if (Stats['Health'] <= 0) {
            //document.getElementById("SidebarHealth").style.color = "Red"
            LinkSceneOverride = true
            SetStat("Health", 30)
            SetStat("Fatigue", 90)
            TopText += "You pass out due to being too tired.\n\n{Next (3h)|HospitalUnconscious|180}"
            SceneManager("Blank")
        } else {
            document.getElementById("SidebarHealth").style.color = "White"
        }
        document.getElementById("SidebarHealth").textContent = "Health: " + Math.round(Stats['Health']) + "/100"
    }
}

function SetStat(stat, value) {
    ChangeStat(stat, value - Stats[stat])
}

function ChangeInventory(item, increment) {
    if (Inventory[item]) {
        Inventory[item] += increment
        document.getElementById("INVENTORYITEM_" + item).textContent = ITEM_DATA[item]['Name'] + ": " + Inventory[item]
    } else {
        Inventory[item] = increment
        div = document.createElement("div")
        div.textContent = ITEM_DATA[item]['Name'] + ": " + Inventory[item]
        div.className = "PopupText"
        div.id = "INVENTORYITEM_" + item
        document.getElementById("InventoryItems").appendChild(div)
    }
}

function GetRng() {
    if (ForcedRng == -1) {
        return Math.floor(Math.random() * 1000)
    } else {
        return ForcedRng
    }
}

function RandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function ColorGen(hex, text) {
    return "<span style=\"color: #" + hex + "\">" + text + "</span>"
}

function BoldGen(text) {
    return "<b>" + text + "</b>"
}

function ChangeMoney(amount) {
    Money += amount
}

function ChangeXp(skill, amount) {
    if (SkillXp[skill] + amount >= Skills[skill] * 20 + 20) {
        SkillXp[skill] += amount - (Skills[skill] * 20 + 20)
        Skills[skill] += 1
        EndText += "\n\n" + ColorGen(TEXT_COLORS['xp'], skill + " increased to level " + Skills[skill])
    } else {
        SkillXp[skill] += amount
    }
    document.getElementById("STAT_" + skill).textContent = skill + ": " + Skills[skill] + " (" + SkillXp[skill] + " XP)"
}

function ChangeCount(val, increment) {
    if (Counts[val]) {
        Counts[val] += increment
    } else {
        Counts[val] = increment 
    }
}

function GetNextClass() {
    if (Time < 585) {
        return "Science"
    } else if (Time < 635) {
        return "English"
    } else if (Time < 715) {
        return "Math"
    } else if (Time < 765) {
        return "Business"
    } else if (Time < 845) {
        return "History"
    } else if (Time < 895) {
        return "Physical Education"
    } else {
        return "Nothing"
    }
}

function SchoolClassroomOptionsGen(classroom) {
    return `\n\nWhat would you like to do?\n\n{Study|SchoolHallway|0|ClassManager(${classroom},Study)}\n{Daydream|SchoolHallway|0|ClassManager(${classroom},Daydream)}`
}

function FishGen(Luck, count) {
    const ModifiedFishTypes = FISH.map(fish => ({
        ...fish,
        "Chance": Math.min(fish['Chance'] * Luck, 0.5)
    }))

    const GeneratedFish = []

    for (let i = 0; i < count; i++) {
        const random = Math.random() * ModifiedFishTypes.reduce((acc, fish) => acc + fish['Chance'], 0)
        
        let CumulativeChance = 0
        
        for (let fish of ModifiedFishTypes) {
            CumulativeChance += fish['Chance']
            if (random <= CumulativeChance) {
                GeneratedFish.push(fish['Name'])
                break
            }
        }
    }
    return GeneratedFish
}

function InfoText(InfoType) {
    if (InfoType == "Office") {
        let CurRank = OFFICE_RANKS[OfficeRank]
        return `Job Stats:\n - Title: ${CurRank['Title']}\n - Pay Per Hour: ${ColorGen(TEXT_COLORS['money'], "$" + CurRank["Pay"])}\n - Promotion: ${OfficePromotionXP}/${CurRank['Promotion']}`
    }
}

function NumberSuffix(num) {
    let j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) {
        return num + "st"
    }
    if (j === 2 && k !== 12) {
        return num + "nd"
    }
    if (j === 3 && k !== 13) {
        return num + "rd"
    }
    return num + "th"
}

function SkillCheck(SkillDict) {
    var Missing = []
    for (var key of Object.keys(SkillDict)) {
        if (Skills[key] < SkillDict[key]) {
            Missing.push(key)
        }
    }
    return Missing
}

// Buttons

document.getElementById("SidebarToggle").addEventListener("click", function() {
    if (document.getElementById("Sidebar").style.display == "block") {
        document.getElementById("Sidebar").style.display = "none"
        document.getElementById("SidebarToggle").style.left = "0px"
        document.getElementById("Main").style.left = "30px"
        document.getElementById("Main").style.width = "calc(100% - 30px)"
        document.getElementById("SidebarToggle").textContent = ">"
    } else {
        document.getElementById("Sidebar").style.display = "block"
        document.getElementById("SidebarToggle").style.left = "307px"
        document.getElementById("Main").style.left = "330px"
        document.getElementById("Main").style.width = "calc(100% - 330px)"
        document.getElementById("SidebarToggle").textContent = "<"
    }
})

document.getElementById("StatsButton").addEventListener("click", function() {
    if (document.getElementById("Stats").style.display == "none") {
        document.getElementById("Stats").style.display = "block"
    } else {
        document.getElementById("Stats").style.display = "none"
    }
})

document.getElementById("InventoryButton").addEventListener("click", function() {
    if (document.getElementById("Inventory").style.display == "none") {
        document.getElementById("Inventory").style.display = "block"
    } else {
        document.getElementById("Inventory").style.display = "none"
    }
})

// Debug
const allScenes = Object.getOwnPropertyNames(Scenes).filter(prop => typeof Scenes[prop] == "function")

function EnableDebug() {
    document.getElementById("DebugButton").style.display = "block"
}

document.getElementById("DebugButton").addEventListener("click", function() {
    if (document.getElementById("Debug").style.display == "none") {
        document.getElementById("Debug").style.display = "block"
    } else {
        document.getElementById("Debug").style.display = "none"
    }
})

let SuggestionsContainer = document.getElementById("AutocompleteSuggestions")
let SelectedIndex = -1

document.getElementById("SceneJump").addEventListener("click", function() {
    SceneManager(document.getElementById("SceneJumpInput").value)
})

document.getElementById("SceneJumpInput").addEventListener("input", function () {
    const query = document.getElementById("SceneJumpInput").value.toLowerCase()
    SuggestionsContainer.innerHTML = ''
    SelectedIndex = -1
    if (query) {
        const filteredData = allScenes.filter(item => item.toLowerCase().includes(query))
        
        filteredData.forEach(function(item) {
            const suggestion = document.createElement('div')
            suggestion.className = "Suggestion"
            suggestion.textContent = item

            suggestion.addEventListener("click", function () {
                document.getElementById("SceneJumpInput").value = item
                SuggestionsContainer.innerHTML = ""
            })

            SuggestionsContainer.appendChild(suggestion)
        })
    }
})

function updateSelection(suggestions) {
    suggestions.forEach(function(suggestion, index) {
        suggestion.classList.remove("Selected")
        if (index == SelectedIndex) {
            suggestion.classList.add("Selected")
        }
    })
}

document.getElementById("SceneJumpInput").addEventListener("keydown", function (e) {
    const suggestions = document.querySelectorAll(".Suggestion")

    if (e.key == "ArrowDown") {
        if (SelectedIndex < suggestions.length - 1) {
            SelectedIndex += 1
            updateSelection(suggestions)
        }
    } else if (e.key == "ArrowUp") {
        if (SelectedIndex > 0) {
            SelectedIndex -= 1
            updateSelection(suggestions)
        }
    } else if (e.key == "Enter" && SelectedIndex >= 0) {
        document.getElementById("SceneJumpInput").value = suggestions[SelectedIndex].textContent
        SuggestionsContainer.innerHTML = ""
        SelectedIndex = -1
    } else if (e.key == "Enter") {
        SceneManager(document.getElementById("SceneJumpInput").value)
    }
})

document.getElementById("TimeSkip1").addEventListener("click", function() {
    ChangeTime(60)
})

document.getElementById("TimeSkip3").addEventListener("click", function() {
    ChangeTime(180)
})

document.getElementById("ReloadScene").addEventListener("click", function() {
    SceneManager(CurrentScene)
})

document.getElementById("Max").addEventListener("click", function() {
    ChangeMoney(100000)
    for (const [key, value] of Object.entries(Skills)) {
        Skills[key] += 100
        ChangeXp(key, 0)
    }
})

document.getElementById("SetRng").addEventListener("click", function() {
    ForcedRng = Number(document.getElementById("ForceRng").value)
})

function FormatTime(si) {
    const seconds = Math.floor(Math.abs(si))
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.round(seconds % 60)
    const t = [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
      .filter(Boolean)
      .join(':')
    return si * 1000 < 0 && seconds ? `-${t}` : t
}

setInterval(function() {
    Playtime += 1
    document.getElementById("STAT_Playtime").textContent = "Play Time: " + FormatTime(Playtime)
}, 1000)

// Saving

function EncodeSave() {
    let gameState = {
        Money, Time, Day, WeekDay, TotalTime, OldScene, CurrentScene, Playtime, TopText, EndText,
        LinkSceneOverride, Stats, Checks, Jobs, OfficeRank, OfficePromotionXP, Skills, SkillXp, Cooldowns, Inventory,
        Debt, DebtDue, Counts, Owned, EquippedRod, EquippedBait
    }

    if (OfficeRank == 0 && OfficePromotionXP == 0) {
        delete gameState['OfficeRank']
        delete gameState['OfficePromotionXP']
    }
    if (Object.keys(Checks).length == 0) {delete gameState['Checks']}
    if (Object.keys(Cooldowns).length == 0) {delete gameState['Cooldowns']}
    if (Object.keys(Counts).length == 0) {delete gameState['Counts']}
    if (TopText == "") {delete gameState['TopText']}
    if (EndText == "") {delete gameState['EndText']}
    if (EquippedRod == null) {delete gameState['EquippedRod']}
    if (EquippedBait == null) {delete gameState['EquippedBait']}
    if (Object.keys(Owned).length == 0) {delete gameState['Owned']}
    if (LinkSceneOverride == false) {delete gameState['LinkSceneOverride']}
    if (Object.keys(Jobs).length == 0) {delete gameState['Jobs']}
    if (Object.keys(Inventory).length == 0) {delete gameState['Inventory']}

    for (const [skill, val] of Object.entries(Skills)) {
        if (val == 0) {
            delete gameState['Skills'][skill]
        }
    }

    for (const [skill, val] of Object.entries(SkillXp)) {
        if (val == 0) {
            delete gameState['SkillXp'][skill]
        }
    }
    if (Object.keys(gameState['Skills']).length == 0) {delete gameState['Skills']}
    if (Object.keys(gameState['SkillXp']).length == 0) {delete gameState['SkillXp']}

    return LZString.compressToBase64(JSON.stringify(gameState))
}

function DecodeSave(EncodedState) {
    return JSON.parse(LZString.decompressFromBase64(EncodedState))
}

function LoadSave(save) {
    let decoded = DecodeSave(save);

    ({
        Money,
        Time,
        Day,
        WeekDay,
        TotalTime,
        OldScene,
        CurrentScene,
        Playtime,
        TopText = "",
        EndText = "",
        LinkSceneOverride = "",
        Stats,
        Checks = {},
        Jobs = {},
        OfficeRank = 0,
        OfficePromotionXP = 0,
        Skills,
        SkillXp,
        Cooldowns = {},
        Inventory = {},
        Debt,
        DebtDue,
        Counts = Counts,
        Owned = Owned,
        EquippedRod = null,
        EquippedBait = null
    } = decoded)
    SceneManager(CurrentScene)
}

SceneManager("Menu")