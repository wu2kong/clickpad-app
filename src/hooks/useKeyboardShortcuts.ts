import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

interface KeyboardShortcutsProps {
  onSearch?: () => void;
  onNewAction?: () => void;
  onOpenSettings?: () => void;
}

export function useKeyboardShortcuts({ onSearch, onNewAction, onOpenSettings }: KeyboardShortcutsProps) {
  const shortcuts = useSettingsStore((state) => state.settings.shortcuts);

  const parseShortcut = useCallback((shortcut: string): { key: string; hasCmdOrCtrl: boolean; alt: boolean; shift: boolean } => {
    const parts = shortcut.split('+');
    const key = parts[parts.length - 1].toLowerCase();
    const hasCmdOrCtrl = parts.includes('CommandOrControl') || parts.includes('Meta') || parts.includes('Ctrl');
    const alt = parts.includes('Alt');
    const shift = parts.includes('Shift');
    return { key, hasCmdOrCtrl, alt, shift };
  }, []);

  const matchesShortcut = useCallback((
    event: KeyboardEvent,
    shortcut: string
  ): boolean => {
    const parsed = parseShortcut(shortcut);
    
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const hasCmdOrCtrlPressed = isMac ? event.metaKey : event.ctrlKey;

    // Check modifiers match
    if (parsed.hasCmdOrCtrl && !hasCmdOrCtrlPressed) return false;
    if (!parsed.hasCmdOrCtrl && hasCmdOrCtrlPressed) return false;
    if (parsed.alt !== event.altKey) return false;
    if (parsed.shift !== event.shiftKey) return false;

    // Check key match
    const eventKey = event.key.toLowerCase();
    
    if (parsed.key === eventKey) return true;
    if (parsed.key === 'space' && eventKey === ' ') return true;
    if (parsed.key === 'comma' && eventKey === ',') return true;
    
    return false;
  }, [parseShortcut]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (onSearch && matchesShortcut(event, shortcuts.search)) {
        event.preventDefault();
        onSearch();
        return;
      }

      if (onNewAction && matchesShortcut(event, shortcuts.newAction)) {
        event.preventDefault();
        onNewAction();
        return;
      }

      if (onOpenSettings && matchesShortcut(event, shortcuts.openSettings)) {
        event.preventDefault();
        onOpenSettings();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, onSearch, onNewAction, onOpenSettings, matchesShortcut]);
}