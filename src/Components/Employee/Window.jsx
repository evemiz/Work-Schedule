import React, {useState, useEffect} from 'react';
import FormWindow from './FormWindow';
import '../../../public/window.css'; // Ensure you have your CSS styles here

const formatDateInHebrew = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    const options = {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long', 
    };
  
    return new Intl.DateTimeFormat('he-IL', options).format(date);
  };

function Window (props) {
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const availability = props.availability[props.day]; // Access availability for the specific day
    if (availability === 'no') {
      setIsSelected(true);
    }
    else {
      setIsSelected(false);
    }
  }, [props.day, props.availability]);

  function handelClick() {
    setIsSelected(prev => !prev)
    props.notAvailable(props.day)
  }

  return (

    <div className={`window ${props.isVisible ? 'visible' : 'hidden'}`}>
       {props.isVisible && 
        <div>
            <button className="close-button" onClick={props.onClose}>X</button>
            <h1 className='mx-5'>{formatDateInHebrew(props.year, props.month, props.day)}</h1>
            <div className='form-div'>
              {!isSelected && 
                <div>
                  <h3>יכול רק:</h3>
                    <FormWindow 
                      isVisible={props.isWindowVisible} 
                      day={props.day} 
                      constraint={props.constraint}
                      availability={props.availability}
                    />
                </div>
              }
              
                <div className='window-button-container'>
                  <button
                    type="button"
                    className={`not-available-button ${isSelected ? 'selected-btn-not-available' : ''}`}
                    onClick={handelClick}
                  >
                    לא יכול לעבוד
                  </button>
                </div>
                
            </div>
            
        </div>
       }
    </div>
  );
};

export default Window;