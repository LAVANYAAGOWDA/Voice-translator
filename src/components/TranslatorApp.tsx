import { useState, useEffect, useRef } from 'react';
import { ArrowRightLeft, Copy, Mic, Volume2, Trash2, Loader2, History, Play, Pause, Square } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSelector } from './LanguageSelector';
import { translateText } from '../lib/translate';

interface HistoryItem {
  id: string;
  original: string;
  translated: string;
  from: string;
  to: string;
  timestamp: number;
}

export const TranslatorApp = () => {
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Audio controls state
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [shouldAutoTranslate, setShouldAutoTranslate] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('translationHistory');
    if (saved) setHistory(JSON.parse(saved));

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop automatically when user stops speaking
      recognitionRef.current.interimResults = true; // Enable live transcription

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInputText(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
          setShouldAutoTranslate(true); // Flag to translate when speech ends
        }
        setInterimText(interimTranscript);
      };

      recognitionRef.current.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          toast.error('Microphone error. Please try again.');
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimText('');
      };
    }
    
    // Cleanup speech synthesis on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Effect to handle automatic translation after voice input
  useEffect(() => {
    if (!isListening && shouldAutoTranslate && inputText) {
      setShouldAutoTranslate(false);
      handleTranslate(true); // Trigger translation and autoplay
    }
  }, [isListening, shouldAutoTranslate, inputText]);

  const saveToHistory = (original: string, translated: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      original,
      translated,
      from: fromLang,
      to: toLang,
      timestamp: Date.now()
    };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('translationHistory', JSON.stringify(updated));
  };

  const handleTranslate = async (autoPlay = false) => {
    if (!inputText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateText(inputText, fromLang, toLang);
      setTranslatedText(result);
      saveToHistory(inputText, result);
      
      if (autoPlay === true) {
        handleSpeak(result, toLang);
      }
    } catch (error) {
      toast.error('Failed to translate. Try again later.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwap = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleClear = () => {
    setInputText('');
    setInterimText('');
    setTranslatedText('');
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleSpeak = (text: string, lang: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.volume = volume;
      utterance.rate = rate;
      
      utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
      utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
      utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };
      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  const pauseSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  };

  const resumeSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = fromLang;
        try {
          // Stop any playing speech before listening
          if (isPlaying) stopSpeech();
          
          recognitionRef.current.start();
          setIsListening(true);
          toast.success('Listening...', { icon: '🎙️' });
        } catch (e) {
          toast.error('Microphone is already active');
        }
      } else {
        toast.error('Speech recognition not supported in this browser');
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('translationHistory');
    toast.success('History cleared');
  };

  // Combine input and interim text for display
  const displayInputText = inputText + (isListening && interimText ? (inputText ? ' ' : '') + interimText : '');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <LanguageSelector value={fromLang} onChange={setFromLang} label="Source Language" />
          
          <button 
            onClick={handleSwap}
            className="p-3 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-all active:scale-95 shadow-sm"
            aria-label="Swap Languages"
            title="Swap Languages"
          >
            <ArrowRightLeft size={20} />
          </button>
          
          <LanguageSelector value={toLang} onChange={setToLang} label="Target Language" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <textarea
                value={displayInputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setInterimText(''); // Clear interim when user types
                }}
                placeholder="Enter text or tap mic to speak in English..."
                className="w-full h-48 md:h-64 p-4 pb-16 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-gray-800 dark:text-gray-100 text-lg relative z-10"
              />
              
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 z-20">
                {isListening && (
                  <div className="flex items-center space-x-1 mr-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-full border border-red-200 dark:border-red-900/50">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['8px', '16px', '8px'] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        className="w-1 bg-red-500 dark:bg-red-400 rounded-full"
                      />
                    ))}
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium ml-2">Listening...</span>
                  </div>
                )}
                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse' : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-blue-500 shadow-sm border border-gray-100 dark:border-gray-700'}`}
                  title={isListening ? "Stop Microphone" : "Use Microphone"}
                >
                  <Mic size={20} />
                </button>
              </div>
              
              {inputText && !isListening && (
                <button
                  onClick={handleClear}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors z-20"
                  title="Clear text"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 px-2">
              <span>{displayInputText.length} characters</span>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col space-y-3">
            <div className="relative h-48 md:h-64 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-900/30 p-4 pb-16">
              {isTranslating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-500">
                  <Loader2 className="animate-spin mb-3" size={36} />
                  <span className="text-sm font-semibold animate-pulse">AI is translating...</span>
                </div>
              ) : (
                <p className="text-lg font-medium text-gray-800 dark:text-gray-100 whitespace-pre-wrap overflow-y-auto h-full pr-2">
                  {translatedText || <span className="text-gray-400 dark:text-gray-600 font-normal">Translation will appear here...</span>}
                </p>
              )}
              
              {/* Output Audio Controls (Left) */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-2 z-10">
                <div className="flex items-center space-x-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-800">
                  <Volume2 size={14} className={volume === 0 ? "text-gray-300" : "text-blue-500"} />
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    title="Adjust Volume"
                  />
                </div>
                <div className="flex items-center space-x-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-800">
                  <span className="font-semibold text-[10px] w-4 text-center">{rate}x</span>
                  <input 
                    type="range" min="0.5" max="2" step="0.25" 
                    value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    title="Adjust Speed"
                  />
                </div>
              </div>

              {/* Output Action Controls (Right) */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 z-10">
                <button
                  onClick={() => handleCopy(translatedText)}
                  disabled={!translatedText}
                  className={`p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors ${translatedText ? 'text-gray-500 hover:text-blue-500' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
                  title="Copy Translation"
                >
                  <Copy size={18} />
                </button>
                
                {isPlaying || isPaused ? (
                  <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 p-0.5">
                    <button
                      onClick={isPaused ? resumeSpeech : pauseSpeech}
                      className="p-2 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      title={isPaused ? "Resume Speech" : "Pause Speech"}
                    >
                      {isPaused ? <Play size={18} className="ml-0.5" /> : <Pause size={18} />}
                    </button>
                    <button
                      onClick={stopSpeech}
                      className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Stop Speech"
                    >
                      <Square size={16} className="fill-current" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSpeak(translatedText, toLang)}
                    disabled={!translatedText}
                    className={`p-2.5 rounded-full bg-gradient-to-r ${translatedText ? 'from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md shadow-blue-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'} transition-all`}
                    title="Play Audio"
                  >
                    <Volume2 size={18} className={translatedText && isPlaying ? "animate-pulse" : ""} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-4 py-2"
          >
            <History size={18} />
            <span className="font-medium">Recent Translations</span>
          </button>
          
          <button
            onClick={() => handleTranslate(false)}
            disabled={isTranslating || !inputText.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/30 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>{isTranslating ? 'Translating...' : 'Translate Text'}</span>
          </button>
        </div>
      </motion.div>

      {/* History Section */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">History</h3>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                    Clear All
                  </button>
                )}
              </div>
              
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">No recent translations</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md transition-shadow hover:border-blue-100 dark:hover:border-blue-900/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200 truncate font-medium">{item.original}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{item.translated}</p>
                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                          <span className="uppercase bg-white dark:bg-gray-700 px-2 py-1 rounded-md shadow-sm text-[10px] font-bold border border-gray-100 dark:border-gray-600">{item.from}</span>
                          <ArrowRightLeft size={10} className="text-gray-300 dark:text-gray-600" />
                          <span className="uppercase bg-white dark:bg-gray-700 px-2 py-1 rounded-md shadow-sm text-[10px] font-bold border border-gray-100 dark:border-gray-600">{item.to}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setInputText(item.original);
                          setTranslatedText(item.translated);
                          setFromLang(item.from);
                          setToLang(item.to);
                        }}
                        className="flex-shrink-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

