'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout, createRoom, getRooms } from '@/lib/auth';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        loadRooms();
    }, [router]);

    const loadRooms = async () => {
        try {
            const data = await getRooms();
            setRooms(data.rooms);
        } catch (error) {
            console.error('Failed to load rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName.trim()) return;

        setCreating(true);
        try {
            const data = await createRoom(roomName);
            setRooms([data.room, ...rooms]);
            setRoomName('');
            setShowCreateForm(false);
        } catch (error: any) {
            alert(error.message || 'Oda oluşturulamadı');
        } finally {
            setCreating(false);
        }
    };

    const copyRoomLink = (roomId: string) => {
        const link = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(link);
        alert('Link kopyalandı!');
    };

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <div className="page-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page">
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">MeetHub</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                Merhaba, {user?.name}
                            </span>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Çıkış
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Toplantı Odalarım</h1>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="btn btn-primary"
                    >
                        + Yeni Oda Oluştur
                    </button>
                </div>

                {showCreateForm && (
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Yeni Toplantı Odası</h3>
                        <form onSubmit={handleCreateRoom}>
                            <div className="form-group">
                                <label className="form-label">Oda Adı</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Örn: Ekip Toplantısı"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={creating}
                                >
                                    {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="btn btn-secondary"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {rooms.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Henüz oda oluşturmadınız</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                            İlk toplantı odanızı oluşturun ve ekibinizle bağlanın
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn btn-primary"
                        >
                            İlk Odayı Oluştur
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                        {rooms.map((room) => (
                            <div key={room.id} className="card">
                                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                                    {room.name}
                                </h3>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    Oluşturulma: {new Date(room.created_at).toLocaleDateString('tr-TR')}
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link
                                        href={`/room/${room.id}`}
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        Katıl
                                    </Link>
                                    <button
                                        onClick={() => copyRoomLink(room.id)}
                                        className="btn btn-secondary"
                                        title="Linki Kopyala"
                                    >
                                        🔗
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
