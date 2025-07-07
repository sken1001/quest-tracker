// src/components/DeadlineHourSelector.tsx

'use client';

import React from 'react';

type DeadlineHourSelectorProps = {
  selectedHour: number | null;
  onChange: (hour: number | null) => void;
};

const DeadlineHourSelector: React.FC<DeadlineHourSelectorProps> = ({ selectedHour, onChange }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0時から23時

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="deadline-hour" className="text-sm font-medium">
        期限時刻:
      </label>
      <select
        id="deadline-hour"
        value={selectedHour ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="border border-gray-700 rounded px-3 py-2 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
      >
        <option value="">指定しない</option>
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {`${hour}:00`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DeadlineHourSelector;
