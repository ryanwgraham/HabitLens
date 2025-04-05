import React, { useEffect, useState } from 'react';
import { TemplateForm } from './components/TemplateForm';
import { EntryForm } from './components/EntryForm';
import { EntriesList } from './components/EntriesList';
import { Analysis } from './components/Analysis';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { useTrackingStore } from './store/trackingStore';
import { useAuthStore } from './store/authStore';
import { LogOut, Sparkles, Edit2, Trash2, PlusCircle, Settings as SettingsIcon } from 'lucide-react';
import { Template } from './types';

function LensLogo() {
  return (
    <div className="relative w-10 h-10">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent-purple"></div>
      {/* Inner ring */}
      <div className="absolute inset-1 rounded-full bg-white/90"></div>
      {/* Lens elements */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-accent-purple">
        <div className="absolute inset-1 rounded-full bg-white/20"></div>
        {/* Lens reflection */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/80"></div>
      </div>
      {/* Focus rings */}
      <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
      <div className="absolute inset-[6px] rounded-full border border-white/20"></div>
    </div>
  );
}

function App() {
  const { templates, activeTemplate, setActiveTemplate, fetchTemplates, deleteTemplate, loading, error } = useTrackingStore();
  const { user, loading: authLoading, signOut, checkUser } = useAuthStore();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user, fetchTemplates]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-purple/20 to-accent-pink/20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      await deleteTemplate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-purple/20 to-accent-pink/20">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LensLogo />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
                Habit Lens
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`inline-flex items-center px-6 py-3 rounded-full ${
                  showSettings
                    ? 'text-white bg-gradient-to-r from-secondary to-accent-purple'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button
                onClick={signOut}
                className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-primary to-accent-purple hover:opacity-90 transition-opacity"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : showSettings ? (
          <Settings />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border-2 border-accent-yellow/20 hover:border-accent-yellow/40 transition-colors">
                <div className="flex items-center space-x-2 mb-6">
                  <Sparkles className="h-6 w-6 text-accent-yellow" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingTemplate ? 'Edit Template' : 'Create Template'}
                  </h2>
                </div>
                <TemplateForm
                  editingTemplate={editingTemplate}
                  onCancel={() => setEditingTemplate(null)}
                />
              </div>

              {templates.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Template</h2>
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`flex items-center justify-between rounded-xl transition-all ${
                          activeTemplate?.id === template.id
                            ? 'bg-gradient-to-r from-secondary to-accent-purple text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <button
                          onClick={() => setActiveTemplate(template)}
                          className="flex-1 text-left px-6 py-4"
                        >
                          {template.name}
                        </button>
                        <div className="flex space-x-2 px-4">
                          <button
                            onClick={() => setEditingTemplate(template)}
                            className={`p-2 rounded-lg ${
                              activeTemplate?.id === template.id
                                ? 'hover:bg-white/20'
                                : 'hover:bg-gray-200'
                            }`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className={`p-2 rounded-lg ${
                              activeTemplate?.id === template.id
                                ? 'hover:bg-white/20'
                                : 'hover:bg-gray-200'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {activeTemplate && (
              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border-2 border-accent-purple/20 hover:border-accent-purple/40 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {showNewEntry ? 'New Entry' : 'Entries'}
                    </h2>
                    <button
                      onClick={() => setShowNewEntry(!showNewEntry)}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-primary border-2 border-primary hover:bg-primary/5"
                    >
                      {showNewEntry ? (
                        'View Entries'
                      ) : (
                        <>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          New Entry
                        </>
                      )}
                    </button>
                  </div>
                  {showNewEntry ? <EntryForm /> : <EntriesList />}
                </div>

                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border-2 border-accent-pink/20 hover:border-accent-pink/40 transition-colors">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Analyze Data</h2>
                  <Analysis />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;