
import React, { useState } from 'react';
import { Skull, Swords, Shield, Mountain } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    id: 1,
    title: "THE STEPPE",
    desc: "You are lost in the endless plains of the Mongol Empire (1254 AD). To survive, you must prove you belong.",
    // Vast Steppe
    image: "https://images.unsplash.com/photo-1629831735930-817651a29582?q=80&w=1000&auto=format&fit=crop&sat=-50",
    icon: <Mountain className="w-12 h-12 text-[#b45309] mb-4" />
  },
  {
    id: 2,
    title: "THE GUARD",
    desc: "BATZORIG blocks your path. He is a Khan's Guard. He respects only strength and the tongue of his people.",
    // Horse (Matching the opponent profile)
    image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=1000&auto=format&fit=crop&sat=-20",
    icon: <Skull className="w-12 h-12 text-[#b45309] mb-4" />
  },
  {
    id: 3,
    title: "THE TEST",
    desc: "He challenges you with phrases. Translate correctly to earn his favor. Hesitate, and you will be cast out.",
    // Yurt Interior
    image: "https://images.unsplash.com/photo-1548682880-9907f9c735d4?q=80&w=1000&auto=format&fit=crop&sat=-50", 
    icon: <Swords className="w-12 h-12 text-[#b45309] mb-4" />
  },
  {
    id: 4,
    title: "HONOR",
    desc: "Achieve 10 CONSECUTIVE correct answers to prove your worthiness to enter the Camp of the Khan.",
    // Horses in Mist
    image: "https://images.unsplash.com/photo-1518014568023-fa00619c286d?q=80&w=1000&auto=format&fit=crop&sat=-50",
    icon: <Shield className="w-12 h-12 text-[#b45309] mb-4" />
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const content = SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
            src={content.image} 
            alt="Background" 
            className="w-full h-full object-cover opacity-40 sepia contrast-125 transition-opacity duration-700"
            key={`img-${content.id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b08] via-[#0f0b08]/80 to-transparent"></div>
        <div className="grain"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl p-8 flex flex-col items-center text-center">
        
        {/* Progress Bar */}
        <div className="w-full flex gap-2 mb-8">
            {SLIDES.map((slide, idx) => (
                <div 
                    key={slide.id} 
                    className={`h-1 flex-1 transition-all duration-300 ${idx <= currentSlide ? 'bg-[#b45309]' : 'bg-[#2a2118]'}`}
                ></div>
            ))}
        </div>

        {/* Content Container */}
        <div 
            key={currentSlide}
            className="bg-[#1c1917]/90 border-2 border-[#5c4a3d] p-8 md:p-12 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full animate-fade-in relative overflow-hidden"
        >
             {/* Decorative Corner Ornaments */}
             <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#b45309]"></div>
             <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#b45309]"></div>
             <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#b45309]"></div>
             <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#b45309]"></div>

             <div className="flex justify-center mb-6 animate-pulse">{content.icon}</div>
             
             <h2 className="text-4xl md:text-5xl font-['Cinzel'] font-bold text-[#fcd34d] mb-4 tracking-wider uppercase drop-shadow-md">
                {content.title}
             </h2>
             
             <p className="text-lg md:text-xl font-['Cinzel'] text-[#a8a29e] mb-8 leading-relaxed">
                {content.desc}
             </p>

             <button
                onClick={handleNext}
                className="group relative px-10 py-3 bg-[#451a03] border-2 border-[#b45309] text-[#feb2b2] font-['Cinzel'] font-bold uppercase tracking-widest transition-all hover:bg-[#78350f] hover:text-white hover:border-[#fcd34d] hover:shadow-[0_0_20px_rgba(180,83,9,0.4)]"
             >
                {currentSlide === SLIDES.length - 1 ? "ENTER THE PIT" : "NEXT"}
             </button>
        </div>
      </div>
    </div>
  );
};
