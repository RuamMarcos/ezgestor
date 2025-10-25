import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const MyAccountPage: React.FC = () => {
  const { themeSetting, isDark, previewTheme, setPreview, applyTheme, cancelPreview } = useTheme();
  const [localChoice, setLocalChoice] = useState<'light'|'dark'|'system'>(themeSetting);

  const handlePreview = (choice: 'light'|'dark'|'system') => {
    setLocalChoice(choice);
    setPreview(choice);
  };

  const handleApply = async () => {
    await applyTheme(localChoice);
  };

  const handleCancel = () => {
    setLocalChoice(themeSetting);
    cancelPreview();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Minha Conta</h1>

      <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tema</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Escolha entre Claro, Escuro ou Automático (segue o sistema).</p>

        <div className="mt-4 flex gap-2">
          {(['light','dark','system'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => handlePreview(opt)}
              className={`px-3 py-2 rounded-md text-sm border transition-colors ${localChoice===opt ? 'border-blue-600 text-blue-700 dark:text-blue-300' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-700`}
            >
              {opt === 'light' ? 'Claro' : opt === 'dark' ? 'Escuro' : 'Automático'}
            </button>
          ))}
        </div>

       {/*  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <span>Pré-visualizando: {previewTheme ?? themeSetting} • Resolução atual: {isDark ? 'Escuro' : 'Claro'}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={handleApply} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Aplicar</button>
          <button onClick={handleCancel} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Cancelar</button>
        </div> */}
      </div>
    </div>
  );
};

export default MyAccountPage;