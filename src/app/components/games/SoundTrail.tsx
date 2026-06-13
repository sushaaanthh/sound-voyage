import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Home, Check, X, Sparkles, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ThemeToggle } from '../ThemeToggle';
import { useGameSession } from '../../context/GameSessionContext';
import { supabase } from '../../../lib/supabase';
import { soundTrailData, SoundTrailLevel } from '../../../data/soundTrailData';

export default function SoundTrail() {
  const navigate = useNavigate();
  const { level } = useParams();
  const { progressorId, completedLevels } = useGameSession();

  const levelStr = level || '1';
  const levelNum = Number(levelStr);

  // Retrieve current level configuration
  const currentLevelConfig: SoundTrailLevel =
    soundTrailData.find((l) => l.level === levelNum) || soundTrailData[0];

  const totalRounds = 5;
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Game state
  const [nodes, setNodes] = useState<Array<{ word: string; x: number; y: number; index: number }>>([]);
  const [targetSequence, setTargetSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [highlightNodeIndex, setHighlightNodeIndex] = useState<number | null>(null);
  
  // Audio state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Clinical tracking state
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [roundHasMistake, setRoundHasMistake] = useState(false);

  // Refs
  const startTimeRef = useRef<number>(Date.now());
  const synthContextRef = useRef<AudioContext | null>(null);

  // Setup TTS voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Timer tick
  useEffect(() => {
    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // TTS Speech Synthesis Engine
  const speakWord = (word: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      
      const indianVoice = voices.find(
        (v) =>
          v.lang === 'en-IN' ||
          v.lang.startsWith('en-IN') ||
          v.lang.replace('_', '-').includes('en-IN')
      );
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = () => {
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  // Synthesizer note player (Major Pentatonic Pitch Scale)
  const playSynthBeep = (nodeIndex: number) => {
    if (typeof window === 'undefined') return;
    try {
      if (!synthContextRef.current) {
        synthContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = synthContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pentatonic Scale (C4, D4, E4, G4, A4, C5, D5)
      const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
      const freq = frequencies[nodeIndex % frequencies.length] || 261.63;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Web Audio playback failed:', e);
    }
  };

  // Setup round nodes and target sequence
  const startNewRound = () => {
    setIsTransitioning(false);
    setUserSequence([]);
    setRoundHasMistake(false);
    
    const count = currentLevelConfig.nodeCount;
    const chain = currentLevelConfig.wordChain;
    
    // Choose a random contiguous sub-chain of length N from the word chain
    const maxStart = chain.length - count;
    const startIndex = Math.floor(Math.random() * (maxStart + 1));
    const subChain = chain.slice(startIndex, startIndex + count);
    
    // Create node objects with preconfigured coordinates
    const roundNodes = subChain.map((word, idx) => ({
      word,
      x: currentLevelConfig.coordinates[idx]?.x || 50,
      y: currentLevelConfig.coordinates[idx]?.y || 50,
      index: idx
    }));
    
    setNodes(roundNodes);

    // Generate a random sequence (permutation of indices) to follow the path
    const sequence = Array.from({ length: count }, (_, i) => i);
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }
    
    setTargetSequence(sequence);
    setIsPlayingSequence(true);
  };

  // Trigger round setup on load or config change
  useEffect(() => {
    setCurrentRound(0);
    setScore(0);
    setMissedWords([]);
    startNewRound();
  }, [levelStr, currentLevelConfig]);

  // Handle sequence playback loop
  useEffect(() => {
    if (!isPlayingSequence || targetSequence.length === 0) return;

    let active = true;
    let step = 0;

    const playStep = async () => {
      if (!active) return;
      if (step >= targetSequence.length) {
        if (active) {
          setIsPlayingSequence(false);
          setHighlightNodeIndex(null);
        }
        return;
      }

      const nodeIdx = targetSequence[step];
      if (active) {
        setHighlightNodeIndex(nodeIdx);
        playSynthBeep(nodeIdx);
      }
      
      const word = nodes[nodeIdx]?.word || '';
      await speakWord(word);

      if (active) {
        step++;
        setTimeout(playStep, currentLevelConfig.playbackSpeed - 300 > 300 ? currentLevelConfig.playbackSpeed - 300 : 300);
      }
    };

    const startTimer = setTimeout(playStep, 500);

    return () => {
      active = false;
      clearTimeout(startTimer);
    };
  }, [isPlayingSequence, targetSequence, nodes]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (synthContextRef.current) {
        synthContextRef.current.close();
      }
    };
  }, []);

  const handleReplaySequence = () => {
    if (isPlayingSequence || isTransitioning) return;
    setUserSequence([]);
    setIsPlayingSequence(true);
  };

  const handleNodeClick = async (nodeIdx: number) => {
    if (isPlayingSequence || isTransitioning) return;

    // Check if correct next node in sequence
    const expectedIdx = targetSequence[userSequence.length];
    
    // Play feedback tone and speak word
    playSynthBeep(nodeIdx);
    speakWord(nodes[nodeIdx].word);

    if (nodeIdx === expectedIdx) {
      // Correct node clicked
      const nextUserSeq = [...userSequence, nodeIdx];
      setUserSequence(nextUserSeq);

      if (nextUserSeq.length === targetSequence.length) {
        // Round successfully completed
        setIsTransitioning(true);
        const earnedPoint = !roundHasMistake;
        const nextScore = score + (earnedPoint ? 1 : 0);
        setScore(nextScore);

        toast.success(earnedPoint ? 'Perfect Trail!' : 'Trail Completed!', {
          icon: <Check className="w-5 h-5 text-green-500" />,
          className: 'bg-card border border-green-500 text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
          duration: 1000,
        });

        setTimeout(async () => {
          if (currentRound < totalRounds - 1) {
            setCurrentRound(currentRound + 1);
            startNewRound();
          } else {
            // Level is completed!
            await completeLevel(nextScore);
          }
        }, 1200);
      }
    } else {
      // Incorrect node clicked
      setRoundHasMistake(true);
      // Track the incorrect word transitioned
      const incorrectWord = nodes[nodeIdx]?.word || '';
      if (!missedWords.includes(incorrectWord)) {
        setMissedWords((prev) => [...prev, incorrectWord]);
      }

      toast.error('Oops, let\'s try that sequence again!', {
        icon: <X className="w-5 h-5 text-[#FF6347]" />,
        className: 'bg-card border border-primary text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1200,
      });

      // Shaking animation or blink on wrong click, then replay the sequence automatically
      setIsTransitioning(true);
      setTimeout(() => {
        setUserSequence([]);
        setIsTransitioning(false);
        setIsPlayingSequence(true);
      }, 1200);
    }
  };

  const completeLevel = async (finalScore: number) => {
    const accuracy = Math.round((finalScore / totalRounds) * 100);
    const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const gameId = 'sound-trail';

    if (accuracy >= 60) {
      // Success triggers confetti and toast notifications
      toast.success('Congratulations! Level Cleared!', {
        description: `Accuracy: ${accuracy}% - Moving to Results`,
        duration: 2000,
      });

      // Save progression strictly to Supabase user profile
      const compositeKey = `${gameId}-${levelNum}`;
      const activeId = progressorId || 'demo';
      
      if (activeId !== 'demo') {
        try {
          const updatedLevels = completedLevels.includes(compositeKey)
            ? completedLevels
            : [...completedLevels, compositeKey];

          const { error } = await supabase
            .from('progressors')
            .update({ completed_levels: updatedLevels })
            .eq('id', activeId);
            
          if (error) {
            console.error('Failed to update progressor profile in Supabase:', error.message);
          }
        } catch (err) {
          console.error('Error executing Supabase update:', err);
        }
      }
    }

    // Direct result page navigation logs it in session database table
    navigate('/result', {
      state: {
        score: finalScore,
        totalQuestions: totalRounds,
        total: totalRounds,
        timeTaken: formattedTime,
        timeElapsed: elapsedSeconds,
        gameId,
        level: levelNum,
        progressorId: progressorId || 'demo',
        missedWords
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300"
              aria-label="Back"
            >
              <Home className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-foreground">Sound Trail</h3>
              <p className="text-sm text-muted-foreground">Level {levelStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-sans">Time</p>
              <p className="font-medium tabular-nums">{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-sans">Round</p>
              <p className="font-medium">{currentRound + 1}/{totalRounds}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-muted h-2 w-full">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(currentRound / totalRounds) * 100}%` }}
        />
      </div>

      {/* Game Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-8 py-8 flex flex-col items-center justify-center">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-muted-foreground">Generating trail...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Instruction Banner */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold font-poppins mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-500" />
                Follow the Sound Trail!
              </h2>
              <p className="text-muted-foreground max-w-md">
                Listen to the spoken words, and tap the nodes in the correct sequence.
              </p>
            </div>

            {/* Playback Control Bar */}
            <div className="mb-6 flex gap-4 items-center">
              <button
                onClick={handleReplaySequence}
                disabled={isPlayingSequence || isTransitioning}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all duration-300 ${
                  isPlayingSequence || isTransitioning
                    ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-50'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 active:scale-95'
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                Play Trail Sequence
              </button>

              <div className="px-4 py-2 bg-secondary border border-border rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPlayingSequence ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                {isPlayingSequence ? 'Playing Sequence...' : 'Ready for Path'}
              </div>
            </div>

            {/* Visual Canvas Board */}
            <div className="w-full max-w-3xl aspect-[1.8/1] bg-card border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-md">
              {/* Background gradient grid glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
              
              {/* SVG Line Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Background Full Connection Path */}
                {nodes.map((node, idx) => {
                  if (idx === nodes.length - 1) return null;
                  const nextNode = nodes[idx + 1];
                  return (
                    <line
                      key={`bg-line-${idx}`}
                      x1={node.x}
                      y1={node.y}
                      x2={nextNode.x}
                      y2={nextNode.y}
                      stroke="rgba(16, 185, 129, 0.12)"
                      strokeWidth={4.5}
                      strokeLinecap="round"
                      strokeDasharray="6,6"
                    />
                  );
                })}

                {/* Animated Foreground User Trail / Connection Glow */}
                {userSequence.map((nodeIdx, seqIdx) => {
                  if (seqIdx === userSequence.length - 1) return null;
                  const nextNodeIdx = userSequence[seqIdx + 1];
                  const startNode = nodes[nodeIdx];
                  const endNode = nodes[nextNodeIdx];
                  return (
                    <motion.line
                      key={`fg-line-${seqIdx}`}
                      x1={startNode.x}
                      y1={startNode.y}
                      x2={endNode.x}
                      y2={endNode.y}
                      stroke="#10B981"
                      strokeWidth={5}
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  );
                })}
              </svg>

              {/* Trail Interactive Nodes */}
              {nodes.map((node) => {
                const isHighlighted = highlightNodeIndex === node.index;
                const isClicked = userSequence.includes(node.index);
                
                // Determine styling
                let borderStyles = 'border-border bg-card/75 text-foreground hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:scale-105 active:scale-95';
                let glowStyles = '';

                if (isHighlighted) {
                  borderStyles = 'border-emerald-500 bg-emerald-500 text-white font-extrabold scale-110';
                  glowStyles = 'shadow-[0_0_25px_#10B981]';
                } else if (isClicked) {
                  borderStyles = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                  glowStyles = 'shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                }

                return (
                  <motion.button
                    key={`node-${node.index}`}
                    onClick={() => handleNodeClick(node.index)}
                    disabled={isPlayingSequence || isTransitioning}
                    style={{
                      position: 'absolute',
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-3 flex flex-col items-center justify-center shadow-lg transition-all duration-300 font-poppins relative select-none disabled:cursor-not-allowed z-10 ${borderStyles} ${glowStyles}`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Index Label */}
                    <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isHighlighted ? 'text-white/80' : 'text-muted-foreground'}`}>
                      Sound {node.index + 1}
                    </span>
                    {/* Word Chain Phoneme */}
                    <span className="text-lg md:text-xl font-extrabold tracking-wide uppercase">
                      {node.word}
                    </span>
                    
                    {/* Pulse Rings for Active highlights */}
                    {isHighlighted && (
                      <span className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-75" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Trial Instruction Guidance */}
            <p className="text-sm text-muted-foreground font-sans mt-6">
              {isPlayingSequence
                ? '👂 Listen carefully to the sequence...'
                : userSequence.length === 0
                ? '👉 Click the nodes to start recreating the trail!'
                : `🌟 Success! Completed ${userSequence.length} of ${targetSequence.length} nodes.`}
            </p>
          </div>
        )}
      </div>

      {/* Footer message / spacing */}
      <div className="pb-8 text-center text-xs text-muted-foreground font-sans">
        Sound Voyage Clinical Suite • Sound Trail Game Engine
      </div>
    </div>
  );
}
