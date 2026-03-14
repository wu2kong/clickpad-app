# FastClickApp

一款轻量级跨平台桌面应用，用于快速管理和执行自定义小程序（ClickAction）。

## 功能特性

- **小程序管理**：创建、编辑、删除自定义 ClickAction
- **分类管理**：使用类别组织小程序（单类别）
- **标签系统**：支持多标签和层级标签管理
- **双栏布局**：左侧导航栏可收起，右侧内容区支持列表/网格视图切换
- **执行统计**：记录每个小程序的执行次数
- **多种执行方式**：支持打开应用、执行脚本等多种动作类型
- **展示控制**：可配置在 Gallery、下拉菜单、命令行中的展示

## 技术栈

- **框架**: Tauri 2.x (Rust + WebView)
- **前端**: React 18 + TypeScript
- **状态管理**: Zustand
- **图标**: Lucide React
- **存储**: JSON 文件存储（可扩展为 SQLite）

## 开发环境要求

- Node.js 18+
- Rust 1.70+
- macOS / Windows / Linux

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装 Rust（如果未安装）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. 开发模式运行

```bash
# 启动 Tauri 开发服务器
npm run tauri-dev
```

### 3. 构建生产版本

```bash
# 构建应用安装包
npm run tauri-build
```

构建后的安装包位于 `src-tauri/target/release/bundle/` 目录下。

## 项目结构

```
fastclick-app/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── stores/            # Zustand 状态管理
│   ├── types/             # TypeScript 类型定义
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口
├── src-tauri/             # Tauri 后端源代码
│   ├── src/main.rs        # Rust 主程序
│   ├── Cargo.toml         # Rust 依赖配置
│   └── tauri.conf.json    # Tauri 配置文件
├── package.json           # npm 配置
├── vite.config.ts         # Vite 配置
└── tsconfig.json          # TypeScript 配置
```

## 命令行支持（规划中）

```bash
# 列出所有可用的小程序
fastclick --list

# 执行指定名称的小程序
fastclick <name>
```

## 数据存储

默认使用 JSON 文件存储数据，位置：
- macOS: `~/Library/Application Support/com.fastclick.app/data.json`
- Windows: `%APPDATA%/com.fastclick.app/data.json`
- Linux: `~/.config/com.fastclick.app/data.json`

## 许可证

MIT
