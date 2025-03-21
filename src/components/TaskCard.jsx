import React from 'react';
import { format } from 'date-fns';
import { Trash2, CheckCircle, XCircle, FileText, Edit } from 'lucide-react';

export function TaskCard({ task, onToggleComplete, onDelete, onEdit }) {
  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
          <p className="text-sm text-gray-500">{task.description}</p>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <span className="text-gray-500">
          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
        </span>
        <span className={`font-medium ${priorityColors[task.priority]}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      {task.fileName && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FileText className="w-4 h-4" />
          <span>{task.fileName}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`flex items-center space-x-2 ${task.completed ? 'text-green-600' : 'text-gray-500'} hover:text-green-700`}
        >
          {task.completed ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Completed</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              <span>Mark Complete</span>
            </>
          )}
        </button>
        <button
          onClick={() => onEdit(task)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <Edit className="w-5 h-5" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
}