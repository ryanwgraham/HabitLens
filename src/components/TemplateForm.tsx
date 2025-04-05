import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, GripVertical } from 'lucide-react';
import { Field } from '../types';
import { useTrackingStore } from '../store/trackingStore';
import { supabase } from '../lib/supabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TemplateFormProps {
  editingTemplate?: {
    id: string;
    name: string;
    fields: Field[];
  } | null;
  onCancel?: () => void;
}

interface SortableFieldProps {
  field: Field;
  index: number;
  updateField: (index: number, updates: Partial<Field>) => void;
  removeField: (index: number) => void;
}

function SortableField({ field, index, updateField, removeField }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-4 bg-white rounded-xl p-2 ${
        isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
      }`}
    >
      <button
        type="button"
        className="p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <input
        type="text"
        value={field.name}
        onChange={(e) => updateField(index, { name: e.target.value })}
        placeholder="Field name"
        className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
        required
      />
      <select
        value={field.type}
        onChange={(e) => updateField(index, { type: e.target.value as Field['type'] })}
        className="rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="date">Date</option>
        <option value="select">Select</option>
        <option value="rating">Rating</option>
      </select>
      <button
        type="button"
        onClick={() => removeField(index)}
        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

export function TemplateForm({ editingTemplate, onCancel }: TemplateFormProps) {
  const { addTemplate, updateTemplate, loading } = useTrackingStore();
  const [name, setName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name);
      setFields(editingTemplate.fields);
    } else {
      // Reset form when not editing
      setName('');
      setFields([]);
    }
  }, [editingTemplate]);

  const addField = () => {
    const newField: Field = {
      id: crypto.randomUUID(),
      name: '',
      type: 'text',
      required: false
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, { name, fields });
      onCancel?.();
    } else {
      await addTemplate({
        name,
        fields,
        user_id: user.id
      });
      setName('');
      setFields([]);
    }
  };

  const handleCancel = () => {
    // Reset form state
    setName('');
    setFields([]);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Template Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          required
        />
      </div>

      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <SortableField
                key={field.id}
                field={field}
                index={index}
                updateField={updateField}
                removeField={removeField}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={addField}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border-2 border-primary text-sm font-medium rounded-xl text-primary hover:bg-primary/5 disabled:opacity-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-accent-purple text-sm font-medium rounded-xl text-white hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
        </button>
        {editingTemplate && (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}