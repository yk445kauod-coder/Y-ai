# YAI - Your Personal AI Assistant 🤖

YAI is a high-performance, ChatGPT-inspired mobile web application built with **React**, **Vite**, and **Google Gemini API**. It features advanced memory management (long-term and short-term), web search, image generation, and deep reasoning capabilities.

## 🚀 Features

- **Multi-Modal AI**: Support for text, images, and file analysis.
- **Dual Memory System**: 
  - *Short-term*: Retains context within the current conversation.
  - *Long-term*: Automatically saves key facts about the user across sessions using function calling.
- **Smart Tools**: Integrated Web Search, Image Generation (Gemini 2.5 Flash Image), and Deep Reasoning.
- **Persona Customization**: Change writing styles (Formal, Creative, etc.) and assistant identity.
- **PWA Ready**: Installable on iOS and Android with offline support via Service Workers.
- **Modern UI**: RTL support (Arabic/English), Dark Mode, and smooth framer-like animations.

## 🛠️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your Google Gemini API Key:
```env
VITE_API_KEY=your_gemini_api_key_here
```
*Note: The application is configured to use `process.env.API_KEY` for compatibility with specific hosting environments, but for local Vite development, you should ensure your environment variables are correctly mapped.*

### 4. Run Development Server
```bash
npm run dev
```

## 📦 Deployment to GitHub Pages

### Step 1: Update `vite.config.ts`
Ensure the `base` property in `vite.config.ts` matches your repository name if you aren't using a custom domain.
```typescript
// If your repo is https://github.com/user/my-app/
base: '/my-app/' 
// If using a custom domain or root page (user.github.io)
base: './' 
```

### Step 2: Install Deployment Package
```bash
npm install -D gh-pages
```

### Step 3: Add Deploy Scripts
Update your `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist",
  ...
}
```

### Step 4: Deploy
Run the following command to build the project and push the `dist` folder to the `gh-pages` branch:
```bash
npm run deploy
```

### Step 5: Activate GitHub Pages
1. Go to your GitHub repository **Settings**.
2. Navigate to **Pages** in the sidebar.
3. Under **Build and deployment > Branch**, select `gh-pages` and folder `/ (root)`.
4. Click **Save**. Your app will be live at `https://<username>.github.io/<repo-name>/`.

## ⚠️ Important Note on API Keys
This app calls the Gemini API directly from the client side. **For production apps, it is highly recommended to proxy these requests through a backend** to keep your API Key secure. If deploying publicly, ensure your API Key has appropriate usage limits and restrictions in the Google AI Studio console.

## 🧪 Technologies Used
- **Frontend**: React 19, Tailwind CSS
- **Bundler**: Vite
- **AI**: Google Generative AI (Gemini 3 Pro/Flash)
- **Markdown**: React-Markdown with LaTeX (KaTeX) & Mermaid.js support.
- **Storage**: LocalStorage for persistent chat history and settings.

---
Built with ❤️ by [Your Name/Handle]
