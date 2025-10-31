
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface AudioPlayerProps {
  audioData: string | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      } else {
        console.error("Web Audio API is not supported in this browser.");
      }
    }

    // Decode new audio data when it arrives
    const setupAudio = async () => {
      if (audioData && audioContextRef.current) {
        setIsReady(false);
        // Stop any currently playing audio
        if (sourceNodeRef.current) {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }
        setIsPlaying(false);

        try {
          const decodedBytes = decode(audioData);
          const buffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
          audioBufferRef.current = buffer;
          setIsReady(true);
        } catch (error) {
          console.error("Failed to decode audio data:", error);
          setIsReady(false);
        }
      }
    };

    setupAudio();

    // Cleanup on unmount
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      }
       if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
         // Don't close context on data change, only on unmount
         // audioContextRef.current.close(); 
       }
    };
  }, [audioData]);

  const handlePlayPause = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current) return;
    
    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      // Pause
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Play
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  }, [isPlaying]);
  
  if (!audioData) return null;

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
      <button
        onClick={handlePlayPause}
        disabled={!isReady}
        className="p-3 bg-blue-600 rounded-full text-white disabled:bg-gray-500 disabled:cursor-wait transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
        aria-label={isPlaying ? 'Pause summary' : 'Play summary'}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="text-sm font-medium text-gray-300">
        {isReady ? "Audio summary ready" : "Preparing audio..."}
      </div>
    </div>
  );
};

export default AudioPlayer;
