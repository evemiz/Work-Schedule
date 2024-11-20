import React, { useEffect, useState } from "react";
import { auth, savedScheduleCollection, scheduleCollection, usersCollection } from "../../../Utils/firebaseconfig";
import { getDoc, getDocs, query, doc } from "firebase/firestore";
import '../../../public/empCalendar.css';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import Loading from "../Loading";
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";
import ScheduleModal from "./ScheduleModal";


const hebrewMonthes = {
    "1": "ינואר",
    "2": "פברואר",
    "3": "מרץ",
    "4": "אפריל",
    "5": "מאי",
    "6": "יוני",
    "7": "יולי",
    "8": "אוגוסט",
    "9": "ספטמבר",
    "10": "אוקטובר",
    "11": "נובמבר",
    "12": "דצמבר"
}

function ExistSchedule() {
    const [loading, setLoading] = useState(false);
    const [loggedUser, setLoggedUser] = useState(null);
    const [daysArray, setDaysArray] = useState([]);
    const [modifiedDays, setModifiedDays] = useState({});
    const [schedule, setSchedule] = useState({});
    const [allSchedule, setAllSchedule] = useState({});
    const [adminComments, setAdminComments] = useState({});
    const [userName, setUserName] = useState("");
    const [month, setMonth] = useState(dayjs('2024-11-01'));
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [employees, setEmployees] = useState({});
    // const [today, setToday] = useState([]);
    const today = [dayjs().date(), dayjs().month()+1, dayjs().year()];

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setLoggedUser(user);
                await fetchSchedule(user.uid);
            } else {
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, []);

    async function fetchSchedule(uid) {
        try {
            const querySnapshotEmps = await getDocs(usersCollection);
            let updatedEmp = {};
            querySnapshotEmps.forEach((doc) => {
                const user = doc.data();
                const name = user.name;
                updatedEmp = { ...updatedEmp, [doc.id]: name };
            });
            setEmployees(updatedEmp);

            const docRef = doc(usersCollection, uid);
            const docSnap = await getDoc(docRef); 
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setUserName(userData.name);
            }

            const querySnapshotDate = await getDocs(scheduleCollection);
            if(!querySnapshotDate.empty){
                const scheduleDoc = querySnapshotDate.docs[0].data();
                setMonth(dayjs(`${scheduleDoc.year}-${scheduleDoc.month}-01`))
              }

            const q = query(savedScheduleCollection);
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const data = querySnapshot.docs[0].data();
                setDaysArray(data.daysArray);
                setModifiedDays(data.modifiedDays);
                setAdminComments(data.adminComments);
                setAllSchedule(data.schedule);

                let userShifts = {};

                // Loop through the schedule and match the employee with the given UID
                for (let day in data.schedule) {
                    const shifts = data.schedule[day];
                    for (let shift in shifts) {
                        const shiftData = shifts[shift];
                        for (let empKey in shiftData) {
                            if (shiftData[empKey] === uid) {
                                userShifts[day] = shift;
                                break;
                            }
                        }
                    }
                }
                setSchedule(userShifts);      
                console.log(today);      
            }
        } catch (err) {
            alert("שגיאה לא צפויה, אנא נסה שוב מאוחר יותר");
        } finally {
            setLoading(false);
        }
    }

    function handelLogout() {
        auth.signOut()
        .then(() => {
        })
        .catch(err => {
        })
      }

    function handelDayClick(day) {
        setSelectedDay(day);
        setIsModalVisible(true);
    }

    function isPast(day) {
        const dayDate = dayjs(`${month.year()}-${month.month() + 1}-${day}`);
        return dayDate.isBefore(dayjs(), "day");
    }

    return (
        <div id="schedule-table">
            {loading ? (
                <div className='py-5 my-5 text-center'>
                    <Loading />
                </div>
            ) : (
                <>
                <nav className="navbar bg-body-tertiary mb-4">
                    <div className="container-fluid">
                        <div className="mt-3 justify-content-center">
                        {userName && <div>
                          <div className='user-name'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="user-bi bi-person-circle" viewBox="0 0 16 16">
                              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"></path>
                              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"></path>
                            </svg>
                            {userName}
                          </div>
                        </div>}
                        </div>
                        <div>
                        <IconButton onClick={handelLogout} aria-label="delete">
                            <LogoutIcon color="success"/>
                        </IconButton>
                        </div>
                    </div>
                </nav>
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <h1 className='me-3 costume-header-emp mb-3'>
                                {hebrewMonthes[month.month()+1]}, {month.year()}
                            </h1>
                        </div>
                        <div className="col">
                            <div className="container-fluid colors-div">
                            <div className="row g-0">
                            <div className="col d-flex flex-column align-items-center">
                                <div className="row mb-2"></div>
                                    <div className="row" style={{backgroundColor: "#F9E897"}}><span>בוקר</span></div>
                                </div>
                                <div className="col d-flex flex-column align-items-center">
                                    <div className="row mb-2"></div>
                                    <div className="row" style={{backgroundColor: "lightblue"}}><span>ערב</span></div>
                                </div>
                                <div className="col d-flex flex-column align-items-center">
                                    <div className="row mb-2"></div>
                                    <div className="row" style={{backgroundColor: "#ACE1AF"}}><span>לילה</span></div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>


                    <div className="emp-calendar-grid">
                    {["א", "ב", "ג", "ד", "ה", "ו", "ש"].map((day) => (
                        <div className="emp-calendar-header" key={day}>
                            {day}
                        </div>
                    ))}
                    {daysArray.map((day, index) => (
                        <div key={index} className={`emp-calendar-day ${day ? "active" : "empty"} ${isPast(day) ? "past-day" : ""}`}>
                            {day && (
                                <div 
                                    onClick={() => handelDayClick(day)}
                                >
                                    <div className="emp-day-div">
                                        <div className="emp-day-number">
                                            {day}
                                        </div>


                                        {modifiedDays[day] && modifiedDays[day].comment && modifiedDays[day].comment !== "" && (
                                            <div className="emp-day-comment">
                                                {modifiedDays[day].comment}
                                            </div>
                                        )}
                                    </div>
                                    <div className="emp-admin-comments">
                                        {adminComments && adminComments[day]}
                                    </div>
                                    
                                    <div className="emp-day-shift">
                                    {schedule && schedule[day] && (
                                        <div
                                            style={{
                                                backgroundColor:
                                                    schedule[day] === 'morning' ? '#F9E897' :
                                                    schedule[day] === 'evening' ? 'lightblue' :
                                                    schedule[day] === 'night' ? '#ACE1AF' : 'transparent',

                                                padding: '5px 10px ',
                                                borderRadius: '5px',
                                                marginTop: '7px',
                                                fontSize:'1.8vw'
                                            }}
                                        >
                                            {schedule[day] === 'morning' && 'בוקר'}
                                            {schedule[day] === 'evening' && 'ערב'}
                                            {schedule[day] === 'night' && 'לילה'}
                                        </div>
                                    )}
                                    
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
                <div style={{height: '30vh'}}></div>

                {isModalVisible && (
                    <>
                        {console.log(allSchedule)}
                        
                        <ScheduleModal
                            setIsModalVisible={setIsModalVisible}
                            allSchedule={allSchedule}
                            day={selectedDay}
                            month={month.month()+1}
                            year={month.year()}
                            employees={employees}
                        />
                    </>
                )}
                </>
                
            )}
        </div>
    );
}

export default ExistSchedule;
