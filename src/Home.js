import { useState, useEffect } from "react";
import Questions from "./questions.js";

export default function Home() {
  const [startQuiz, setStartQuiz] = useState(false);

  if (startQuiz) {
    return <Questions />;
  }

  return (
    <div className="home-container">
      <div className="quarter-circle-top" />
      <div className="quarter-circle-bottom" />
      <div className="home-details">
        <h1>Quizzical</h1>
        <p>Test your Skills Now</p>
        <button className="btn" onClick={() => setStartQuiz(true)}>
          Start Quiz
        </button>
      </div>
    </div>
  );
}
