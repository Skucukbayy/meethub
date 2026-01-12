'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/auth';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData.email, formData.password, formData.name);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Kayıt başarısız oldu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="logo" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        MeetHub
                    </h1>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Kayıt Ol</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Hesap oluşturun ve toplantılara başlayın
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Ad Soyad</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Adınız ve soyadınız"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">E-posta</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="ornek@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Şifre</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="En az 6 karakter"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="form-error" style={{ marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Zaten hesabınız var mı?{' '}
                    <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                        Giriş Yap
                    </Link>
                </div>
            </div>
        </div>
    );
}
