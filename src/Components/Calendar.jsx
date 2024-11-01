import React, { useState } from 'react';
import Window from './Window';
import Modal from './Modal';
import Cell from './Cell';
import '../../public/calendar.css';

const generateCalendar = (year, month) => {
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const lastDayOfMonth = new Date(year, month - 1, daysInMonth).getDay();
  const greyDaysEnd = (7 - lastDayOfMonth - 1) % 7;

  const insert = Array.from({ length: firstDayOfMonth }, () => 0)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))
    .concat(Array.from({ length: greyDaysEnd }, () => 0));

  const rows = [];
  for (let i = 0; i < insert.length; i += 7) {
    rows.push(insert.slice(i, i + 7));
  }

  return rows;
};

function Calendar() {
  const year = 2024;
  const month = 10;

  const [activeCell, setActiveCell] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isWindowVisible, setIsWindowVisible] = useState(false);
  const [availability, setAvailability] = useState(Object.fromEntries(
    Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => [i + 1, ''])
  ));
  const [constraintsNum, setConstraintsNum] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalButton, setModalButton] = useState("");

  const daysNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  const rows = generateCalendar(year, month);


  function submit () {
    const hasEmptyValue = Object.values(availability).some(value => value === '');
    if (hasEmptyValue) {
      setModalTitle("שגיאה בשליחת הסידור");
      setModalContent("מלא את כל הימים");
      setModalButton("הבנתי");
      setModalVisible(true);
    } else {
      setModalTitle("האם אתה בטוח שברצונך לשלוח את הסידור ?");
      setModalContent("לאחר השליחה אין אפשרות לערוך את המשמרות.");
      setModalButton("שלח סידור");
      setModalVisible(true);
    }
  }

  // Function to handle availability constraints based on user selection
  // Called from <FormWindow />
  function handelConstraint (constraint, day) {
    if(constraintsNum >= 10 && (availability[day] === '' || availability[day] === 'allDay')) {
      setModalTitle("הגעת למגבלת האילוצים");
      setModalContent("לא ניתן לקבוע יותר מ-10 אילוצים בחודש.");
      setModalButton("הבנתי");
      setModalVisible(true);
    }
    else{
      setAvailability((prevAvailability) => {
        const updatedAvailability = { ...prevAvailability };
          if (updatedAvailability[day] === '' || updatedAvailability[day] === 'allDay') {
          updatedAvailability[day] = {
            morning: constraint === 'morning',
            noon: constraint === 'noon',
            evening: constraint === 'evening'
          };
          setConstraintsNum(prev => prev + 1);
        } else {
          updatedAvailability[day] = {
            ...updatedAvailability[day],
            [constraint]: !updatedAvailability[day][constraint]
          };

          const allFalse =
            updatedAvailability[day].morning === false &&
            updatedAvailability[day].noon === false &&
            updatedAvailability[day].evening === false;

          if (allFalse) {
            updatedAvailability[day] = 'allDay';
            setConstraintsNum(prev => {
              if (prev-1 < 0)
                return 0
              return prev-1
            });
          }
  
          // Check if all options are true
          const allSelected = 
          updatedAvailability[day].morning &&
          updatedAvailability[day].noon &&
          updatedAvailability[day].evening;
  
          // If all options are true, set to 'allDay'
          if (allSelected) {
            updatedAvailability[day] = 'allDay';
            setConstraintsNum(prev => prev - 1);
          }
        }
        return updatedAvailability;
      });
    }
  }

  function notAvailable(day) {
    setAvailability((prevAvailability) => {
      const updatedAvailability = { ...prevAvailability };
      if(updatedAvailability[day] === 'no'){
        updatedAvailability[day] = 'allDay';
      }
      else if(updatedAvailability[day] !== '' && updatedAvailability[day] !== 'allDay'){
        setConstraintsNum(prev => prev - 1);
        updatedAvailability[day] = 'no';
      }
      else{
        updatedAvailability[day] = 'no';
      }
      return updatedAvailability;
    })
  }

  // Function to handle cell click events in the calendar
  const handleCellClick = (day) => {
    if (day === 0) return;

    setAvailability((prevAvailability) => {
      const updatedAvailability = { ...prevAvailability };
      if (updatedAvailability[day] === '') {
        updatedAvailability[day] = 'allDay';
        setIsWindowVisible(true);
      } else {
        if (updatedAvailability[day] !== 'allDay'){
          setConstraintsNum(prev => prev - 1);
        }
        if (updatedAvailability[day] === 'no'){
          updatedAvailability[day] = '';
        }
        updatedAvailability[day] = '';
        setIsWindowVisible(false);
      }
      return updatedAvailability;
    });

    console.log(availability);

    setActiveCell(day);
    setSelectedDay(day);
    setTimeout(() => {
      setActiveCell(null);
    }, 300);
  };

  // Function to close the window when needed
  const handleCloseWindow = () => {
    setIsWindowVisible(false);
  };

  return (
    <>
    <nav className="navbar bg-body-tertiary mb-4">
      <div className="container-fluid">
        <div className="mt-3">
          {constraintsNum == 10 ?<p>לא נותרו אילוצים </p>: <p>אילוצים : 10 / {constraintsNum}</p>}
        </div>
        <div>
          <button onClick={submit} className="btn btn-outline-success">שלח סידור</button>
        </div>
      </div>
    </nav>

    <div className='container'>
     
      <div className="table-container">
        <table className="table table-bordered">
          <thead>
            <tr>
              {daysNames.map((day, index) => (
                <th key={index}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    id={cellIndex}
                    className={`
                      cell 
                      ${availability[cell] === 'no' ? 'not-available' : ''} 
                      ${availability[cell] === 'allDay' ? 'selected' : ''} 
                      ${availability[cell] !== 'allDay' && availability[cell] !== '' && cell !== 0? 'selected-constraint' : ''} 
                      ${activeCell === cell ? 'active' : ''} 
                      ${cell === 0 ? 'empty-cell' : ''}
                    `}
                    key={cellIndex}
                    onClick={() => handleCellClick(cell)}
                  >
                    <Cell 
                      cell={cell}
                      availability={availability}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalVisible && (
        <Modal
          title={modalTitle}
          bodyContent={modalContent}
          button={modalButton}
          isVisible={isModalVisible}
          onConfirm={() => {
            setModalVisible(false);
          }}
        />
      )}
    </div>
    <Window 
        isVisible={isWindowVisible} 
        day={selectedDay} 
        month={month}
        year={year}
        onClose={handleCloseWindow} 
        constraint={handelConstraint}
        availability={availability}
        notAvailable={notAvailable}
      />
    </>
  );
}

export default Calendar;
