import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const SectionHeader = ({ title, icon: Icon, actionButton }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
    {actionButton}
  </div>
);

export const ModalContainer = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);
