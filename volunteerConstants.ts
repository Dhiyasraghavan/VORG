import { VolunteerEvent, Language } from './types';

export const QUIZ_TRANSLATIONS: Record<Language, { id: number; text: string; options: string[]; correct: number }[]> = {
    english: [
        { id: 1, text: "What is the primary motivation behind volunteering?", options: ["Personal gain", "Helping the community", "Building a resume", "Mandatory requirement"], correct: 1 },
        { id: 2, text: "Which of these is a core value of ethical volunteering?", options: ["Paternalism", "Dependency", "Mutual Respect", "Publicity"], correct: 2 },
        { id: 3, text: "Active listening in volunteering involves:", options: ["Interrupting with advice", "Checking your phone", "Focusing fully on the speaker", "Multitasking"], correct: 2 },
        { id: 4, text: "When managing a group task, what's most important?", options: ["Speed", "Clear Communication", "Ignoring conflict", "Doing it yourself"], correct: 1 },
        { id: 5, text: "A volunteer should handle sensitive information with:", options: ["Publicity", "Strict Confidentiality", "Partial Disclosure", "Indifference"], correct: 1 },
        { id: 6, text: "How should you respond to unexpected changes in a project?", options: ["Panic", "Resignation", "Adaptability & Patience", "Blaming others"], correct: 2 },
        { id: 7, text: "What defines 'sustainable' volunteering?", options: ["Short-term fixes", "Creating long-term positive change", "Using only paper products", "Expensive solutions"], correct: 1 },
        { id: 8, text: "In conflict resolution, a volunteer should aim for:", options: ["Winning the argument", "Compromise and understanding", "Avoiding the person", "Loud confrontation"], correct: 1 },
        { id: 9, text: "How does intersectionality affect community work?", options: ["It doesn't", "It ignores cultural differences", "It recognizes overlapping social identities", "It simplifies problems"], correct: 2 },
        { id: 10, text: "Global volunteering ethics prioritize:", options: ["The volunteer's comfort", "Host community needs and agency", "Marketing photos", "Western superiority"], correct: 1 },
    ],
    hindi: [
        { id: 1, text: "स्वयंसेवा के पीछे मुख्य प्रेरणा क्या है?", options: ["व्यक्तिगत लाभ", "समाज की मदद करना", "बायोडाटा बनाना", "अनिवार्य आवश्यकता"], correct: 1 },
        { id: 2, text: "इनमें से कौन सा नैतिक स्वयंसेवा का मूल मूल्य है?", options: ["पितृसत्ता", "निर्भरता", "परस्पर सम्मान", "प्रचार"], correct: 2 },
        { id: 3, text: "स्वयंसेवा में सक्रिय रूप से सुनने में शामिल है:", options: ["सलाह के साथ टोकना", "अपना फोन चेक करना", "पूरी तरह से वक्ता पर ध्यान केंद्रित करना", "एक साथ कई काम करना"], correct: 2 },
        { id: 4, text: "समूह कार्य का प्रबंधन करते समय, सबसे महत्वपूर्ण क्या है?", options: ["गति", "स्पष्ट संचार", "संघर्ष को नजरअंदाज करना", "इसे खुद करना"], correct: 1 },
        { id: 5, text: "एक स्वयंसेवक को संवेदनशील जानकारी को कैसे संभालना चाहिए?", options: ["प्रचार के साथ", "सख्त गोपनीयता", "आंशिक प्रकटीकरण", "उदासीनता"], correct: 1 },
        { id: 6, text: "आपको किसी प्रोजेक्ट में अप्रत्याशित परिवर्तनों पर कैसी प्रतिक्रिया देनी चाहिए?", options: ["घबराहट", "इस्तीफा", "अनुकूलनशीलता और धैर्य", "दूसरों को दोष देना"], correct: 2 },
        { id: 7, text: " 'सतत' स्वयंसेवा को क्या परिभाषित करता है?", options: ["अल्पकालिक सुधार", "दीर्घकालिक सकारात्मक परिवर्तन लाना", "केवल कागज के उत्पादों का उपयोग करना", "महंगे समाधान"], correct: 1 },
        { id: 8, text: "संघर्ष समाधान में, एक स्वयंसेवक का लक्ष्य होना चाहिए:", options: ["तर्क जीतना", "समझौता और समझ", "व्यक्ति से बचना", "जोर से टकराव"], correct: 1 },
        { id: 9, text: "इंटरसेक्शनलिटी सामुदायिक कार्य को कैसे प्रभावित करती है?", options: ["यह नहीं करती", "यह सांस्कृतिक मतभेदों को नजरअंदाज करती है", "यह ओवरलैपिंग सामाजिक पहचान को पहचानती है", "यह समस्याओं को सरल बनाती है"], correct: 2 },
        { id: 10, text: "वैश्विक स्वयंसेवा नैतिकता प्राथमिकता देती है:", options: ["स्वयंसेवक की सुविधा", "मेजबान समुदाय की जरूरतें", "मार्केटिंग फोटो", "पश्चیمی श्रेष्ठता"], correct: 1 },
    ],
    tamil: [
        { id: 1, text: "தன்னார்வத் தொண்டின் பின்னணியில் உள்ள முற்போக்கான நோக்கம் எது?", options: ["தனிப்பட்ட லாபம்", "சமூகத்திற்கு உதவுதல்", "ரெஸ்யூம் உருவாக்குதல்", "கட்டாயத் தேவை"], correct: 1 },
        { id: 2, text: "நெறிமுறை சார்ந்த தன்னார்வத் தொண்டின் முக்கிய மதிப்பு எது?", options: ["தந்தைவழி மனப்பான்மை", "சார்புநிலை", "பரஸ்பர மரியாதை", "விளம்பரம்"], correct: 2 },
        { id: 3, text: "தன்னார்வத் தொண்டில் தீவிரமாகக் கேட்பது என்பது:", options: ["ஆலோசனையுடன் இடைமறித்தல்", "தொலைபேசியைச் சரிபார்த்தல்", "பேசுபவர் மீது முழு கவனம் செலுத்துதல்", "மல்டிடாஸ்கிங்"], correct: 2 },
        { id: 4, text: "ஒரு குழுப் பணியை நிர்வகிக்கும்போது, எது மிக முக்கியமானது?", options: ["வேகம்", "தெளிவான தொடர்பு", "மோதல்களைப் புறக்கணித்தல்", "நீங்களே செய்தல்"], correct: 1 },
        { id: 5, text: "ஒரு தன்னார்வலர் முக்கியமான தகவல்களை எவ்வாறு கையாள வேண்டும்?", options: ["விளம்பரப்படுத்துதல்", "கடுமையான ரகசியத்தன்மை", "பகுதி வெளிப்படுத்தல்", "அலட்சியம்"], correct: 1 },
        { id: 6, text: "திட்டத்தில் எதிர்பாராத மாற்றங்களுக்கு நீங்கள் எவ்வாறு பதிலளிக்க வேண்டும்?", options: ["பதட்டம்", "விலகுதல்", "அடாப்டபிலிட்டி மற்றும் பொறுமை", "மற்றவர்களைக் குற்றம் சாட்டுதல்"], correct: 2 },
        { id: 7, text: " 'நிலையான' தன்னார்வத் தொண்டை எது வரையறுக்கிறது?", options: ["குறுகிய கால தீர்வுகள்", "நீண்ட கால நேர்மறையான மாற்றத்தை உருவாக்குதல்", "காகித தயாரிப்புகளை மட்டுமே பயன்படுத்துதல்", "விலையுயர்ந்த தீர்வுகள்"], correct: 1 },
        { id: 8, text: "மோதல் தீர்வில், ஒரு தன்னார்வலரின் இலக்கு என்னவாக இருக்க வேண்டும்?", options: ["வாதத்தில் வெற்றி பெறுதல்", "சமரசம் மற்றும் புரிதல்", "நபரைத் தவிர்த்தல்", "சத்தமான மோதல்"], correct: 1 },
        { id: 9, text: "சமூகப் பணியை இன்டர்செக்ஷனாலிட்டி (Intersectionality) எவ்வாறு பாதிக்கிறது?", options: ["பாதிக்காது", "கலாச்சார வேறுபாடுகளைப் புறக்கணிக்கிறது", "சமூக அடையாளங்களை அங்கீகரிக்கிறது", "சிக்கல்களை எளிதாக்குகிறது"], correct: 2 },
        { id: 10, text: "உலகளாவிய தன்னார்வ நெறிமுறைகள் எதற்கு முன்னுரிமை அளிக்கின்றன?", options: ["தன்னார்வலரின் வசதி", "சமூகத்தின் தேவைகள்", "சந்தைப்படுத்தல் புகைப்படங்கள்", "மேற்கத்திய மேலாதிக்கம்"], correct: 1 },
    ]
};

export const MOCK_VOLUNTEER_EVENTS: VolunteerEvent[] = [
    {
        id: 'icc-2025',
        title: 'International Coastal Cleanup 2025',
        description: 'A massive annual drive to revitalise our coastlines. Volunteers collected tons of waste along Marina Beach and stretches from Kasimedu to Kovalam.',
        date: '20 Sep 2025, 6:00 AM – 9:00 AM',
        image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=1000&auto=format&fit=crop',
        prerequisites: ['Commitment to environmental protection', 'Ability to walk on sandy terrain'],
        checklist: ['Protective gloves', 'Sunscreen', 'Reusable water bottle'],
        suitableScore: 30,
        roles: [
            { name: 'Waste Collector', description: 'Focus on picking up plastic and debris along the shoreline.' },
            { name: 'Data Logger', description: 'Record and categorize the types of waste collected for research.' }
        ],
        location: 'Marina Beach, Chennai'
    },
    {
        id: 'rd-blood-2026',
        title: 'Republic Day Blood Donation Drive',
        description: 'A community-level blood donation event where donors can save lives with one act of generosity on our Republic Day.',
        date: '26 Jan 2026, 8:00 AM – 2:00 PM',
        image: 'https://images.unsplash.com/photo-1615461066841-6116ecaaba74?q=80&w=1000&auto=format&fit=crop',
        prerequisites: ['Aged 18-65', 'Weight above 45kg', 'No major surgery in last 6 months'],
        checklist: ['Original ID Card', 'Light breakfast consumed', 'Comfortable clothing'],
        suitableScore: 20,
        roles: [
            { name: 'Donor Liaison', description: 'Guide donors through the registration and recovery process.' },
            { name: 'Registration Desk', description: 'Manage intake forms and verify donor identity.' }
        ],
        location: 'Navrangpura, Ahmedabad'
    },
    {
        id: 'tvk-maanadu-2025',
        title: 'TVK Maanadu - State Level Conference',
        description: 'The state-level conference of the Tamilaga Vettri Kazhagam (TVK) party. A grand gathering for supporters and volunteers led by Vijay.',
        date: 'Upcoming 2025',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
        prerequisites: ['Strong team spirit', 'Proficiency in local language preferred'],
        checklist: ['Volunteer badge', 'Mobile phone fully charged', 'Sturdy walking shoes'],
        suitableScore: 50,
        roles: [
            { name: 'Crowd Manager', description: 'Assist in guiding the public and ensuring safety during the event.' },
            { name: 'Logistics Aid', description: 'Help with water distribution and seating coordination.' }
        ],
        location: 'Tamil Nadu (Central Venue)'
    }
];
