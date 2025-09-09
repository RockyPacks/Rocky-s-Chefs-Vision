export interface AnalyzedIngredient {
  name: string;
  quantity: string;
  freshness: 'Fresh' | 'Good' | 'Okay' | 'Near Spoiled' | 'Spoiled';
  freshness_reason: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface DrinkPairings {
  wine: string;
  beer: string;
  cocktail: string;
  nonAlcoholic: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  cookingTime: string;
  calories: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutritional_warning: string | null;
  drinkPairings: DrinkPairings;
}

export interface UserPreferences {
  diet: string;
  allergies: string;
  cookTime: 'any' | 'short' | 'medium' | 'long';
  difficulty: 'any' | 'Easy' | 'Medium' | 'Hard';
  goal: 'none' | 'healthy_eating' | 'weight_loss' | 'save_money' | 'cook_faster';
}

export interface ShoppingListItem {
  name: string;
  amount: string;
  recipeName: string;
  purchased: boolean;
}

export interface HistoryEntry {
  id: string;
  date: string;
  ingredients: AnalyzedIngredient[];
  recipes: Recipe[];
}