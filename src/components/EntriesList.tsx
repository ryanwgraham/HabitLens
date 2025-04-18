import React, { useState } from 'react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { useTrackingStore } from '../store/trackingStore';
import { Calendar, Star, Hash, Type, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Entry } from '../types';
import { EntryForm } from './EntryForm';

interface GroupedEntries {
  [key: string]: Entry[];
}

export function EntriesList() {
  const { entries, activeTemplate, deleteEntry } = useTrackingStore();
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  // Initialize expanded sections with current month expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    const currentDate = new Date();
    
    entries.forEach(entry => {
      const entryDate = parseISO(entry.date);
      const monthYear = format(entryDate, 'MMMM yyyy');
      if (!initialState.hasOwnProperty(monthYear)) {
        initialState[monthYear] = isSameMonth(currentDate, entryDate);
      }
    });
    
    return initialState;
  });

  if (!activeTemplate || entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No entries yet. Start tracking by adding your first entry!
      </div>
    );
  }

  // Group entries by month and year
  const groupedEntries = entries.reduce<GroupedEntries>((groups, entry) => {
    const date = parseISO(entry.date);
    const key = format(date, 'MMMM yyyy');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
    return groups;
  }, {});

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

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const toggleEntry = (entryId: string) => {
    setExpandedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
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
    <div className="space-y-6">
      {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => {
        const isExpanded = expandedSections[monthYear] ?? false;

        return (
          <div
            key={monthYear}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => toggleSection(monthYear)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">{monthYear}</h3>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            <div
              className={`transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}
            >
              <div className="divide-y divide-gray-100">
                {monthEntries.map((entry) => {
                  const isEntryExpanded = expandedEntries[entry.id] ?? false;

                  return (
                    <div
                      key={entry.id}
                      className="hover:bg-gray-50 transition-colors relative group"
                    >
                      <div
                        className="p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleEntry(entry.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {format(parseISO(entry.date), 'MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingEntry(entry);
                              }}
                              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEntry(entry.id);
                              }}
                              className="p-2 rounded-lg bg-gray-50 text-red-500 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {isEntryExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isEntryExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="px-6 pb-6 pt-2 grid gap-4">
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}