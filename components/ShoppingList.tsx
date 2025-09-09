import React from 'react';
import type { ShoppingListItem } from '../types';

interface ShoppingListProps {
  list: ShoppingListItem[];
  onToggleItem: (itemName: string, recipeName: string) => void;
  onClearPurchased: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ list, onToggleItem, onClearPurchased }) => {
  const groupedByRecipe = list.reduce((acc, item) => {
    (acc[item.recipeName] = acc[item.recipeName] || []).push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const hasPurchasedItems = list.some(item => item.purchased);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Shopping List</h2>
        {list.length > 0 && (
          <button 
            onClick={onClearPurchased}
            disabled={!hasPurchasedItems}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Clear Purchased
          </button>
        )}
      </div>

      {list.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedByRecipe).map(([recipeName, items]) => (
            <div key={recipeName} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-green-700 mb-3 border-b pb-2">{recipeName}</h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={`${recipeName}-${item.name}`} className="flex items-center">
                    <label className="flex items-center cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={item.purchased}
                        onChange={() => onToggleItem(item.name, item.recipeName)}
                        className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className={`ml-3 text-gray-700 ${item.purchased ? 'line-through text-gray-400' : ''}`}>
                        <strong>{item.amount}</strong> {item.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-16">
          <i className="fas fa-shopping-cart text-6xl mb-4"></i>
          <p className="text-xl">Your shopping list is looking lean.</p>
          <p>Let's find some delicious trouble to get into! Add ingredients from a recipe.</p>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;