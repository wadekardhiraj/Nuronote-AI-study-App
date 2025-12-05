import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Sparkles, 
  Upload, 
  FileText, 
  Zap, 
  Layout, 
  Play, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  Lightbulb,
  BookOpen,
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';

/* NEURONOTE - The AI Second Brain for Students
  --------------------------------------------
  Core Philosophy: Optimize for retention, not just reading.
  Tech: React, Tailwind, Gemini Flash 1.5 (Multimodal)
*/

const App = () => {
  const [apiKey, setApiKey] = useState("");
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studyData, setStudyData] = useState(null);
  const [activeTab, setActiveTab] = useState("input"); // input, summary, map, cards, hacks, quiz
  const [error, setError] = useState("");

  // --- API INTERACTION ---

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result.split(',')[1]); // Keep only base64 data
      };
      reader.readAsDataURL(file);
    }
  };

  const generateStudyPack = async () => {
    if (!inputText && !imageBase64) {
      setError("Please provide text or an image to analyze.");
      return;
    }
    
    setLoading(true);
    setError("");
    setStudyData(null);

    try {
      const systemPrompt = `
        You are 'NeuroNote', an expert cognitive science tutor designed to help students memorize 90% of information. 
        Analyze the provided content (text or image of notes).
        
        OUTPUT FORMAT: Return ONLY a valid JSON object. Do not wrap in markdown code blocks.
        The JSON must match this schema:
        {
          "title": "A short, catchy title for the topic",
          "summary": {
            "core_concept": "The one-sentence 'Feynman Technique' explanation",
            "key_points": ["Point 1", "Point 2", "Point 3"]
          },
          "mind_map": {
            "label": "Central Topic",
            "children": [
              { "label": "Subtopic A", "children": [{"label": "Detail A1"}, {"label": "Detail A2"}] },
              { "label": "Subtopic B", "children": [{"label": "Detail B1"}] }
            ]
          },
          "flashcards": [
            { "front": "Question/Concept", "back": "Answer/Definition" }
          ],
          "mnemonics": [
            { "type": "Acronym", "content": "The mnemonic itself (e.g., PEMDAS)", "explanation": "What it stands for", "emoji": "🧮" },
            { "type": "Analogy", "content": "The analogy explanation", "emoji": "💡" }
          ],
          "quiz": [
            { "question": "Question text", "options": ["A", "B", "C", "D"], "correctIndex": 0 }
          ]
        }
      `;

      const userContent = [];
      if (inputText) userContent.push({ text: inputText });
      if (imageBase64) {
        userContent.push({
          inlineData: {
            mimeType: selectedImage.type || "image/png",
            data: imageBase64
          }
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: userContent }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              responseMimeType: "application/json"
            }
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const resultText = data.candidates[0].content.parts[0].text;
      const parsedData = JSON.parse(resultText);
      setStudyData(parsedData);
      setActiveTab("summary");

    } catch (err) {
      setError(err.message || "Failed to generate study pack. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NeuroNote</span>
          </div>
          <div className="flex items-center gap-4">
             <input
              type="password"
              placeholder="Enter Gemini API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* VIEW: INPUT SECTION */}
        {(!studyData && !loading) && (
          <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Turn Material into Memory.
              </h1>
              <p className="text-slate-400 text-lg">
                Upload notes, book pages, or paste text. NeuroNote converts them into high-retention mnemonics, visualizations, and tests.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              
              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Source Material (Image or Text)</label>
                <div className="flex gap-4">
                  <div className="relative flex-1 group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${selectedImage ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 group-hover:border-slate-500 bg-slate-900'}`}>
                      {selectedImage ? (
                        <div className="flex flex-col items-center text-indigo-300">
                          <CheckCircle className="w-8 h-8 mb-2" />
                          <span className="text-sm font-medium truncate max-w-[200px]">{selectedImage.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm">Drop image or click to upload</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Input */}
              <div className="mb-6">
                 <textarea
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-40"
                  placeholder="Or paste your lecture notes, article, or topic summary here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                ></textarea>
              </div>

              <button
                onClick={generateStudyPack}
                disabled={!apiKey || (!inputText && !selectedImage)}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  !apiKey || (!inputText && !selectedImage)
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98]'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                Generate Second Brain
              </button>
              
              {!apiKey && (
                 <p className="text-center text-xs text-rose-400 mt-3">API Key required to proceed.</p>
              )}

              {error && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-300">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-6 h-6 text-indigo-500 animate-pulse" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white">Synthesizing Knowledge...</h2>
            <p className="text-slate-400 mt-2">Creating neural links, mnemonics, and visual maps.</p>
          </div>
        )}

        {/* STUDY DASHBOARD */}
        {studyData && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Study Pack</div>
                <h1 className="text-3xl font-bold text-white">{studyData.title}</h1>
              </div>
              <button 
                onClick={() => { setStudyData(null); setActiveTab("input"); }}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Start Over
              </button>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 overflow-x-auto">
              {[
                { id: 'summary', icon: FileText, label: 'Synthesize' },
                { id: 'map', icon: Layout, label: 'Visualize' },
                { id: 'cards', icon: BookOpen, label: 'Recall' },
                { id: 'hacks', icon: Zap, label: 'Memory Hacks' },
                { id: 'quiz', icon: Play, label: 'Test Me' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTENT AREA */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 min-h-[500px] shadow-2xl relative overflow-hidden">
              
              {/* TAB: SUMMARY */}
              {activeTab === 'summary' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="bg-indigo-900/30 border border-indigo-500/30 p-6 rounded-xl">
                    <h3 className="flex items-center gap-2 text-indigo-300 font-bold mb-3">
                      <Lightbulb className="w-5 h-5" /> The Feynman Summary
                    </h3>
                    <p className="text-lg text-indigo-50 leading-relaxed">
                      {studyData.summary.core_concept}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-slate-300 font-bold mb-4 uppercase text-xs tracking-wider">Key Concepts Breakdown</h3>
                    <ul className="space-y-4">
                      {studyData.summary.key_points.map((point, idx) => (
                        <li key={idx} className="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="text-slate-200 leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB: MIND MAP (Recursive Component) */}
              {activeTab === 'map' && (
                <div className="w-full h-full overflow-auto">
                   <div className="text-center mb-6">
                    <p className="text-slate-400 text-sm">A hierarchical breakdown of the topic.</p>
                  </div>
                  <div className="flex justify-center min-w-max p-4">
                    <MindMapNode node={studyData.mind_map} isRoot={true} />
                  </div>
                </div>
              )}

              {/* TAB: FLASHCARDS */}
              {activeTab === 'cards' && (
                <FlashcardDeck cards={studyData.flashcards} />
              )}

              {/* TAB: MEMORY HACKS */}
              {activeTab === 'hacks' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {studyData.mnemonics.map((hack, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative group hover:border-indigo-500/50 transition-all hover:translate-y-[-2px]">
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                        {hack.emoji}
                      </div>
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">{hack.type}</div>
                      <div className="text-xl font-bold text-white mb-3 font-mono">{hack.content}</div>
                      <p className="text-slate-400 text-sm leading-relaxed">{hack.explanation}</p>
                    </div>
                  ))}
                  
                  {/* Empty state filler if few hacks */}
                  {studyData.mnemonics.length === 0 && (
                    <div className="col-span-2 text-center text-slate-500 py-10">
                      No specific mnemonics generated for this content.
                    </div>
                  )}
                </div>
              )}

              {/* TAB: QUIZ */}
              {activeTab === 'quiz' && (
                <QuizModule questions={studyData.quiz} />
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

// Recursive Mind Map Node
const MindMapNode = ({ node, isRoot = false }) => {
  if (!node) return null;

  return (
    <div className="flex flex-col items-center">
      <div className={`
        px-6 py-3 rounded-full border shadow-lg transition-all hover:scale-105 cursor-default
        ${isRoot 
          ? 'bg-indigo-600 border-indigo-400 text-white font-bold text-lg mb-8' 
          : 'bg-slate-800 border-slate-600 text-slate-200 text-sm font-medium mb-6 hover:bg-slate-750 hover:border-indigo-400'}
      `}>
        {node.label}
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="flex gap-8 relative">
          {/* Connector Lines Logic (Visual only, simple CSS) */}
          <div className="absolute top-[-24px] left-1/2 w-px h-6 bg-slate-600 -translate-x-1/2"></div>
          
          {node.children.map((child, idx) => (
            <div key={idx} className="relative flex flex-col items-center">
              {/* Horizontal bar for children */}
              {node.children.length > 1 && (
                <div className={`absolute top-[-24px] h-px bg-slate-600 
                  ${idx === 0 ? 'w-1/2 right-0' : idx === node.children.length - 1 ? 'w-1/2 left-0' : 'w-full'}
                `}></div>
              )}
              {/* Vertical drop to child */}
              <div className="absolute top-[-24px] w-px h-6 bg-slate-600"></div>
              
              <MindMapNode node={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FlashcardDeck = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 150);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <div className="perspective-1000 w-full max-w-xl h-64 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* FRONT */}
          <div className="absolute inset-0 backface-hidden bg-slate-900 border-2 border-slate-600 rounded-2xl flex flex-col items-center justify-center p-8 shadow-xl">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">Question</div>
            <p className="text-xl md:text-2xl text-center font-medium text-white">
              {cards[currentIndex].front}
            </p>
            <div className="absolute bottom-4 text-slate-500 text-xs flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Click to flip
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-900/20 border-2 border-indigo-500 rounded-2xl flex flex-col items-center justify-center p-8 shadow-xl shadow-indigo-500/10">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">Answer</div>
            <p className="text-lg md:text-xl text-center text-indigo-100">
              {cards[currentIndex].back}
            </p>
          </div>

        </div>
      </div>

      <div className="flex items-center gap-6 mt-8">
        <button onClick={prevCard} className="p-3 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowRight className="w-6 h-6 rotate-180" />
        </button>
        <span className="text-sm font-bold text-slate-400">
          {currentIndex + 1} / {cards.length}
        </span>
        <button onClick={nextCard} className="p-3 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const QuizModule = ({ questions }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIndex, optionIndex) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const score = Object.keys(answers).reduce((acc, qIdx) => {
    return acc + (answers[qIdx] === questions[qIdx].correctIndex ? 1 : 0);
  }, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {questions.map((q, idx) => {
        const isCorrect = answers[idx] === q.correctIndex;
        const isWrong = answers[idx] !== undefined && answers[idx] !== q.correctIndex;

        return (
          <div key={idx} className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
            <div className="flex gap-3 mb-4">
               <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center text-sm font-bold">{idx + 1}</span>
               <h3 className="text-lg font-medium text-slate-200">{q.question}</h3>
            </div>
            
            <div className="grid gap-3 pl-9">
              {q.options.map((opt, optIdx) => {
                let btnClass = "border-slate-700 hover:bg-slate-800 text-slate-400"; // default
                
                if (showResults) {
                  if (optIdx === q.correctIndex) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300";
                  else if (answers[idx] === optIdx) btnClass = "bg-rose-500/20 border-rose-500 text-rose-300";
                  else btnClass = "border-slate-800 opacity-50";
                } else {
                  if (answers[idx] === optIdx) btnClass = "bg-indigo-600 border-indigo-600 text-white";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(idx, optIdx)}
                    disabled={showResults}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {!showResults ? (
        <button 
          onClick={() => setShowResults(true)}
          disabled={Object.keys(answers).length !== questions.length}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Check My Answers
        </button>
      ) : (
        <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-center animate-in zoom-in duration-300">
          <div className="text-slate-400 mb-2">You scored</div>
          <div className="text-4xl font-black text-white mb-2">
            {Math.round((score / questions.length) * 100)}%
          </div>
          <p className="text-indigo-400 font-medium">
            {score === questions.length ? "Perfect Recall! 🧠" : "Keep practicing to strengthen those neural paths!"}
          </p>
          <button 
            onClick={() => { setShowResults(false); setAnswers({}); }}
            className="mt-6 text-sm text-slate-400 hover:text-white underline underline-offset-4"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

// Add styles for 3D flip effect
const style = document.createElement('style');
style.textContent = `
  .perspective-1000 { perspective: 1000px; }
  .transform-style-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }
`;
document.head.appendChild(style);

export default App;
