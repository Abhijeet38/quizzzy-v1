import { useEffect, useState } from "react";
import he from "he";
import Cards from "./Cards.js";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Questions() {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [score, setScore] = useState(null);
  const [questionsData, setQuestions] = useState([]);
  const [correctOptions, setCorrect] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timer, setTimer] = useState(30); // Countdown timer state
  const [intervalId, setIntervalId] = useState(null);

  // Handle option selection and auto-advance to next question
  const handleOptionSelected = (qno, option) => {
    setSelectedOptions((prev) => ({ ...prev, [qno]: option }));
    clearInterval(intervalId); // Stop timer when an option is selected

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questionsData.length) {
      setTimeout(() => {
        setCurrentQuestionIndex(nextIndex);
        setTimer(30); // Reset timer for next question
      }, 300); // Delay before moving to next question
    } else {
      setIsSubmitted(true);
    }
  };

  useEffect(() => {
    if (isSubmitted) {
      evaluateResult(); // Evaluate the result after submission
    }
  }, [isSubmitted]);

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        "https://opentdb.com/api.php?amount=3&category=9&difficulty=easy&type=multiple"
      );
      const data = await res.json();
      const questionsData = data.results.map((item, index) => {
        const options = shuffleArray([
          item.correct_answer,
          ...item.incorrect_answers,
        ]).map((option) => he.decode(option));

        return {
          qno: (index + 1).toString(),
          question: he.decode(item.question),
          options,
          correctAnswer: he.decode(item.correct_answer),
        };
      });
      const correctAnswers = data.results.map((item) =>
        he.decode(item.correct_answer)
      );
      setQuestions(questionsData);
      setCorrect(correctAnswers);
      //   console.log(questionsData);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  // Evaluate result after quiz is complete
  const evaluateResult = () => {
    console.log(questionsData);
    const res = questionsData.reduce((acc, data) => {
      const selectedAnswer = selectedOptions[data.qno];
      console.log(selectedAnswer);
      const isCorrect = selectedAnswer === data.correctAnswer;
      return acc + (isCorrect ? 1 : 0);
    }, 0);
    setScore(res);
  };

  // Countdown Timer Functionality
  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timer === 0) {
      // Move to next question when time runs out
      if (currentQuestionIndex < questionsData.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTimer(30); // Reset timer
      } else {
        setIsSubmitted(true);
        evaluateResult();
      }
    }

    if (timer > 0 && !isSubmitted) {
      // Start the countdown timer
      const id = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      setIntervalId(id); // Store interval id to clear it later

      return () => clearInterval(id); // Cleanup on unmount or when timer is reset
    }
  }, [timer, currentQuestionIndex, isSubmitted, questionsData.length]);

  // Reset the quiz state when Replay is clicked
  const handleReplay = () => {
    setSelectedOptions({});
    setScore(null);
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setTimer(30);
    setIntervalId(null);
    fetchQuestions(); // Re-fetch questions for a new game
  };

  return (
    <div className="home-container">
      <div className="quarter-circle-top" />
      <div className="quarter-circle-bottom" />
      <div className="quiz-container">
        {/* Progress Bar */}
        {questionsData.length > 0 && !isSubmitted && (
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${
                  (currentQuestionIndex + 1) * (100 / questionsData.length)
                }%`,
              }}
            />
          </div>
        )}

        {/* Timer Display */}
        {questionsData.length > 0 && !isSubmitted && (
          <div className="timer">Time Left: {timer} seconds</div>
        )}

        {/* Display the current question */}
        {questionsData.length > 0 && !isSubmitted && (
          <Cards
            key={currentQuestionIndex}
            qno={questionsData[currentQuestionIndex].qno}
            question={questionsData[currentQuestionIndex].question}
            options={questionsData[currentQuestionIndex].options}
            onOptionSelected={handleOptionSelected}
            isSubmitted={isSubmitted}
            selectedOption={
              selectedOptions[questionsData[currentQuestionIndex].qno]
            }
            correctOption={correctOptions[currentQuestionIndex]}
          />
        )}

        {/* Show buttons after submission */}
        {isSubmitted && (
          <div>
            <p className="score">
              You scored: {score}/{questionsData.length}
            </p>
            <div className="report">
              {questionsData.map((data, index) => (
                <div key={index} className="report-item">
                  <p>
                    <strong>{data.question}</strong>
                  </p>
                  <p>
                    Correct Answer:{" "}
                    <span className="correct-answer">{data.correctAnswer}</span>
                  </p>
                  <p>
                    Your Answer:{" "}
                    <span className="user-answer">
                      {selectedOptions[data.qno]}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            {/* Replay Button */}
            <button className="btn" onClick={handleReplay}>
              Replay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
