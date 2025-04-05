import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTrackingStore } from '../store/trackingStore';
import { supabase } from '../lib/supabase';
import { Calendar, Star } from 'lucide-react';

export function EntryForm() {
  const { activeTemplate, addEntry, loading } = useTrackingStore();
  const [values, setValues] = useState<Record<string, any>>({});
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  if (!activeTemplate) {
    return <div>Please select a template first</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await addEntry({
      template_id: activeTemplate.id,
      user_id: user.id,
      date: entryDate,
      values
    });

    setValues({});
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setValues({ ...values, [fieldId]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entry Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="pl-10 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            required
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {activeTemplate.fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.name}
          </label>
          {field.type === 'rating' ? (
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleInputChange(field.id, rating)}
                  className="relative group"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      rating <= (values[field.id] || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 group-hover:fill-yellow-200 group-hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
              <div className="ml-2 text-sm text-gray-500">
                {values[field.id] ? (
                  ['Poor', 'Below average', 'Average', 'Above average', 'Excellent'][
                    values[field.id] - 1
                  ]
                ) : (
                  'Select rating'
                )}
              </div>
            </div>
          ) : field.type === 'date' ? (
            <div className="relative">
              <input
                type="date"
                value={values[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="pl-10 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                required={field.required}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          ) : (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={values[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              required={field.required}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent-purple text-sm font-medium rounded-xl text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Saving...' : 'Save Entry'}
      </button>
    </form>
  );
}