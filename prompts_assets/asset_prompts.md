# 🎨 Congkak Quest Asset Generation Guide

Use these prompts with **OpenArt (Recommended Models: Flux Kontext Dev, Flux.1 Dev, or SDXL)** for the best high-quality results. Save the images with the exact names provided below into your `public/assets/textures/` sub-folders.

### 📐 Recommended Resolutions:
- **Seamless Textures (Wood, Grass, Planks):** 1024x1024 or 2048x2048 (Square)
- **Individual Assets (Guli, Palm Leaf):** 1024x1024 (Square with padding)
- **Backgrounds (Menu BG):** 1920x1080 (Widescreen)
- **UI Elements (Paper Scroll):** 1024x1024 or 1024x512

---

## 🛶 1. Congkak & Guli (Folder: `/assets/textures/congkak/`)

### **File: `congkak_wood.png`**
> **Prompt:** Top-down seamless texture of aged dark teak wood, traditional Malaysian wood carving patterns, rich mahogany grain, high detail, 4k, photorealistic, cinematic lighting, wood grooves and polished finish.
> **OpenArt Model:** Flux.1 Dev

### **File: `guli_blue.png`**
> **Prompt:** Close-up of a single translucent blue glass marble, traditional Malaysian guli, internal swirls of white and light blue, shiny reflective surface, caustic light refractions, macro photography, white background.
> **OpenArt Model:** Flux.1 Dev

### **File: `guli_yellow.png`**
> **Prompt:** Close-up of a single translucent yellow glass marble, traditional Malaysian guli, internal swirls of orange and light yellow, shiny reflective surface, caustic light refractions, macro photography, white background.

### **File: `guli_red.png`**
> **Prompt:** Close-up of a single translucent red glass marble, traditional Malaysian guli, internal swirls of crimson and light orange, shiny reflective surface, caustic light refractions, macro photography, white background.

### **File: `guli_white.png`**
> **Prompt:** Close-up of a single translucent white glass marble, traditional Malaysian guli, internal swirls of pearlescent white and soft grey, shiny reflective surface, caustic light refractions, macro photography, white background.

### **File: `guli_black.png`**
> **Prompt:** Close-up of a single opaque obsidian black glass marble, Mythic Heritage Guli, internal swirls of deep violet and shimmering silver, shiny reflective surface, dramatic lighting, glossy finish, macro photography, white background.
> **OpenArt Model:** Flux.1 Dev

### **File: `guli_scam.png`**
> **Prompt:** Close-up of a single vibrant neon purple glass marble, glowing internal swirls of hot pink and electric lime, extremely shiny and tempting, macro photography, white background.
> **OpenArt Model:** Flux Kontext Dev

### **File: `guli_scam_green.png`**
> **Prompt:** Close-up of a single translucent emerald green glass marble, glowing internal swirls of lime and jade green, extremely shiny and tempting like a nature gem, macro photography, white background.
> **OpenArt Model:** Flux Kontext Dev

### **File: `guli_scam_orange.png`**
> **Prompt:** Close-up of a single translucent bright orange glass marble, glowing internal swirls of amber and molten gold, extremely shiny and tempting like a rare treasure, macro photography, white background.
> **OpenArt Model:** Flux Kontext Dev

### **File: `guli_scam_brown.png`**
> **Prompt:** Close-up of a single translucent dark brown glass marble, glowing internal swirls of bronze and ancient copper, extremely shiny and tempting like an antique artifact, macro photography, white background.
> **OpenArt Model:** Flux Kontext Dev

### **File: `guli_scam_pink.png`**
> **Prompt:** Close-up of a single translucent hot pink glass marble, glowing internal swirls of rose and magenta, extremely shiny and tempting like a love charm, macro photography, white background.
> **OpenArt Model:** Flux Kontext Dev

---

## 🌴 2. Environment (Folder: `/assets/textures/environment/`)

### **File: `grass_seamless.png`**
> **Prompt:** Seamless top-down texture of tropical lush green grass, small patches of brown soil, clover leaves, realistic lawn, high detail, 8k, uniform lighting, no shadows.
> **OpenArt Model:** Stable Diffusion XL (SDXL)

### **File: `wood_planks.png`**
> **Prompt:** Seamless texture of weathered tropical wood planks, used for stilted house floors, rustic brown, grainy, high detail, realistic wood knots.

### **File: `palm_leaf.png`**
> **Prompt:** Isolated single feather-like coconut palm leaf, vibrant green, detailed veins, tropical foliage, high resolution, white background (to be removed for alpha).

---

## 🛖 3. UI & Atmosphere (Folder: `/assets/textures/ui/`)

### **File: `menu_bg.png`**
> **Prompt:** Cinematic landscape of a traditional Malay village at sunset, stilted houses (Rumah Kampung), coconut trees, golden hour, soft bokeh, artistic oil painting style mixed with realism, wide angle.
> **OpenArt Model:** Flux.1 Dev

### **File: `paper_scroll.png`**
> **Prompt:** Old yellowish parchment paper texture, torn edges, traditional heritage look, used for UI panels.

### **File: `button_texture.png`**
> **Prompt:** Rectangular seamless texture of polished golden teak wood, intricate traditional Malay wood carving patterns on the edges, smooth glossy finish, rich amber tones, high detail, 4k, photorealistic. 
> **Resolution:** 1024x512

---

## 🛠️ Implementation Note
Once you have these files:
1. Put them in the folders I just created.
2. Tell me, and I will update the Three.js materials to use these `TextureLoader` paths instead of the basic colors. 
3. **Naming is critical!** Use lowercase and underscores as shown.
