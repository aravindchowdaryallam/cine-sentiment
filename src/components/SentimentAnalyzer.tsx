import React, { useState, useEffect } from 'react';
import { pipeline, env } from '@xenova/transformers';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Sparkles, AlertCircle } from 'lucide-react';
import 'regenerator-runtime/runtime';

// Configure Transformers.js to allow local models from the public folder
env.allowLocalModels = true;
env.localModelPath = '/models/';
env.useBrowserCache = true;

/**
 * SentimentAnalyzer Component
 * Elegantly styled with "classy" aesthetic (Gold/Black/Glass).
 */
const SentimentAnalyzer: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'analyzing' | 'error'>('loading');
    const [classifier, setClassifier] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [text, setText] = useState('');
    const [result, setResult] = useState<{ label: string; score: number } | null>(null);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        // Load the model
        const loadModel = async () => {
            try {
                console.log("Initializing sentiment analysis model...");

                // Use the official pre-trained sentiment model from Hugging Face
                // This model is specifically fine-tuned for sentiment analysis and proven to work
                const pipe = await pipeline(
                    'sentiment-analysis',
                    'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
                    {
                        progress_callback: (p: any) => {
                            console.log(`Loading model: ${Math.round(p.progress ?? 0)}%`);
                        }
                    }
                );

                console.log("Model loaded successfully:", pipe);
                setClassifier(() => pipe);
                setStatus('ready');
                console.log("Sentiment analysis engine ready");
            } catch (err: any) {
                console.error("Model loading failed:", err);
                console.error("Error details:", err.message);

                setErrorMessage(err.message || 'Failed to load sentiment model');
                setStatus('error');
            }
        };
        loadModel();
    }, []);

    useEffect(() => {
        if (transcript) {
            setText(transcript);
        }
    }, [transcript]);

    const handleAnalyze = async () => {
        if (!classifier || !text.trim()) return;

        setStatus('analyzing');
        setResult(null);

        try {
            console.log("Analyzing:", text);

            // @ts-ignore
            const results = await classifier(text);
            console.log("Results:", results);

            if (results && Array.isArray(results) && results.length > 0) {
                const result = results[0];
                console.log("Sentiment:", result.label, "Score:", result.score);
                setResult(result);
                setStatus('ready');
            } else {
                throw new Error('No results returned from model');
            }
        } catch (err: any) {
            console.error("Analysis failed:", err);
            setErrorMessage(err.message || "Failed to analyze sentiment");
            setStatus('error');
        }
    };

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-8 space-y-12">
            <div className="text-center space-y-6">
                <h1 className="text-5xl font-serif font-bold text-white tracking-tight">
                    Review Extraction & <span className="text-primary italic">Analysis</span>
                </h1>
                <p className="text-white-muted font-light text-lg max-w-2xl mx-auto">
                    Leveraging state-of-the-art DistilBERT models with subword tokenization to deconstruct cinematic feedback.
                </p>
            </div>

            {/* Status Indicator */}
            <div className={`flex items-center justify-center p-3 rounded-full border max-w-md mx-auto backdrop-blur-md transition-all ${status === 'ready' ? 'bg-primary/5 border-primary/20 text-primary' :
                status === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-white-muted'
                }`}>
                {status === 'loading' && <span className="animate-pulse font-light tracking-wide">Initializing Neural Engine...</span>}
                {status === 'ready' && <span className="font-medium tracking-wide">✓ Model Parameters Loaded</span>}
                {status === 'analyzing' && <span className="animate-pulse font-light tracking-wide">Performing Inference...</span>}
                {status === 'error' && <span className="flex items-center gap-2 font-medium"><AlertCircle size={16} /> {errorMessage || 'Load Failure'}</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Input Card */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl hover:border-white/20 transition-all duration-500 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <label className="font-serif text-2xl text-white">Input Review</label>
                        <span className="text-xs font-mono text-white-muted tracking-widest uppercase">{text.length} / 2000 CHARS</span>
                    </div>

                    <div className="relative flex-1">
                        <textarea
                            className="w-full h-full min-h-[200px] bg-black/20 rounded-xl p-6 resize-none border border-white/5 text-lg font-light leading-relaxed focus:border-primary/50 focus:ring-0 focus:bg-black/40 transition-all placeholder:text-white/20"
                            placeholder="Articulate your cinematic experience..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        {browserSupportsSpeechRecognition && (
                            <button
                                onClick={toggleListening}
                                className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-300 ${listening
                                    ? 'bg-red-500/80 text-white animate-pulse shadow-lg shadow-red-500/20'
                                    : 'bg-white/10 text-white hover:bg-primary hover:text-black'
                                    }`}
                                title={listening ? "Stop Dictation" : "Activate Voice Input"}
                            >
                                {listening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={status !== 'ready' || !text.trim()}
                        className="mt-6 w-full py-4 bg-primary text-black font-serif font-bold text-lg rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                    >
                        <Sparkles size={20} />
                        Analyze Sentiment
                    </button>
                </div>

                {/* Result Card */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col justify-center items-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <h2 className="font-serif text-2xl text-white absolute top-8 left-8">Analysis Result</h2>

                    {result ? (
                        <div className="text-center space-y-8 z-10 w-full animate-in fade-in zoom-in duration-500">
                            <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center border-4 ${result.label === 'POSITIVE' ? 'border-primary/30 bg-primary/10' : 'border-rose-500/30 bg-rose-500/10'
                                }`}>
                                <span className="text-5xl drop-shadow-lg">
                                    {result.label === 'POSITIVE' ? '👍' : '👎'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h3 className={`text-4xl font-serif font-bold tracking-wide ${result.label === 'POSITIVE' ? 'text-primary' : 'text-rose-400'
                                    }`}>
                                    {result.label}
                                </h3>
                                <div className="flex items-center justify-center gap-2 text-white-muted font-mono text-sm">
                                    <span>CONFIDENCE SCORE:</span>
                                    <span className="text-white">{(result.score * 100).toFixed(2)}%</span>
                                </div>
                            </div>

                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden max-w-sm mx-auto">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out ${result.label === 'POSITIVE' ? 'bg-primary' : 'bg-rose-500'}`}
                                    style={{ width: `${result.score * 100}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-white-muted space-y-4 z-10 opacity-50">
                            <div className="w-20 h-20 border border-white/10 rounded-full mx-auto flex items-center justify-center">
                                <Sparkles size={32} />
                            </div>
                            <p className="font-light tracking-wide">Awaiting input for inference...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SentimentAnalyzer;
