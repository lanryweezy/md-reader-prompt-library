import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  X,
  Check,
  Copy,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Grid,
} from 'lucide-react';

interface TableGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (snippet: string) => void;
}

type Alignment = 'left' | 'center' | 'right';

interface TablePreset {
  id: string;
  name: string;
  description: string;
  cols: string[];
  alignments: Alignment[];
  sampleRows: string[][];
}

const PRESETS: TablePreset[] = [
  {
    id: 'custom',
    name: 'Custom Grid',
    description: 'Configure custom row and column dimensions',
    cols: ['Header 1', 'Header 2', 'Header 3'],
    alignments: ['left', 'left', 'left'],
    sampleRows: [
      ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
      ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3'],
    ],
  },
  {
    id: 'comparison',
    name: 'Feature Comparison',
    description: 'Compare plans, products, or specifications',
    cols: ['Feature', 'Free Tier', 'Pro Plan', 'Enterprise'],
    alignments: ['left', 'center', 'center', 'center'],
    sampleRows: [
      ['Storage Space', '5 GB', '100 GB', 'Unlimited'],
      ['Custom Domains', '❌', '✅', '✅'],
      ['24/7 Priority Support', '❌', '❌', '✅'],
      ['API Access', 'Basic', 'Full', 'Dedicated'],
    ],
  },
  {
    id: 'task_tracker',
    name: 'Task & Project Status',
    description: 'Track items, assignees, priorities, and deadlines',
    cols: ['Task ID', 'Description', 'Priority', 'Assignee', 'Status'],
    alignments: ['left', 'left', 'center', 'left', 'center'],
    sampleRows: [
      ['TSK-101', 'Accessibility light mode audit', 'High', 'Alex', 'In Progress'],
      ['TSK-102', 'Table generator component', 'Medium', 'Sarah', 'Done'],
      ['TSK-103', 'Optimize bundle size', 'Low', 'Dev Team', 'Pending'],
    ],
  },
  {
    id: 'api_params',
    name: 'API Endpoint Parameters',
    description: 'Document request parameters or response payload fields',
    cols: ['Parameter', 'Type', 'Required', 'Default', 'Description'],
    alignments: ['left', 'center', 'center', 'left', 'left'],
    sampleRows: [
      ['`query`', 'string', 'Yes', '—', 'Search string term'],
      ['`page`', 'number', 'No', '`1`', 'Page number offset'],
      ['`limit`', 'number', 'No', '`20`', 'Items per page result'],
    ],
  },
  {
    id: 'metrics',
    name: 'KPI & Metrics Summary',
    description: 'Financial, performance, or analytics report',
    cols: ['Metric', 'Q1 Target', 'Q1 Actual', 'Growth %', 'Health'],
    alignments: ['left', 'right', 'right', 'right', 'center'],
    sampleRows: [
      ['Monthly Active Users', '50,000', '58,200', '+16.4%', '🟢 On Track'],
      ['Conversion Rate', '3.5%', '3.8%', '+8.5%', '🟢 On Track'],
      ['Customer Churn', '< 2.0%', '2.4%', '+0.4%', '🟡 Attention'],
    ],
  },
];

export const TableGeneratorModal: React.FC<TableGeneratorModalProps> = ({
  isOpen,
  onClose,
  onInsertTable,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');
  const [colsCount, setColsCount] = useState<number>(3);
  const [rowsCount, setRowsCount] = useState<number>(3);
  const [hoverGrid, setHoverGrid] = useState<{ rows: number; cols: number } | null>(null);

  // Column header titles & alignments state
  const [headers, setHeaders] = useState<string[]>(['Header 1', 'Header 2', 'Header 3']);
  const [alignments, setAlignments] = useState<Alignment[]>(['left', 'left', 'left']);
  
  // Data rows state
  const [tableData, setTableData] = useState<string[][]>([
    ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
    ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3'],
    ['Row 3, Col 1', 'Row 3, Col 2', 'Row 3, Col 3'],
  ]);

  const [fillSampleData, setFillSampleData] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Preset selection
  const handleSelectPreset = (preset: TablePreset) => {
    setSelectedPresetId(preset.id);
    setHeaders([...preset.cols]);
    setAlignments([...preset.alignments]);
    setTableData(preset.sampleRows.map((r) => [...r]));
    setColsCount(preset.cols.length);
    setRowsCount(preset.sampleRows.length);
  };

  // Adjust Grid Dimensions
  const updateGridDimensions = (newCols: number, newRows: number) => {
    const validCols = Math.max(1, Math.min(10, newCols));
    const validRows = Math.max(1, Math.min(20, newRows));

    setColsCount(validCols);
    setRowsCount(validRows);

    // Update Headers
    setHeaders((prev) => {
      const next = [...prev];
      if (validCols > next.length) {
        for (let i = next.length; i < validCols; i++) {
          next.push(`Header ${i + 1}`);
        }
      } else {
        next.length = validCols;
      }
      return next;
    });

    // Update Alignments
    setAlignments((prev) => {
      const next = [...prev];
      if (validCols > next.length) {
        for (let i = next.length; i < validCols; i++) {
          next.push('left');
        }
      } else {
        next.length = validCols;
      }
      return next;
    });

    // Update Table Data
    setTableData((prev) => {
      const nextData: string[][] = [];
      for (let r = 0; r < validRows; r++) {
        const row = prev[r] ? [...prev[r]] : [];
        if (validCols > row.length) {
          for (let c = row.length; c < validCols; c++) {
            row.push(fillSampleData ? `Data ${r + 1}-${c + 1}` : '');
          }
        } else {
          row.length = validCols;
        }
        nextData.push(row);
      }
      return nextData;
    });
  };

  // Toggle Alignment for a column
  const toggleAlignment = (colIndex: number) => {
    setAlignments((prev) => {
      const next = [...prev];
      const current = next[colIndex];
      if (current === 'left') next[colIndex] = 'center';
      else if (current === 'center') next[colIndex] = 'right';
      else next[colIndex] = 'left';
      return next;
    });
  };

  // Cell Content change
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    setTableData((prev) => {
      const next = prev.map((r) => [...r]);
      if (next[rowIndex]) {
        next[rowIndex][colIndex] = value;
      }
      return next;
    });
  };

  // Header Title change
  const handleHeaderChange = (colIndex: number, value: string) => {
    setHeaders((prev) => {
      const next = [...prev];
      next[colIndex] = value;
      return next;
    });
  };

  // Generate Markdown syntax
  const generatedMarkdown = useMemo(() => {
    if (headers.length === 0) return '';

    // Calculate max column widths for pristine formatting
    const widths = headers.map((h, colIdx) => {
      let maxLen = Math.max(3, h.length);
      tableData.forEach((row) => {
        const cell = row[colIdx] || '';
        if (cell.length > maxLen) maxLen = cell.length;
      });
      return maxLen;
    });

    // Header line
    const headerRow = `| ${headers.map((h, i) => h.padEnd(widths[i])).join(' | ')} |`;

    // Separator line with alignment indicators
    const separatorRow = `| ${alignments
      .map((align, i) => {
        const w = widths[i];
        if (align === 'center') return `:${'-'.repeat(Math.max(1, w - 2))}:`;
        if (align === 'right') return `${'-'.repeat(Math.max(1, w - 1))}:`;
        return `:${'-'.repeat(Math.max(1, w - 1))}`;
      })
      .join(' | ')} |`;

    // Data rows
    const dataRows = tableData.map((row) => {
      return `| ${headers
        .map((_, colIdx) => {
          const val = row[colIdx] || '';
          return val.padEnd(widths[colIdx]);
        })
        .join(' | ')} |`;
    });

    return `\n${headerRow}\n${separatorRow}\n${dataRows.join('\n')}\n`;
  }, [headers, alignments, tableData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    onInsertTable(generatedMarkdown);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-800 dark:text-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                Markdown Table Generator
                <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono border border-zinc-300 dark:border-zinc-700">
                  {colsCount} × {rowsCount} Grid
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Interactively construct, align, and customize Markdown tables
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Close table generator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-zinc-50/50 dark:bg-zinc-950/50">
          {/* Section 1: Presets & Grid Chooser */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Presets Column */}
            <div className="lg:col-span-2 space-y-3">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                <span>Quick Table Templates</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESETS.map((preset) => {
                  const isActive = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? 'bg-white dark:bg-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm ring-1 ring-zinc-900 dark:ring-zinc-100'
                          : 'bg-white/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                            {preset.name}
                          </span>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                          {preset.description}
                        </p>
                      </div>
                      <div className="mt-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                        <span>{preset.cols.length} cols</span>
                        <span>•</span>
                        <span>{preset.sampleRows.length} rows</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Grid Hover Picker & Spinners */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Quick Grid Selector</span>
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {hoverGrid ? `${hoverGrid.cols} × ${hoverGrid.rows}` : `${colsCount} × ${rowsCount}`}
                  </span>
                </label>

                {/* 6x6 Interactive Grid Cells */}
                <div
                  className="grid grid-cols-6 gap-1 p-2 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800/80"
                  onMouseLeave={() => setHoverGrid(null)}
                >
                  {Array.from({ length: 36 }).map((_, idx) => {
                    const r = Math.floor(idx / 6) + 1;
                    const c = (idx % 6) + 1;
                    const isHovered =
                      hoverGrid && c <= hoverGrid.cols && r <= hoverGrid.rows;
                    const isSelected =
                      !hoverGrid && c <= colsCount && r <= rowsCount;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onMouseEnter={() => setHoverGrid({ rows: r, cols: c })}
                        onClick={() => {
                          setSelectedPresetId('custom');
                          updateGridDimensions(c, r);
                        }}
                        className={`h-6 rounded border transition-all cursor-pointer ${
                          isHovered || isSelected
                            ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                        aria-label={`${c} columns by ${r} rows`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Exact Spinners for Rows & Columns */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
                    Columns (1-10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={colsCount}
                    onChange={(e) => {
                      setSelectedPresetId('custom');
                      updateGridDimensions(parseInt(e.target.value) || 1, rowsCount);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
                    Rows (1-20)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={rowsCount}
                    onChange={(e) => {
                      setSelectedPresetId('custom');
                      updateGridDimensions(colsCount, parseInt(e.target.value) || 1);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Table Header & Cell Content Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <span>Table Content & Column Alignments</span>
                <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                  (Click alignment icons to toggle Left / Center / Right)
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setSelectedPresetId('custom');
                  updateGridDimensions(colsCount, rowsCount + 1);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-2.5 text-center text-[11px] font-mono text-zinc-400 w-10">#</th>
                    {headers.map((h, colIdx) => {
                      const align = alignments[colIdx] || 'left';
                      return (
                        <th key={colIdx} className="p-2 min-w-[130px] border-r border-zinc-200/80 dark:border-zinc-800/80 last:border-r-0">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                                Col {colIdx + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleAlignment(colIdx)}
                                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                                title={`Alignment: ${align} (Click to toggle)`}
                                aria-label={`Toggle alignment for Column ${colIdx + 1}, currently ${align}`}
                              >
                                {align === 'left' && <AlignLeft className="w-3 h-3" />}
                                {align === 'center' && <AlignCenter className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                                {align === 'right' && <AlignRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                              </button>
                            </div>

                            <input
                              type="text"
                              value={h}
                              onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                              placeholder={`Header ${colIdx + 1}`}
                              className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                            />
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {tableData.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50 transition-colors"
                    >
                      <td className="p-2 text-center text-[10px] font-mono text-zinc-400">
                        {rowIdx + 1}
                      </td>
                      {headers.map((_, colIdx) => (
                        <td
                          key={colIdx}
                          className="p-1.5 border-r border-zinc-100 dark:border-zinc-800/50 last:border-r-0"
                        >
                          <input
                            type="text"
                            value={row[colIdx] || ''}
                            onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                            placeholder="Cell text..."
                            className="w-full px-2 py-1 rounded bg-zinc-50/80 dark:bg-zinc-950/80 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 focus:border-zinc-400 focus:bg-white dark:focus:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Live Syntax Code Output */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Generated Markdown Code
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 font-mono text-xs overflow-x-auto whitespace-pre custom-scrollbar">
              {generatedMarkdown}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleInsert}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <TableIcon className="w-4 h-4" />
            <span>Insert Table into Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
