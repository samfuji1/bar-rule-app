import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import "./RuleTypingApp.css";

// Use PUBLIC_URL so fetch works correctly on GitHub Pages or any base path
const rulesURL = process.env.PUBLIC_URL + "/rules.json";

export default function RuleTypingApp() {
  const [rules, setRules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filteredRules, setFilteredRules] = useState([]);
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [input, setInput] = useState("");
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);

  useEffect(() => {
    fetch(rulesURL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((groupedData) => {
        const flatRules = groupedData.flatMap((group) =>
          group.rules.map((rule) => ({
            subject: group.subject,
            topic: rule.topic,
            rule: rule.rule,
          }))
        );

        setRules(flatRules);
        const uniqueSubjects = [...new Set(flatRules.map((rule) => rule.subject))];
        setSubjects(uniqueSubjects);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      const filtered = rules.filter((rule) => rule.subject === selectedSubject);
      setFilteredRules(filtered);
      setCurrentRuleIndex(0);
      setInput("");
      setFeedback(null);
      setShowAnswer(false);
    } else {
      setFilteredRules([]);
      setCurrentRuleIndex(0);
      setInput("");
      setFeedback(null);
      setShowAnswer(false);
    }
  }, [selectedSubject, rules]);

  const currentRule = filteredRules[currentRuleIndex];

  const getMatchPercentage = (a, b) => {
    const fuse = new Fuse([b], { includeScore: true, threshold: 0.6 });
    const result = fuse.search(a);
    return result.length > 0 ? Math.round((1 - result[0].score) * 100) : 0;
  };

  const checkAnswer = () => {
    if (!currentRule) return;

    const userInput = input.trim().toLowerCase();
    const correctAnswer = currentRule.rule.trim().toLowerCase();
    const percent = getMatchPercentage(userInput, correctAnswer);
    setMatchPercentage(percent);

    let result = null;
    if (percent >= 80) result = "Correct!";
    else if (percent >= 50) result = "Needs improvement.";
    else result = "Incorrect.";

    setFeedback(result);
    setShowAnswer(true);

    setAnswerHistory((prev) => [
      ...prev,
      {
        topic: currentRule.topic,
        userInput: input,
        correct: currentRule.rule,
        match: percent,
        result,
      },
    ]);
  };

  const nextRule = () => {
    if (!filteredRules.length) return;

    setInput("");
    setFeedback(null);
    setShowAnswer(false);
    setCurrentRuleIndex((prev) => (prev + 1) % filteredRules.length);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffleRules = () => {
    const shuffled = shuffleArray(filteredRules);
    setFilteredRules(shuffled);
    setCurrentRuleIndex(0);
    setInput("");
    setFeedback(null);
    setShowAnswer(false);
  };

  function getHighlightedComparison(userInput, correctText) {
    const inputWords = userInput.trim().toLowerCase().split(/\s+/);
    const correctWords = correctText.trim().split(/\s+/);

    return correctWords.map((word, idx) => {
      const cleanedWord = word.replace(/[.,!?]/g, "").toLowerCase();
      const match = inputWords.includes(cleanedWord);

      return (
        <span key={idx} className={match ? "match" : "mismatch"}>
          {word + " "}
        </span>
      );
    });
  }

  if (!currentRule && selectedSubject)
    return <div className="loading">No rules found for this subject.</div>;

  return (
    <div className="app-container">
      <div className="subject-select">
        <label>Select Subject: </label>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="">-- Choose --</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {selectedSubject && currentRule && (
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
              <button className="button button-secondary" onClick={shuffleRules}>
                Shuffle
              </button>
            </div>

            {showAnswer && (
              <div className="answer-section">
                <p
                  className={
                    feedback === "Correct!"
                      ? "correct"
                      : feedback === "Needs improvement."
                      ? "partial"
                      : "incorrect"
                  }
                >
                  {feedback} ({matchPercentage}% match)
                </p>
                {feedback !== "Correct!" && (
                  <div className="correct-answer">
                    Correct Answer: {getHighlightedComparison(input, currentRule.rule)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
