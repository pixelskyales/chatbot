import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './index.css';

// DŮLEŽITÉ: Načtení API klíče ze správné proměnné pro Netlify
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializace klienta pro Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [prompt, setPrompt] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setStreamingContent('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContentStream(prompt);

      let text = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        text += chunkText;
        setStreamingContent(text);
      }
    } catch (error) {
      console.error("Chyba při volání API:", error);
      setStreamingContent('Nastala chyba při komunikaci s AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Generátor Obsahu AI</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Napište svůj požadavek..."
          rows="4"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generuji...' : 'Generovat obsah'}
        </button>
      </form>
      <div className="content-area">
        {streamingContent && <pre>{streamingContent}</pre>}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
