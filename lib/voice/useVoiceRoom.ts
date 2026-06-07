"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
const SPEAK_THRESHOLD = 0.045;

/** Max people in one voice room (mesh stays smooth up to ~6). */
export const MAX_VOICE = 6;

type SignalMessage =
  | { from: string; to: string; description: RTCSessionDescriptionInit }
  | { from: string; to: string; candidate: RTCIceCandidateInit };

type Peer = {
  pc: RTCPeerConnection;
  polite: boolean;
  makingOffer: boolean;
  ignoreOffer: boolean;
  audio: HTMLAudioElement;
  analyser: AnalyserNode | null;
};

export type VoiceMember = { userId: string; username: string };

/**
 * WebRTC mesh voice for a room. Signaling rides the user's existing Supabase
 * Realtime (a dedicated `voice:${roomId}` channel): presence = who has the mic
 * on, broadcast = SDP/ICE. Glare is handled with the "perfect negotiation"
 * pattern. All WebRTC lives here so it can later be swapped for LiveKit.
 */
export function useVoiceRoom({
  roomId,
  userId,
  username,
}: {
  roomId: string;
  userId: string;
  username: string;
}) {
  const supabase = useMemo(() => createClient(), []);

  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<VoiceMember[]>([]);
  const [speakingIds, setSpeakingIds] = useState<string[]>([]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, Peer>>(new Map());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const localAnalyserRef = useRef<AnalyserNode | null>(null);
  const hideHandlerRef = useRef<(() => void) | null>(null);
  const mutedRef = useRef(true);

  const leave = useCallback(() => {
    peersRef.current.forEach((peer) => {
      peer.pc.onicecandidate = null;
      peer.pc.ontrack = null;
      peer.pc.onnegotiationneeded = null;
      peer.pc.close();
      peer.audio.srcObject = null;
      peer.audio.remove();
    });
    peersRef.current.clear();

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    localAnalyserRef.current = null;

    if (hideHandlerRef.current) {
      window.removeEventListener("pagehide", hideHandlerRef.current);
      hideHandlerRef.current = null;
    }
    if (channelRef.current) {
      void channelRef.current.untrack();
      void supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    mutedRef.current = true;
    setJoined(false);
    setJoining(false);
    setMuted(true);
    setMembers([]);
    setSpeakingIds([]);
  }, [supabase]);

  const join = useCallback(async () => {
    if (joined || joining) return;
    setJoining(true);
    setError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Mic permission is needed to join voice.");
      setJoining(false);
      return;
    }
    streamRef.current = stream;
    stream.getAudioTracks().forEach((t) => (t.enabled = false)); // start muted
    mutedRef.current = true;
    setMuted(true);

    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    try {
      const localAnalyser = ctx.createAnalyser();
      localAnalyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(localAnalyser);
      localAnalyserRef.current = localAnalyser;
    } catch {
      /* speaking detection is best-effort */
    }

    const channel = supabase.channel(`voice:${roomId}`, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    const send = (msg: SignalMessage) => {
      void channel.send({ type: "broadcast", event: "signal", payload: msg });
    };

    const createPeer = (remoteId: string): Peer => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const audio = document.createElement("audio");
      audio.autoplay = true;
      document.body.appendChild(audio);

      const peer: Peer = {
        pc,
        polite: userId > remoteId,
        makingOffer: false,
        ignoreOffer: false,
        audio,
        analyser: null,
      };
      peersRef.current.set(remoteId, peer);

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) send({ from: userId, to: remoteId, candidate: candidate.toJSON() });
      };
      pc.onnegotiationneeded = async () => {
        try {
          peer.makingOffer = true;
          await pc.setLocalDescription();
          const d = pc.localDescription;
          if (d) send({ from: userId, to: remoteId, description: { type: d.type, sdp: d.sdp } });
        } catch {
          /* ignore */
        } finally {
          peer.makingOffer = false;
        }
      };
      pc.ontrack = ({ streams }) => {
        const [remoteStream] = streams;
        audio.srcObject = remoteStream;
        audio.muted = false;
        audio.volume = 1;
        void audio.play().catch(() => {});
        try {
          const a = ctx.createAnalyser();
          a.fftSize = 512;
          ctx.createMediaStreamSource(remoteStream).connect(a);
          peer.analyser = a;
        } catch {
          /* ignore */
        }
      };

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      return peer;
    };

    const dropPeer = (remoteId: string) => {
      const peer = peersRef.current.get(remoteId);
      if (!peer) return;
      peer.pc.close();
      peer.audio.srcObject = null;
      peer.audio.remove();
      peersRef.current.delete(remoteId);
    };

    const handleSignal = async (msg: SignalMessage) => {
      if (msg.to !== userId) return;
      const remoteId = msg.from;
      const peer = peersRef.current.get(remoteId) ?? createPeer(remoteId);
      const pc = peer.pc;
      try {
        if ("description" in msg) {
          const collision =
            msg.description.type === "offer" &&
            (peer.makingOffer || pc.signalingState !== "stable");
          peer.ignoreOffer = !peer.polite && collision;
          if (peer.ignoreOffer) return;
          await pc.setRemoteDescription(msg.description);
          if (msg.description.type === "offer") {
            await pc.setLocalDescription();
            const d = pc.localDescription;
            if (d) send({ from: userId, to: remoteId, description: { type: d.type, sdp: d.sdp } });
          }
        } else {
          try {
            await pc.addIceCandidate(msg.candidate);
          } catch {
            /* candidate may arrive before remote description; ok to drop */
          }
        }
      } catch {
        /* ignore */
      }
    };

    const syncPeers = () => {
      const state = channel.presenceState() as Record<string, Array<Record<string, unknown>>>;
      const list: VoiceMember[] = Object.values(state)
        .map((entries) => {
          const p = entries[0] ?? {};
          return { userId: String(p.userId ?? ""), username: String(p.username ?? "anon") };
        })
        .filter((m) => m.userId);
      setMembers(list);

      const present = new Set(list.map((m) => m.userId));
      list.forEach((m) => {
        if (m.userId !== userId && !peersRef.current.has(m.userId)) createPeer(m.userId);
      });
      peersRef.current.forEach((_peer, id) => {
        if (!present.has(id)) dropPeer(id);
      });
    };

    channel.on("broadcast", { event: "signal" }, ({ payload }) => {
      void handleSignal(payload as SignalMessage);
    });
    channel
      .on("presence", { event: "sync" }, syncPeers)
      .on("presence", { event: "join" }, syncPeers)
      .on("presence", { event: "leave" }, syncPeers);

    const handleHide = () => {
      void channel.untrack();
    };
    hideHandlerRef.current = handleHide;
    window.addEventListener("pagehide", handleHide);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void channel.track({ userId, username });
        setJoined(true);
        setJoining(false);
      }
    });
  }, [joined, joining, supabase, roomId, userId, username]);

  const toggleMute = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const next = !mutedRef.current;
    stream.getAudioTracks().forEach((t) => (t.enabled = !next));
    mutedRef.current = next;
    setMuted(next);
  }, []);

  // Who's speaking (audio level over a light interval).
  useEffect(() => {
    if (!joined) return;
    const rms = (analyser: AnalyserNode) => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      return Math.sqrt(sum / data.length);
    };
    const id = window.setInterval(() => {
      const speaking: string[] = [];
      const local = localAnalyserRef.current;
      if (local && !mutedRef.current && rms(local) > SPEAK_THRESHOLD) speaking.push(userId);
      peersRef.current.forEach((peer, id2) => {
        if (peer.analyser && rms(peer.analyser) > SPEAK_THRESHOLD) speaking.push(id2);
      });
      setSpeakingIds(speaking);
    }, 250);
    return () => window.clearInterval(id);
  }, [joined, userId]);

  // Tear down on unmount.
  useEffect(() => {
    return () => leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = members.length;
  return {
    joined,
    joining,
    muted,
    error,
    members,
    speakingIds,
    count,
    full: !joined && count >= MAX_VOICE,
    join,
    leave,
    toggleMute,
  };
}
