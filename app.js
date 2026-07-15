// 1. Tag Library Configuration
const TAG_MODIFIERS = {
    style: [
        { label: "Cyberpunk", value: "cyberpunk aesthetic" },
        { label: "Surrealism", value: "surrealist style" },
        { label: "Fantasy", value: "magical fantasy art" },
        { label: "Mystic", value: "mystic atmosphere" },
        { label: "Steampunk", value: "steampunk design" },
        { label: "Minimalist", value: "minimalist vector art" },
        { label: "Retro-Futurism", value: "80s retro-futurism synthwave" },
        { label: "Anime", value: "retro anime key visual" },
        { label: "Baroque", value: "dramatic baroque oil painting" },
        { label: "Cybernetic", value: "cybernetic bio-mechanical detail" }
    ],
    medium: [
        { label: "Digital Art", value: "digital painting" },
        { label: "Oil Painting", value: "heavy brush stroke oil painting" },
        { label: "3D Render", value: "unreal engine 5 render, octane render" },
        { label: "Watercolor", value: "flowing watercolor sketch" },
        { label: "Pencil Sketch", value: "intricate graphite pencil sketch" },
        { label: "Claymation", value: "clay sculpture, stop-motion claymation" },
        { label: "Cinematic Photo", value: "cinematic photography, 35mm photograph" }
    ],
    lighting: [
        { label: "Volumetric", value: "volumetric light rays, god rays" },
        { label: "Cinematic", value: "dramatic cinematic lighting" },
        { label: "Neon Glow", value: "glowing neon illumination" },
        { label: "Golden Hour", value: "warm golden hour light" },
        { label: "Mood Lighting", value: "low-key mood lighting" },
        { label: "Studio Lighting", value: "clean studio product lighting" },
        { label: "Dark Ambient", value: "dark moody ambient atmosphere" }
    ],
    camera: [
        { label: "Close Up", value: "macro close-up shot" },
        { label: "Wide Angle", value: "panoramic wide angle view" },
        { label: "Macro", value: "extreme detail macro lens" },
        { label: "Drone View", value: "aerial drone photography" },
        { label: "Low Angle", value: "low-angle dramatic perspective" },
        { label: "Bokeh", value: "shallow depth of field, creamy bokeh background" }
    ],
    colors: [
        { label: "Vibrant", value: "vibrant color scheme, highly saturated" },
        { label: "Pastel", value: "soft pastel color palette" },
        { label: "Monochromatic", value: "dramatic monochromatic color palette" },
        { label: "Warm Palette", value: "warm amber and crimson tones" },
        { label: "Cool Palette", value: "cool cyan and indigo color spectrum" },
        { label: "Synthwave", value: "magenta, purple, and neon-blue palette" }
    ]
};

// 2. Application State
let appState = {
    basePrompt: "",
    selectedTags: new Set(), // Set of tag values
    aspectRatio: "1:1",
    sampler: "Euler a",
    guidanceScale: 7.5,
    steps: 30,
    seed: -1,
    negativePrompt: "blurry, low quality, distorted, extra limbs",
    currentGeneratedImage: null, // Holds data URL or local path
    gallery: []
};

// Generation status logs for simulated loading
const SIMULATED_LOGS = [
    "Queueing prompt request...",
    "Connecting to inference server (idle)...",
    "Parsing negative instructions...",
    "Allocating generation seed and noise map...",
    "Sampling noise step 1...",
    "Sampling noise step 5...",
    "Sampling noise step 12...",
    "Sampling noise step 18...",
    "Injecting color maps and style weights...",
    "Sampling noise step 25...",
    "Sampling noise step 30 (rendering)...",
    "Running latent upscaling (2x)...",
    "Performing face restoration checks...",
    "Finalizing image decoding...",
    "Done!"
];

// 3. Initialize Elements
document.addEventListener("DOMContentLoaded", () => {
    // Sync repository link with current host or generic github
    const repoLink = document.getElementById("githubRepoLink");
    repoLink.href = window.location.href.includes("github.io") 
        ? window.location.href.split("/").slice(0, 4).join("/") 
        : "https://github.com/amarnath139/prompt-studio";

    // Setup modifier tabs
    initModifierTabs();
    
    // Load modifiers clouds
    loadModifiersClouds();
    
    // Setup form controls event listeners
    initFormControls();
    
    // Load local storage states
    loadSavedSettings();
    
    // Update compiled prompt string
    updateCompiledPrompt();

    // Render local gallery
    renderGallery();
});

// 4. Modifier Tags UI Handler
function initModifierTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const tabId = tab.dataset.tab;
            const contents = document.querySelectorAll(".tab-content");
            contents.forEach(content => {
                if (content.id === `${tabId}Tab`) {
                    content.classList.remove("hidden");
                } else {
                    content.classList.add("hidden");
                }
            });
        });
    });
}

function loadModifiersClouds() {
    Object.keys(TAG_MODIFIERS).forEach(category => {
        const cloud = document.getElementById(`${category}TagsCloud`);
        if (!cloud) return;
        
        TAG_MODIFIERS[category].forEach(tag => {
            const chip = document.createElement("div");
            chip.className = "tag-chip";
            chip.dataset.value = tag.value;
            chip.innerHTML = `
                <span>${tag.label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            `;
            
            chip.addEventListener("click", () => {
                if (appState.selectedTags.has(tag.value)) {
                    appState.selectedTags.delete(tag.value);
                    chip.classList.remove("active");
                } else {
                    appState.selectedTags.add(tag.value);
                    chip.classList.add("active");
                }
                updateCompiledPrompt();
            });
            
            cloud.appendChild(chip);
        });
    });
}

// 5. Form Controls and Event Sync
function initFormControls() {
    // Base Prompt text
    const promptInput = document.getElementById("promptInput");
    promptInput.addEventListener("input", (e) => {
        appState.basePrompt = e.target.value;
        updateCompiledPrompt();
    });
    
    // Clear prompt button
    document.getElementById("clearPromptBtn").addEventListener("click", () => {
        promptInput.value = "";
        appState.basePrompt = "";
        // Deselect all chips
        document.querySelectorAll(".tag-chip").forEach(chip => {
            chip.classList.remove("active");
        });
        appState.selectedTags.clear();
        updateCompiledPrompt();
        showToast("Prompt workspace cleared", "info");
    });
    
    // Theme Selector
    const themeBtn = document.getElementById("themeBtn");
    const themeDropdown = document.getElementById("themeDropdown");
    
    themeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle("show");
    });
    
    document.addEventListener("click", () => {
        themeDropdown.classList.remove("show");
    });
    
    document.querySelectorAll(".theme-opt").forEach(opt => {
        opt.addEventListener("click", (e) => {
            const selectedTheme = opt.dataset.theme;
            
            document.querySelectorAll(".theme-opt").forEach(o => o.classList.remove("active"));
            opt.classList.add("active");
            
            document.documentElement.setAttribute("data-theme", selectedTheme);
            localStorage.setItem("prompt-studio-theme", selectedTheme);
            showToast(`Theme switched to ${opt.textContent.trim()}`, "success");
        });
    });
    
    // Parameters Collapse
    const paramToggle = document.getElementById("parametersToggle");
    const paramChevron = document.getElementById("paramChevron");
    const paramPanel = document.getElementById("parametersPanel");
    
    paramToggle.addEventListener("click", () => {
        paramChevron.classList.toggle("rotate");
        paramPanel.classList.toggle("open");
    });
    
    // Inputs Sync
    const guidanceInput = document.getElementById("guidanceScale");
    const guidanceVal = document.getElementById("guidanceScaleVal");
    guidanceInput.addEventListener("input", (e) => {
        appState.guidanceScale = parseFloat(e.target.value);
        guidanceVal.textContent = e.target.value;
    });
    
    const stepsInput = document.getElementById("inferenceSteps");
    const stepsVal = document.getElementById("inferenceStepsVal");
    stepsInput.addEventListener("input", (e) => {
        appState.steps = parseInt(e.target.value);
        stepsVal.textContent = e.target.value;
    });
    
    const seedInput = document.getElementById("seedInput");
    seedInput.addEventListener("input", (e) => {
        appState.seed = e.target.value === "" ? -1 : parseInt(e.target.value);
    });
    
    document.getElementById("randomizeSeedBtn").addEventListener("click", () => {
        const randSeed = Math.floor(Math.random() * 9999999);
        seedInput.value = randSeed;
        appState.seed = randSeed;
        showToast(`Random seed set: ${randSeed}`, "info");
    });
    
    document.getElementById("negativePromptInput").addEventListener("input", (e) => {
        appState.negativePrompt = e.target.value;
    });
    
    const aspectSelect = document.getElementById("aspectRatioSelect");
    const canvasViewport = document.getElementById("canvasViewport");
    aspectSelect.addEventListener("change", (e) => {
        appState.aspectRatio = e.target.value;
        canvasViewport.setAttribute("data-aspect", e.target.value);
    });
    
    document.getElementById("samplerSelect").addEventListener("change", (e) => {
        appState.sampler = e.target.value;
    });
    
    // Clipboard Copy
    document.getElementById("copyPromptBtn").addEventListener("click", () => {
        copyStringToClipboard(compilePromptText());
    });
    
    // Trigger Generation
    document.getElementById("generateBtn").addEventListener("click", triggerGenerationSimulation);
    
    // Actions panel buttons
    document.getElementById("actionCopyPrompt").addEventListener("click", () => {
        copyStringToClipboard(compilePromptText());
    });
    
    document.getElementById("actionSave").addEventListener("click", saveCreationToGallery);
    
    document.getElementById("actionDownload").addEventListener("click", downloadCanvasImage);
    
    // Gallery controls
    document.getElementById("gallerySearch").addEventListener("input", filterGalleryItems);
    document.getElementById("galleryFilterStyle").addEventListener("change", filterGalleryItems);
    
    document.getElementById("clearGalleryBtn").addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your saved gallery history? This cannot be undone.")) {
            appState.gallery = [];
            localStorage.setItem("prompt-studio-gallery", JSON.stringify([]));
            renderGallery();
            showToast("Gallery cleared successfully", "success");
        }
    });
}

// 6. State Recovery
function loadSavedSettings() {
    // Theme loading
    const savedTheme = localStorage.getItem("prompt-studio-theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
        document.querySelectorAll(".theme-opt").forEach(opt => {
            if (opt.dataset.theme === savedTheme) {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        });
    }
    
    // Gallery loading
    const savedGallery = localStorage.getItem("prompt-studio-gallery");
    if (savedGallery) {
        try {
            appState.gallery = JSON.parse(savedGallery);
        } catch (e) {
            appState.gallery = [];
        }
    }
}

// 7. Prompt Compiler
function compilePromptText() {
    let parts = [];
    if (appState.basePrompt.trim()) {
        parts.push(appState.basePrompt.trim());
    }
    
    if (appState.selectedTags.size > 0) {
        parts.push(Array.from(appState.selectedTags).join(", "));
    }
    
    if (parts.length === 0) {
        return "Write a prompt idea or click modifier tags...";
    }
    
    return parts.join(", ");
}

function updateCompiledPrompt() {
    const text = compilePromptText();
    const display = document.getElementById("compiledPromptDisplay");
    
    if (text.startsWith("Write a prompt")) {
        display.classList.add("placeholder");
        display.textContent = text;
    } else {
        display.classList.remove("placeholder");
        display.textContent = text;
    }
}

// 8. Simulated Image Generation
function triggerGenerationSimulation() {
    const compiledText = compilePromptText();
    if (compiledText.startsWith("Write a prompt")) {
        showToast("Please write a prompt or click tags first!", "error");
        return;
    }
    
    // Randomize seed if it is -1
    let activeSeed = appState.seed;
    if (activeSeed === -1) {
        activeSeed = Math.floor(Math.random() * 9999999);
    }
    
    // Switch canvas to Generating View
    const stateIdle = document.getElementById("stateIdle");
    const stateGenerating = document.getElementById("stateGenerating");
    const stateDisplay = document.getElementById("stateDisplay");
    const canvasActions = document.getElementById("canvasActions");
    
    stateIdle.classList.add("hidden");
    stateDisplay.classList.add("hidden");
    canvasActions.classList.remove("enabled");
    stateGenerating.classList.remove("hidden");
    
    // Setup blurred backdrop
    const generatingBackdrop = document.getElementById("generatingBackdrop");
    const potentialSample = determineMatchedImage(compiledText);
    
    if (potentialSample) {
        generatingBackdrop.style.backgroundImage = `url('${potentialSample}')`;
    } else {
        generatingBackdrop.style.backgroundImage = "none";
        generatingBackdrop.style.backgroundColor = "var(--input-bg)";
    }
    
    // Reset loader elements
    const progressBar = document.getElementById("progressBarInner");
    const stepCounter = document.getElementById("stepCounterDisplay");
    const statusText = document.getElementById("generationStatusDisplay");
    
    progressBar.style.width = "0%";
    stepCounter.textContent = `Step 0/${appState.steps}`;
    
    // Simulation steps
    const totalSimSteps = 15;
    let currentSimStep = 0;
    const intervalMs = Math.max(150, (appState.steps * 100) / totalSimSteps); // scale based on inference steps
    
    const simInterval = setInterval(() => {
        currentSimStep++;
        
        // Progress percentage
        const progress = Math.min(100, Math.round((currentSimStep / totalSimSteps) * 100));
        progressBar.style.width = `${progress}%`;
        
        // Step number sync
        const activeInfStep = Math.min(appState.steps, Math.round((progress / 100) * appState.steps));
        stepCounter.textContent = `Step ${activeInfStep}/${appState.steps}`;
        
        // Status log update
        statusText.textContent = SIMULATED_LOGS[currentSimStep - 1] || "Sampling vectors...";
        
        if (currentSimStep >= totalSimSteps) {
            clearInterval(simInterval);
            
            // Finish generation
            revealGeneratedOutput(compiledText, activeSeed);
        }
    }, intervalMs);
}

// Reveal final output
function revealGeneratedOutput(promptText, seed) {
    const stateGenerating = document.getElementById("stateGenerating");
    const stateDisplay = document.getElementById("stateDisplay");
    const canvasActions = document.getElementById("canvasActions");
    const generatedImageEl = document.getElementById("generatedImage");
    
    // Select image or draw procedural canvas
    const samplePath = determineMatchedImage(promptText);
    if (samplePath) {
        generatedImageEl.src = samplePath;
        appState.currentGeneratedImage = samplePath;
    } else {
        // Draw gorgeous generative art canvas fallback
        const proceduralDataUrl = createProceduralCanvasArt(promptText, seed);
        generatedImageEl.src = proceduralDataUrl;
        appState.currentGeneratedImage = proceduralDataUrl;
    }
    
    // Update meta details overlays
    document.getElementById("displayAspect").textContent = appState.aspectRatio;
    document.getElementById("displaySampler").textContent = appState.sampler;
    document.getElementById("displayCfg").textContent = `CFG: ${appState.guidanceScale}`;
    document.getElementById("displaySteps").textContent = `Steps: ${appState.steps}`;
    document.getElementById("displaySeed").textContent = `Seed: ${seed}`;
    
    // Switch States
    stateGenerating.classList.add("hidden");
    stateDisplay.classList.remove("hidden");
    canvasActions.classList.add("enabled");
    
    showToast("Image generation mockup finalized!", "success");
}

// Map keywords to local samples
function determineMatchedImage(promptText) {
    const textLower = promptText.toLowerCase();
    
    if (textLower.includes("cyberpunk") || textLower.includes("neon") || textLower.includes("futuristic city")) {
        return "assets/samples/cyberpunk_street.png";
    }
    if (textLower.includes("fantasy") || textLower.includes("dreamy") || textLower.includes("surreal") || textLower.includes("island")) {
        return "assets/samples/dreamy_fantasy.png";
    }
    if (textLower.includes("retro") || textLower.includes("synthwave") || textLower.includes("car") || textLower.includes("highway")) {
        return "assets/samples/retro_futurism.png";
    }
    if (textLower.includes("mystic") || textLower.includes("forest") || textLower.includes("nature") || textLower.includes("deer")) {
        return "assets/samples/mystic_nature.png";
    }
    
    return null; // fallback to procedural
}

// 9. Procedural Generative Art Fallback
function createProceduralCanvasArt(promptText, seed) {
    const canvas = document.createElement("canvas");
    
    // Match dimensions to aspect ratio
    let width = 600;
    let height = 600;
    
    if (appState.aspectRatio === "16:9") {
        width = 800; height = 450;
    } else if (appState.aspectRatio === "9:16") {
        width = 450; height = 800;
    } else if (appState.aspectRatio === "4:3") {
        width = 800; height = 600;
    }
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    // Use prompt + seed to seed random values deterministically
    let seedValue = seed;
    for (let i = 0; i < promptText.length; i++) {
        seedValue += promptText.charCodeAt(i) * (i + 1);
    }
    
    function pseudoRandom() {
        const x = Math.sin(seedValue++) * 10000;
        return x - Math.floor(x);
    }
    
    // Choose theme palette based on tags or random
    const themeIdx = Math.floor(pseudoRandom() * 4);
    let colorPalette = [];
    
    if (promptText.toLowerCase().includes("warm") || promptText.toLowerCase().includes("golden") || themeIdx === 0) {
        colorPalette = ["#ff5964", "#35a7ff", "#ffe74c", "#38618c", "#0b0f19"]; // warm sunset tech
    } else if (promptText.toLowerCase().includes("cool") || promptText.toLowerCase().includes("watercolor") || themeIdx === 1) {
        colorPalette = ["#00a896", "#028090", "#f0f3f4", "#02c39a", "#05668d"]; // serene teal oceanic
    } else if (promptText.toLowerCase().includes("pastel") || themeIdx === 2) {
        colorPalette = ["#ffc0cb", "#e6e6fa", "#ffe4e1", "#faf0e6", "#b0c4de"]; // soft dream
    } else {
        colorPalette = ["#7a04eb", "#120458", "#ff007f", "#00f0ff", "#080315"]; // neon vapor/cyber
    }
    
    // Draw rich background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, colorPalette[4] || "#0b0f19");
    bgGrad.addColorStop(1, "#030408");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    
    // Draw stylized generative patterns (flow waves/particles)
    ctx.globalCompositeOperation = "screen";
    const shapeCount = 15 + Math.floor(pseudoRandom() * 20);
    
    for (let s = 0; s < shapeCount; s++) {
        ctx.fillStyle = colorPalette[Math.floor(pseudoRandom() * 4)];
        ctx.strokeStyle = colorPalette[Math.floor(pseudoRandom() * 4)];
        
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10 + pseudoRandom() * 30;
        
        ctx.beginPath();
        const drawType = pseudoRandom();
        
        if (drawType < 0.3) {
            // Draw flowing rings
            const r = 20 + pseudoRandom() * (width / 3);
            const cx = pseudoRandom() * width;
            const cy = pseudoRandom() * height;
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.lineWidth = 1 + pseudoRandom() * 4;
            ctx.stroke();
        } else if (drawType < 0.65) {
            // Draw soft overlapping polygons/orbs
            const r = 50 + pseudoRandom() * 150;
            const cx = pseudoRandom() * width;
            const cy = pseudoRandom() * height;
            
            const radialGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            radialGrad.addColorStop(0, ctx.fillStyle);
            radialGrad.addColorStop(1, "transparent");
            ctx.fillStyle = radialGrad;
            
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw geometric vector lines
            const x1 = pseudoRandom() * width;
            const y1 = pseudoRandom() * height;
            const x2 = pseudoRandom() * width;
            const y2 = pseudoRandom() * height;
            const x3 = pseudoRandom() * width;
            const y3 = pseudoRandom() * height;
            
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.lineWidth = 0.5 + pseudoRandom() * 2;
            
            if (pseudoRandom() < 0.5) {
                ctx.stroke();
            } else {
                ctx.globalAlpha = 0.15;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }
    }
    
    // Clear shadow blur for signature text
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
    
    // Add tiny abstract technical grid/overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Watermark/Signature signature
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText("PROMPTSTUDIO PROCEDURAL ENGINE", 16, height - 16);
    ctx.fillText(`SEED: ${seed}`, width - 120, height - 16);
    
    return canvas.toDataURL("image/png");
}

// 10. Gallery Management
function saveCreationToGallery() {
    if (!appState.currentGeneratedImage) {
        showToast("No active generation to save!", "error");
        return;
    }
    
    const compiledText = compilePromptText();
    
    // Prevent duplicate saves of identical prompt
    const isDuplicate = appState.gallery.some(item => 
        item.prompt === compiledText && item.seed === appState.seed
    );
    
    if (isDuplicate) {
        showToast("Prompt & Seed combination already saved!", "info");
        return;
    }
    
    // Construct new item
    const newItem = {
        id: Date.now().toString(),
        prompt: compiledText,
        basePrompt: appState.basePrompt,
        selectedTags: Array.from(appState.selectedTags),
        aspectRatio: appState.aspectRatio,
        sampler: appState.sampler,
        guidanceScale: appState.guidanceScale,
        steps: appState.steps,
        seed: appState.seed === -1 ? Math.floor(Math.random() * 999999) : appState.seed,
        negativePrompt: appState.negativePrompt,
        imageSrc: appState.currentGeneratedImage,
        timestamp: new Date().toLocaleDateString()
    };
    
    appState.gallery.unshift(newItem);
    localStorage.setItem("prompt-studio-gallery", JSON.stringify(appState.gallery));
    
    renderGallery();
    showToast("Saved to history gallery!", "success");
}

function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    grid.innerHTML = "";
    
    if (appState.gallery.length === 0) {
        grid.innerHTML = `
            <div class="gallery-empty">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                <h3>Your Gallery is Empty</h3>
                <p>Construct prompts, click "Generate Mockup Image", and hit "Save to Gallery" to fill your history.</p>
            </div>
        `;
        return;
    }
    
    appState.gallery.forEach(item => {
        const card = document.createElement("div");
        card.className = "gallery-card";
        card.dataset.id = item.id;
        
        // Tags markup
        const tagsHtml = item.selectedTags.map(tag => {
            // Get label from values dictionary
            let label = tag;
            Object.values(TAG_MODIFIERS).forEach(group => {
                const found = group.find(t => t.value === tag);
                if (found) label = found.label;
            });
            return `<span class="card-tag">${label}</span>`;
        }).join("");
        
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${item.imageSrc}" alt="Gallery generation card">
                <span class="card-aspect">${item.aspectRatio}</span>
            </div>
            <div class="card-content">
                <p class="card-prompt" title="${item.prompt}">${item.prompt}</p>
                <div class="card-tags">${tagsHtml}</div>
                <div class="card-footer">
                    <span class="card-parameters">CFG: ${item.guidanceScale} &bull; Steps: ${item.steps}</span>
                    <div class="card-actions">
                        <button class="card-btn remix-btn" title="Remix Prompt & Parameters">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                        </button>
                        <button class="card-btn copy-prompt-btn" title="Copy Prompt text">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button class="card-btn delete-btn" title="Remove creation">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add events directly
        card.querySelector(".remix-btn").addEventListener("click", () => remixGalleryItem(item));
        card.querySelector(".copy-prompt-btn").addEventListener("click", () => copyStringToClipboard(item.prompt));
        card.querySelector(".delete-btn").addEventListener("click", () => deleteGalleryItem(item.id));
        
        grid.appendChild(card);
    });
}

function deleteGalleryItem(id) {
    appState.gallery = appState.gallery.filter(item => item.id !== id);
    localStorage.setItem("prompt-studio-gallery", JSON.stringify(appState.gallery));
    renderGallery();
    showToast("Item deleted from gallery", "info");
}

function remixGalleryItem(item) {
    // 1. Sync Base Prompt
    const promptInput = document.getElementById("promptInput");
    promptInput.value = item.basePrompt;
    appState.basePrompt = item.basePrompt;
    
    // 2. Sync Selected Tags
    appState.selectedTags = new Set(item.selectedTags);
    document.querySelectorAll(".tag-chip").forEach(chip => {
        if (appState.selectedTags.has(chip.dataset.value)) {
            chip.classList.add("active");
        } else {
            chip.classList.remove("active");
        }
    });
    
    // 3. Sync sliders and options
    document.getElementById("aspectRatioSelect").value = item.aspectRatio;
    appState.aspectRatio = item.aspectRatio;
    document.getElementById("canvasViewport").setAttribute("data-aspect", item.aspectRatio);
    
    document.getElementById("samplerSelect").value = item.sampler;
    appState.sampler = item.sampler;
    
    document.getElementById("guidanceScale").value = item.guidanceScale;
    document.getElementById("guidanceScaleVal").textContent = item.guidanceScale;
    appState.guidanceScale = item.guidanceScale;
    
    document.getElementById("inferenceSteps").value = item.steps;
    document.getElementById("inferenceStepsVal").textContent = item.steps;
    appState.steps = item.steps;
    
    document.getElementById("seedInput").value = item.seed;
    appState.seed = item.seed;
    
    document.getElementById("negativePromptInput").value = item.negativePrompt;
    appState.negativePrompt = item.negativePrompt;
    
    updateCompiledPrompt();
    
    // Scroll to panel top smoothly
    document.querySelector(".control-panel").scrollIntoView({ behavior: "smooth" });
    showToast("Gallery settings loaded into Workspace!", "success");
}

function filterGalleryItems() {
    const searchQuery = document.getElementById("gallerySearch").value.toLowerCase();
    const filterStyle = document.getElementById("galleryFilterStyle").value;
    
    const cards = document.querySelectorAll(".gallery-card");
    
    cards.forEach(card => {
        const id = card.dataset.id;
        const item = appState.gallery.find(i => i.id === id);
        if (!item) return;
        
        const matchesSearch = item.prompt.toLowerCase().includes(searchQuery);
        let matchesStyle = false;
        
        if (filterStyle === "all") {
            matchesStyle = true;
        } else {
            const promptLower = item.prompt.toLowerCase();
            if (filterStyle === "cyberpunk" && (promptLower.includes("cyberpunk") || promptLower.includes("neon"))) {
                matchesStyle = true;
            } else if (filterStyle === "fantasy" && (promptLower.includes("fantasy") || promptLower.includes("dreamy") || promptLower.includes("surreal"))) {
                matchesStyle = true;
            } else if (filterStyle === "retro-futurism" && (promptLower.includes("retro") || promptLower.includes("synthwave") || promptLower.includes("car"))) {
                matchesStyle = true;
            } else if (filterStyle === "mystic" && (promptLower.includes("mystic") || promptLower.includes("forest") || promptLower.includes("nature"))) {
                matchesStyle = true;
            } else if (filterStyle === "other" && 
                       !promptLower.includes("cyberpunk") && !promptLower.includes("neon") && 
                       !promptLower.includes("fantasy") && !promptLower.includes("dreamy") && !promptLower.includes("surreal") && 
                       !promptLower.includes("retro") && !promptLower.includes("synthwave") && !promptLower.includes("car") && 
                       !promptLower.includes("mystic") && !promptLower.includes("forest") && !promptLower.includes("nature")) {
                matchesStyle = true;
            }
        }
        
        if (matchesSearch && matchesStyle) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    });
}

// 11. Helper utilities
function copyStringToClipboard(str) {
    if (!str || str.startsWith("Write a prompt")) return;
    
    navigator.clipboard.writeText(str)
        .then(() => {
            showToast("Copied to clipboard!", "success");
        })
        .catch(err => {
            console.error("Clipboard write error:", err);
            showToast("Failed to copy automatically.", "error");
        });
}

function downloadCanvasImage() {
    if (!appState.currentGeneratedImage) return;
    
    const link = document.createElement("a");
    link.href = appState.currentGeneratedImage;
    link.download = `generation_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Downloading generation image...", "success");
}

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    // Select icon
    let iconSvg = "";
    if (type === "success") {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === "error") {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
    
    toast.innerHTML = `
        ${iconSvg}
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Automatically delete from DOM after animations
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
