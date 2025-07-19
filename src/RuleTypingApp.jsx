import { useState, useEffect } from "react";
import "./RuleTypingApp.css"; // You'll need to create this CSS file

const rulesURL = "/rules.json"; // Place the full rules array in public/rules.json

export default function RuleTypingApp() {
  const [rules, setRules] = useState([]);
  const [input, setInput] = useState("");
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetch(rulesURL)
      .then((res) => res.json())
      .then(setRules);
  }, []);
  
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
  const currentRule = rules[currentRuleIndex];

  const checkAnswer = () => {
    const normalizedInput = input.trim().toLowerCase();
    const normalizedRule = currentRule.rule.trim().toLowerCase();
    setIsCorrect(normalizedInput === normalizedRule);
    setShowAnswer(true);
  };

  const nextRule = () => {
    setInput("");
    setIsCorrect(false);
    setShowAnswer(false);
    setCurrentRuleIndex((prevIndex) => (prevIndex + 1) % rules.length);
  };

  if (!currentRule) return <div className="loading">Loading rules...</div>;

function getHighlightedComparison(userInput, correctText) {
  const inputWords = userInput.trim().toLowerCase().split(/\s+/);
  const correctWords = correctText.trim().split(/\s+/);

  return correctWords.map((word, idx) => {
    const cleanedWord = word.replace(/[.,!?]/g, '').toLowerCase();
    const match = inputWords.includes(cleanedWord);
    
    return (
      <span
        key={idx}
        className={match ? "match" : "mismatch"}
      >
        {word + " "}
      </span>
    );
  });
}

  return (
    <div className="app-container">
      <div className="card">
        <div className="card-content">
          <h2 className="rule-title">{currentRule.topic}</h2>
          <input
            className="rule-input"
            placeholder="Type the rule here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
         <div className="button-group">
  <button className="button button-primary" onClick={checkAnswer}>
    Check
  </button>
  <button className="button button-secondary" onClick={nextRule}>
    Next
  </button>
  <button className="button button-secondary" onClick={() => {
    const shuffled = shuffleArray(rules);
    setRules(shuffled);
    setCurrentRuleIndex(0);
    setInput("");
    setIsCorrect(false);
    setShowAnswer(false);
  }}>
    Shuffle
  </button>
</div>

          
          {showAnswer && (
            <div className="answer-section">
              <p className={isCorrect ? "correct" : "incorrect"}>
                {isCorrect ? "Correct!" : "Incorrect."}
              </p>
              {!isCorrect && (
                <div className="correct-answer">
  Correct Answer: {getHighlightedComparison(input, currentRule.rule)}
</div>

              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}