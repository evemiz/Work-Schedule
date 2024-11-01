import React from 'react';
import FormWindow from './FormWindow';
import '../../public/window.css'; // Ensure you have your CSS styles here

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
  return (
    <div className={`window ${props.isVisible ? 'visible' : 'hidden'}`}>
       {props.isVisible && 
        <div>
            <button className="close-button" onClick={props.onClose}>X</button>
            <h1 className='mx-5'>{formatDateInHebrew(props.year, props.month, props.day)}</h1>
            <div className='form-div'>
                <h3>יכול רק:</h3>
                <FormWindow 
                  day={props.day} 
                  constraint={props.constraint}
                  availability={props.availability}
                />
            </div>
            
        </div>
       }
    </div>
  );
};

export default Window;