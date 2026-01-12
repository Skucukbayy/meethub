'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '@/lib/auth';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Participant {
    peerId: string;
    userId: number;
    userName: string;
    stream?: MediaStream;
    audioEnabled: boolean;
    videoEnabled: boolean;
    screenSharing: boolean;
}

interface UseWebRTCReturn {
    localStream: MediaStream | null;
    participants: Map<string, Participant>;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;
    toggleScreenShare: () => void;
    leaveRoom: () => void;
}

export function useWebRTC(roomId: string, userName: string): UseWebRTCReturn {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const screenStreamRef = useRef<MediaStream | null>(null);

    // ICE servers configuration
    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    // Initialize local media stream
    useEffect(() => {
        const initializeMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setLocalStream(stream);
            } catch (error) {
                console.error('Error accessing media devices:', error);
                alert('Kamera veya mikrofona erişim izni gerekli!');
            }
        };

        initializeMedia();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Initialize socket connection and WebRTC
    useEffect(() => {
        if (!localStream) return;

        const token = getToken();
        if (!token) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to signaling server');
            socket.emit('join-room', { roomId, userName });
        });

        socket.on('room-joined', ({ participants: existingParticipants }) => {
            console.log('Joined room, existing participants:', existingParticipants);

            // Create peer connections for existing participants
            existingParticipants.forEach((participant: any) => {
                createPeerConnection(participant.peerId, true, participant);
            });
        });

        socket.on('user-joined', ({ peerId, userName: newUserName, userId }) => {
            console.log('User joined:', newUserName);
            createPeerConnection(peerId, false, { peerId, userName: newUserName, userId });
        });

        socket.on('user-left', ({ peerId }) => {
            console.log('User left:', peerId);
            closePeerConnection(peerId);
        });

        socket.on('offer', async ({ from, offer }) => {
            const pc = peerConnectionsRef.current.get(from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('answer', { to: from, answer });
            }
        });

        socket.on('answer', async ({ from, answer }) => {
            const pc = peerConnectionsRef.current.get(from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on('ice-candidate', async ({ from, candidate }) => {
            const pc = peerConnectionsRef.current.get(from);
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on('user-audio-toggled', ({ peerId, enabled }) => {
            setParticipants(prev => {
                const updated = new Map(prev);
                const participant = updated.get(peerId);
                if (participant) {
                    participant.audioEnabled = enabled;
                    updated.set(peerId, participant);
                }
                return updated;
            });
        });

        socket.on('user-video-toggled', ({ peerId, enabled }) => {
            setParticipants(prev => {
                const updated = new Map(prev);
                const participant = updated.get(peerId);
                if (participant) {
                    participant.videoEnabled = enabled;
                    updated.set(peerId, participant);
                }
                return updated;
            });
        });

        socket.on('user-screen-share-started', ({ peerId }) => {
            setParticipants(prev => {
                const updated = new Map(prev);
                const participant = updated.get(peerId);
                if (participant) {
                    participant.screenSharing = true;
                    updated.set(peerId, participant);
                }
                return updated;
            });
        });

        socket.on('user-screen-share-stopped', ({ peerId }) => {
            setParticipants(prev => {
                const updated = new Map(prev);
                const participant = updated.get(peerId);
                if (participant) {
                    participant.screenSharing = false;
                    updated.set(peerId, participant);
                }
                return updated;
            });
        });

        return () => {
            socket.disconnect();
            peerConnectionsRef.current.forEach(pc => pc.close());
            peerConnectionsRef.current.clear();
        };
    }, [localStream, roomId, userName]);

    const createPeerConnection = useCallback((peerId: string, createOffer: boolean, participantInfo: any) => {
        if (!localStream || !socketRef.current) return;

        const pc = new RTCPeerConnection(iceServers);
        peerConnectionsRef.current.set(peerId, pc);

        // Add local tracks to peer connection
        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });

        // Handle incoming tracks
        pc.ontrack = (event) => {
            console.log('Received track from', peerId);
            setParticipants(prev => {
                const updated = new Map(prev);
                const participant = updated.get(peerId) || {
                    ...participantInfo,
                    audioEnabled: true,
                    videoEnabled: true,
                    screenSharing: false,
                };
                participant.stream = event.streams[0];
                updated.set(peerId, participant);
                return updated;
            });
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', {
                    to: peerId,
                    candidate: event.candidate,
                });
            }
        };

        // Create offer if initiator
        if (createOffer) {
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    if (socketRef.current) {
                        socketRef.current.emit('offer', {
                            to: peerId,
                            offer: pc.localDescription,
                        });
                    }
                })
                .catch(error => console.error('Error creating offer:', error));
        }

        // Add participant to state
        setParticipants(prev => {
            const updated = new Map(prev);
            updated.set(peerId, {
                ...participantInfo,
                audioEnabled: true,
                videoEnabled: true,
                screenSharing: false,
            });
            return updated;
        });
    }, [localStream, iceServers]);

    const closePeerConnection = useCallback((peerId: string) => {
        const pc = peerConnectionsRef.current.get(peerId);
        if (pc) {
            pc.close();
            peerConnectionsRef.current.delete(peerId);
        }

        setParticipants(prev => {
            const updated = new Map(prev);
            updated.delete(peerId);
            return updated;
        });
    }, []);

    const toggleAudio = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);

                if (socketRef.current) {
                    socketRef.current.emit('toggle-audio', { enabled: audioTrack.enabled });
                }
            }
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);

                if (socketRef.current) {
                    socketRef.current.emit('toggle-video', { enabled: videoTrack.enabled });
                }
            }
        }
    }, [localStream]);

    const toggleScreenShare = useCallback(async () => {
        if (isScreenSharing) {
            // Stop screen sharing
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
                screenStreamRef.current = null;
            }

            // Restore camera stream
            if (localStream) {
                const videoTrack = localStream.getVideoTracks()[0];
                peerConnectionsRef.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender && videoTrack) {
                        sender.replaceTrack(videoTrack);
                    }
                });
            }

            setIsScreenSharing(false);
            if (socketRef.current) {
                socketRef.current.emit('screen-share-stopped');
            }
        } else {
            // Start screen sharing
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                });

                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace video track in all peer connections
                peerConnectionsRef.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });

                // Handle screen share stop
                screenTrack.onended = () => {
                    toggleScreenShare();
                };

                setIsScreenSharing(true);
                if (socketRef.current) {
                    socketRef.current.emit('screen-share-started');
                }
            } catch (error) {
                console.error('Error sharing screen:', error);
            }
        }
    }, [isScreenSharing, localStream]);

    const leaveRoom = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('leave-room');
            socketRef.current.disconnect();
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }

        peerConnectionsRef.current.forEach(pc => pc.close());
        peerConnectionsRef.current.clear();
    }, [localStream]);

    return {
        localStream,
        participants,
        isAudioEnabled,
        isVideoEnabled,
        isScreenSharing,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        leaveRoom,
    };
}
