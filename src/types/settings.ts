export type ThemeMode = 'light' | 'dark' | 'system';

export interface GeneralSettings {
  theme: ThemeMode;
  autoStart: boolean;
  silentStart: boolean;
  minimizeToTray: boolean;
  preferredTerminal: string;
  preferredTextEditor: string;
  preferredMarkdownEditor: string;
}

export interface ShortcutsSettings {
  globalInvoke: string;
  search: string;
  newAction: string;
  openSettings: string;
}

export interface AdvancedSettings {
  autoBackup: boolean;
  backupDir: string;
  cloudSyncEnabled: boolean;
}

export interface AppSettings {
  general: GeneralSettings;
  shortcuts: ShortcutsSettings;
  advanced: AdvancedSettings;
}

export const defaultSettings: AppSettings = {
  general: {
    theme: 'system',
    autoStart: false,
    silentStart: false,
    minimizeToTray: false,
    preferredTerminal: 'Terminal',
    preferredTextEditor: 'Visual Studio Code',
    preferredMarkdownEditor: 'Visual Studio Code',
  },
  shortcuts: {
    globalInvoke: 'CommandOrControl+Shift+Space',
    search: 'CommandOrControl+F',
    newAction: 'CommandOrControl+N',
    openSettings: 'CommandOrControl+,',
  },
  advanced: {
    autoBackup: true,
    backupDir: '',
    cloudSyncEnabled: false,
  },
};

export type SettingsTab = 'general' | 'shortcuts' | 'advanced' | 'about';