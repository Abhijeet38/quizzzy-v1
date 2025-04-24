export default function Cards({
  qno,
  question,
  options,
  onOptionSelected,
  isSubmitted,
  selectedOption,
  correctOption,
}) {
  return (
    <div className="Card">
      <h3>
        {qno}. {question}
      </h3>

      {options.map((option, index) => {
        let labelClass = "radio-label";

        if (isSubmitted) {
          if (option === correctOption) {
            labelClass += " correct-option";
          } else if (option === selectedOption) {
            labelClass += " incorrect-option";
          }
        }

        return (
          <div key={index}>
            <input
              type="radio"
              id={`${qno}option${index}`}
              name={`${qno}option`}
              className="radio-button"
              onChange={() => onOptionSelected(qno, option)}
              disabled={isSubmitted}
              checked={selectedOption === option}
            />
            <label htmlFor={`${qno}option${index}`} className={labelClass}>
              {option}
            </label>
          </div>
        );
      })}

      <hr />
    </div>
  );
}
