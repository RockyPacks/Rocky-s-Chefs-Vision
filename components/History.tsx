import React from 'react';
import type { HistoryEntry } from '../types';

interface HistoryProps {
  history: HistoryEntry[];
  onViewHistoryEntry: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onViewHistoryEntry, onClearHistory }) => {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Generation History</h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-6">
          {history.map((entry) => (
            <div key={entry.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-bold text-gray-700">Generated on:</p>
                  <p className="text-gray-600">{new Date(entry.date).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => onViewHistoryEntry(entry)}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Recipes
                </button>
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="font-semibold text-gray-700 mb-2">Based on ingredients:</p>
                <div className="flex flex-wrap gap-2">
                  {entry.ingredients.map((ing, index) => (
                    <span key={index} className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                      {ing.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-16">
          <i className="fas fa-history text-6xl mb-4"></i>
          <p className="text-xl">No history yet. Your delicious past awaits!</p>
          <p>Analyze some ingredients to start making culinary history.</p>
        </div>
      )}
    </div>
  );
};

export default History;