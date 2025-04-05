import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTrackingStore } from '../store/trackingStore';
import { Calendar, Star, Hash, Type, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Entry } from '../types';
import { EntryForm } from './EntryForm';

export function EntriesList() {
  const { entries, activeTemplate, deleteEntry } = useTrackingStore();
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  if (!activeTemplate || entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No entries yet. Start tracking by adding your first entry!
      </div>
    );
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'rating':
        return <Star className="h-4 w-4" />;
      case 'number':
        return <Hash className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const getRatingLabel = (rating: number) => {
    const labels = ['Poor', 'Below average', 'Average', 'Above average', 'Excellent'];
    return labels[rating - 1];
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      await deleteEntry(id);
    }
  };

  if (editingEntry) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Edit Entry</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleDeleteEntry(editingEntry.id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete Entry
            </button>
            <button
              onClick={() => setEditingEntry(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
        <EntryForm editingEntry={editingEntry} onSaved={() => setEditingEntry(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative group"
        >
          <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditingEntry(entry)}
              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteEntry(entry.id)}
              className="p-2 rounded-lg bg-gray-50 text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center text-gray-500 mb-4">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {format(new Date(entry.date), 'MMMM d, yyyy')}
            </span>
          </div>
          
          <div className="grid gap-4">
            {activeTemplate.fields.map((field) => (
              <div key={field.id} className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                  {getFieldIcon(field.type)}
                </div>
                <div>
                  <div className="text-sm text-gray-500">{field.name}</div>
                  {field.type === 'rating' ? (
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className={`w-5 h-5 ${
                              rating <= entry.values[field.id]
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {getRatingLabel(entry.values[field.id])}
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {entry.values[field.id]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}