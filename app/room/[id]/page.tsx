'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUser, getRoom } from '@/lib/auth';
import { useWebRTC } from '@/hooks/useWebRTC';

export default function RoomPage() {
    const router = useRouter();
    const params = useParams();
    const roomId = params.id as string;

    const [user, setUser] = useState<any>(null);
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const {
        localStream,
        participants,
        isAudioEnabled,
        isVideoEnabled,
        isScreenSharing,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        leaveRoom,
    } = useWebRTC(roomId, user?.name || 'Guest');

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.push(`/login?redirect=/room/${roomId}`);
            return;
        }
        setUser(currentUser);
        loadRoom();
    }, [roomId, router]);

    const loadRoom = async () => {
        try {
            const data = await getRoom(roomId);
            setRoom(data.room);
        } catch (error: any) {
            setError(error.message || 'Oda bulunamadı');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveRoom = () => {
        leaveRoom();
        router.push('/dashboard');
    };

    const copyRoomLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        alert('Oda linki kopyalandı!');
    };

    const getGridClass = () => {
        const totalParticipants = participants.size + 1; // +1 for local user
        if (totalParticipants === 1) return 'grid-1';
        if (totalParticipants === 2) return 'grid-2';
        if (totalParticipants <= 4) return 'grid-4';
        if (totalParticipants <= 6) return 'grid-6';
        if (totalParticipants <= 9) return 'grid-9';
        return 'grid-many';
    };

    if (loading) {
        return (
            <div className="page-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-center">
                <div className="card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Hata</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                        {error}
                    </p>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-primary">
                        Dashboard'a Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page" style={{ background: 'var(--color-bg-primary)' }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                background: 'rgba(30, 41, 59, 0.95)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{room?.name}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {participants.size + 1} katılımcı
                    </p>
                </div>
                <button onClick={copyRoomLink} className="btn btn-secondary">
                    🔗 Linki Kopyala
                </button>
            </div>

            {/* Video Grid */}
            <div style={{
                flex: 1,
                padding: '1rem',
                overflow: 'auto',
            }}>
                <div className={`video-grid ${getGridClass()}`}>
                    {/* Local Video */}
                    <div className="video-container">
                        <video
                            ref={(video) => {
                                if (video && localStream) {
                                    video.srcObject = localStream;
                                }
                            }}
                            autoPlay
                            muted
                            playsInline
                            className="video-element"
                        />
                        <div className="video-overlay">
                            <span className="video-name">Siz {isScreenSharing && '(Ekran Paylaşıyor)'}</span>
                            <div className="video-status">
                                {!isAudioEnabled && <span>🔇</span>}
                                {!isVideoEnabled && <span>📹</span>}
                            </div>
                        </div>
                    </div>

                    {/* Remote Videos */}
                    {Array.from(participants.values()).map((participant) => (
                        <div key={participant.peerId} className="video-container">
                            <video
                                ref={(video) => {
                                    if (video && participant.stream) {
                                        video.srcObject = participant.stream;
                                    }
                                }}
                                autoPlay
                                playsInline
                                className="video-element"
                            />
                            <div className="video-overlay">
                                <span className="video-name">
                                    {participant.userName} {participant.screenSharing && '(Ekran Paylaşıyor)'}
                                </span>
                                <div className="video-status">
                                    {!participant.audioEnabled && <span>🔇</span>}
                                    {!participant.videoEnabled && <span>📹</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Control Panel */}
            <div className="control-panel">
                <button
                    onClick={toggleAudio}
                    className={`control-btn ${isAudioEnabled ? 'active' : ''}`}
                    title={isAudioEnabled ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
                >
                    {isAudioEnabled ? '🎤' : '🔇'}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`control-btn ${isVideoEnabled ? 'active' : ''}`}
                    title={isVideoEnabled ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
                >
                    {isVideoEnabled ? '📹' : '📷'}
                </button>

                <button
                    onClick={toggleScreenShare}
                    className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                    title={isScreenSharing ? 'Ekran Paylaşımını Durdur' : 'Ekran Paylaş'}
                >
                    🖥️
                </button>

                <button
                    onClick={handleLeaveRoom}
                    className="control-btn danger"
                    title="Toplantıdan Ayrıl"
                >
                    📞
                </button>
            </div>
        </div>
    );
}
