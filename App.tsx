import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { analyzeIngredients, generateRecipes } from './services/geminiService';
import type { AnalyzedIngredient, Recipe, UserPreferences, ShoppingListItem, HistoryEntry } from './types';

import Header from './components/Header';
import IngredientUploader from './components/IngredientUploader';
import RecipeGenerator from './components/RecipeGenerator';
import RecipeDisplay from './components/RecipeDisplay';
import Favorites from './components/Favorites';
import ShoppingList from './components/ShoppingList';
import Settings from './components/Settings';
import History from './components/History';
import Tutorial from './components/Tutorial';
import { speechService } from './services/speechService';

type View = 'upload' | 'generate' | 'recipes' | 'favorites' | 'shopping_list' | 'settings' | 'history';

const DEFAULT_PREFERENCES: UserPreferences = {
  diet: '',
  allergies: '',
  cookTime: 'any',
  difficulty: 'any',
  goal: 'none',
};

const funnyLoadingMessages = [
    "Consulting the culinary cosmos...",
    "Reticulating splines... and spices.",
    "Teaching tomatoes to sing...",
    "Convincing the oven not to burn things.",
    "Sharpening virtual knives...",
    "Asking the potatoes for their life story.",
    "Decoding the secret language of herbs.",
    "Waking up the yeast. It's a slow process.",
    "Polishing the recipe pixels.",
    "Don't worry, no chickens were harmed in this algorithm."
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('upload');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [analyzedIngredients, setAnalyzedIngredients] = useState<AnalyzedIngredient[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('userPrefs', DEFAULT_PREFERENCES);
  const [favorites, setFavorites] = useLocalStorage<Recipe[]>('favorites', []);
  const [shoppingList, setShoppingList] = useLocalStorage<ShoppingListItem[]>('shoppingList', []);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('history', []);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useLocalStorage<boolean>('tutorialCompleted', false);
  
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(funnyLoadingMessages[0]);

  // Effect for the humorous loading bar
  useEffect(() => {
    // FIX: Replaced incorrect NodeJS.Timeout with 'number' for browser compatibility.
    let progressInterval: number | null = null;
    // FIX: Replaced incorrect NodeJS.Timeout with 'number' for browser compatibility.
    let messageInterval: number | null = null;
    if (isLoading) {
      setProgress(0);
      setLoadingMessage(funnyLoadingMessages[0]);

      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            // FIX: Updated type assertion from NodeJS.Timeout to 'number' to match the variable's corrected type.
            clearInterval(progressInterval as number);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 400);

      // Cycle through messages
      let messageIndex = 0;
      messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % funnyLoadingMessages.length;
        setLoadingMessage(funnyLoadingMessages[messageIndex]);
      }, 2000);

    } else {
      setProgress(100);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [isLoading]);
  
  // Stop any speech synthesis when view changes.
  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, [view, selectedRecipe]);


  const handleImageAnalyzed = async (base64: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const ingredients = await analyzeIngredients(base64);
      setAnalyzedIngredients(ingredients);
      setView('generate');
    } catch (err: any) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecipes = async (prefs: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setPreferences(prefs);
    try {
      const recipes = await generateRecipes(analyzedIngredients, prefs);
      setGeneratedRecipes(recipes);
      // Add to history
      const newHistoryEntry: HistoryEntry = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        ingredients: analyzedIngredients,
        recipes: recipes,
      };
      setHistory(prev => [newHistoryEntry, ...prev]);
      setView('recipes');
    } catch (err: any) {
      setError(`Recipe generation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNavigate = (newView: View) => {
    setError(null);
    setSelectedRecipe(null);
    setView(newView);
  };
  
  const handleBackToGenerator = () => {
    setGeneratedRecipes([]);
    setView('generate');
  };
  
  const handleBackToUploader = () => {
    setAnalyzedIngredients([]);
    setGeneratedRecipes([]);
    setView('upload');
  }

  const handleToggleFavorite = (recipe: Recipe) => {
    setFavorites(prev => {
      const isFav = prev.some(fav => fav.recipeName === recipe.recipeName);
      if (isFav) {
        return prev.filter(fav => fav.recipeName !== recipe.recipeName);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const isFavorite = (recipeName: string) => favorites.some(fav => fav.recipeName === recipeName);

  const handleAddToShoppingList = (recipe: Recipe) => {
    const newItems = recipe.ingredients
      .filter(ing => !shoppingList.some(item => item.name === ing.name && item.recipeName === recipe.recipeName))
      .map(ing => ({ ...ing, recipeName: recipe.recipeName, purchased: false }));

    if (newItems.length > 0) {
      setShoppingList(prev => [...prev, ...newItems]);
      alert(`${newItems.length} item(s) added to your shopping list!`);
    } else {
      alert("All ingredients for this recipe are already on your list.");
    }
  };

  const handleToggleShoppingItem = (itemName: string, recipeName: string) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.name === itemName && item.recipeName === recipeName
          ? { ...item, purchased: !item.purchased }
          : item
      )
    );
  };
  
  const handleClearPurchased = () => {
      setShoppingList(prev => prev.filter(item => !item.purchased));
  }

  const handleViewHistoryEntry = (entry: HistoryEntry) => {
      setAnalyzedIngredients(entry.ingredients);
      setGeneratedRecipes(entry.recipes);
      setView('recipes');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire generation history? This cannot be undone.')) {
        setHistory([]);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    <i className="fas fa-hat-chef animate-bounce mr-2"></i>
                    AI is cooking...
                </h2>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progress}%` }}>
                    </div>
                </div>
                <p className="text-gray-600 mt-2 text-lg italic h-12">{loadingMessage}</p>
            </div>
        </div>
      );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4" role="alert">
                  <p className="font-bold">An Error Occurred</p>
                  <p>{error}</p>
                </div>
                <button onClick={() => handleNavigate('upload')} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700">
                    Start Over
                </button>
            </div>
        )
    }

    switch (view) {
      case 'upload':
        return <IngredientUploader onImageAnalyzed={handleImageAnalyzed} />;
      case 'generate':
        return <RecipeGenerator ingredients={analyzedIngredients} onGenerateRecipes={handleGenerateRecipes} preferences={preferences} onBack={handleBackToUploader}/>;
      case 'recipes':
        return <RecipeDisplay recipes={generatedRecipes} selectedRecipe={selectedRecipe} onSelectRecipe={setSelectedRecipe} onToggleFavorite={handleToggleFavorite} isFavorite={isFavorite} onAddToShoppingList={handleAddToShoppingList} onBack={analyzedIngredients.length > 0 ? handleBackToGenerator : handleBackToUploader}/>;
      case 'favorites':
        return <Favorites favorites={favorites} onSelectRecipe={setSelectedRecipe} onToggleFavorite={handleToggleFavorite} onAddToShoppingList={handleAddToShoppingList} />;
      case 'shopping_list':
        return <ShoppingList list={shoppingList} onToggleItem={handleToggleShoppingItem} onClearPurchased={handleClearPurchased} />;
      case 'settings':
        return <Settings preferences={preferences} onSave={setPreferences} />;
      case 'history':
        return <History history={history} onViewHistoryEntry={handleViewHistoryEntry} onClearHistory={handleClearHistory}/>
      default:
        return <IngredientUploader onImageAnalyzed={handleImageAnalyzed} />;
    }
  };
  
  if (!hasCompletedTutorial) {
      return <Tutorial onComplete={() => setHasCompletedTutorial(true)} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header activeView={view} onNavigate={handleNavigate} />
      <main className="flex-grow container mx-auto p-4">
        {renderContent()}
      </main>
      <footer className="text-center py-4 bg-white border-t">
        <p className="text-sm text-gray-500">Forged in the kitchen of Morokolo Chueu. &copy; {new Date().getFullYear()} Rocky's Chef's Vision.</p>
      </footer>
    </div>
  );
};

export default App;