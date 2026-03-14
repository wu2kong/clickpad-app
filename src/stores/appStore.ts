import { create } from 'zustand';
import type { ClickAction, Category, Tag, ViewMode } from '../types';

interface AppState {
  clickActions: ClickAction[];
  categories: Category[];
  tags: Tag[];
  selectedCategoryId: string | null;
  selectedTagId: string | null;
  viewMode: ViewMode;
  searchQuery: string;
  sidebarCollapsed: boolean;
  
  setClickActions: (actions: ClickAction[]) => void;
  addClickAction: (action: Omit<ClickAction, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>) => void;
  updateClickAction: (id: string, action: Partial<ClickAction>) => void;
  deleteClickAction: (id: string) => void;
  incrementExecutionCount: (id: string) => void;
  
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  setSelectedCategory: (id: string | null) => void;
  setSelectedTag: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  
  getFilteredActions: () => ClickAction[];
  getTagStats: (tagId: string) => number;
  getCategoryStats: (categoryId: string) => number;
  getChildTags: (parentId: string) => Tag[];
  getTagHierarchy: () => { tag: Tag; level: number }[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultCategories: Category[] = [
  { id: 'cat-1', name: '启动应用', description: '快速启动应用程序', icon: 'rocket', createdAt: Date.now() },
  { id: 'cat-2', name: '执行脚本', description: '运行自定义脚本', icon: 'terminal', createdAt: Date.now() },
  { id: 'cat-3', name: '执行操作', description: '执行系统操作', icon: 'zap', createdAt: Date.now() },
];

const defaultTags: Tag[] = [
  { id: 'tag-1', name: '工具', parentId: null, description: '实用工具', color: '#3b82f6', createdAt: Date.now() },
  { id: 'tag-2', name: '开发', parentId: 'tag-1', description: '开发相关', color: '#10b981', createdAt: Date.now() },
  { id: 'tag-3', name: 'App', parentId: null, description: '应用程序', color: '#f59e0b', createdAt: Date.now() },
  { id: 'tag-4', name: '财经', parentId: null, description: '金融财经', color: '#ef4444', createdAt: Date.now() },
];

const defaultActions: ClickAction[] = [
  {
    id: 'action-1',
    name: '打开 VS Code',
    action: { type: 'open_app', value: 'Visual Studio Code' },
    icon: 'code',
    categoryId: 'cat-1',
    tagIds: ['tag-3'],
    description: '快速启动代码编辑器',
    displayInGallery: true,
    displayInMenu: true,
    displayInCLI: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    executionCount: 0,
  },
  {
    id: 'action-2',
    name: '清理缓存',
    action: { type: 'execute_script', value: 'rm -rf ~/Library/Caches/*' },
    icon: 'trash',
    categoryId: 'cat-3',
    tagIds: ['tag-1'],
    description: '清理系统缓存文件',
    displayInGallery: true,
    displayInMenu: true,
    displayInCLI: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    executionCount: 0,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  clickActions: defaultActions,
  categories: defaultCategories,
  tags: defaultTags,
  selectedCategoryId: null,
  selectedTagId: null,
  viewMode: 'grid',
  searchQuery: '',
  sidebarCollapsed: false,

  setClickActions: (actions) => set({ clickActions: actions }),
  addClickAction: (action) => {
    const newAction: ClickAction = {
      ...action,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      executionCount: 0,
    };
    set((state) => ({ clickActions: [...state.clickActions, newAction] }));
  },
  updateClickAction: (id, action) => {
    set((state) => ({
      clickActions: state.clickActions.map((a) =>
        a.id === id ? { ...a, ...action, updatedAt: Date.now() } : a
      ),
    }));
  },
  deleteClickAction: (id) => {
    set((state) => ({
      clickActions: state.clickActions.filter((a) => a.id !== id),
    }));
  },
  incrementExecutionCount: (id) => {
    set((state) => ({
      clickActions: state.clickActions.map((a) =>
        a.id === id ? { ...a, executionCount: a.executionCount + 1 } : a
      ),
    }));
  },

  setCategories: (categories) => set({ categories }),
  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: Date.now(),
    };
    set((state) => ({ categories: [...state.categories, newCategory] }));
  },
  updateCategory: (id, category) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...category } : c
      ),
    }));
  },
  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      clickActions: state.clickActions.filter((a) => a.categoryId !== id),
    }));
  },

  setTags: (tags) => set({ tags }),
  addTag: (tag) => {
    const newTag: Tag = {
      ...tag,
      id: generateId(),
      createdAt: Date.now(),
    };
    set((state) => ({ tags: [...state.tags, newTag] }));
  },
  updateTag: (id, tag) => {
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, ...tag } : t)),
    }));
  },
  deleteTag: (id) => {
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
      clickActions: state.clickActions.map((a) => ({
        ...a,
        tagIds: a.tagIds.filter((tid) => tid !== id),
      })),
    }));
  },

  setSelectedCategory: (id) => set({ selectedCategoryId: id, selectedTagId: null }),
  setSelectedTag: (id) => set({ selectedTagId: id, selectedCategoryId: null }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  getFilteredActions: () => {
    const { clickActions, selectedCategoryId, selectedTagId, searchQuery } = get();
    return clickActions.filter((action) => {
      if (selectedCategoryId && action.categoryId !== selectedCategoryId) return false;
      if (selectedTagId && !action.tagIds.includes(selectedTagId)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          action.name.toLowerCase().includes(query) ||
          action.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  },
  getTagStats: (tagId) => {
    return get().clickActions.filter((a) => a.tagIds.includes(tagId)).length;
  },
  getCategoryStats: (categoryId) => {
    return get().clickActions.filter((a) => a.categoryId === categoryId).length;
  },
  getChildTags: (parentId) => {
    return get().tags.filter((t) => t.parentId === parentId);
  },
  getTagHierarchy: () => {
    const { tags } = get();
    const result: { tag: Tag; level: number }[] = [];
    
    const addTagWithLevel = (tag: Tag, level: number) => {
      result.push({ tag, level });
      const children = tags.filter((t) => t.parentId === tag.id);
      children.forEach((child) => addTagWithLevel(child, level + 1));
    };
    
    const rootTags = tags.filter((t) => t.parentId === null);
    rootTags.forEach((tag) => addTagWithLevel(tag, 0));
    
    return result;
  },
}));
