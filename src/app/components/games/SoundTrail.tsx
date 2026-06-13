import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Home, Check, X, Sparkles, Play, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ThemeToggle } from '../ThemeToggle';
import { useGameSession } from '../../context/GameSessionContext';
import { supabase } from '../../../lib/supabase';
import { soundTrailData, SoundTrailLevel, SoundTrailChain } from '../../../data/soundTrailData';
import { getOptionIcon } from '../OptionIconMapper';
import { playAudio } from '../../../lib/audioUtils';

export default function SoundTrail() {
  const navigate = useNavigate();
  const { level } = useParams();
  const { progressorId, completedLevels } = useGameSession();

  const levelStr = level || '1';
  const levelNum = Number(levelStr);
  const isWorkingMemoryMode = levelNum >= 6;

  // Retrieve current level configuration
  const currentLevelConfig: SoundTrailLevel =
    soundTrailData.find((l) => l.level === levelNum) || soundTrailData[0];

  const totalRounds = 5;
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Game states
  const [nodes, setNodes] = useState<Array<{ word: string; x: number; y: number; index: number }>>([]);
  const [currentChain, setCurrentChain] = useState<SoundTrailChain | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // active step index along the chain: 0 to words.length - 2
  const [userSequence, setUserSequence] = useState<number[]>([]); // nodes reached so far in the trail: [0, 1, 2...]
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [highlightNodeIndex, setHighlightNodeIndex] = useState<number | null>(null);
  
  // Clinical tracking state
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [roundHasMistake, setRoundHasMistake] = useState(false);

  // Refs
  const startTimeRef = useRef<number>(Date.now());
  const synthContextRef = useRef<AudioContext | null>(null);

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
      playAudio(word, {
        onStart: () => {},
        onEnd: () => resolve(),
        onError: () => resolve()
      });
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

      // Pentatonic Scale (C4, D4, E4, G4, A4, C5, D5, E5)
      const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
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

  // Play the auditory cue sequence for the current transition step
  const playCurrentTransition = async () => {
    if (isPlayingSequence || isTransitioning || !currentChain || nodes.length === 0) return;
    setIsPlayingSequence(true);
    setHighlightNodeIndex(null);

    // Initial brief delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Under Working Memory Mode, do not repeat the starting word of the transition
    // unless it is the very first step in the chain.
    const skipFirstWord = isWorkingMemoryMode && currentStepIndex > 0;

    if (!skipFirstWord) {
      // Highlight and speak Word 1 (Source node)
      setHighlightNodeIndex(currentStepIndex);
      playSynthBeep(currentStepIndex);
      await speakWord(nodes[currentStepIndex].word);

      // Short delay between spoken words
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    // Highlight and speak Word 2 (Destination node)
    setHighlightNodeIndex(currentStepIndex + 1);
    playSynthBeep(currentStepIndex + 1);
    await speakWord(nodes[currentStepIndex + 1].word);

    // Clear highlights and return control
    setHighlightNodeIndex(null);
    setIsPlayingSequence(false);
  };

  // Setup round nodes and select a random chain from pool
  const startNewRound = () => {
    setIsTransitioning(false);
    setUserSequence([0]); // Start at the first node
    setCurrentStepIndex(0);
    setRoundHasMistake(false);
    
    const chainsPool = currentLevelConfig.chains;
    
    // Select a random chain from the pool
    const randomChainIndex = Math.floor(Math.random() * chainsPool.length);
    const selectedChain = chainsPool[randomChainIndex];
    setCurrentChain(selectedChain);

    // Map words to grid coordinates
    const roundNodes = selectedChain.words.map((word, idx) => ({
      word,
      x: currentLevelConfig.coordinates[idx]?.x || 50,
      y: currentLevelConfig.coordinates[idx]?.y || 50,
      index: idx
    }));
    
    setNodes(roundNodes);
  };

  // Trigger round setup on load or config change
  useEffect(() => {
    setCurrentRound(0);
    setScore(0);
    setMissedWords([]);
    startNewRound();
  }, [levelStr, currentLevelConfig]);

  // Autoplay current step transition when nodes or active step changes
  useEffect(() => {
    if (nodes.length > 0 && currentChain) {
      playCurrentTransition();
    }
  }, [currentStepIndex, nodes, currentChain]);

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
    playCurrentTransition();
  };

  const handlePositionClick = async (positionValue: number) => {
    if (isPlayingSequence || isTransitioning || !currentChain) return;

    // Check if the chosen position matches the transition changed index
    const expectedPosition = currentChain.positions[currentStepIndex];

    if (positionValue === expectedPosition) {
      // Correct position selected
      const nextStep = currentStepIndex + 1;
      const nextUserSeq = [...userSequence, nextStep];
      setUserSequence(nextUserSeq);
      
      // Advance active node indicator
      setHighlightNodeIndex(nextStep);
      playSynthBeep(nextStep);
      await speakWord(nodes[nextStep].word);
      setHighlightNodeIndex(null);

      if (nextStep === currentChain.words.length - 1) {
        // Reached the final node of the chain: Round completed!
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
      } else {
        // Not at the end yet: move to next step index, triggering automatic autoplay
        setCurrentStepIndex(nextStep);
      }
    } else {
      // Incorrect position selected
      setRoundHasMistake(true);
      
      // Log the incorrect word transition target
      const incorrectWord = nodes[currentStepIndex + 1]?.word || '';
      if (!missedWords.includes(incorrectWord)) {
        setMissedWords((prev) => [...prev, incorrectWord]);
      }

      toast.error('Oops, that\'s incorrect! Let\'s listen again.', {
        icon: <X className="w-5 h-5 text-[#FF6347]" />,
        className: 'bg-card border border-primary text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1200,
      });

      // Freeze inputs and replay the transition to reinforce training
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
        playCurrentTransition();
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
      toast.success('Congratulations! Level Cleared!', {
        description: `Accuracy: ${accuracy}% - Moving to Results`,
        duration: 2000,
      });

      // Save progression to Supabase user profile
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
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-extrabold font-poppins flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                  Follow the Sound Trail!
                </h2>
                <button
                  onClick={() => speakWord("Follow the Sound Trail! Listen to the sound change, and click the position block of the phoneme that changed!")}
                  className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer"
                  aria-label="Speak instruction"
                >
                  <Volume2 className="w-6 h-6 text-muted-foreground hover:text-primary" />
                </button>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto">
                Listen to the sound change, and click the position block of the phoneme that changed!
              </p>
              {isWorkingMemoryMode && (
                <span className="mt-2 inline-block px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                  Working Memory Mode Active
                </span>
              )}
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
                Play Step Sound
              </button>

              <div className="px-4 py-2 bg-secondary border border-border rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPlayingSequence ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                {isPlayingSequence ? 'Playing Transition...' : 'Waiting for Click'}
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
                const isReached = userSequence.includes(node.index);
                const isCurrent = node.index === currentStepIndex;

                let borderStyles = 'border-border bg-card/40 opacity-40 text-muted-foreground';
                let glowStyles = '';

                if (isHighlighted) {
                  borderStyles = 'border-emerald-500 bg-emerald-500 text-white font-extrabold scale-110 opacity-100 z-20';
                  glowStyles = 'shadow-[0_0_25px_#10B981]';
                } else if (isCurrent) {
                  borderStyles = 'border-dashed border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold opacity-100 z-10';
                  glowStyles = 'shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse';
                } else if (isReached) {
                  borderStyles = 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold opacity-100';
                }

                // If working memory mode is active, hide words that are not the active node or not yet reached
                // (Force user to rely on memory for past nodes, except active)
                const showLabel = !isWorkingMemoryMode || isCurrent || isHighlighted;

                return (
                  <motion.div
                    key={`node-${node.index}`}
                    style={{
                      position: 'absolute',
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-3 flex flex-col items-center justify-center shadow-lg transition-all duration-300 font-poppins relative select-none z-10 ${borderStyles} ${glowStyles}`}
                  >
                    {/* Index Label */}
                    <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isHighlighted ? 'text-white/80' : 'text-muted-foreground'}`}>
                      Node {node.index + 1}
                    </span>
                    {/* Word Chain Phoneme */}
                    <span className="text-sm md:text-base font-extrabold tracking-wide uppercase">
                      {showLabel ? node.word : '???'}
                    </span>
                    
                    {/* Pulse Rings for Active highlights */}
                    {isHighlighted && (
                      <span className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-75" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Position click plates */}
            <div className="mt-8 flex flex-col items-center">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                Which sound changed? Select the position:
              </p>
              <div className="flex gap-4">
                {Array.from({ length: currentLevelConfig.phonemeCount }, (_, i) => i + 1).map((pos) => (
                  <button
                    key={`pos-btn-${pos}`}
                    onClick={() => handlePositionClick(pos)}
                    disabled={isPlayingSequence || isTransitioning}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-card border-3 border-border hover:border-emerald-500 hover:bg-emerald-500/5 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-2xl font-black flex flex-col items-center justify-center transition-all text-foreground cursor-pointer shadow-md gap-1"
                  >
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Pos</span>
                    <span className="flex items-center gap-1.5 justify-center">
                      {getOptionIcon(String(pos))}
                      <span>{pos}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guidance status text */}
            <p className="text-sm text-muted-foreground font-sans mt-6">
              {isPlayingSequence
                ? 'Listening to the changes...'
                : `Transition ${currentStepIndex + 1} of ${(currentChain?.words.length || 1) - 1} | Choose the correct position block.`}
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
