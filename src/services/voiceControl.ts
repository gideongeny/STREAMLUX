import { toast } from "react-toastify";

export type VoiceCommand = {
    command: string | RegExp;
    callback: (match: string[]) => void;
    description: string;
};

class VoiceControlService {
    private recognition: any = null;
    private isListening: boolean = false;
    private commands: VoiceCommand[] = [];

    constructor() {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.lang = "en-US";

                this.recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript.toLowerCase();
                    console.log("Voice Input:", transcript);
                    this.processTranscript(transcript);
                };

                this.recognition.onend = () => {
                    this.isListening = false;
                };

                this.recognition.onerror = (event: any) => {
                    console.error("Speech Recognition Error:", event.error);
                    this.isListening = false;
                    if (event.error === 'not-allowed') {
                        toast.error("Microphone access denied.");
                    }
                };
            }
        }
    }

    public registerCommands(commands: VoiceCommand[]) {
        this.commands = [...this.commands, ...commands];
    }

    private processTranscript(transcript: string) {
        for (const cmd of this.commands) {
            if (typeof cmd.command === "string") {
                if (transcript.includes(cmd.command.toLowerCase())) {
                    cmd.callback([transcript]);
                    return;
                }
            } else if (cmd.command instanceof RegExp) {
                const match = transcript.match(cmd.command);
                if (match) {
                    cmd.callback(Array.from(match));
                    return;
                }
            }
        }
        toast.info(`Command not recognized: "${transcript}"`, { autoClose: 2000 });
    }

    public start() {
        if (!this.recognition) {
            toast.error("Voice recognition not supported in this browser.");
            return;
        }
        if (this.isListening) return;

        try {
            this.recognition.start();
            this.isListening = true;
            toast.info("Listening for command...", {
                autoClose: 2000,
                icon: "🎙️"
            });
        } catch (err) {
            console.error("Start Error:", err);
        }
    }

    public stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    public getIsListening() {
        return this.isListening;
    }
}

export const voiceControl = new VoiceControlService();
