import React, { useEffect, useState } from 'react';
import '../../../public/modal.css'

function Modal(props) {
  const {setShiftsCounter, setMorningCounter,
    setEveningCounter, setNightCounter,
    shiftsCounter, morningCounter, eveningCounter, nightCounter,
    onClose, day, schedule, setSchedule,
    backupSchedule, setBackupSchedule, adminComment,
    employeesList, employees, month} = props;

  const [selectedEmp, setSelectedEmp] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [backupForSelectedTime, setBackupForSelectedTime] = useState([]);
  const [showAvailableEmps, setShowAvailableEmps] = useState(false);
  const [showEmpsList, setShowEmpList] = useState(false);
  const [comment, setComment] = useState(adminComment || "");

  function handelEmpClick(emp, time) {
    console.log(backupSchedule)
    setBackupForSelectedTime(backupSchedule[day][time] || []);
    setShowAvailableEmps(true);
    setSelectedShift(time);
    setSelectedEmp(emp);
  }

  function handelShiftClick(time) {
    setBackupForSelectedTime(backupSchedule[day][time] || []);
    setShowAvailableEmps(true);
    setSelectedShift(time);
    setSelectedEmp("");
  }

  function updateCounters(shift, action, key) {
    if (action === 'replace') {
      const { oldEmp, newEmp } = key;
      const oldEmpStr = oldEmp.join('');
      const newEmpStr = newEmp.join('');

      const newShiftsCounter = {
        ...shiftsCounter,
        [oldEmpStr]: (shiftsCounter[oldEmpStr] || 0) - 1, // Decrease the count for oldEmp
        [newEmpStr]: (shiftsCounter[newEmpStr] || 0) + 1, // Increase the count for newEmp
      };
        
      // Updating the main shift counter
      setShiftsCounter(newShiftsCounter);
      
      // Create new objects for each shift counter
      let newMorningCounter = { ...morningCounter };
      let newEveningCounter = { ...eveningCounter };
      let newNightCounter = { ...nightCounter };
  
      // Update the appropriate shift counter based on the shift type
      if (shift === 'morning') {
        newMorningCounter[oldEmpStr] = (morningCounter[oldEmpStr] || 0) - 1; // Remove the oldEmp
        newMorningCounter[newEmpStr] = (morningCounter[newEmpStr] || 0) + 1; // Add the newEmp
        setMorningCounter(newMorningCounter);
      } else if (shift === 'evening') {
        newEveningCounter[oldEmpStr] = (eveningCounter[oldEmpStr] || 0) - 1;
        newEveningCounter[newEmpStr] = (eveningCounter[newEmpStr] || 0) + 1;
        setEveningCounter(newEveningCounter);
      } else if (shift === 'night') {
        newNightCounter[oldEmpStr] = (nightCounter[oldEmpStr] || 0) - 1;
        newNightCounter[newEmpStr] = (nightCounter[newEmpStr] || 0) + 1;
        setNightCounter(newNightCounter);
      }
    } else {
      const keyStr = key.join('');

      const newShiftsCounter = {
        ...shiftsCounter,
        [keyStr]: (shiftsCounter[keyStr] || 0) + (action === 'add' ? 1 : -1),
      };
  
      // Updating the main shift counter
      setShiftsCounter(newShiftsCounter);
      
      // Create new objects for each shift counter
      let newMorningCounter = { ...morningCounter };
      let newEveningCounter = { ...eveningCounter };
      let newNightCounter = { ...nightCounter };
  
      // Update the appropriate shift counter based on the shift type
      if (shift === 'morning') {
        newMorningCounter[keyStr] = (morningCounter[keyStr] || 0) + (action === 'add' ? 1 : -1);
        setMorningCounter(newMorningCounter);
      } else if (shift === 'evening') {
        newEveningCounter[keyStr] = (eveningCounter[keyStr] || 0) + (action === 'add' ? 1 : -1);
        setEveningCounter(newEveningCounter);
      } else if (shift === 'night') {
        newNightCounter[keyStr] = (nightCounter[keyStr] || 0) + (action === 'add' ? 1 : -1);
        setNightCounter(newNightCounter);
      }
    }
  }
  

  function updateSchedule(schedule, day, selectedShift, emp, action) {
    const updatedSchedule = { ...schedule };
    const shiftArray = [...updatedSchedule[day][selectedShift]];

    if (action === 'add') {
      shiftArray.push(emp);
      schedule !== backupSchedule && updateCounters(selectedShift, 'add', emp);
    } else if (action === 'remove') {
      const empIndex = shiftArray.indexOf(emp);
      if (empIndex !== -1) {
        shiftArray.splice(empIndex, 1);
        schedule !== backupSchedule && updateCounters(selectedShift, 'remove', emp);
      }
    } else if (action === 'replace') {
      const empIndex = shiftArray.findIndex(arr => JSON.stringify(arr) === JSON.stringify(emp.oldEmp));

      if (empIndex !== -1) {
        shiftArray[empIndex] = emp.newEmp;
        if (schedule !== backupSchedule) {          
          updateCounters(selectedShift, 'replace', { oldEmp: emp.oldEmp, newEmp: emp.newEmp }
          ); 
        }
      }
    }

    updatedSchedule[day][selectedShift] = shiftArray;
    return updatedSchedule;
  }
  
  function changeEmp(newEmployee) {
    const shouldDelete = typeof newEmployee === 'string' ? true : false;
    const newEmp = typeof newEmployee === 'string' ? newEmployee.split('') : newEmployee;
  
    if (selectedEmp) {
      const updatedSchedule = updateSchedule(schedule, day, selectedShift, { oldEmp: selectedEmp, newEmp: newEmp }, 'replace');
      const updatedBackupSchedule = updateSchedule(backupSchedule, day, selectedShift, { oldEmp: newEmp, newEmp: selectedEmp }, 'replace');
  
      setSchedule(updatedSchedule);
      setBackupSchedule(updatedBackupSchedule);
    } else {
      const updatedBackupSchedule = updateSchedule(backupSchedule, day, selectedShift, newEmp, 'remove');
      setBackupSchedule(updatedBackupSchedule);
  
      const updatedSchedule = updateSchedule(schedule, day, selectedShift, newEmp, 'add');
      setSchedule(updatedSchedule);
    }
  
    setShowAvailableEmps(false);
    setShowEmpList(false);
  }
  
  function removeEmp() {
    const updatedSchedule = updateSchedule(schedule, day, selectedShift, selectedEmp, 'remove');
    const updatedBackupSchedule = updateSchedule(backupSchedule, day, selectedShift, selectedEmp, 'add');
  
    setSchedule(updatedSchedule);
    setBackupSchedule(updatedBackupSchedule);
    setShowAvailableEmps(false);
  }

  return (
    <>
      <div className="modal-overlay"></div>
      <div className={`modal fade show`} style={{ display: 'block' }} aria-labelledby="staticBackdropLabel" inert>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">עריכה - {day}/{month}</h1>
            </div>
            <div className="modal-body">
              <div className="container">
                <div className="row">
                  <div className="col">
                  <div className="selectedEmployees">
                  <p 
                    className={`day-title-modal ${selectedShift === "morning" && selectedEmp === "" ? 'selected-shift' : ''}`}
                    onClick={() => handelShiftClick("morning")}
                    >בוקר
                  </p>
                  {schedule[day].morning.map((emp, index) => (
                    <li 
                      key={index} 
                      onClick={() => handelEmpClick(emp, "morning")} 
                      className={`employee-li ${selectedEmp === emp && selectedShift === "morning" ? 'selected-emp' : ''}`}
                      style={{
                      color: employeesList.find(empObj => empObj.user_id === emp.join(''))?.color || 'black'
                    }}>
                      {employees[emp.join('')] || "No name available"}
                    </li>
                  ))}

                  <p 
                    className={`day-title-modal ${selectedShift === "evening" && selectedEmp === "" ? 'selected-shift' : ''}`}
                    onClick={() => handelShiftClick("evening")}>
                      ערב
                    </p>
                  {schedule[day].evening.map((emp, index) => (
                    <li 
                      key={index} 
                      onClick={() => handelEmpClick(emp, "evening")} 
                      className={`employee-li ${selectedEmp === emp && selectedShift === "evening" ? 'selected-emp' : ''}`}
                      style={{
                      color: employeesList.find(empObj => empObj.user_id === emp.join(''))?.color || 'black'
                    }}>
                      {employees[emp.join('')] || "No name available"}
                    </li>
                  ))}

                  <p 
                    className={`day-title-modal ${selectedShift === "night" && selectedEmp === "" ? 'selected-shift' : ''}`}
                    onClick={() => handelShiftClick("night")}>
                    לילה
                  </p>
                  {schedule[day].night.map((emp, index) => (
                    <li 
                      key={index} 
                      onClick={() => handelEmpClick(emp, "night")} 
                      className={`employee-li ${selectedEmp === emp && selectedShift === "night" ? 'selected-emp' : ''}`}
                      style={{
                      color: employeesList.find(empObj => empObj.user_id === emp.join(''))?.color || 'black'
                    }}>
                      {employees[emp.join('')] || "No name available"}
                    </li>
                  ))}
                  </div>

                  {/* Check for employees with overlapping shifts */}
                  {(() => {
                    const currentDayShifts = Object.values(schedule[day]);
                    const previousDayShifts = schedule[day - 1] ? schedule[day - 1].night : [];
                    
                    const currentDayEmployeeCount = {};
                    const currentMorningEveningEmpsCount = {};
                    const previousNightEmployees = new Set();

                    // Count current day employee shifts
                    for (let shift in currentDayShifts) {
                      for (let emp of currentDayShifts[shift]) {
                        const empId = emp.join('');
                        currentDayEmployeeCount[empId] = (currentDayEmployeeCount[empId] || 0) + 1;
                        if(shift != 2){
                          currentMorningEveningEmpsCount[empId] = (currentMorningEveningEmpsCount[empId] || 0) + 1;
                        }
                      }
                    }

                    // Collect employees from previous night's shift
                    for (let emp of previousDayShifts) {
                      const empId = emp.join('');
                      previousNightEmployees.add(empId);
                    }

                    // Find employees with multiple shifts on the current day
                    const multipleShiftEmployees = Object.entries(currentDayEmployeeCount)
                      .filter(([_, count]) => count > 1)
                      .map(([id]) => id);

                    // Find employees who worked the previous night's shift and also on the current day
                    const overlappingShiftEmployees = Object.keys(currentMorningEveningEmpsCount).filter(empId => 
                      previousNightEmployees.has(empId)
                    );

                    return (
                      <div>
                        <p className="mt-3" style={{ color: 'red' }}>
                          {multipleShiftEmployees.length > 0 &&
                            `* ${multipleShiftEmployees
                              .map(empId => employees[empId] || "Unknown")
                              .join(', ')} - יותר ממשמרת אחת`}
                        </p>
                        <p className="mt-3" style={{ color: 'blue' }}>
                          {overlappingShiftEmployees.length > 0 &&
                            `* ${overlappingShiftEmployees
                              .map(empId => employees[empId] || "Unknown")
                              .join(', ')} - משמרת לילה ביום הקודם`}
                        </p>
                      </div>
                    );
                  })()}


                  </div>
                  <div className="col">

                  {showEmpsList && 
                  <div>
                    {Object.keys(employeesList).map((emp) => {
                      return (
                        <li 
                          onClick={() => changeEmp(employeesList[emp].user_id)}
                          key={employeesList[emp].user_id} 
                          className='employee-li' 
                          style={{ color: employeesList.find(empObj => empObj.user_id === employeesList[emp].user_id)?.color || 'black' }}
                        >
                          {employeesList[emp].name || "No name available"}
                        </li>
                      );
                    })}
                    <button 
                      onClick={() => setShowEmpList(false)} 
                      className="btn btn-outline-secondary mt-4"
                      >הצג עובדים פנויים 
                    </button>
                  </div>
                  }

                    {showAvailableEmps && backupForSelectedTime.length > 0 && !showEmpsList &&
                      <div>
                        <span className="available-emps-title">עובדים פנויים :</span>
                        {backupForSelectedTime.map((emp, index) => (
                          <li key={index} onClick={() => changeEmp(emp)} className='employee-li' style={{
                            color: employeesList.find(empObj => empObj.user_id === emp.join(''))?.color || 'black'
                          }}>
                            {employees[emp.join('')] || "No name available"}
                          </li>
                        ))}
                            <button 
                              onClick={() => setShowEmpList(true)} 
                              className="btn btn-outline-secondary mt-4"
                              >הצג עובדים נוספים
                            </button>
                        {selectedEmp && 
                          <div className="container mt-3">
                            <button 
                              onClick={removeEmp} 
                              className="btn btn-outline-danger mt-4"
                              >הסר עובד מהמשמרת
                            </button>
                          </div>
                        }
                      </div>
                    }
                    {showAvailableEmps && backupForSelectedTime.length === 0 &&
                    <div>

                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" className="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                        <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                        <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                      </svg>
                      <span className="no-availble-list me-2">אין עובדים פנויים </span>
                      
                      <div>
                        {Object.keys(employeesList).map((emp) => {
                          return (
                            <li 
                              onClick={() => changeEmp(employeesList[emp].user_id)}
                              key={employeesList[emp].user_id} 
                              className='employee-li' 
                              style={{ color: employeesList.find(empObj => empObj.user_id === employeesList[emp].user_id)?.color || 'black' }}
                            >
                              {employeesList[emp].name || "No name available"}
                            </li>
                          );
                        })}

                        {selectedEmp !== "" &&
                          <button 
                            onClick={removeEmp} 
                            className="btn btn-outline-danger my-4 delete-emp-btn"
                            >הסר עובד מהמשמרת
                          </button>
                        }
                      </div>
                    </div>
                    }
                  </div>
                </div>
              </div>
              <div className="container">
                  <div className="form-floating mt-3 mx-2">
                    <input value={comment}  onChange={(e) => setComment(e.target.value)} className="form-control" placeholder="Leave a comment here" id="floatingTextarea2"></input>
                    <label htmlFor="floatingTextarea2">הערות</label>
                  </div>
                </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => onClose(comment)}>אישור</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;

