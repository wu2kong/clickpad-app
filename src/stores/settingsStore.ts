import { create } from 'zustand';
import type { AppSettings, GeneralSettings, ShortcutsSettings, AdvancedSettings, ThemeMode } from '../types/settings';
import { defaultSettings } from '../types/settings';
import { storage } from '../services/storage';
import { invoke } from '@tauri-apps/api/core';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  isInitialized: boolean;
  previousGlobalShortcut: string | null;
  
  initializeSettings: () => Promise<void>;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  updateShortcutsSettings: (settings: Partial<ShortcutsSettings>) => void;
  updateAdvancedSettings: (settings: Partial<AdvancedSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleAutoStart: () => void;
  toggleSilentStart: () => void;
  toggleMinimizeToTray: () => void;
  setPreferredTerminal: (terminal: string) => void;
  setPreferredTextEditor: (editor: string) => void;
  setPreferredMarkdownEditor: (editor: string) => void;
  toggleAutoBackup: () => void;
  setBackupDir: (dir: string) => void;
  toggleCloudSync: () => void;
  resetToDefaults: () => void;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  isInitialized: false,
  previousGlobalShortcut: null,

  initializeSettings: async () => {
    set({ isLoading: true });
    try {
      let settings = await storage.loadSettings();
      // Ensure all settings objects exist with defaults
      if (!settings.general) {
        settings = { ...settings, general: defaultSettings.general };
      } else {
        settings.general = { ...defaultSettings.general, ...settings.general };
      }
      if (!settings.shortcuts) {
        settings = { ...settings, shortcuts: defaultSettings.shortcuts };
      } else {
        settings.shortcuts = { ...defaultSettings.shortcuts, ...settings.shortcuts };
      }
      if (!settings.advanced) {
        settings = { ...settings, advanced: defaultSettings.advanced };
      } else {
        settings.advanced = { ...defaultSettings.advanced, ...settings.advanced };
      }
      set({ 
        settings, 
        isInitialized: true,
        previousGlobalShortcut: settings.shortcuts.globalInvoke 
      });
      try {
        await invoke('set_minimize_to_tray', { enabled: settings.general.minimizeToTray });
        console.log('[Settings] Initialized minimizeToTray to', settings.general.minimizeToTray);
      } catch (e) {
        console.error('[Settings] Failed to init minimizeToTray:', e);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ settings: defaultSettings, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  updateGeneralSettings: (generalSettings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        general: { ...state.settings.general, ...generalSettings },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  updateShortcutsSettings: (shortcutsSettings) => {
    const prevShortcut = get().settings.shortcuts.globalInvoke;
    
    set((state) => ({
      settings: {
        ...state.settings,
        shortcuts: { ...state.settings.shortcuts, ...shortcutsSettings },
      },
    }));
    
    if (shortcutsSettings.globalInvoke && shortcutsSettings.globalInvoke !== prevShortcut) {
      setTimeout(async () => {
        try {
          await invoke('update_global_shortcut', { 
            oldShortcut: prevShortcut || null,
            newShortcut: shortcutsSettings.globalInvoke 
          });
          set({ previousGlobalShortcut: shortcutsSettings.globalInvoke });
          console.log('[Settings] Updated global shortcut to', shortcutsSettings.globalInvoke);
        } catch (e) {
          console.error('[Settings] Failed to update global shortcut:', e);
        }
      }, 0);
    }
    
    setTimeout(() => get().saveSettings(), 0);
  },

  updateAdvancedSettings: (advancedSettings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        advanced: { ...state.settings.advanced, ...advancedSettings },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  setTheme: (theme) => {
    set((state) => ({
      settings: {
        ...state.settings,
        general: { ...state.settings.general, theme },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  toggleAutoStart: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        general: {...state.settings.general, autoStart: !state.settings.general.autoStart },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  toggleSilentStart: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        general: { ...state.settings.general, silentStart: !state.settings.general.silentStart },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  toggleMinimizeToTray: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        general: { ...state.settings.general, minimizeToTray: !state.settings.general.minimizeToTray },
      },
    }));
    setTimeout(async () => {
      await get().saveSettings();
      const newValue = get().settings.general.minimizeToTray;
      try {
        await invoke('set_minimize_to_tray', { enabled: newValue });
        console.log('[Settings] Set minimizeToTray to', newValue);
      } catch (e) {
        console.error('[Settings] Failed to set minimizeToTray:', e);
      }
    }, 0);
  },

  setPreferredTerminal: (terminal) => {
    set((state) => ({
      settings: {
        ...state.settings,
        general: { ...state.settings.general, preferredTerminal: terminal },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  setPreferredTextEditor: (editor) => {
    set((state) => ({
      settings: {
        ...state.settings,
        general: { ...state.settings.general, preferredTextEditor: editor },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  setPreferredMarkdownEditor: (editor) => {
    set((state) => ({
      settings: {
        ...state.settings,
        general: { ...state.settings.general, preferredMarkdownEditor: editor },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  toggleAutoBackup: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        advanced: { ...state.settings.advanced, autoBackup: !state.settings.advanced.autoBackup },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  setBackupDir: (dir) => {
    set((state) => ({
      settings: {
        ...state.settings,
        advanced: { ...state.settings.advanced, backupDir: dir },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  toggleCloudSync: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        advanced: { ...state.settings.advanced, cloudSyncEnabled: !state.settings.advanced.cloudSyncEnabled },
      },
    }));
    setTimeout(() => get().saveSettings(), 0);
  },

  resetToDefaults: () => {
    const prevShortcut = get().settings.shortcuts.globalInvoke;
    set({ settings: defaultSettings });
    
    if (defaultSettings.shortcuts.globalInvoke !== prevShortcut) {
      setTimeout(async () => {
        try {
          await invoke('update_global_shortcut', { 
            oldShortcut: prevShortcut || null,
            newShortcut: defaultSettings.shortcuts.globalInvoke 
          });
          set({ previousGlobalShortcut: defaultSettings.shortcuts.globalInvoke });
          console.log('[Settings] Reset global shortcut to default');
        } catch (e) {
          console.error('[Settings] Failed to reset global shortcut:', e);
        }
      }, 0);
    }
    
    setTimeout(() => get().saveSettings(), 0);
  },

  saveSettings: async () => {
    const state = get();
    if (!state.isInitialized) return;
    try {
      await storage.saveSettings(state.settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));