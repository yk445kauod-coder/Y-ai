# YAI - Your Personal AI Assistant 🤖

YAI is a high-performance, ChatGPT-inspired mobile web application built with **React**, **Vite**, and **Google Gemini API**. It features advanced memory management (long-term and short-term), web search, image generation, and deep reasoning capabilities.

## 🚀 Features

- **Multi-Modal AI**: Support for text, images, and file analysis.
- **Dual Memory System**: 
  - *Short-term*: Retains context within the current conversation.
  - *Long-term*: Automatically saves key facts about the user across sessions using function calling.
- **Smart Tools**: Integrated Web Search, Image Generation (Gemini 2.5 Flash Image), and Deep Reasoning.
- **PWA Ready**: Installable on iOS and Android with offline support via Service Workers.
- **Modern UI**: RTL support (Arabic/English), Dark Mode, and smooth framer-like animations.

## 🛠️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/yk445kauod-coder/Y-ai.git
cd Y-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

## 📦 One-Click Deployment to GitHub Pages

We've provided a script to automate the build and push process to the `gh-pages` branch.

### Prerequisites
- Make sure you have `git` installed and configured.
- Ensure your repository is named `Y-ai` on GitHub.

### Deploy
Run the following command in your terminal:
```bash
npm run deploy
```
This script will:
1. Build the production assets into the `dist/` folder.
2. Initialize a local git repository inside `dist/`.
3. Force push the assets to the `gh-pages` branch of `https://github.com/yk445kauod-coder/Y-ai.git`.

After the script finishes, your app will be live at:
**[https://yk445kauod-coder.github.io/Y-ai/](https://yk445kauod-coder.github.io/Y-ai/)**

## 🧪 Technologies Used
- **Frontend**: React 19, Tailwind CSS
- **Bundler**: Vite
- **AI**: Google Generative AI (Gemini 3 Pro/Flash)
- **Markdown**: React-Markdown with LaTeX (KaTeX) & Mermaid.js support.

---
Built with ❤️ by yk445kauod-coder
