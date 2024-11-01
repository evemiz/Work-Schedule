import React, { useState, useEffect } from 'react';
import '../../../public/window.css'; // Ensure you have your CSS styles here

function FormWindow(props) {
  const [selectedOptions, setSelectedOptions] = useState({ 1: false, 2: false, 3: false });

  // Update the selectedOptions only when the day or availability changes
  useEffect(() => {
    const availability = props.availability[props.day]; // Access availability for the specific day

    if (availability) {
      setSelectedOptions({
        1: availability.morning || false,
        2: availability.noon || false,
        3: availability.evening || false,
      });
    }
  }, [props.day, props.availability]); // Reacts to both day and availability changes

  function toggleOption(option) {
    setSelectedOptions((prevSelected) => {
      return {
        ...prevSelected,
        [option]: !prevSelected[option],
      };
    });

    let opt = '';
    switch (option) {
      case 1:
        opt = 'morning';
        break;
      case 2:
        opt = 'noon';
        break;
      case 3:
        opt = 'evening';
        break;
      default:
        opt = '';
        break;
    }
    props.constraint(opt, props.day); // Call the constraint function with the option
  }

  return (
    <form>
      <div className="form-check form-check-inline me-4 ms-1">
        <button
          type="button"
          className={`form-button ${selectedOptions[1] ? 'selected-btn' : ''}`}
          onClick={() => toggleOption(1)}
        >
          בוקר
        </button>
      </div>

      <div className="form-check form-check-inline mx-1">
        <button
          type="button"
          className={`form-button ${selectedOptions[2] ? 'selected-btn' : ''}`}
          onClick={() => toggleOption(2)}
        >
          צהריים
        </button>
      </div>

      <div className="form-check form-check-inline mx-1">
        <button
          type="button"
          className={`form-button ${selectedOptions[3] ? 'selected-btn' : ''}`}
          onClick={() => toggleOption(3)}
        >
          ערב
        </button>
      </div>
    </form>
  );
}

export default FormWindow;
