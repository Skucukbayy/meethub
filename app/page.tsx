'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">MeetHub</div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/login" className="btn btn-secondary">
                Giriş Yap
              </Link>
              <Link href="/register" className="btn btn-primary">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1 className="hero-title fade-in">
            Modern Video Konferans Platformu
          </h1>
          <p className="hero-subtitle fade-in">
            Ekibinizle kolayca bağlanın. Ses, video ve ekran paylaşımı ile
            profesyonel toplantılar yapın.
          </p>
          <div className="hero-actions fade-in">
            <Link href="/register" className="btn btn-primary">
              Ücretsiz Başla
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Toplantıya Katıl
            </Link>
          </div>
        </section>

        <section className="features">
          <div className="card card-glass feature-card fade-in">
            <div className="feature-icon">🎥</div>
            <h3 className="feature-title">HD Video & Ses</h3>
            <p className="feature-description">
              Kristal netliğinde görüntü ve ses kalitesi ile profesyonel
              toplantılar yapın.
            </p>
          </div>

          <div className="card card-glass feature-card fade-in">
            <div className="feature-icon">🖥️</div>
            <h3 className="feature-title">Ekran Paylaşımı</h3>
            <p className="feature-description">
              Sunumlarınızı ve ekranınızı kolayca paylaşın, birlikte çalışın.
            </p>
          </div>

          <div className="card card-glass feature-card fade-in">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">20 Kişiye Kadar</h3>
            <p className="feature-description">
              Her odada 20 kişiye kadar katılımcı ile büyük toplantılar yapın.
            </p>
          </div>

          <div className="card card-glass feature-card fade-in">
            <div className="feature-icon">🔗</div>
            <h3 className="feature-title">Kolay Paylaşım</h3>
            <p className="feature-description">
              Toplantı linkini paylaşın, katılımcılar tek tıkla katılsın.
            </p>
          </div>

          <div className="card card-glass feature-card fade-in">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Güvenli</h3>
            <p className="feature-description">
              End-to-end şifreleme ile güvenli ve özel toplantılar.
            </p>
          </div>

          <div className="card card-glass feature-card fade-in">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Hızlı & Stabil</h3>
            <p className="feature-description">
              WebRTC teknolojisi ile düşük gecikme ve yüksek performans.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
