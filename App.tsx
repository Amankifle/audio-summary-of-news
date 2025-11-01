import React, { useState, useCallback } from "react";
import { generateSummary, generateSpeech } from "./services/geminiService";
import AudioPlayer from "./components/AudioPlayer";
import { SpinnerIcon } from "./components/icons/SpinnerIcon";

function App() {
  const [article, setArticle] = useState("");
  const [persona, setPersona] = useState("");
  const [summary, setSummary] = useState("");
  const [audioB64, setAudioB64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");

  const handleGenerate = useCallback(async () => {
    if (!article.trim()) {
      setError("Please paste an article to summarize.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary("");
    setAudioB64(null);

    try {
      setLoadingStep("Summarizing article...");
      const generatedSummary = await generateSummary(article, persona, language);
      setSummary(generatedSummary);

      setLoadingStep("Generating audio...");
      const generatedAudioB64 = await generateSpeech(generatedSummary, language);
      setAudioB64(generatedAudioB64);
    } catch (e) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to generate summary. ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  }, [article, persona]);

  
  return (
    <div className="min-h-scree-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            Audio News Summarizer
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Transform articles into personalized audio summaries.
          </p>
        </header>

        <main>
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="block text-sm font-medium text-gray-300 mb-2 bg-gray-900 border border-gray-700 rounded-md p-2"
            >
              <option value="en">English (en)</option>
              <option value="am">Amharic (am)</option>
            </select>

            <div>
              <label
                htmlFor="article"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Paste your news article here
              </label>
              <textarea
                id="article"
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Start by pasting the full text of a news article..."
                className="w-full h-48 p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="persona"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Personalization (Optional)
              </label>
              <input
                type="text"
                id="persona"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="e.g., 'like I'm a 5th grader' or 'focus on the tech industry impact'"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !article}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  <span>{loadingStep}</span>
                </>
              ) : (
                "Generate Audio Summary"
              )}
            </button>
          </div>

          {error && (
            <div
              className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {(summary || audioB64) && !isLoading && (
            <div className="mt-8 bg-gray-800 rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                Your Summary
              </h2>
              {audioB64 && <AudioPlayer audioData={audioB64} />}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {summary}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
