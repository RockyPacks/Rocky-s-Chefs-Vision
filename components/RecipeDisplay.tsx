import React, { useState, useEffect } from 'react';
import type { Recipe } from '../types';
import { speechService } from '../services/speechService';

interface RecipeDisplayProps {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe | null) => void;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: (recipeName: string) => boolean;
  onAddToShoppingList: (recipe: Recipe) => void;
  onBack: () => void;
}

const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    switch(difficulty) {
        case 'Easy': return 'bg-green-100 text-green-800';
        case 'Medium': return 'bg-yellow-100 text-yellow-800';
        case 'Hard': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({
  recipes,
  selectedRecipe,
  onSelectRecipe,
  onToggleFavorite,
  isFavorite,
  onAddToShoppingList,
  onBack,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(-1);

  useEffect(() => {
    // Stop speech when component unmounts or selected recipe changes
    return () => speechService.stop();
  }, [selectedRecipe]);

  const handleReadAloud = (text: string, onEndCallback: () => void) => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      onEndCallback();
    } else {
      setIsSpeaking(true);
      speechService.speak(text, () => {
        setIsSpeaking(false);
        onEndCallback();
      });
    }
  };

  const readInstructions = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      setCurrentInstruction(-1);
      return;
    }
    
    if (selectedRecipe) {
      const textToRead = selectedRecipe.instructions.join(' \n\n ');
      handleReadAloud(textToRead, () => setCurrentInstruction(-1));
    }
  };

  if (selectedRecipe) {
    return (
      <div className="p-4 animate-fade-in">
        <button onClick={() => onSelectRecipe(null)} className="mb-4 text-green-600 hover:text-green-800 font-semibold">
          &larr; Back to Recipes
        </button>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-gray-800">{selectedRecipe.recipeName}</h2>
            <button onClick={() => onToggleFavorite(selectedRecipe)} className="text-2xl">
              <i className={`fas fa-heart ${isFavorite(selectedRecipe.recipeName) ? 'text-red-500' : 'text-gray-300'}`}></i>
            </button>
          </div>
          <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>
          <div className="flex items-center space-x-6 text-gray-500 mb-6">
            <span><i className="fas fa-clock mr-1"></i> {selectedRecipe.cookingTime}</span>
            <span><i className="fas fa-fire-alt mr-1"></i> {selectedRecipe.calories} kcal</span>
            {selectedRecipe.difficulty && (
                <span className={`px-2.5 py-1 text-sm font-semibold rounded-full ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                    {selectedRecipe.difficulty}
                </span>
            )}
          </div>

          {selectedRecipe.nutritional_warning && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded" role="alert">
              <p className="font-bold">A Friendly Warning from the Chef</p>
              <p>{selectedRecipe.nutritional_warning}</p>
            </div>
          )}

          {selectedRecipe.drinkPairings && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
              <h3 className="text-xl font-semibold text-green-800 mb-3">Perfect Pairings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-center">
                  <i className="fas fa-wine-glass-alt text-red-500 text-2xl w-8 text-center mr-3"></i>
                  <span><strong>Wine:</strong> {selectedRecipe.drinkPairings.wine}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-beer-mug-empty text-yellow-600 text-2xl w-8 text-center mr-3"></i>
                  <span><strong>Beer:</strong> {selectedRecipe.drinkPairings.beer}</span>
                </div>
                <div className="flex items-center">
                   <i className="fas fa-martini-glass-citrus text-blue-500 text-2xl w-8 text-center mr-3"></i>
                  <span><strong>Cocktail:</strong> {selectedRecipe.drinkPairings.cocktail}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-mug-saucer text-purple-500 text-2xl w-8 text-center mr-3"></i>
                  <span><strong>Non-Alcoholic:</strong> {selectedRecipe.drinkPairings.nonAlcoholic}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Ingredients</h3>
              <ul className="list-disc text-black list-inside space-y-2">
                {selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing.amount} {ing.name}</li>)}
              </ul>
              <button onClick={() => onAddToShoppingList(selectedRecipe)} className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors">
                <i className="fas fa-cart-plus mr-2"></i> Add to Shopping List
              </button>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Instructions</h3>
              <button onClick={readInstructions} className={`mb-4 px-4 py-2 font-semibold rounded-lg shadow-md transition-colors ${isSpeaking ? 'bg-red-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                <i className={`fas ${isSpeaking ? 'fa-stop-circle' : 'fa-volume-up'} mr-2`}></i> {isSpeaking ? 'Stop' : 'Read Aloud'}
              </button>
              <ol className=" text-black list-decimal list-inside space-y-3">
                {selectedRecipe.instructions.map((step, i) => <li key={i} className={currentInstruction === i ? 'text-black font-bold text-green-600' : ''}>{step}</li>)}
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in">
      <button onClick={onBack} className="mb-4 text-green-600 hover:text-green-800 font-semibold">
        &larr; Start Over
      </button>
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Here are your recipe ideas!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
            <div className="p-6 flex-grow">
               <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{recipe.recipeName}</h3>
                <button onClick={() => onToggleFavorite(recipe)} className="text-xl">
                    <i className={`fas fa-heart ${isFavorite(recipe.recipeName) ? 'text-red-500 hover:text-red-600' : 'text-gray-300 hover:text-red-400'}`}></i>
                </button>
               </div>
               <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                 <div className="flex items-center space-x-4">
                   <span><i className="fas fa-clock mr-1"></i> {recipe.cookingTime}</span>
                   <span><i className="fas fa-fire-alt mr-1"></i> {recipe.calories} kcal</span>
                 </div>
                 {recipe.difficulty && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                    </span>
                 )}
               </div>
               <p className="text-gray-600 text-sm">{recipe.description}</p>
            </div>
            <div className="p-6 bg-gray-50">
               <button onClick={() => onSelectRecipe(recipe)} className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                View Recipe
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeDisplay;