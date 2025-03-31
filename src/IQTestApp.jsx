import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_URL = "https://iq-backend-bc3f.onrender.com"; // Live backend URL

export default function IQTestApp() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [log, setLog] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/questions`)
      .then((res) => res.json())
      .then(setQuestions);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleAnswer = (selected) => {
    const q = questions[current];
    const correct = selected === q.answer;
    const inTime = timeLeft > 0;
    const timeTaken = 30 - timeLeft;
    const weight = q.weight;
    const earned = correct && inTime ? weight : 0;

    setLog((prev) => [
      ...prev,
      { question: q.question, selected, correct: q.answer, timeTaken, earned },
    ]);
    setScore((s) => s + earned);
    setTimeLeft(30);
    setCurrent((c) => c + 1);
  };

  const getIQ = () => {
    const max = questions.reduce((sum, q) => sum + q.weight, 0);
    return Math.round(85 + (score / max) * 60); // Scales from 85 to 145
  };

  if (questions.length === 0) return <p className="p-4">Loading...</p>;
  if (current >= questions.length) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Your IQ Score</h1>
        <p className="text-xl">Estimated IQ: {getIQ()}</p>
        <ul className="mt-4 text-sm">
          {log.map((entry, i) => (
            <li key={i}>
              Q{i + 1}: {entry.selected || "(No answer)"} | Correct: {entry.correct} |
              Time: {entry.timeTaken}s | +{entry.earned}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">
            Question {current + 1} / {questions.length}
          </h2>
          <p className="mb-4">{q.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(q.options).map(([key, val]) => (
              <Button key={key} onClick={() => handleAnswer(key)}>
                {key}: {val}
              </Button>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">Time left: {timeLeft}s</p>
        </CardContent>
      </Card>
    </div>
  );
}