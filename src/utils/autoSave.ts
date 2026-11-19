import { AutoSaveBackup, MDFile } from '../types';
import { getDocumentStats } from './markdownParser';

export const AUTOSAVE_INTERVAL_MS = 30_000;
export const AUTOSAVE_CURRENT_KEY = 'md_app_autosave_current';
export const AUTOSAVE_BACKUPS_KEY = 'md_app_autosave_backups';

/**
 * Safely reads all per-file auto-save backups from localStorage.
 */
export function getAllAutoSaveBackups(): Record<string, AutoSaveBackup> {
  try {
    const raw = localStorage.getItem(AUTOSAVE_BACKUPS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, AutoSaveBackup>;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Retrieves the latest auto-saved backup copy for a specific file.
 */
export function getAutoSaveBackup(fileId: string): AutoSaveBackup | null {
  const backups = getAllAutoSaveBackups();
  if (backups[fileId]) {
    return backups[fileId];
  }

  try {
    const currentRaw = localStorage.getItem(AUTOSAVE_CURRENT_KEY);
    if (!currentRaw) return null;
    const current = JSON.parse(currentRaw) as AutoSaveBackup;
    return current?.fileId === fileId ? current : null;
  } catch {
    return null;
  }
}

/**
 * Saves a backup copy of the active file's content to localStorage.
 * Persists both a dedicated current-file key and a per-file backup map.
 */
export function saveAutoSaveBackup(file: MDFile): AutoSaveBackup | null {
  const backup: AutoSaveBackup = {
    fileId: file.id,
    fileName: file.name,
    filePath: file.path,
    content: file.content,
    savedAt: Date.now(),
    wordCount: getDocumentStats(file.content).words,
  };

  try {
    localStorage.setItem(AUTOSAVE_CURRENT_KEY, JSON.stringify(backup));
    const existing = getAllAutoSaveBackups();
    existing[file.id] = backup;
    localStorage.setItem(AUTOSAVE_BACKUPS_KEY, JSON.stringify(existing));
    return backup;
  } catch (err) {
    console.warn('Auto-save to localStorage failed:', err);
    return null;
  }
}

/**
 * Removes the stored auto-save backup for a deleted file.
 */
export function deleteAutoSaveBackup(fileId: string): void {
  try {
    const existing = getAllAutoSaveBackups();
    if (fileId in existing) {
      delete existing[fileId];
      localStorage.setItem(AUTOSAVE_BACKUPS_KEY, JSON.stringify(existing));
    }

    const currentRaw = localStorage.getItem(AUTOSAVE_CURRENT_KEY);
    if (currentRaw) {
      const current = JSON.parse(currentRaw) as AutoSaveBackup;
      if (current?.fileId === fileId) {
        localStorage.removeItem(AUTOSAVE_CURRENT_KEY);
      }
    }
  } catch {
    // Ignore storage cleanup errors
  }
}

/**
 * Formats an auto-save timestamp as HH:MM:SS.
 */
export function formatAutoSaveTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
