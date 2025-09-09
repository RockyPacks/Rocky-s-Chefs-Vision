import React, { useState } from 'react';
import type { Recipe } from '../types';
import RecipeDisplay from './RecipeDisplay';

interface FavoritesProps {
  favorites: Recipe[];
  onSelectRecipe: (recipe: Recipe | null) => void;
  onToggleFavorite: (recipe: Recipe) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
}

const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    switch(difficulty) {
        case 'Easy': return 'bg-green-100 text-green-800';
        case 'Medium': return 'bg-yellow-100 text-yellow-800';
        case 'Hard': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const Favorites: React.FC<FavoritesProps> = ({ favorites, onSelectRecipe, onToggleFavorite, onAddToShoppingList }) => {
  const [selectedFavorite, setSelectedFavorite] = useState<Recipe | null>(null);
  
  const handleSelect = (recipe: Recipe) => {
    setSelectedFavorite(recipe);
    onSelectRecipe(recipe);
  };
  
  const handleBack = () => {
    setSelectedFavorite(null);
    onSelectRecipe(null);
  }
  
  const isFavoriteCheck = (recipeName: string) => favorites.some(fav => fav.recipeName === recipeName);

  if (selectedFavorite) {
    return (
        <RecipeDisplay 
            recipes={[]} 
            selectedRecipe={selectedFavorite} 
            onSelectRecipe={handleBack}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavoriteCheck}
            onBack={handleBack}
            // FIX: The 'onAddToShoppingList' prop was missing, which is required by RecipeDisplay.
            onAddToShoppingList={onAddToShoppingList}
        />
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">My Favorite Recipes</h2>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{recipe.recipeName}</h3>
                    <button onClick={() => onToggleFavorite(recipe)} className="text-xl">
                        <i className="fas fa-heart text-red-500 hover:text-red-600"></i>
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
                <button onClick={() => handleSelect(recipe)} className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                  View Recipe
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-16">
          <i className="far fa-heart text-6xl mb-4"></i>
          <p className="text-xl">You haven't saved any favorite recipes yet.</p>
          <p>Are you playing hard to get? Click the heart on a recipe to add it here!</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;