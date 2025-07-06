/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from '@google/genai';
import { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [contentType, setContentType] = useState('blog');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Kopírovat');

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  const getPrompt = () => {
    switch (contentType) {
      case 'blog':
        return `Napiš odborný, dobře strukturovaný článek na blog na téma: "${topic}". Článek by měl mít úvod, několik odstavců s podnadpisy a závěr. Měl by být informativní a připravený k publikování na webu.`;
      case 'social':
        return `Vytvoř krátký a poutavý příspěvek na sociální sítě (pro LinkedIn nebo Facebook) na téma: "${topic}". Zaměř se na profesionální tón. Na konec přidej 3-5 relevantních hashtagů.`;
      default:
        return topic;
    }
  };

  const handleGenerateContent = async () => {
    if (isLoading || !topic.trim()) return;

    setIsLoading(true);
    setStreamingContent('');
    setGeneratedContent('');
    setCopyButtonText('Kopírovat');

    try {
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: getPrompt(),
      });

      let fullContent = '';
      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          fullContent += text;
          setStreamingContent(prev => prev + text);
        }
      }
      setGeneratedContent(fullContent);
    } catch (error) {
      console.error("Error generating content:", error);
      setStreamingContent("Došlo k chybě při generování obsahu. Zkuste to prosím znovu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopyButtonText('Zkopírováno!');
      setTimeout(() => setCopyButtonText('Kopírovat'), 2000);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Generátor Obsahu AI</h1>
        <p>Vytvořte odborné články a příspěvky na sociální sítě během okamžiku.</p>
      </header>

      <main>
        <div className="form-group">
          <label htmlFor="content-type">Typ obsahu</label>
          <select
            id="content-type"
            className="form-control"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            disabled={isLoading}
          >
            <option value="blog">Článek na blog</option>
            <option value="social">Příspěvek na sociální sítě</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="topic">Zadejte téma nebo klíčová slova</label>
          <textarea
            id="topic"
            className="form-control"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="např. 'Výhody přechodu na cloudové řešení pro malé firmy'"
            disabled={isLoading}
          ></textarea>
        </div>

        <button className="btn" onClick={handleGenerateContent} disabled={isLoading || !topic.trim()}>
          {isLoading ? 'Generuji...' : 'Generovat obsah'}
        </button>

        <div className="output-container">
          {generatedContent && !isLoading && <button className="copy-button" onClick={handleCopy}>{copyButtonText}</button>}
          {streamingContent || isLoading ? (
            <div className="generated-content">{streamingContent}</div>
          ) : (
            <p className="output-placeholder">Zde se zobrazí vygenerovaný obsah.</p>
          )}
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
