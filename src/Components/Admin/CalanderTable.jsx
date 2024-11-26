import React, { useRef, useState } from 'react';
import '../../../public/calendar.css';
import { savedScheduleCollection } from '../../../Utils/firebaseconfig';
import { getDocs, deleteDoc, setDoc, doc } from 'firebase/firestore';
import AlertModal from './UnSavedModal';

const Calendar = ({ 
  daysArray, 
  modifiedDays, 
  schedule, 
  employeesList, 
  employees, 
  handleClick, 
  needMoreEmps, 
  adminComments,
  empGivenShifts,
  morningCounter,
  eveningCounter,
  nightCounter,
  shiftsCounter,
  backupSchedule,
}) => {
  
  const toastRef = useRef(null);
  const [saved, setSaved] = useState(false); 
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePrint = () => {
    setIsModalVisible(false);
    const calendarTable = document.getElementById('calendar-table');
    const originalContent = document.body.innerHTML;

    // Temporarily replace the body content with just the calendar table
    document.body.innerHTML = calendarTable.outerHTML;

    // Wait for the next tick to ensure the DOM updates before printing
    setTimeout(() => {
      window.print();

      // Refresh the page after printing
      window.location.reload();
    }, 0);
  };

  const convertArraysToObjects = (schedule) => {
    const updatedSchedule = {};
  
    // Loop through each day in the schedule
    for (const day in schedule) {
      if (schedule.hasOwnProperty(day)) {
        updatedSchedule[day] = {};
  
        // Loop through each time period (morning, evening, night)
        for (const period in schedule[day]) {
          if (schedule[day].hasOwnProperty(period)) {
            const employeesArray = schedule[day][period];
  
            // Convert array to an object
            updatedSchedule[day][period] = employeesArray.reduce((acc, employee, index) => {
              acc[`employee_${index + 1}`] = employee.join(''); // Or use any key structure you prefer
              return acc;
            }, {});
          }
        }
      }
    }
  
    return updatedSchedule;
  };


  const handleSave = async () => {
    try {
      const calendarData = {
        daysArray,
        modifiedDays,
        schedule: convertArraysToObjects(schedule),
        employees,
        needMoreEmps,
        adminComments,
        empGivenShifts,
        morningCounter,
        eveningCounter,
        nightCounter,
        shiftsCounter,
        backupSchedule: convertArraysToObjects(backupSchedule)
      };
      const querySnapshot = await getDocs(savedScheduleCollection);

      if (!querySnapshot.empty) {
        // Delete all existing documents in the collection
        const deletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
      }

      // Add the new document
      const newDocRef = doc(savedScheduleCollection);
      await setDoc(newDocRef, calendarData);
      setSaved(true);

    } catch (error) {
      alert("שגיאה בשמירת הסידור");
      console.log(error);
      setSaved(false);
    } finally {
      const toast = new bootstrap.Toast(toastRef.current);
      toast.show();
    }
  };

  return (
    <div>
        <button type="button" onClick={handleSave} className="btn mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"></path>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"></path>
            </svg>
        </button>
      <button type="button" onClick={() => setIsModalVisible(true)} className="btn mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-printer" viewBox="0 0 16 16">
                <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"></path>
                <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"></path>
            </svg>
        </button>

        {isModalVisible && 
          <AlertModal 
            setIsModalVisible={setIsModalVisible}
            handel={handlePrint}
            btn={"הדפס"}
          />
        }

        
      <div id="calendar-table">
        <div className="calendar-grid mb-5">
          {["א", "ב", "ג", "ד", "ה", "ו", "ש"].map((day) => (
            <div className="calendar-header" key={day}>
              {day}
            </div>
          ))}
          {daysArray.map((day, index) => (
            <div key={index} onClick={() => handleClick(day)} className={`calendar-day ${day ? "active" : "empty"}`}>
              {day && (
                <>
                  <div className="day-div">
                    <div className="day-number">
                    {day}
                    {needMoreEmps && needMoreEmps.includes(day) && (
                      <span style={{color: 'red'}} className='me-2'>!</span>
                      )} 
                    </div>
                    {modifiedDays[day] && modifiedDays[day].comment && modifiedDays[day].comment !== "" && (
                      <div className="day-comment">
                        {modifiedDays[day].comment}
                      </div>
                    )} 
                  </div>

                  <div className="calendar-time-slot">
                    <span className="day-title">בוקר</span>
                    {schedule[day] && schedule[day].morning && schedule[day].morning.length > 0 ? (
                      <ul>
                        {schedule[day].morning.map((emp, index) => (
                          <li
                            className="emp-li-table"
                            key={index}
                            style={{
                              color: employeesList.find(empObj => empObj.user_id === emp.join(''))?.color || 'black'
                            }}
                          >
                            {employees[emp.join('')] || "No name available"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>אין עובדים במשמרת</p>
                    )}
                  </div>
                  <div className="calendar-time-slot">
                    <span className="day-title">ערב</span>
                    {schedule[day] && schedule[day].evening && schedule[day].evening.length > 0 ? (
                      <ul>
                        {schedule[day].evening.map((emp, index) => (
                          <li
                            className="emp-li-table"
                            key={index}
                            style={{
                              color: employeesList.find(empObj => empObj.user_id === emp.join(''))?.color || 'black'
                            }}
                          >
                            {employees[emp.join('')] || "No name available"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>אין עובדים במשמרת</p>
                    )}
                  </div>
                  <div className="calendar-time-slot">
                    <span className="day-title">לילה</span>
                    {schedule[day] && schedule[day].night && schedule[day].night.length > 0 ? (
                      <ul>
                        {schedule[day].night.map((emp, index) => (
                          <li
                            className="emp-li-table"
                            key={index}
                            style={{
                              color: employeesList.find(empObj => empObj.user_id === emp.join(''))?.color || 'black'
                            }}
                          >
                            {employees[emp.join('')] || "No name available"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>אין עובדים במשמרת</p>
                    )}
                  </div>
                  {adminComments && adminComments[day] && (
                      <div className="day-comment text-center">
                        {adminComments[day]}
                      </div>
                    )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div ref={toastRef} id="liveToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-body">
          <button type="button" className="btn-close mb-3 me-1" data-bs-dismiss="toast" aria-label="Close"></button>
            {saved ? (
              <div style={{color: 'green'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" className="ms-3 bi bi-check-circle-fill" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                הסידור נשמר בהצלחה
              </div>
            ):(
              <div style={{color: 'red'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" className="ms-3 bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                </svg>
                שגיאה בשמירת הסידור
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
