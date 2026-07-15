# AI Prompt Studio & Image Generator Mockup

A premium, visually stunning single-page web application that serves as an AI prompt engineering helper and image generation mockup. It enables users to construct prompts using categorized modifiers (style, lighting, camera, colors, etc.), adjust generator parameters, simulate a realistic image generation process, and save generated creations to an interactive gallery stored in local storage.

This project is fully self-contained and designed to be deployed to **GitHub Pages** with zero configuration.

## ✨ Features

- **Dynamic Prompt Builder**: Type a base idea and toggle chips from different modifier groups (Style, Medium, Lighting, Camera, Colors) to build rich prompts.
- **Parametric Controls**: Fine-tune aspect ratios, sampler selections, negative prompts, inference steps, CFG scale, and seed values.
- **Rich Generation Simulator**: Click "Generate" to initiate a visual step-by-step progress loading animation, detailing real-time actions like allocation, sampling steps, upscaling, and rendering.
- **Responsive Canvas Viewport**: Visual output dimensions automatically adapt to your chosen aspect ratio (1:1, 16:9, 9:16, 4:3) with hover detail overlays.
- **Procedural Art Fallback Engine**: If no specific style match is found in the prompt, a generative HTML5 Canvas engine dynamically renders a unique abstract artwork based on your prompt text and seed.
- **Creation Gallery**: Save, search, filter, and delete creations locally.
- **Prompt Remixing**: Click the remix button on any gallery card to load the exact prompt, tags, aspect ratio, seed, and parameters back into the editor workspace.
- **Theme Engine**: Switch between three custom-designed visual themes:
  - 🌌 **Midnight Obsidian** (Default sleek dark grey-blue)
  - 🦄 **Neon Cyberpunk** (Vibrant hot-pink and purple neon aesthetic)
  - ☀️ **Solarized Light** (Classic warm cream solarized readability theme)
- **Zero Dependencies**: Pure HTML5, Vanilla CSS custom property themes, and ES6+ JavaScript. No build step or installation required!

## 🚀 How to Run Locally

Since this is a client-side static web application, you have two options:

### Option A: Double-Click
Simply navigate to the project folder and double-click `index.html` to open it in any web browser!

### Option B: Local HTTP Server (Recommended)
If you'd like a server environment, run one of the following commands in the project folder:

**Using Python:**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Using Node.js/npx:**
```bash
npx live-server
```

## 🌐 Deploy to GitHub Pages

You can host this project online for free using GitHub Pages:
1. Push this project to a new repository on your GitHub account.
2. Go to the repository **Settings** tab.
3. Scroll down to **Pages** in the left sidebar.
4. Under **Build and deployment**, set the Source to **Deploy from a branch**.
5. Select the `master` or `main` branch, set folder to `/ (root)`, and click **Save**.
6. After a minute, your app will be live at `https://<your-username>.github.io/<your-repo-name>/`!
