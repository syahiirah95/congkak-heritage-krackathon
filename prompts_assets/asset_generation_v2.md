# 🎨 Congkak Quest — Full Asset Generation Guide (V2)

Use these prompts with **OpenArt (Recommended Model: Flux.1 Dev)** for the best results.
Save with the exact filenames provided into the correct `public/assets/textures/` sub-folders.

> **IMPORTANT:** All textures that need transparency (alpha channel) MUST be generated on a **pure white background** so we can easily remove it or use `alphaTest`.

---

## 📐 Recommended Resolutions
| Type | Resolution |
|---|---|
| Seamless Textures (ground, wood, bark) | 1024x1024 |
| Individual Assets (guli, leaf, character) | 1024x1024 (Square) |
| Panoramic / Skybox | 2048x1024 |
| UI Elements | 1024x512 |

---

## 🧑 1. Player Character (Folder: `/assets/textures/player/`)

Currently the player is a blocky humanoid using plain colors. We want to apply realistic textures to each body part.

### **File: `player_face.png`**
> **Prompt:** Front-facing portrait of a young Malaysian boy, cheerful smile, traditional Malay songkok cap on head, warm brown skin tone, big friendly eyes, cartoon-realistic style (like Pixar), clean simple background, suitable for game character face texture map, detailed but stylized, 4k.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 512x512

### **File: `player_shirt.png`**
> **Prompt:** Seamless fabric texture of a traditional Malay Baju Melayu shirt, deep royal blue color with subtle golden songket thread patterns along the edges, soft cotton fabric weave visible, high detail, realistic textile close-up, 4k, uniform lighting. 
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 512x512

### **File: `player_pants.png`**
> **Prompt:** Seamless fabric texture of traditional Malay seluar (trousers), dark navy blue or black fabric, simple cotton weave, subtle creases, realistic textile texture, high detail, 4k, uniform lighting.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 512x512

### **File: `player_skin.png`**
> **Prompt:** Seamless human skin texture, warm medium brown Southeast Asian skin tone, subtle pore details, smooth realistic skin, high detail, 4k, uniform soft lighting, no blemishes.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 512x512

---

## 🌴 2. Environment — Trees & Vegetation (Folder: `/assets/textures/environment/`)

### **File: `palm_bark.png`**
> **Prompt:** Seamless texture of coconut palm tree trunk bark, rough fibrous brown bark with horizontal ring patterns, characteristic coconut palm texture with old leaf scars, tropical, weathered, photorealistic close-up, 4k, uniform lighting, no shadows.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 1024x1024

### **File: `palm_leaf.png`** *(REPLACE EXISTING — current one looks flat)*
> **Prompt:** Single isolated coconut palm frond leaf from above, long feather-like shape with individual leaflets spreading from central stem, vibrant tropical green color, detailed leaf veins and natural slight yellowing at tips, high resolution, photorealistic, PURE WHITE background for alpha cutout, no other objects.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 1024x1024

### **File: `coconut_cluster.png`**
> **Prompt:** Small cluster of 3-4 green coconuts hanging together, tropical fruit, realistic, seen from below looking up, pure white background for alpha cutout, photorealistic, high detail.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 512x512

### **File: `grass_seamless.png`** *(REPLACE EXISTING — current one is too noisy)*
> **Prompt:** Seamless top-down view of lush tropical village grass, short well-maintained green lawn with occasional tiny wildflowers, a few small fallen leaves, warm sunlit appearance, soft green tones, no harsh shadows, game texture style, tileable, 4k.
> **OpenArt Model:** SDXL
> **Resolution:** 1024x1024

### **File: `dirt_path.png`**
> **Prompt:** Seamless top-down texture of packed brown dirt village path, a few small pebbles, dry tropical soil, warm earth tones, subtle foot traffic marks, tileable, photorealistic, 4k, uniform lighting.
> **OpenArt Model:** SDXL
> **Resolution:** 1024x1024

---

## 🛖 3. Environment — Traditional Malay Houses (Folder: `/assets/textures/environment/`)

### **File: `wood_planks.png`** *(REPLACE EXISTING — current one is too dark)*
> **Prompt:** Seamless texture of traditional Malaysian kampung house wooden wall planks, aged tropical hardwood, warm honey-brown color with natural grain patterns, horizontal plank layout, rustic but well-maintained, weathered edges, photorealistic, 4k, uniform straight-on lighting.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 1024x1024

### **File: `attap_roof.png`**
> **Prompt:** Seamless texture of traditional Malaysian attap (nipah palm leaf) thatched roof, overlapping woven dried palm leaves, golden-brown straw color, detailed weave pattern visible, traditional kampung roofing, photorealistic close-up, 4k, uniform lighting.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 1024x1024

### **File: `bamboo_stilt.png`**
> **Prompt:** Seamless texture of thick bamboo pole surface, light golden-tan color with characteristic bamboo nodes/joints visible, smooth polished tropical bamboo, vertical orientation, photorealistic, 4k, uniform lighting.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 512x1024

### **File: `kampung_window.png`**
> **Prompt:** Front view of a traditional Malaysian kampung house wooden window frame, ornate traditional Malay wood carving (ukiran) border, open shutters revealing dark interior, warm teak wood color, photorealistic, white background for alpha cutout, 4k.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 512x512

---

## 🌅 4. Sky & Atmosphere (Folder: `/assets/textures/environment/`)

### **File: `sky_panorama.png`**
> **Prompt:** Seamless 360-degree equirectangular panoramic HDR sky, beautiful golden hour tropical sunset, warm orange and pink clouds, Southeast Asian kampung atmosphere, coconut palms silhouetted on horizon, soft volumetric light rays, photorealistic, high dynamic range, 4k.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 2048x1024

---

## 🛶 5. Congkak & Guli (Folder: `/assets/textures/congkak/`)

> **These existing assets are mostly good. Only the wood needs replacement.**

### **File: `congkak_wood.png`** *(REPLACE EXISTING — needs more carved details)*
> **Prompt:** Top-down view of a traditional Malaysian Congkak game board surface texture, richly carved dark teak wood with intricate traditional Malay floral ukiran (carving) patterns along the edges, polished glossy finish, warm mahogany tones, visible wood grain, museum-quality antique piece, photorealistic, 4k, uniform overhead lighting.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 1024x512

---

## 🛠️ 6. Props & Decorations (Folder: `/assets/textures/environment/`)

### **File: `stone_well.png`**
> **Prompt:** Seamless texture of old tropical village stone well wall, rough-cut grey limestone blocks, some moss growing between cracks, aged and weathered, traditional Southeast Asian village style, photorealistic, 4k, uniform lighting.
> **OpenArt Model:** SDXL
> **Resolution:** 512x512

### **File: `hanging_lantern.png`**
> **Prompt:** Traditional Malaysian oil lamp (pelita), brass colored, ornate, warm glowing flame visible inside, isolated on pure white background for alpha cutout, photorealistic product shot, high detail, 4k.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 512x512

### **File: `wooden_fence.png`**
> **Prompt:** Seamless texture of traditional kampung wooden fence, simple rustic horizontal bamboo/wood slats, warm brown color, slightly weathered, traditional Malaysian village style, tileable, photorealistic, 4k, uniform lighting.
> **OpenArt Model:** SDXL
> **Resolution:** 1024x512

### **File: `tok_aki_face.png`** (Folder: `/assets/textures/player/`)
> **Prompt:** Front-facing portrait of an elderly Malaysian man (Tok Aki), kind eyes, wise expression, white beard and hair, wearing a traditional Malay songkok and white Baju Melayu, warm sun-weathered brown skin tone, cartoon-realistic style (like Pixar), clean simple background, 4k.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 512x512

### **File: `bounty_board_texture.png`** (Folder: `/assets/textures/environment/`)
> **Prompt:** Texture for a wooden notice board, rustic tropical wood frame, with several old yellowish parchment papers pinned to it, hand-drawn Malay sketches of marbles and game rules, tropical Southeast Asian aesthetic, photorealistic close-up, 4k, uniform lighting.
> **OpenArt Model:** Flux.1 Dev
> **Resolution:** 1024x1024

---

## 📋 Asset Checklist

| # | File | Folder | Status |
|---|---|---|---|
| 1 | `player_face.png` | `/player/` | ⬜ NEW |
| 2 | `player_shirt.png` | `/player/` | ⬜ NEW |
| 3 | `player_pants.png` | `/player/` | ⬜ NEW |
| 4 | `player_skin.png` | `/player/` | ⬜ NEW |
| 5 | `palm_bark.png` | `/environment/` | ⬜ NEW |
| 6 | `palm_leaf.png` | `/environment/` | 🔄 REPLACE |
| 7 | `coconut_cluster.png` | `/environment/` | ⬜ NEW |
| 8 | `grass_seamless.png` | `/environment/` | 🔄 REPLACE |
| 9 | `dirt_path.png` | `/environment/` | ⬜ NEW |
| 10 | `wood_planks.png` | `/environment/` | 🔄 REPLACE |
| 11 | `attap_roof.png` | `/environment/` | ⬜ NEW |
| 12 | `bamboo_stilt.png` | `/environment/` | ⬜ NEW |
| 13 | `kampung_window.png` | `/environment/` | ⬜ NEW |
| 14 | `sky_panorama.png` | `/environment/` | ⬜ NEW |
| 15 | `congkak_wood.png` | `/congkak/` | 🔄 REPLACE |
| 16 | `stone_well.png` | `/environment/` | ⬜ NEW |
| 17 | `hanging_lantern.png` | `/environment/` | ⬜ NEW |
| 18 | `wooden_fence.png` | `/environment/` | ⬜ NEW |
| 19 | `tok_aki_face.png` | `/player/` | ⬜ NEW |
| 20 | `bounty_board_texture.png` | `/environment/` | ⬜ NEW |

---

## 🛠️ Implementation Plan
Once all assets are generated and placed:
1. **Player.js** — Apply `player_face.png`, `player_shirt.png`, `player_pants.png`, `player_skin.png` textures to the humanoid body parts.
2. **World.js — Trees** — Apply `palm_bark.png` to trunk, improved `palm_leaf.png` for fronds, add `coconut_cluster.png` sprite.
3. **World.js — Houses** — Apply `attap_roof.png` to roofs, `bamboo_stilt.png` to stilts, `kampung_window.png` as decal, improved `wood_planks.png` for walls.
4. **World.js — Ground** — Use improved `grass_seamless.png` with `dirt_path.png` pathways.
5. **World.js — Sky** — Use `sky_panorama.png` as equirectangular environment map for realistic sky.
6. **Props** — Add village props like stone well, hanging lanterns, and wooden fences for immersion.
