# MeetHub Deployment Guide

Bu rehber MeetHub uygulamasını ücretsiz olarak deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

### Gerekli Hesaplar
1. ✅ **GitHub** hesabı (kod repository için)
2. ✅ **Render** hesabı (backend + database için) - https://render.com
3. ✅ **Vercel** hesabı (frontend için) - https://vercel.com

---

## 🚀 Deployment Adımları

### Adım 1: GitHub Repository Oluşturma

1. **GitHub.com'a gidin** ve giriş yapın

2. **Yeni repository oluşturun:**
   - Repository name: `meethub` (veya istediğiniz isim)
   - Description: "Modern video conferencing platform"
   - Public veya Private seçin
   - **Create repository** butonuna tıklayın

3. **Local repository'yi GitHub'a push edin:**

```bash
cd /Users/serhankucukbay/.gemini/antigravity/scratch/meeting-app

# Remote ekleyin (YOUR_USERNAME yerine GitHub kullanıcı adınızı yazın)
git remote add origin https://github.com/YOUR_USERNAME/meethub.git

# Main branch'e push edin
git branch -M main
git push -u origin main
```

---

### Adım 2: Render - Backend ve Database Deployment

#### 2.1 PostgreSQL Database Oluşturma

1. **Render.com'a gidin** ve giriş yapın

2. **Dashboard'dan "New +"** butonuna tıklayın

3. **"PostgreSQL"** seçin

4. **Database ayarları:**
   - Name: `meethub-db`
   - Database: `meethub`
   - User: `meethub`
   - Region: **Frankfurt** (Avrupa için en yakın)
   - PostgreSQL Version: **16**
   - Plan: **Free**

5. **"Create Database"** butonuna tıklayın

6. **Database oluşturulurken bekleyin** (1-2 dakika)

7. **Internal Database URL'i kopyalayın** (sonra kullanacağız)

#### 2.2 Backend Web Service Oluşturma

1. **Dashboard'dan "New +"** → **"Web Service"** seçin

2. **GitHub repository'yi bağlayın:**
   - "Connect a repository" seçeneğini seçin
   - GitHub hesabınızı bağlayın
   - `meethub` repository'sini seçin

3. **Service ayarları:**
   - Name: `meethub-backend`
   - Region: **Frankfurt**
   - Branch: `main`
   - Root Directory: (boş bırakın)
   - Environment: **Node**
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
   - Plan: **Free**

4. **Environment Variables ekleyin** (Advanced → Environment Variables):

   ```
   NODE_ENV = production
   
   DATABASE_URL = [Adım 2.1'de kopyaladığınız Internal Database URL]
   
   JWT_SECRET = [Güçlü random string - örn: kj3h4k5j6h7k8j9h0k1j2h3k4j5h6k7j8]
   
   CLIENT_URL = https://meethub.vercel.app
   (Not: Vercel deployment'tan sonra güncelleyeceğiz)
   ```

   > **JWT_SECRET için random string oluşturma:**
   > Terminal'de: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

5. **"Create Web Service"** butonuna tıklayın

6. **Deployment başlayacak** - ilk deployment 3-5 dakika sürebilir

7. **Deployment tamamlandığında** backend URL'inizi kopyalayın:
   - Örnek: `https://meethub-backend.onrender.com`

#### 2.3 Database Migration Çalıştırma

1. **Backend service sayfasında** "Shell" sekmesine gidin

2. **Migration komutunu çalıştırın:**
   ```bash
   npm run migrate
   ```

3. **Başarılı mesajı görmelisiniz:**
   ```
   ✅ Users table created
   ✅ Rooms table created
   ✅ Room participants table created
   ✅ Migration completed successfully!
   ```

---

### Adım 3: Vercel - Frontend Deployment

1. **Vercel.com'a gidin** ve giriş yapın

2. **"Add New..." → "Project"** seçin

3. **GitHub repository'yi import edin:**
   - "Import Git Repository" seçin
   - GitHub hesabınızı bağlayın (gerekirse)
   - `meethub` repository'sini seçin
   - **"Import"** butonuna tıklayın

4. **Project ayarları:**
   - Project Name: `meethub` (veya istediğiniz isim)
   - Framework Preset: **Next.js** (otomatik algılanır)
   - Root Directory: `./` (varsayılan)
   - Build Command: `npm run build` (varsayılan)
   - Output Directory: `.next` (varsayılan)

5. **Environment Variables ekleyin:**
   
   ```
   NEXT_PUBLIC_API_URL = https://meethub-backend.onrender.com
   (Adım 2.2'de aldığınız backend URL)
   ```

6. **"Deploy"** butonuna tıklayın

7. **Deployment tamamlanacak** (2-3 dakika)

8. **Production URL'inizi kopyalayın:**
   - Örnek: `https://meethub.vercel.app`

---

### Adım 4: CORS Ayarlarını Güncelleme

Frontend URL'iniz hazır olduğuna göre, backend'de CORS ayarlarını güncellememiz gerekiyor:

1. **Render.com'da backend service'e gidin**

2. **"Environment"** sekmesine gidin

3. **CLIENT_URL değişkenini güncelleyin:**
   ```
   CLIENT_URL = https://meethub.vercel.app
   (Adım 3.8'de aldığınız Vercel URL)
   ```

4. **"Save Changes"** butonuna tıklayın

5. **Backend otomatik olarak redeploy olacak** (1-2 dakika)

---

## ✅ Deployment Tamamlandı!

Tebrikler! Uygulamanız artık canlıda! 🎉

### Erişim Linkleri

- **Frontend (Kullanıcı Arayüzü):** https://meethub.vercel.app
- **Backend API:** https://meethub-backend.onrender.com

---

## 🧪 Test Etme

1. **Frontend URL'inizi açın**

2. **"Kayıt Ol" butonuna tıklayın**

3. **Yeni bir hesap oluşturun:**
   - Ad: Test User
   - Email: test@example.com
   - Şifre: test123

4. **Dashboard'a yönlendirileceksiniz**

5. **"Yeni Oda Oluştur" butonuna tıklayın**

6. **Oda adı girin ve oluşturun**

7. **"Katıl" butonuna tıklayın**

8. **Kamera/mikrofon izni verin**

9. **Kontrolleri test edin:**
   - 🎤 Mikrofon aç/kapat
   - 📹 Kamera aç/kapat
   - 🖥️ Ekran paylaşımı
   - 🔗 Link kopyalama

10. **Çoklu kullanıcı testi için:**
    - Oda linkini kopyalayın
    - Farklı bir tarayıcı/incognito modda açın
    - Yeni kullanıcı oluşturun
    - Linki yapıştırıp odaya katılın

---

## 🔧 Sorun Giderme

### Backend çalışmıyor

**Kontrol edin:**
- Render dashboard'da "Logs" sekmesine bakın
- Environment variables doğru mu?
- Database bağlantısı çalışıyor mu?

**Test:**
```bash
curl https://meethub-backend.onrender.com/health
# Beklenen: {"status":"ok"}
```

### Frontend API'ye bağlanamıyor

**Kontrol edin:**
- Vercel'de `NEXT_PUBLIC_API_URL` doğru mu?
- Backend URL'i https ile mi başlıyor?
- CORS ayarları güncel mi?

**Browser Console'da:**
- F12 → Console
- CORS hatası var mı?
- Network sekmesinde API istekleri başarısız mı?

### WebSocket bağlantısı kurulamıyor

**Kontrol edin:**
- Backend logs'da WebSocket hatası var mı?
- Render free tier sleep modunda mı? (15 dakika inaktivite sonrası)
- Browser console'da Socket.io hatası var mı?

### Database bağlantı hatası

**Kontrol edin:**
- DATABASE_URL environment variable doğru mu?
- Migration çalıştırıldı mı?
- PostgreSQL database aktif mi?

**Migration tekrar çalıştırma:**
```bash
# Render Shell'de
npm run migrate
```

---

## 💰 Maliyet ve Limitler

### Vercel Free Tier
- ✅ Sınırsız deployment
- ✅ 100GB bandwidth/ay
- ✅ Otomatik SSL
- ✅ Global CDN
- ⚠️ Limit: 100GB/ay bandwidth

### Render Free Tier
- ✅ 750 saat/ay (tek web service için yeterli)
- ✅ Otomatik SSL
- ✅ PostgreSQL 90 gün ücretsiz
- ⚠️ Limit: 15 dakika inaktivite sonrası sleep mode
- ⚠️ Cold start: ~30 saniye (ilk istek)

### PostgreSQL Database
- ✅ 90 gün ücretsiz (Render)
- ✅ 1GB storage
- ⚠️ 90 gün sonra: Neon.tech veya Supabase'e geçiş (kalıcı ücretsiz)

---

## 🔄 Güncelleme Yapma

### Code değişikliği yaptığınızda:

```bash
cd /Users/serhankucukbay/.gemini/antigravity/scratch/meeting-app

# Değişiklikleri commit edin
git add .
git commit -m "feat: yeni özellik eklendi"

# GitHub'a push edin
git push origin main
```

**Otomatik deployment:**
- Vercel: GitHub'a push sonrası otomatik deploy
- Render: GitHub'a push sonrası otomatik deploy

---

## 🌟 Production İyileştirmeleri

### 1. Custom Domain (Opsiyonel)

**Vercel:**
- Settings → Domains → Add Domain
- DNS ayarlarını yapın
- Otomatik SSL

**Render:**
- Settings → Custom Domain
- DNS ayarlarını yapın
- Otomatik SSL

### 2. TURN Server (NAT/Firewall için)

Ücretsiz TURN server:
- **Metered TURN**: 50GB/ay ücretsiz
- https://www.metered.ca/tools/openrelay/

`hooks/useWebRTC.ts` dosyasında:
```typescript
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'your-username',
      credential: 'your-credential'
    }
  ]
};
```

### 3. Monitoring

**Render:**
- Dashboard → Metrics
- CPU, Memory, Request count

**Vercel:**
- Analytics → Overview
- Page views, bandwidth

### 4. Database Backup

**Render PostgreSQL:**
- Dashboard → Backups
- Manuel backup oluşturma
- Otomatik daily backups (paid plan)

---

## 📞 Destek

**Render Docs:** https://render.com/docs  
**Vercel Docs:** https://vercel.com/docs  
**Next.js Docs:** https://nextjs.org/docs

---

## 🎉 Başarıyla Deploy Edildi!

Artık kendi video konferans platformunuz var! 

**Paylaşın ve kullanın:** https://meethub.vercel.app

**Not:** İlk ziyarette backend cold start nedeniyle 30 saniye kadar yavaş olabilir. Sonraki istekler hızlı olacaktır.
