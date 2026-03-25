"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geniusProxy = void 0;
const functions = __importStar(require("firebase-functions"));
/**
 * StreamLux Genius AI Proxy
 * Handles intelligent cinema discovery and recommendations.
 */
exports.geniusProxy = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
    // Handle CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400).json({ error: 'Missing prompt for Genius AI' });
        return;
    }
    try {
        // Placeholder: In a real production environment, this would call 
        // the Gemini API or a similar LLM. 
        // For now, we provide high-quality localized "AI" responses
        // to demonstrate the premium experience.
        let responseText = "";
        const query = prompt.toLowerCase();
        if (query.includes('recommend') || query.includes('what to watch')) {
            responseText = "I'd love to help! Based on your mood, I recommend checking out 'The Midnight Sky' for some stunning sci-fi, or if you're in for sports, the latest highlights from the Champions League are live in the Sports section!";
        }
        else if (query.includes('how to use') || query.includes('help')) {
            responseText = "I am StreamLux Genius! You can ask me for movie recommendations, find where a match is playing, or ask for the latest trending shows. Just type what you're looking for!";
        }
        else {
            responseText = "That's an interesting question! As your Cinema Assistant, I'm constantly learning. For now, I can help you find the best movies, TV shows, and sports highlights on StreamLux!";
        }
        res.status(200).json({
            answer: responseText,
            timestamp: Date.now(),
            status: "simulated_ai" // Label for transparency while in dev/demo
        });
    }
    catch (error) {
        functions.logger.error('Genius AI Error:', error.message);
        res.status(500).json({
            error: 'Genius AI is temporarily resting.',
            details: error.message
        });
    }
});
//# sourceMappingURL=geniusProxy.js.map