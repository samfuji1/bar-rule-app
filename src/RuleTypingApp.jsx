import { useState, useEffect } from "react";

const rulesURL = "/rules.json";

export default function RuleTypingApp() {
  const [rules, setRules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filteredRules, setFilteredRules] = useState([]);

  useEffect(() => {
    fetch(rulesURL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data fetched:", data);
        const flatRules = data.flatMap((group) =>
          group.rules.map((rule) => ({
            subject: group.subject,
            topic: rule.topic,
            rule: rule.rule,
          }))
        );
        setRules(flatRules);
        setSubjects([...new Set(flatRules.map((r) => r.subject))]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      setFilteredRules(rules.filter((r) => r.subject === selectedSubject));
    } else {
      setFilteredRules([]);
    }
  }, [selectedSubject, rules]);

  return (
    <div>
      <h1>Rule Typing App</h1>
      <label>
        Subject:
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">--Select--</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <h2>Rules for: {selectedSubject}</h2>
      <ul>
        {filteredRules.map((rule, i) => (
          <li key={i}>
            <strong>{rule.topic}:</strong> {rule.rule}
          </li>
        ))}
      </ul>
    </div>
  );
}
