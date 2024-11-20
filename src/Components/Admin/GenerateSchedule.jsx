import React, { useRef, useState, useEffect } from "react";
import { scheduleCollection, usersCollection, savedScheduleCollection } from "../../../Utils/firebaseconfig";
import { getDocs } from "firebase/firestore";
import '../../../public/adminSchedule.css'
import Loading from "../Loading";
import Modal from "./Modal";
import dayjs from 'dayjs';
import Calendar from "./CalanderTable";
import AlertModal from "./UnSavedModal";


const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
};
  
const getStartDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay();
};


function Generate({month, year, employeesList}) {
    const toastRef = useRef(null);
    const [shifts, setShifts] = useState([]);
    const [schedule, setSchedule] = useState({});
    const [backupSchedule, setBackupSchedule] = useState({});
    const [employees, setEmployees] = useState({});
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isAlertModalVisible, setIsAllertModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [shiftsCounter, setShiftsCounter] = useState({});
    const [empGivenShifts, setEmpGivenShifts] = useState({});
    const [needMoreEmps, setNeedMoreEmps] = useState([]);
    const [morningCounter, setMorningCounter] = useState({});
    const [eveningCounter, setEveningCounter] = useState({});
    const [nightCounter, setNightCounter] = useState({});
    const daysInMonth = getDaysInMonth(month, year);
    const startDay = getStartDayOfMonth(month, year);

    const [modifiedDays, setModifiedDays] = useState({});
    const [adminComments, setAdminComments] = useState({});

    const daysArray = new Array(startDay).fill(null).concat(
        Array.from({ length: daysInMonth }, (_, i) => i + 1)
    );

    
    const handleClick = (day) => {
        if(day){
            setSelectedDate(day);
            setModalVisible(true);
        }
    };

    function modifyShift(EmpNumber, shifts, day, shiftNum) {
        let needMore = true;
        let counter = EmpNumber;
        let newShifts = shifts.map(emp => emp.map(inner => [...inner]));
        if(EmpNumber > 0){
            let otherShifts = [];
            switch(shiftNum){
                case 0:
                    otherShifts = [1,2];
                    break;
                case 1:
                    otherShifts = [0,2];
                    break;
                default:
                    otherShifts = [0,1];
                    break;
            }
            newShifts.forEach(newEmp => {
                if(newEmp[day][shiftNum] === 1 && newEmp[day][otherShifts[0]] !== -1 && newEmp[day][otherShifts[1]] !== -1 && needMore){
                    newEmp[day][shiftNum] = -1;
                    counter -= 1;
                    if(shiftNum === 2 && day < 6){
                        newEmp[day+1][0] = 0;
                        newEmp[day+1][1] = 0;
                    }
                }
                if(counter === 0){
                    needMore = false;
                }
            })
        }
        if (needMore && !needMoreEmps.includes(day + 1)) {
            setNeedMoreEmps(prev => [
                ...prev,
                day + 1
            ]);
        }
        return newShifts;
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    

    async function getSchedule() {
        setLoading(true);
        let shiftsData = [];
    
        // Get shifts data from the usersCollection
        try {
            const querySnapshot = await getDocs(usersCollection);
            let updatedEmp = {};
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                const shifts = user.shifts;
                const name = user.name;
                updatedEmp = { ...updatedEmp, [doc.id]: name };
                const userShifts = [];
    
                if (shifts && Object.keys(shifts).length > 0) {
                    for (let i = 1; i <= Object.keys(shifts).length; i++) {
                        const shift = shifts["day" + i];
                        userShifts.push(shift);
                    }
                    shiftsData.push([...userShifts, doc.id]); 
                }
            });
            setEmployees(updatedEmp);
        } catch (err) {
            alert("שגיאה לא צפויה");
        }
        if(shiftsData.length === 0){
            const toast = new bootstrap.Toast(toastRef.current);
            toast.show();
            setLoading(false);
            return;
        }
        setShifts(shiftsData);
        let empsCounter = {};
        for(let emp in shiftsData){
            let shiftCount = 0;

            for(let i=0 ; i<daysInMonth-1 ; i++){
                if (JSON.stringify(shiftsData[emp][i]) !== JSON.stringify([0, 0, 0])) {
                    shiftCount++;
                }
            }
            empsCounter[shiftsData[emp][daysInMonth]] = shiftCount;
        }

        setEmpGivenShifts(empsCounter);
    
        let month = 0;
        let year = 0;
        let modifyEmpsNum ={};

        const specialDays = {};
        const scheduleSnapshot = await getDocs(scheduleCollection);
        if (!scheduleSnapshot.empty) {
            const firstDoc = scheduleSnapshot.docs[0].data();
            month = firstDoc.month;
            year = firstDoc.year;
            modifyEmpsNum = firstDoc.modifyEmpsNum;
    
            const startOfMonth = dayjs().startOf('month');
            const endOfMonth = dayjs().endOf('month');
    
            // Loop to set special days
            for (let day = startOfMonth; day.isBefore(endOfMonth.add(1, 'day'), 'day'); day = day.add(1, 'day')) {
                if (day.day() === 5) { 
                    specialDays[day.date()] = { evening: 1 };
                }
                if (day.day() === 6) { 
                    specialDays[day.date()] = { morning: 1, evening: 1 };
                }
            }

            for(let day in modifyEmpsNum) {
                if(day in specialDays){
                    specialDays[day] = { 
                        ...specialDays[day], 
                        ...modifyEmpsNum[day] 
                    };
                }
                else {
                    specialDays[day] = modifyEmpsNum[day];
                }
            }
            setModifiedDays(modifyEmpsNum);
        } else {
            return;
        }
    
        for (let day = 0; day < daysInMonth; day++) {
            let numEmpMorning = 3;  
            let numEmpEvening = 2;  
            let numEmpNight = 1;    
    
            let morning = 0;
            let evening = 0;
            let night = 0;
    
            shiftsData.forEach(emp => {
                morning += emp[day][0];
                evening += emp[day][1];
                night += emp[day][2];
            });

            const tempDay = day + 1 ;
            if (tempDay in specialDays) {
                if ("morning" in specialDays[tempDay]) {
                    numEmpMorning = specialDays[tempDay].morning;
                }
                if ("evening" in specialDays[tempDay]) {
                    numEmpEvening = specialDays[tempDay].evening;
                }
                if ("night" in specialDays[tempDay]) {
                    numEmpNight = specialDays[tempDay].night;
                }
            }

            // Apply the shift modification based on the number of employees for each shift
            if (morning <= evening && morning <= night) {
                shiftsData = modifyShift(numEmpMorning, shiftsData, day, 0);
                if (evening < night) {
                    shiftsData = modifyShift(numEmpEvening, shiftsData, day, 1);
                    shiftsData = modifyShift(numEmpNight, shiftsData, day, 2);
                } else {
                    shiftsData = modifyShift(numEmpNight, shiftsData, day, 2);
                    shiftsData = modifyShift(numEmpEvening, shiftsData, day, 1);
                }
                shuffleArray(shiftsData);
            } else if (evening <= morning && evening <= night) {
                shiftsData = modifyShift(numEmpEvening, shiftsData, day, 1);
                if (morning < night) {
                    shiftsData = modifyShift(numEmpMorning, shiftsData, day, 0);
                    shiftsData = modifyShift(numEmpNight, shiftsData, day, 2);
                } else {
                    shiftsData = modifyShift(numEmpNight, shiftsData, day, 2);
                    shiftsData = modifyShift(numEmpMorning, shiftsData, day, 0);
                }
                shuffleArray(shiftsData);
            } else if (night <= morning && night < evening) {
                shiftsData = modifyShift(numEmpNight, shiftsData, day, 2);
                if (evening < morning) {
                    shiftsData = modifyShift(numEmpEvening, shiftsData, day, 1);
                    shiftsData = modifyShift(numEmpMorning, shiftsData, day, 0);
                } else {
                    shiftsData = modifyShift(numEmpMorning, shiftsData, day, 0);
                    shiftsData = modifyShift(numEmpEvening, shiftsData, day, 1);
                }
                shuffleArray(shiftsData);
            }

        }
        makeSchedule(shiftsData);
        setLoading(false);
    }
    
    function makeSchedule(shiftsData) {
        let newSchedule = {};
        let backup = {};
        let employeeShiftCount = {}; 
        let morningShiftCount = {}; 
        let eveningShiftCount = {}; 
        let nightShiftCount = {}; 
    
        for (let dayIndex = 0; dayIndex < shiftsData[0].length - 1; dayIndex++) {
            newSchedule[dayIndex + 1] = { morning: [], evening: [], night: [] };
            backup[dayIndex + 1] = { morning: [], evening: [], night: [] };
        }
    
        shiftsData.forEach(emp => {
            const employeeName = emp[emp.length - 1]; 

            if (!employeeShiftCount[employeeName]) {
                employeeShiftCount[employeeName] = 0;
            }

            if (!morningShiftCount[employeeName]) {
                morningShiftCount[employeeName] = 0;
            }

            if (!eveningShiftCount[employeeName]) {
                eveningShiftCount[employeeName] = 0;
            }

            if (!nightShiftCount[employeeName]) {
                nightShiftCount[employeeName] = 0;
            }
    
            emp.forEach((day, ind) => {
                // Morning Shift
                if (day[0] === -1) {
                    newSchedule[ind + 1]["morning"].push(employeeName);
                    employeeShiftCount[employeeName] += 1; 
                    morningShiftCount[employeeName] += 1;
                }
                if (day[0] === 1) {
                    backup[ind + 1]["morning"].push(employeeName);
                }
    
                // Evening Shift
                if (day[1] === -1) {
                    newSchedule[ind + 1]["evening"].push(employeeName);
                    employeeShiftCount[employeeName] += 1;
                    eveningShiftCount[employeeName] += 1;
                }
                if (day[1] === 1) {
                    backup[ind + 1]["evening"].push(employeeName);
                }
    
                // Night Shift
                if (day[2] === -1) {
                    newSchedule[ind + 1]["night"].push(employeeName);
                    employeeShiftCount[employeeName] += 1;
                    nightShiftCount[employeeName] += 1;
                }
                if (day[2] === 1) {
                    backup[ind + 1]["night"].push(employeeName);
                }
            });
        });

        const modifyShiftCountKeys = (shiftCount) =>
            Object.keys(shiftCount).reduce((acc, key) => {
              acc[key.split(',').join('')] = shiftCount[key];
              return acc;
            }, {});
          
          const modifiedEmployeeShiftCount = modifyShiftCountKeys(employeeShiftCount);
          const modifiedMorningShiftCount = modifyShiftCountKeys(morningShiftCount);
          const modifiedEveningShiftCount = modifyShiftCountKeys(eveningShiftCount);
          const modifiedNightShiftCount = modifyShiftCountKeys(nightShiftCount);
    
        setSchedule(newSchedule);
        setBackupSchedule(backup);
        setShiftsCounter(modifiedEmployeeShiftCount);
        setMorningCounter(modifiedMorningShiftCount);
        setEveningCounter(modifiedEveningShiftCount);
        setNightCounter(modifiedNightShiftCount);
    }

    const reverseConvertObjectsToArrays = (schedule) => {
        const updatedSchedule = {};
    
        // Loop through each day in the schedule
        for (const day in schedule) {
          if (schedule.hasOwnProperty(day)) {
            updatedSchedule[day] = {};
    
            // Loop through each time period (morning, evening, night)
            for (const period in schedule[day]) {
              if (schedule[day].hasOwnProperty(period)) {
                const employeesObject = schedule[day][period];
    
                // Convert the object back to an array
                updatedSchedule[day][period] = Object.values(employeesObject).map((emp) => {
                  return emp.split(''); // Split back into the original employee structure
                });
              }
            }
          }
        }
    
        return updatedSchedule;
      };

    async function getExistSchedule() {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(savedScheduleCollection);
      
            if (!querySnapshot.empty) {
              const savedData = querySnapshot.docs[0].data();
              const originalSchedule = reverseConvertObjectsToArrays(savedData.schedule);
              setAdminComments(savedData.adminComments);
              setEmployees(savedData.employees);
              setModifiedDays(savedData.modifiedDays);
              setNeedMoreEmps(savedData.needMoreEmps);
              setSchedule(originalSchedule);
              setEmpGivenShifts(savedData.empGivenShifts);
              setMorningCounter(savedData.morningCounter);
              setEveningCounter(savedData.eveningCounter);
              setNightCounter(savedData.nightCounter);
              setShiftsCounter(savedData.shiftsCounter);
            }
            else {
                const toast = new bootstrap.Toast(toastRef.current);
                toast.show();
            }
          } catch (error) {
            alert("שגיאה לא צפויה");
          } finally {
            setLoading(false);
          }
        
    }

    function back() {
        window.location.reload(); 
    }

    return (

    <div className="container mt-5">
            
        {loading ? (
            <div className='py-5 my-5 text-center'>
                <Loading />
            </div>
        ) : (
            <>
            <div className="d-flex justify-content-center gap-2">
                {!(schedule && Object.keys(schedule).length > 0 && employees) && 
                    <button className="btn btn-outline-primary" style={{ width: "20vw" }} onClick={getSchedule}> צור סידור חדש</button>
                }

                {!(schedule && Object.keys(schedule).length > 0 && employees) && 
                    <button className="btn btn-outline-primary" style={{ width: "20vw" }} onClick={getExistSchedule}>עריכת סידור קיים</button>
                }

                {schedule && Object.keys(schedule).length > 0 && employees && 
                <>
                    <button className="btn btn-outline-primary" style={{ width: "20vw" }} type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                        צפייה בנתונים
                    </button>
                    <button onClick={() => setIsAllertModalVisible(true)} type="button" className="btn btn-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"></path>
                        </svg>
                    </button> 
                </>                
                }
            </div>

            <div className="collapse mt-3" id="collapseExample">
                <div className="card card-body">
                    {shiftsCounter && (
                        <table className="table">
                            <thead>
                            <tr>
                                <th className="admin-table-th">עובד</th>
                                <th className="admin-table-th">מספר ימים שהוגשו</th>
                                <th className="admin-table-th">מספר משמרות בסידור</th>
                                <th className="admin-table-th">מספר משמרות בוקר</th>
                                <th className="admin-table-th">מספר משמרות ערב</th>
                                <th className="admin-table-th">מספר משמרות לילה</th>
                                <th className="admin-table-th">הערות</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.keys(shiftsCounter).map((key, index) => {
                                const emp = shiftsCounter[key];
                                const employee = employeesList.find(empObj => empObj.user_id === key);

                                return (
                                    <tr key={index}>
                                        <td
                                            style={{
                                                color: employee?.color || 'black',
                                            }}
                                        > {employee?.name || "No name available"}

                                        </td>
                                        <td>{empGivenShifts[key]}</td>
                                        <td>{emp}</td> 
                                        <td>{morningCounter[key]}</td>
                                        <td>{eveningCounter[key]}</td>
                                        <td>{nightCounter[key]}</td>
                                        <td>{employee?.comments && employee.comments.trim() !== "" ? (
                                            employee.comments):("-")}
                                        </td>
                                    </tr>
                                    
                                );
                            })}
                            
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

    {/* <button onClick={handlePrint} className="btn btn-primary">Print Schedule</button> */}
      {schedule && Object.keys(schedule).length > 0 && employees && (
        <Calendar
            daysArray = {daysArray}
            modifiedDays = {modifiedDays}
            schedule = {schedule}
            employeesList ={employeesList}
            employees ={employees}
            handleClick= {handleClick}
            needMoreEmps = {needMoreEmps}
            adminComments = {adminComments}
            empGivenShifts={empGivenShifts}
            morningCounter={morningCounter}
            eveningCounter={eveningCounter}
            nightCounter ={nightCounter}
            shiftsCounter={shiftsCounter}
        />
      )}
            </>
        )}
            

        {isModalVisible && (
            <Modal
            onClose={(comment) => {
                setModalVisible(false);
                setAdminComments(prev => ({
                    ...prev,
                    [selectedDate]: comment
                }))
            }}
            day={selectedDate}
            schedule={schedule}
            setSchedule={setSchedule}
            backupSchedule={backupSchedule}
            setBackupSchedule={setBackupSchedule}
            employeesList={employeesList}
            employees={employees}
            month={month}
            setShiftsCounter={setShiftsCounter}
            setMorningCounter={setMorningCounter}
            setEveningCounter={setEveningCounter}
            setNightCounter={setNightCounter}
            shiftsCounter={shiftsCounter}
            morningCounter={morningCounter}
            eveningCounter={eveningCounter}
            nightCounter={nightCounter}
            adminComment = {adminComments[selectedDate]}
            />
        )}

        {isAlertModalVisible && 
          <AlertModal 
            setIsModalVisible={setIsAllertModalVisible}
            handel={back}
            btn={"צא"}
          />
        }

          <div className="toast-container position-fixed bottom-0 end-0 p-3">
            <div ref={toastRef} id="liveToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-body">
            <button type="button" className="btn-close mb-3 me-1" data-bs-dismiss="toast" aria-label="Close"></button>
                <div style={{color: 'red'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" className="ms-3 bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                    </svg>
                    לא קיים סידור
                </div>
            </div>
            </div>
        </div>

        </div>
      );
    };

    export default Generate;