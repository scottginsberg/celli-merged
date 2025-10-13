/**
 * Undo/Redo History System
 * Transaction ledger for data and UI changes
 * Extracted from merged2.html lines 12202-12205
 */

export const History = {
  dataPast: [], 
  dataFuture: [], 
  dataMax: 100, // cell value/formula changes
  uiPast: [], 
  uiFuture: [], 
  uiMax: 50 // selection/view changes
};

