import React, { useState } from 'react';
import type { UserPreferences } from '../types';
import { speechService } from '../services/speechService';


interface SettingsProps {
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
}

const Settings: React.FC<SettingsProps> = ({ preferences, onSave }) => {
  const [currentPrefs, setCurrentPrefs] = useState<UserPreferences>(preferences);
  const [saved, setSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string|null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentPrefs(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(currentPrefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const handleVoiceCommand = () => {
    if (isListening) return;
    setIsListening(true);
    setSpeechError(null);

    speechService.listen(
      (transcript) => {
        const lowerTranscript = transcript.toLowerCase().replace(/\.$/, ''); // Sanitize transcript
        let newPrefs = { ...currentPrefs };
        let updated = false;

        // Parse Diet
        const dietMatch = lowerTranscript.match(/diet (?:to|is) ([\w\s-]+)/);
        if (dietMatch && dietMatch[1]) {
          newPrefs.diet = dietMatch[1].trim();
          updated = true;
        }

        // Parse Allergies
        const allergyMatch = lowerTranscript.match(/(?:allergies are|allergic to) ([\w\s,]+)/);
        if (allergyMatch && allergyMatch[1]) {
          newPrefs.allergies = allergyMatch[1].trim();
          updated = true;
        }

        // Parse Cook Time
        if (lowerTranscript.includes('cook time')) {
          if (lowerTranscript.includes('under 30') || lowerTranscript.includes('short')) {
            newPrefs.cookTime = 'short';
            updated = true;
          } else if (lowerTranscript.includes('30 to 60') || lowerTranscript.includes('medium')) {
            newPrefs.cookTime = 'medium';
            updated = true;
          } else if (lowerTranscript.includes('over 60') || lowerTranscript.includes('long')) {
            newPrefs.cookTime = 'long';
            updated = true;
          } else if (lowerTranscript.includes('any')) {
            newPrefs.cookTime = 'any';
            updated = true;
          }
        }

        // Parse Goal
        if (lowerTranscript.includes('goal')) {
          if (lowerTranscript.includes('healthy eating')) {
            newPrefs.goal = 'healthy_eating';
            updated = true;
          } else if (lowerTranscript.includes('weight loss')) {
            newPrefs.goal = 'weight_loss';
            updated = true;
          } else if (lowerTranscript.includes('save money')) {
            newPrefs.goal = 'save_money';
            updated = true;
          } else if (lowerTranscript.includes('cook faster')) {
            newPrefs.goal = 'cook_faster';
            updated = true;
          } else if (lowerTranscript.includes('none')) {
            newPrefs.goal = 'none';
            updated = true;
          }
        }
        
        if (updated) {
          setCurrentPrefs(newPrefs);
        } else {
            setSpeechError("Sorry, I didn't understand that. Try 'set diet to vegan'.");
            setTimeout(() => setSpeechError(null), 5000);
        }
      },
      () => setIsListening(false),
      (error) => {
        setSpeechError(error);
        setIsListening(false);
      }
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">My Preferences</h2>
      <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label htmlFor="diet" className="block text-sm font-medium text-gray-700">Dietary Preference</label>
          <input type="text" name="diet" id="diet" value={currentPrefs.diet} onChange={handleInputChange} placeholder="e.g., Vegan, Low-carb, Gluten-free" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies to Avoid</label>
          <input type="text" name="allergies" id="allergies" value={currentPrefs.allergies} onChange={handleInputChange} placeholder="e.g., Peanuts, Dairy, Shellfish" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700">Preferred Cooking Time</label>
          <select name="cookTime" id="cookTime" value={currentPrefs.cookTime} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
            <option value="any">Any</option>
            <option value="short">Under 30 mins</option>
            <option value="medium">30-60 mins</option>
            <option value="long">Over 60 mins</option>
          </select>
        </div>
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700">Primary Goal</label>
          <select name="goal" id="goal" value={currentPrefs.goal} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
             <option value="none">None</option>
             <option value="healthy_eating">Healthy Eating</option>
             <option value="weight_loss">Weight Loss</option>
             <option value="save_money">Save Money</option>
             <option value="cook_faster">Cook Faster</option>
          </select>
        </div>
         <div className="border-t pt-6 flex flex-col items-center">
             <button
              onClick={handleVoiceCommand}
              disabled={isListening}
              className={`px-6 py-2 rounded-full font-semibold transition-colors flex items-center ${isListening ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
              <i className={`fas fa-microphone mr-2 ${isListening ? 'animate-pulse' : ''}`}></i>
              {isListening ? 'Listening...' : 'Set with Voice'}
            </button>
            {speechError && <p className="text-red-500 text-sm mt-2">{speechError}</p>}
        </div>
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-colors"
        >
          Save Preferences
        </button>
        {saved && <p className="text-green-600 mt-4 font-semibold animate-fade-in">Preferences saved successfully!</p>}
      </div>
    </div>
  );
};

export default Settings;
