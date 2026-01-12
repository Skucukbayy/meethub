# Sonraki Adımlar - Backend URL ve Migration

## ✅ Tamamlanan

- GitHub repository oluşturuldu
- Kod push edildi
- Render PostgreSQL database oluşturuldu
- Render backend deploy edildi

## 🔄 Şimdi Yapılacaklar

### 1. Backend URL'ini Alın

Render backend service sayfasında:
- Üst kısımda backend URL'inizi göreceksiniz
- Örnek: `https://meethub-backend-xxx.onrender.com`
- Bu URL'i kopyalayın

### 2. Database Migration Çalıştırın

Render backend service sayfasında:
1. **"Shell"** sekmesine gidin
2. Şu komutu çalıştırın:
   ```bash
   npm run migrate
   ```
3. Başarılı mesajları görmelisiniz:
   ```
   ✅ Users table created
   ✅ Rooms table created
   ✅ Room participants table created
   ✅ Migration completed successfully!
   ```

### 3. Backend URL'ini Verin

Migration tamamlandıktan sonra backend URL'inizi bana verin.

Örnek: `https://meethub-backend-abc123.onrender.com`

## 📋 Sonraki: Vercel Frontend Deployment

Backend URL'i aldıktan sonra Vercel'de frontend deploy edeceğiz!
