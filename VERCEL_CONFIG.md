# Vercel Frontend Deployment - Yapılandırma

Backend URL'iniz hazır: `https://meethub-backend-v8kh.onrender.com`

## Vercel Deployment Adımları

### 1. Repository Import

1. **"Continue with GitHub"** butonuna tıklayın
2. `Skucukbayy/meethub` repository'sini bulun
3. **"Import"** butonuna tıklayın

### 2. Project Configuration

**Framework Preset:** `Next.js` (otomatik algılanmalı)

**Root Directory:** Boş bırakın

**Build Command:** `npm run build` (otomatik)

**Output Directory:** `.next` (otomatik)

### 3. Environment Variables

**Environment Variables** bölümünü açın ve ekleyin:

- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://meethub-backend-v8kh.onrender.com`

### 4. Deploy

**"Deploy"** butonuna tıklayın!

## ⏳ Deployment Süreci

- Deployment 2-3 dakika sürecek
- Build logs'u izleyebilirsiniz
- Tamamlandığında Vercel size bir URL verecek

## ✅ Deployment Tamamlandığında

1. Vercel URL'inizi kopyalayın (örn: `https://meethub-xxx.vercel.app`)
2. Bana **"frontend deploy oldu"** ve URL'inizi verin
3. Son adım: Render'da CORS ayarlarını güncelleyeceğiz

🚀 Neredeyse bitti!
