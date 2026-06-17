
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HUD } from './components/HUD';
import { Arena } from './components/Arena';
import { InputConsole } from './components/InputConsole';
import { GameOverOverlay } from './components/GameOverOverlay';
import { Onboarding } from './components/Onboarding';
import { Glossary } from './components/Glossary';
import { GameState, Sender, Challenge, AnswerFeedback } from './types';
import {
  ProgressMap,
  loadProgress,
  saveProgress,
  recordResult,
  selectChallenge,
  getWord,
  modeForBox,
  isRecallCorrect,
  masteryStats,
  MAX_BOX,
} from './srs';

interface SessionStats {
  answered: number;   // questions answered this session
  correct: number;    // correct answers this session
  advanced: number;   // times a word moved up a mastery box
  mastered: number;   // words that reached the top box this session
}

const EMPTY_SESSION: SessionStats = { answered: 0, correct: 0, advanced: 0, mastered: 0 };

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
    },
    {
        phrase: "Морь",
        phonetic: "Mor",
        translation: "Horse",
        options: ["Horse", "Dog", "Wolf", "Eagle"]
    },
    {
        phrase: "Чоно",
        phonetic: "Chono",
        translation: "Wolf",
        options: ["Bear", "Wolf", "Fox", "Lion"]
    },
    {
        phrase: "Гэр",
        phonetic: "Ger",
        translation: "Home",
        options: ["Home", "Door", "Road", "City"]
    },
    {
        phrase: "Цай",
        phonetic: "Tsai",
        translation: "Tea",
        options: ["Milk", "Tea", "Wine", "Soup"]
    },
    {
        phrase: "Сүү",
        phonetic: "Suu",
        translation: "Milk",
        options: ["Water", "Milk", "Tea", "Honey"]
    },
    {
        phrase: "Мах",
        phonetic: "Makh",
        translation: "Meat",
        options: ["Bread", "Cheese", "Meat", "Fish"]
    },
    {
        phrase: "Нар",
        phonetic: "Nar",
        translation: "Sun",
        options: ["Moon", "Sun", "Star", "Sky"]
    },
    {
        phrase: "Сар",
        phonetic: "Sar",
        translation: "Moon",
        options: ["Moon", "Sun", "Star", "Cloud"]
    },
    {
        phrase: "Тэнгэр",
        phonetic: "Tenger",
        translation: "Sky",
        options: ["Earth", "Mountain", "Sky", "River"]
    },
    {
        phrase: "Хаан",
        phonetic: "Khaan",
        translation: "King",
        options: ["Soldier", "King", "Slave", "Priest"]
    },
    {
        phrase: "Дайчин",
        phonetic: "Daichin",
        translation: "Warrior",
        options: ["Farmer", "Warrior", "Merchant", "Scholar"]
    },
    {
        phrase: "Сум",
        phonetic: "Sum",
        translation: "Arrow",
        options: ["Sword", "Arrow", "Shield", "Spear"]
    },
    {
        phrase: "Дөрөв",
        phonetic: "Durov",
        translation: "Four",
        options: ["Three", "Four", "Five", "Six"]
    },
    {
        phrase: "Тав",
        phonetic: "Tav",
        translation: "Five",
        options: ["Four", "Five", "Six", "Seven"]
    },
    {
        phrase: "Зургаа",
        phonetic: "Zurgaa",
        translation: "Six",
        options: ["Six", "Seven", "Eight", "Nine"]
    },
    {
        phrase: "Долоо",
        phonetic: "Doloo",
        translation: "Seven",
        options: ["Six", "Seven", "Eight", "Ten"]
    },
    {
        phrase: "Найм",
        phonetic: "Naim",
        translation: "Eight",
        options: ["Seven", "Eight", "Nine", "Ten"]
    },
    {
        phrase: "Ес",
        phonetic: "Yos",
        translation: "Nine",
        options: ["Seven", "Eight", "Nine", "Ten"]
    },
    {
        phrase: "Арав",
        phonetic: "Arav",
        translation: "Ten",
        options: ["Six", "Eight", "Nine", "Ten"]
    },
    {
        phrase: "Улаан",
        phonetic: "Ulaan",
        translation: "Red",
        options: ["Red", "White", "Black", "Blue"]
    },
    {
        phrase: "Цагаан",
        phonetic: "Tsagaan",
        translation: "White",
        options: ["Red", "White", "Black", "Yellow"]
    },
    {
        phrase: "Хар",
        phonetic: "Khar",
        translation: "Black",
        options: ["White", "Black", "Blue", "Green"]
    },
    {
        phrase: "Хөх",
        phonetic: "Khokh",
        translation: "Blue",
        options: ["Red", "Blue", "Yellow", "Green"]
    },
    {
        phrase: "Шар",
        phonetic: "Shar",
        translation: "Yellow",
        options: ["White", "Yellow", "Green", "Black"]
    },
    {
        phrase: "Ногоон",
        phonetic: "Nogoon",
        translation: "Green",
        options: ["Red", "Blue", "Yellow", "Green"]
    },
    {
        phrase: "Нохой",
        phonetic: "Nokhoi",
        translation: "Dog",
        options: ["Dog", "Wolf", "Horse", "Sheep"]
    },
    {
        phrase: "Хонь",
        phonetic: "Khoni",
        translation: "Sheep",
        options: ["Sheep", "Cow", "Goat", "Horse"]
    },
    {
        phrase: "Гал",
        phonetic: "Gal",
        translation: "Fire",
        options: ["Fire", "Water", "Earth", "Air"]
    },
    {
        phrase: "Цас",
        phonetic: "Tsas",
        translation: "Snow",
        options: ["Rain", "Snow", "Wind", "Cloud"]
    },
    {
        phrase: "Салхи",
        phonetic: "Salkhi",
        translation: "Wind",
        options: ["Wind", "Snow", "Rain", "Fire"]
    },
    {
        phrase: "Уул",
        phonetic: "Uul",
        translation: "Mountain",
        options: ["River", "Mountain", "Sky", "Sea"]
    },
    {
        phrase: "Ном",
        phonetic: "Nom",
        translation: "Book",
        options: ["Book", "Knife", "Cup", "Rope"]
    },
    {
        phrase: "Талх",
        phonetic: "Talkh",
        translation: "Bread",
        options: ["Bread", "Meat", "Cheese", "Rice"]
    },
    {
        phrase: "Давс",
        phonetic: "Davs",
        translation: "Salt",
        options: ["Salt", "Sugar", "Pepper", "Spice"]
    },
    {
        phrase: "Том",
        phonetic: "Tom",
        translation: "Big",
        options: ["Big", "Small", "Old", "New"]
    },
    {
        phrase: "Жижиг",
        phonetic: "Jijig",
        translation: "Small",
        options: ["Big", "Small", "Long", "Round"]
    },
    {
        phrase: "Халуун",
        phonetic: "Khaluun",
        translation: "Hot",
        options: ["Hot", "Cold", "Sweet", "Sour"]
    },
    {
        phrase: "Хүйтэн",
        phonetic: "Khuiten",
        translation: "Cold",
        options: ["Hot", "Cold", "Dark", "Light"]
    },
    {
        phrase: "Сайхан",
        phonetic: "Saikhan",
        translation: "Beautiful",
        options: ["Beautiful", "Ugly", "Angry", "Tired"]
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

const BEST_STREAK_KEY = 'quest_mgl_best_streak';

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
  currentMode: 'CHOICE_HINTED',
  roundCount: 0
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isGeneratingRound, setIsGeneratingRound] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<AnswerFeedback>(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>(EMPTY_SESSION);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const raw = window.localStorage.getItem(BEST_STREAK_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  });

  // Spaced-repetition progress, persisted across sessions.
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  const stateRef = useRef(gameState);
  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  const stats = masteryStats(STATIC_CHALLENGES, progress);

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

  const shuffle = <T,>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const startNewRound = useCallback(() => {
    if (stateRef.current.status !== 'ACTIVE') return;

    setIsGeneratingRound(true);

    const randomScene = SCENES[Math.floor(Math.random() * SCENES.length)];
    setGameState(prev => ({ ...prev, currentScene: randomScene }));

    setTimeout(() => {
        const round = stateRef.current.roundCount + 1;
        const avoidPhrase = stateRef.current.currentChallenge?.phrase;

        // Spaced-repetition selection: weak and unseen words surface most often.
        const selected = selectChallenge(STATIC_CHALLENGES, progressRef.current, round, avoidPhrase);
        const box = getWord(progressRef.current, selected.phrase).box;
        const mode = modeForBox(box);

        const challengeForRound: Challenge = {
            ...selected,
            options: shuffle(selected.options),
        };

        // The phonetic crutch is only offered at the easiest tier; removing it as
        // mastery grows forces progressively harder retrieval.
        const showHint = mode === 'CHOICE_HINTED';

        setGameState(prev => ({
            ...prev,
            roundCount: round,
            currentMode: mode,
            currentChallenge: challengeForRound,
            messages: [...prev.messages, {
                id: Date.now().toString() + Math.random(),
                sender: Sender.OPPONENT,
                text: selected.phrase,
                timestamp: Date.now(),
                isMongolian: true,
                phonetic: showHint ? selected.phonetic : undefined
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

  const handleAnswer = useCallback((rawAnswer: string) => {
    const currentCheck = stateRef.current;
    const challenge = currentCheck.currentChallenge;
    if (currentCheck.status !== 'ACTIVE' || !challenge) return;

    const answer = rawAnswer.trim();
    if (currentCheck.currentMode === 'TYPE' && answer.length === 0) return; // ignore empty submits

    setIsGeneratingRound(true);
    const correctAnswer = challenge.translation;

    // Free-recall (TYPE) tolerates case/typos/articles; multiple choice is exact.
    const isCorrect = currentCheck.currentMode === 'TYPE'
        ? isRecallCorrect(answer, correctAnswer)
        : answer === correctAnswer;

    setLastFeedback({ selected: answer, correct: correctAnswer, isCorrect });
    addMessage(answer, Sender.USER);

    // Update spaced-repetition memory for this word and persist it.
    const prevBox = getWord(progressRef.current, challenge.phrase).box;
    const updatedProgress = recordResult(progressRef.current, challenge.phrase, isCorrect, currentCheck.roundCount);
    const newBox = updatedProgress[challenge.phrase].box;
    progressRef.current = updatedProgress;
    setProgress(updatedProgress);
    saveProgress(updatedProgress);

    // Track what was learned this session for the end-of-duel summary.
    setSessionStats(prev => ({
        answered: prev.answered + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        advanced: prev.advanced + (newBox > prevBox ? 1 : 0),
        mastered: prev.mastered + (prevBox < MAX_BOX && newBox >= MAX_BOX ? 1 : 0),
    }));

    let newIntegrity = currentCheck.integrity;
    let newStreak = currentCheck.streak;

    if (isCorrect) {
        newStreak += 1;
    } else {
        newStreak = 0;
        newIntegrity -= 20;
    }

    newIntegrity = Math.max(0, newIntegrity);

    if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        try { window.localStorage.setItem(BEST_STREAK_KEY, String(newStreak)); } catch {}
    }

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

        // On a miss, reveal the answer AND the pronunciation (corrective feedback).
        if (!isCorrect && newStatus !== 'DEFEAT') {
            addMessage(`THE WORD WAS: ${correctAnswer.toUpperCase()} — SAY [${challenge.phonetic}]`, Sender.SYSTEM);
        }

        if (newStatus === 'ACTIVE') {
             setTimeout(() => {
                 setLastFeedback(null);
                 startNewRound();
             }, 1200);
        }
    }, 300);

  }, [triggerDamageEffect, startNewRound, bestStreak]);

  const handleRestart = () => {
    setLastFeedback(null);
    setSessionStats(EMPTY_SESSION);
    // Spaced-repetition progress intentionally persists across defeats — the
    // learner keeps the words they've earned.
    setGameState({
        ...INITIAL_STATE,
        status: 'ACTIVE',
        roundCount: 0
    });

    setTimeout(() => {
        addMessage("THE SPIRITS AWAKEN AGAIN.", Sender.SYSTEM);
        startNewRound();
    }, 800);
  };

  const handleOnboardingComplete = () => {
      setSessionStats(EMPTY_SESSION);
      setGameState(prev => ({ ...prev, status: 'ACTIVE' }));
      setTimeout(() => {
          addMessage("PROVE YOUR LINEAGE. 10 VICTORIES.", Sender.SYSTEM);
          startNewRound();
      }, 500);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState.status !== 'ACTIVE' || isGeneratingRound) return;
      // Number-key shortcuts only apply to multiple-choice rounds, not typed recall.
      if (gameState.currentMode === 'TYPE') return;
      const options = gameState.currentChallenge?.options;
      if (!options || options.length === 0) return;
      const idx = parseInt(e.key, 10);
      if (Number.isInteger(idx) && idx >= 1 && idx <= options.length) {
        e.preventDefault();
        handleAnswer(options[idx - 1]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState.status, gameState.currentChallenge, gameState.currentMode, isGeneratingRound, handleAnswer]);

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

      <HUD
        gameState={gameState}
        bestStreak={bestStreak}
        mastered={stats.mastered}
        totalWords={stats.total}
        onOpenGlossary={() => setShowGlossary(true)}
      />

      <main className="flex-1 flex flex-col relative w-full max-w-5xl mx-auto z-10 min-h-0">
        <Arena messages={gameState.messages} />
        <InputConsole
            onSendMessage={handleAnswer}
            disabled={gameState.status !== 'ACTIVE' || isGeneratingRound}
            options={gameState.currentChallenge?.options || []}
            mode={gameState.currentMode}
            feedback={lastFeedback}
        />
      </main>

      {showGlossary && (
        <Glossary
            challenges={STATIC_CHALLENGES}
            progress={progress}
            onClose={() => setShowGlossary(false)}
        />
      )}

      <GameOverOverlay
        status={gameState.status}
        onRestart={handleRestart}
        answered={sessionStats.answered}
        correct={sessionStats.correct}
        advanced={sessionStats.advanced}
        mastered={sessionStats.mastered}
      />
    </div>
  );
};

export default App;
