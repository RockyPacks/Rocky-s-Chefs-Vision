import React, { useState } from 'react';

interface TutorialProps {
  onComplete: () => void;
}

const tutorialSteps = [
  {
    icon: 'fa-utensils',
    title: "Welcome to Rocky's Chef's Vision!",
    text: "Let's take a quick tour of how to turn your ingredients into delicious meals. This app is your personal kitchen assistant!",
  },
  {
    icon: 'fa-camera-retro',
    title: 'Step 1: Show Us Your Ingredients',
    text: 'Start by uploading a photo of your ingredients. You can select a file from your device or use your camera for a live view.',
  },
  {
    icon: 'fa-tasks',
    title: 'Step 2: Review & Customize',
    text: 'Our AI will analyze your photo and list the ingredients it sees, along with their freshness. You can then set your dietary preferences, allergies, and desired cooking time.',
  },
  {
    icon: 'fa-blender-phone',
    title: 'Step 3: Get Your Recipes!',
    text: 'With your ingredients and preferences, the AI will generate three unique recipe ideas just for you. Browse the list and pick your favorite.',
  },
  {
    icon: 'fa-book-open',
    title: 'Step 4: Dive into the Details',
    text: "View a recipe's full details, including a step-by-step instruction guide and ingredient list. Use the 'Read Aloud' feature for a hands-free cooking experience!",
  },
  {
    icon: 'fa-star',
    title: 'Your Personal Cookbook',
    text: "Use the header to navigate your cookbook. Save recipes to 'Favorites', add missing items to your 'Shopping List', and adjust your 'Settings' to save your preferences for next time.",
  },
  {
    icon: 'fa-check-circle',
    title: "You're All Set!",
    text: 'You now know the basics. Time to start your culinary adventure. Happy cooking!',
  },
];

const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };
  
  const currentStep = tutorialSteps[step];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative transform transition-all scale-100 opacity-100">
        <button onClick={onComplete} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
          &times;
        </button>
        
        <div className="text-green-500 text-6xl mb-4">
          <i className={`fas ${currentStep.icon}`}></i>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{currentStep.title}</h2>
        <p className="text-gray-600 mb-8">{currentStep.text}</p>
        
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${step > 0 ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            disabled={step === 0}
          >
            Previous
          </button>
          <div className="flex items-center space-x-2">
            {tutorialSteps.map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full transition-colors ${i === step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            ))}
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            {step === tutorialSteps.length - 1 ? "Let's Cook!" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;