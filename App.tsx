
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HUD } from './components/HUD';
import { Arena } from './components/Arena';
import { InputConsole } from './components/InputConsole';
import { GameOverOverlay } from './components/GameOverOverlay';
import { Onboarding } from './components/Onboarding';
import { GameState, Sender, Challenge } from './types';

// --- STATIC CONTENT CONFIGURATION ---

// Generic Horse Picture (stable placeholder image source)
const STATIC_OPPONENT_IMAGE = "https://images.unsplash.com/photo-1594670075694-34ce50c3245d?w=1000&auto=format&fit=crop&q=80";

// Mongol Empire Backgrounds
const SCENES = [
    "https://images.unsplash.com/photo-1516912522568-5a5548f0f3f7?w=1000&auto=format&fit=crop&q=80", // Vast Steppe
    "https://images.unsplash.com/photo-1509227984326-0a02a5b40233?w=1000&auto=format&fit=crop&q=80", // Yurt Interior
    "https://images.unsplash.com/photo-1516455590571-18256e9f79e5?w=1000&auto=format&fit=crop&q=80", // Mountains
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80", // Horses in mist
    "https://images.unsplash.com/photo-1533616688413-bf8b1a6c79a0?w=1000&auto=format&fit=crop&q=80", // Snowy Steppe
];

const STATIC_CHALLENGES: Challenge[] = [
    {
        phrase: "Сайн байна уу",
        phonetic: "Sain baina uu",
        translation: "Hello",
        options: ["Hello", "Goodbye", "Thank you", "Please"]
    },
    {
        phrase: "Баярлалаа",
        phonetic: "Bayar-lalaa",
        translation: "Thank you",
        options: ["Sorry", "Thank you", "Yes", "No"]
    },
    {
        phrase: "Уучлаарай",
        phonetic: "Ooch-laa-rai",
        translation: "Sorry",
        options: ["Happy", "Hungry", "Sorry", "Welcome"]
    },
    {
        phrase: "Тийм",
        phonetic: "Teem",
        translation: "Yes",
        options: ["No", "Maybe", "Yes", "What?"]
    },
    {
        phrase: "Үгүй",
        phonetic: "U-gui",
        translation: "No",
        options: ["Yes", "No", "Okay", "Sure"]
    },
    {
        phrase: "Ус",
        phonetic: "Us",
        translation: "Water",
        options: ["Fire", "Earth", "Air", "Water"]
    },
    {
        phrase: "Би ойлгохгүй байна",
        phonetic: "Bi oil-gokh-gui bain",
        translation: "I don't understand",
        options: ["I understand", "I don't understand", "I am happy", "I am lost"]
    },
    {
        phrase: "Туслаач",
        phonetic: "Tus-laach",
        translation: "Help",
        options: ["Run", "Stop", "Help", "Wait"]
    },
    {
        phrase: "За",
        phonetic: "Dza",
        translation: "Ok",
        options: ["No", "Bad", "Ok", "Never"]
    },
    {
        phrase: "Баяртай",
        phonetic: "Bayar-tai",
        translation: "Goodbye",
        options: ["Hello", "Goodbye", "Good morning", "Good night"]
    },
    {
        phrase: "Миний нэр...",
        phonetic: "Minii ner...",
        translation: "My name is...",
        options: ["Where is...", "My name is...", "I want...", "You are..."]
    },
    {
        phrase: "Хэд вэ?",
        phonetic: "Hed we?",
        translation: "How much?",
        options: ["What time?", "How much?", "Where?", "Who?"]
    },
    {
        phrase: "Өглөөний мэнд",
        phonetic: "Ugluunii mend",
        translation: "Good morning",
        options: ["Good morning", "Good evening", "Good night", "Hello"]
    },
    {
        phrase: "Оройн мэнд",
        phonetic: "Oroin mend",
        translation: "Good evening",
        options: ["Good morning", "Good evening", "Goodbye", "See you"]
    },
    {
        phrase: "Амттай",
        phonetic: "Amt-tai",
        translation: "Delicious",
        options: ["Delicious", "Bad", "Hot", "Cold"]
    },
    {
        phrase: "Үнэтэй",
        phonetic: "Une-tei",
        translation: "Expensive",
        options: ["Cheap", "Expensive", "Free", "Big"]
    },
    {
        phrase: "Хямд",
        phonetic: "Hyamd",
        translation: "Cheap",
        options: ["Cheap", "Expensive", "Good", "Bad"]
    },
    {
        phrase: "Нэг",
        phonetic: "Neg",
        translation: "One",
        options: ["One", "Two", "Three", "Ten"]
    },
    {
        phrase: "Хоёр",
        phonetic: "Hoyor",
        translation: "Two",
        options: ["One", "Two", "Three", "Four"]
    },
    {
        phrase: "Гурав",
        phonetic: "Gurav",
        translation: "Three",
        options: ["Two", "Three", "Four", "Five"]
    },
    {
        phrase: "Ээж",
        phonetic: "Eej",
        translation: "Mother",
        options: ["Father", "Mother", "Sister", "Brother"]
    },
    {
        phrase: "Аав",
        phonetic: "Aav",
        translation: "Father",
        options: ["Father", "Mother", "Grandfather", "Friend"]
    },
    {
        phrase: "Найз",
        phonetic: "Naiz",
        translation: "Friend",
        options: ["Enemy", "Friend", "Teacher", "Warrior"]
    },
    {
        phrase: "Морьтон",
        phonetic: "Moriton",
        translation: "Horseman",
        options: ["Horseman", "Doctor", "Teacher", "Cook"]
    },
    {
        phrase: "Зогс",
        phonetic: "Zogs",
        translation: "Stop",
        options: ["Go", "Stop", "Run", "Walk"]
    }
];

const GUARD_QUOTES = {
    CORRECT: [
        "YOUR SPIRIT IS STRONG.",
        "THE KHAN WOULD APPROVE.",
        "A WARRIOR'S TONGUE.",
        "YOU RIDE WELL.",
        "GOOD.",
        "KEEP YOUR GUARD UP."
    ],
    INCORRECT: [
        "YOU SHAME YOUR ANCESTORS.",
        "WEAKNESS IS DEATH.",
        "THE WOLVES WILL EAT YOU.",
        "SILENCE, FOOL.",
        "BACK TO THE DIRT.",
        "MY BLADE IS SHARP."
    ]
};

const INITIAL_STATE: GameState = {
  integrity: 100,
  streak: 0,
  status: 'ONBOARDING',
  messages: [{
    id: 'init-1',
    sender: Sender.OPPONENT,
    text: "THE CAMP IS WATCHING...",
    timestamp: Date.now()
  }],
  isShaking: false,
  isFlashing: false,
  opponentImage: STATIC_OPPONENT_IMAGE,
  currentScene: SCENES[0],
  availableQuestionIndices: Array.from({ length: STATIC_CHALLENGES.length }, (_, i) => i)
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isGeneratingRound, setIsGeneratingRound] = useState(false);
  
  useEffect(() => {
      setGameState(prev => ({
          ...prev,
          status: 'ONBOARDING'
      }));
  }, []);

  const stateRef = useRef(gameState);
  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  const addMessage = (text: string, sender: Sender, isMongolian = false, phonetic?: string) => {
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: Date.now().toString() + Math.random(),
        sender,
        text,
        timestamp: Date.now(),
        isMongolian,
        phonetic
      }]
    }));
  };

  const shuffle = (array: string[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const startNewRound = useCallback(() => {
    if (stateRef.current.status !== 'ACTIVE') return;
    
    setIsGeneratingRound(true);

    const randomScene = SCENES[Math.floor(Math.random() * SCENES.length)];
    setGameState(prev => ({ ...prev, currentScene: randomScene }));

    setTimeout(() => {
        let nextIndices = [...stateRef.current.availableQuestionIndices];
        const currentChallenge = stateRef.current.currentChallenge;
        
        if (nextIndices.length === 0) {
            nextIndices = Array.from({ length: STATIC_CHALLENGES.length }, (_, i) => i);
            if (currentChallenge) {
                const currentPhrase = currentChallenge.phrase;
                const currentIndexInStatic = STATIC_CHALLENGES.findIndex(c => c.phrase === currentPhrase);
                if (currentIndexInStatic !== -1) {
                    nextIndices = nextIndices.filter(i => i !== currentIndexInStatic);
                }
            }
        }

        const randomIndexPtr = Math.floor(Math.random() * nextIndices.length);
        const challengeIndex = nextIndices[randomIndexPtr];
        nextIndices.splice(randomIndexPtr, 1);
        
        const selectedChallenge = STATIC_CHALLENGES[challengeIndex];
        const shuffledOptions = shuffle([...selectedChallenge.options]);

        const challengeWithShuffledOptions = {
            ...selectedChallenge,
            options: shuffledOptions
        };
        
        setGameState(prev => ({ 
            ...prev, 
            availableQuestionIndices: nextIndices,
            currentChallenge: challengeWithShuffledOptions,
            messages: [...prev.messages, {
                id: Date.now().toString() + Math.random(),
                sender: Sender.OPPONENT,
                text: selectedChallenge.phrase,
                timestamp: Date.now(),
                isMongolian: true,
                phonetic: selectedChallenge.phonetic
            }]
        }));
        
        setIsGeneratingRound(false);
    }, 600);
  }, []);

  const triggerDamageEffect = useCallback(() => {
    setGameState(prev => ({ ...prev, isShaking: true, isFlashing: true }));
    setTimeout(() => setGameState(prev => ({ ...prev, isFlashing: false })), 100);
    setTimeout(() => setGameState(prev => ({ ...prev, isShaking: false })), 400);
  }, []);

  const handleAnswer = useCallback((selectedOption: string) => {
    const currentCheck = stateRef.current;
    if (currentCheck.status !== 'ACTIVE' || !currentCheck.currentChallenge) return;

    setIsGeneratingRound(true);
    addMessage(selectedOption, Sender.USER);
    
    const isCorrect = selectedOption === currentCheck.currentChallenge.translation;
    
    let newIntegrity = currentCheck.integrity;
    let newStreak = currentCheck.streak;
    
    if (isCorrect) {
        newStreak += 1;
    } else {
        newStreak = 0;
        newIntegrity -= 20;
    }
    
    newIntegrity = Math.max(0, newIntegrity);

    let newStatus: GameState['status'] = currentCheck.status;
    if (newIntegrity <= 0) newStatus = 'DEFEAT';
    if (newStreak >= 10) newStatus = 'VICTORY';

    setGameState(prev => ({
        ...prev,
        integrity: newIntegrity,
        streak: newStreak,
        status: newStatus
    }));

    if (!isCorrect) {
        triggerDamageEffect();
    }

    const quotes = isCorrect ? GUARD_QUOTES.CORRECT : GUARD_QUOTES.INCORRECT;
    const responseText = quotes[Math.floor(Math.random() * quotes.length)];
    
    setTimeout(() => {
        addMessage(responseText, Sender.OPPONENT);

        if (newStatus === 'ACTIVE') {
             setTimeout(() => {
                 startNewRound();
             }, 1000);
        }
    }, 300); 

  }, [triggerDamageEffect, startNewRound]);

  const handleRestart = () => {
    setGameState({
        ...INITIAL_STATE,
        status: 'ACTIVE',
        availableQuestionIndices: Array.from({ length: STATIC_CHALLENGES.length }, (_, i) => i)
    });
    
    setTimeout(() => {
        addMessage("THE SPIRITS AWAKEN AGAIN.", Sender.SYSTEM);
        startNewRound();
    }, 800);
  };

  const handleOnboardingComplete = () => {
      setGameState(prev => ({ ...prev, status: 'ACTIVE' }));
      setTimeout(() => {
          addMessage("PROVE YOUR LINEAGE. 10 VICTORIES.", Sender.SYSTEM);
          startNewRound();
      }, 500);
  };

  return (
    <div className={`relative w-full h-screen bg-[#1a1a1a] flex flex-col overflow-hidden transition-all duration-1000 ease-in-out ${gameState.isShaking ? 'animate-shake' : ''}`}>
      
      {/* Dynamic Background Scene */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${gameState.currentScene})` }}
      ></div>
      <div className="absolute inset-0 bg-[#0f0b08]/70 z-0"></div>

      {/* Effects */}
      <div className={`pointer-events-none absolute inset-0 bg-red-800 z-40 transition-opacity duration-100 ${gameState.isFlashing ? 'opacity-30 mix-blend-overlay' : 'opacity-0'}`}></div>
      <div className="grain"></div>

      {/* Components */}
      {gameState.status === 'ONBOARDING' && <Onboarding onComplete={handleOnboardingComplete} />}

      <HUD gameState={gameState} />
      
      <main className="flex-1 flex flex-col relative w-full max-w-5xl mx-auto z-10 min-h-0">
        <Arena messages={gameState.messages} />
        <InputConsole 
            onSendMessage={handleAnswer} 
            disabled={gameState.status !== 'ACTIVE' || isGeneratingRound} 
            options={gameState.currentChallenge?.options || []}
        />
      </main>

      <GameOverOverlay status={gameState.status} onRestart={handleRestart} />
    </div>
  );
};

export default App;
