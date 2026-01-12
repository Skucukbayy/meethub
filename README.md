# MeetHub - Video Conferencing Platform

Modern, premium video konferans uygulaması. WebRTC teknolojisi ile ses, video ve ekran paylaşımı özellikleri.

## Özellikler

- ✅ Kullanıcı kayıt ve giriş sistemi (JWT authentication)
- ✅ Toplantı odası oluşturma ve yönetimi
- ✅ Paylaşılabilir oda linkleri
- ✅ 20 kişiye kadar katılımcı desteği
- ✅ HD video ve ses kalitesi
- ✅ Ekran paylaşımı
- ✅ Mikrofon ve kamera kontrolü
- ✅ Responsive tasarım
- ✅ Modern dark theme UI

## Teknoloji Stack

### Frontend
- Next.js 16 (React 19)
- TypeScript
- Socket.io Client
- WebRTC API

### Backend
- Node.js + Express
- Socket.io (WebRTC signaling)
- SQLite (better-sqlite3)
- JWT Authentication
- bcryptjs

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Environment Variables

Proje root dizininde `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Uygulamayı Çalıştırın

İki ayrı terminal penceresi açın:

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend (Next.js):**
```bash
npm run dev
```

Uygulama şu adreslerde çalışacak:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Kullanım

1. **Kayıt Olun**: http://localhost:3000/register adresinden yeni hesap oluşturun
2. **Giriş Yapın**: Email ve şifrenizle giriş yapın
3. **Oda Oluşturun**: Dashboard'dan "Yeni Oda Oluştur" butonuna tıklayın
4. **Link Paylaşın**: Oda linkini kopyalayıp katılımcılarla paylaşın
5. **Toplantıya Katılın**: Odaya girin ve kamera/mikrofon izinlerini verin

## Kontroller

- 🎤 **Mikrofon**: Mikrofonu aç/kapat
- 📹 **Kamera**: Kamerayı aç/kapat
- 🖥️ **Ekran Paylaşımı**: Ekranınızı paylaşın
- 📞 **Ayrıl**: Toplantıdan çıkın

## Proje Yapısı

```
meeting-app/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── room/[id]/        # Meeting room page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── hooks/                 # Custom React hooks
│   └── useWebRTC.ts      # WebRTC management hook
├── lib/                   # Utilities
│   └── auth.ts           # Auth utilities
├── server/                # Backend server
│   ├── api.js            # REST API routes
│   ├── auth.js           # Auth middleware
│   ├── db.js             # Database layer
│   ├── index.js          # Server entry point
│   └── signaling.js      # Socket.io signaling
└── database.sqlite        # SQLite database (auto-created)
```

## Veritabanı Şeması

### Users
- id (PRIMARY KEY)
- email (UNIQUE)
- password (hashed)
- name
- created_at

### Rooms
- id (PRIMARY KEY, UUID)
- name
- creator_id (FOREIGN KEY → users)
- max_participants (default: 20)
- is_active
- created_at

### Room Participants
- id (PRIMARY KEY)
- room_id (FOREIGN KEY → rooms)
- user_id (FOREIGN KEY → users)
- joined_at
- left_at

## API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi (protected)

### Rooms
- `POST /api/rooms` - Yeni oda oluştur (protected)
- `GET /api/rooms` - Kullanıcının odalarını listele (protected)
- `GET /api/rooms/:id` - Oda detayları

## WebRTC Signaling Events

### Client → Server
- `join-room` - Odaya katıl
- `leave-room` - Odadan ayrıl
- `offer` - WebRTC offer gönder
- `answer` - WebRTC answer gönder
- `ice-candidate` - ICE candidate gönder
- `toggle-audio` - Mikrofon durumu
- `toggle-video` - Kamera durumu
- `screen-share-started` - Ekran paylaşımı başladı
- `screen-share-stopped` - Ekran paylaşımı durdu

### Server → Client
- `room-joined` - Odaya katılındı
- `user-joined` - Yeni kullanıcı katıldı
- `user-left` - Kullanıcı ayrıldı
- `user-audio-toggled` - Kullanıcı mikrofon değiştirdi
- `user-video-toggled` - Kullanıcı kamera değiştirdi
- `user-screen-share-started` - Kullanıcı ekran paylaşmaya başladı
- `user-screen-share-stopped` - Kullanıcı ekran paylaşmayı durdurdu

## Production Deployment

### Environment Variables
Production'da mutlaka değiştirin:
- `JWT_SECRET`: Güçlü, rastgele bir string kullanın
- `NEXT_PUBLIC_API_URL`: Production API URL'iniz

### Database
SQLite yerine PostgreSQL veya MySQL kullanmanız önerilir.

### TURN Server
NAT/Firewall arkasındaki kullanıcılar için TURN server ekleyin:

```typescript
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
};
```

## Tarayıcı Desteği

- ✅ Chrome/Edge (Chromium) 
- ✅ Firefox
- ✅ Safari
- ⚠️ Mobile browsers (sınırlı destek)

## Lisans

MIT
