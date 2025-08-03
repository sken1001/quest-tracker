"use client";

import React, { useState, ChangeEvent, useEffect } from 'react';
import { ProgressItem, ProgressState } from '@/types/progress';
import type { TableColumn } from 'react-data-table-component';
import { createTheme } from 'react-data-table-component';

// Dynamically import DataTable to ensure it's only loaded on the client side
const DataTable = React.lazy(() => import('react-data-table-component'));

createTheme('dark', {
  text: {
    primary: '#FFFFFF',
    secondary: '#BDC3C7',
  },
  background: {
    default: '#2C3E50',
  },
  context: {
    background: '#E74C3C',
    text: '#FFFFFF',
  },
  divider: {
    default: '#424242',
  },
  action: {
    button: 'rgba(0,0,0,.54)',
    hover: 'rgba(0,0,0,.08)',
    disabled: 'rgba(0,0,0,.12)',
  },
}, 'dark');

const progressSteps: ProgressState[] = ['未所持', '所持', '1段階目', '2段階目', '3段階目（完了）'];

const ProgressTracker: React.FC = () => {
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [filterText, setFilterText] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedItems = localStorage.getItem('progressTrackerData');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('progressTrackerData', JSON.stringify(items));
    }
  }, [items, isClient]);

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    const newItem: ProgressItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      progress: '未所持',
      completed: false,
    };
    setItems([...items, newItem]);
    setNewItemName('');
  };

  const handleProgressChange = (id: string, progressIndex: number) => {
    const progress = progressSteps[progressIndex];
    setItems(items.map(item => 
      item.id === id ? { ...item, progress, completed: progress === '3段階目（完了）' } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const exportFileDefaultName = 'progress_data.json';
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  const importFromJson = (event: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            if (e.target && typeof e.target.result === 'string') {
                const importedItems: ProgressItem[] = JSON.parse(e.target.result);
                setItems(importedItems);
            }
        };
    }
  };

  const columns: TableColumn<ProgressItem>[] = [
    {
      name: '項目名',
      selector: (row: ProgressItem) => row.name,
      sortable: true,
    },
    {
      name: '種別',
      selector: (row: ProgressItem) => row.type,
      sortable: true,
    },
    {
      name: '進捗',
      cell: (row: ProgressItem) => {
        const progressIndex = progressSteps.indexOf(row.progress);
        return (
          <div className="flex items-center w-full">
            <input 
              type="range" 
              min="0" 
              max="4" 
              value={progressIndex}
              onChange={(e) => handleProgressChange(row.id, parseInt(e.target.value))}
              className="range range-xs flex-grow"
            />
            <span className="ml-4 w-24 text-sm">{row.progress}</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      name: '完了',
      selector: (row: ProgressItem) => (row.completed ? 'はい' : 'いいえ'),
      sortable: true,
      cell: (row: ProgressItem) => <input type="checkbox" checked={row.completed} readOnly className="checkbox" />
    },
    {
      name: '',
      cell: (row: ProgressItem) => (
        <button onClick={() => handleDeleteItem(row.id)} className="text-red-500 hover:text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      ),
    },
  ];

  const filteredItems = items.filter(item => 
    (item.name && item.name.toLowerCase().includes(filterText.toLowerCase())) ||
    (item.type && item.type.toLowerCase().includes(filterText.toLowerCase()))
  );

  if (!isClient) {
    return null; // Render nothing on the server
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">進捗トラッカー</h1>

      <div className="mb-4 flex items-center gap-4">
        <input 
          type="text" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="新しい項目名"
          className="p-2 w-full max-w-xs border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
        />
        <input 
          list="type-options"
          value={newItemType} 
          onChange={(e) => setNewItemType(e.target.value)}
          placeholder="種別"
          className="p-2 w-full max-w-xs border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 h-10"
        />
        <datalist id="type-options">
          <option value="機能" />
          <option value="バグ" />
          <option value="雑務" />
          <option value="リファクタリング" />
        </datalist>
        <button onClick={handleAddItem} className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors">追加</button>
      </div>

      <div className="mb-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="項目名や種別で検索..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="p-2 w-full max-w-xs border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        <div className="flex gap-2">
          <button onClick={exportToJson} className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors">JSONエクスポート</button>
          <label className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors">
            JSONインポート
            <input type="file" accept=".json" onChange={importFromJson} className="hidden" />
          </label>
        </div>
      </div>

      <React.Suspense fallback={<div>テーブルを読み込み中...</div>}>
        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          paginationPerPage={100}
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
          persistTableHead
          theme="dark"
        />
      </React.Suspense>
    </div>
  );
};

export default ProgressTracker;
