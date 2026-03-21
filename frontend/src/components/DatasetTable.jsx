import React from 'react';
import { TableProperties } from 'lucide-react';
import { motion } from 'framer-motion';

const DatasetTable = ({ previewData, rightElement }) => {
  const { columns, data } = previewData;

  if (!columns || columns.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6 flex flex-col w-full overflow-hidden transition-all"
    >
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <TableProperties className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h2 className="font-black text-lg text-slate-800 dark:text-slate-100 tracking-tighter uppercase italic">Data Preview <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black ml-2 uppercase tracking-widest">(Stratified Preview - Max 10 Rows)</span></h2>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-6 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300 text-sm border-r border-slate-50 dark:border-slate-800 last:border-r-0"
                  >
                    {row[col] !== null && row[col] !== undefined ? row[col].toString() : <span className="text-slate-300 dark:text-slate-600 italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DatasetTable;
