declare module 'react-speech-recognition' {
    export interface SpeechRecognition {
        stopListening: () => void;
        startListening: (options?: { continuous?: boolean }) => void;
    }
    export const useSpeechRecognition: () => {
        transcript: string;
        listening: boolean;
        resetTranscript: () => void;
        browserSupportsSpeechRecognition: boolean;
    };
    const SpeechRecognition: SpeechRecognition;
    export default SpeechRecognition;
}
