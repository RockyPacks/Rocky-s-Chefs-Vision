import React, { useState, useEffect } from 'react';
import type { AnalyzedIngredient, UserPreferences } from '../types';

interface RecipeGeneratorProps {
  ingredients: AnalyzedIngredient[];
  onGenerateRecipes: (preferences: UserPreferences) => void;
  preferences: UserPreferences;
  onBack: () => void;
}

const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ ingredients, onGenerateRecipes, preferences, onBack }) => {
  const [currentPrefs, setCurrentPrefs] = useState<UserPreferences>(preferences);

  useEffect(() => {
    setCurrentPrefs(preferences);
  }, [preferences]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentPrefs(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateRecipes(currentPrefs);
  };
  
  const getFreshnessColor = (freshness: AnalyzedIngredient['freshness']) => {
    switch(freshness) {
      case 'Fresh': return 'text-green-800 bg-green-200';
      case 'Good': return 'text-lime-800 bg-lime-200';
      case 'Okay': return 'text-yellow-800 bg-yellow-200';
      case 'Near Spoiled': return 'text-orange-800 bg-orange-200';
      case 'Spoiled': return 'text-red-800 bg-red-200';
      default: return 'text-gray-800 bg-gray-200';
    }
  };

  return (
    <div className="p-4 animate-fade-in">
       <button onClick={onBack} className="mb-4 text-green-600 hover:text-green-800 font-semibold">
        &larr; Back to Uploader
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Detected Ingredients</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {ingredients.map((ing, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-md">
            <p className="font-bold text-gray-900">{ing.name}</p>
            <p className="text-sm text-gray-600">{ing.quantity}</p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 inline-block ${getFreshnessColor(ing.freshness)}`}>
              {ing.freshness}
            </span>
          </div>
        ))}
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Customize Your Recipes</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="diet" className="block text-sm font-medium text-gray-700">Dietary Preference</label>
            <input type="text" name="diet" id="diet" value={currentPrefs.diet} onChange={handleInputChange} placeholder="e.g., Vegan, Low-carb, Gluten-free" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies</label>
            <input type="text" name="allergies" id="allergies" value={currentPrefs.allergies} onChange={handleInputChange} placeholder="e.g., Peanuts, Dairy" className="mt-1 block w-full px-3 py-2  border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700">Max Cooking Time</label>
            <select name="cookTime" id="cookTime" value={currentPrefs.cookTime} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
              <option value="any">Any</option>
              <option value="short">Under 30 mins</option>
              <option value="medium">30-60 mins</option>
              <option value="long">Over 60 mins</option>
            </select>
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Cooking Difficulty</label>
            <select name="difficulty" id="difficulty" value={currentPrefs.difficulty} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
              <option value="any">Any</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700">Health & Cooking Goal</label>
            <select name="goal" id="goal" value={currentPrefs.goal} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                <option value="none">None</option>
                <option value="healthy_eating">Healthy Eating</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="save_money">Save Money</option>
                <option value="cook_faster">Cook Faster</option>
            </select>
          </div>
        </div>
        <div className="text-center">
            <button
                type="submit"
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
            >
                <i className="fas fa-magic mr-2"></i>
                Work Your Magic!
            </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeGenerator;