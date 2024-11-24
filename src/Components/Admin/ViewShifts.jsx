import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminsCollection, auth } from "../../../Utils/firebaseconfig";
import { doc, getDoc } from "firebase/firestore"; 
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import Loading from "../Loading";


const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
};
  
const getStartDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay();
};

function View() {
    const location = useLocation();
    const { employees, date } = location.state || {};
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] =useState(false);
    const [adminName, setAdminName] = useState("");
    const navigate = useNavigate();

    const daysInMonth = getDaysInMonth(date.month, date.year);
    const startDay = getStartDayOfMonth(date.month, date.year);
    const daysArray = new Array(startDay).fill(null).concat(
        Array.from({ length: daysInMonth }, (_, i) => i + 1)
    );

    console.log(employees);

    useEffect(() => {
        setLoading(true);
        const currentUser = auth.currentUser;

        async function verifyAdmin(user) {
            try {
                const adminDocRef = doc(adminsCollection, user.uid);
                const adminDocSnap = await getDoc(adminDocRef);

                if (!adminDocSnap.exists()) {
                    navigate('/');
                }
                else {
                    const adminData = adminDocSnap.data();
                    setAdminName(adminData.name || '');
                }
            } catch (error) {
                alert("שגיאה לא צפויה");
                navigate('/');
            } finally {
                setLoading(false);
            }
        }

        if (currentUser) {
            verifyAdmin(currentUser);
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                verifyAdmin(user);
            } else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, []);


    function handleEmployeeClick(emp) {
        setSelectedEmployee(emp);
        console.log(emp);
    }

    function handelLogout() {
        auth.signOut()
        .then(() => {
        })
        .catch(err => {
        })
      }

      function handleReturn() {
        navigate('/admin');
      }

    return (
        <>
        <nav className="navbar bg-body-tertiary">
                <div className="container-fluid">
                    {adminName && 
                    <div className="row d-flex align-items-center">
                        <div className="col-3">
                            <IconButton onClick={handelLogout} aria-label="delete">
                                <LogoutIcon color="success"/>
                            </IconButton>
                        </div>
                        <div className="col-8">
                            <div className='admin-name'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="user-bi bi-person-circle" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"></path>
                                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"></path>
                                </svg>
                                {adminName}
                            </div>
                        </div>
                    </div>
                }
                <button className="btn" onClick={handleReturn}>
                    חזור לדף הקודם
                </button>
                    
                </div>
            </nav>
            {loading ? 
                <div className='py-5 my-5 text-center'>
                    <Loading />
                </div>
         : (
            <div className="container mt-5">
            <div className="row">
                <div className="col-3">
                    <ul className="list-group list-group-flush ps-5 mt-4">
                        {employees.map((emp) => (
                            <li
                                key={emp.id}
                                className={`emp-li list-group-item ${selectedEmployee && selectedEmployee.id === emp.id ? 'selected-employee' : ''}`}
                                onClick={() => handleEmployeeClick(emp)}
                                style={{ cursor: "pointer" }} 
                            >
                                <div>
                                    {emp.name}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-9">
                    {selectedEmployee && selectedEmployee.shifts &&(
                        <div className="emp-calendar-grid">
                        {["א", "ב", "ג", "ד", "ה", "ו", "ש"].map((day) => (
                            <div className="emp-calendar-header" key={day}>
                                {day}
                            </div>
                        ))}
                        {daysArray.map((day, index) => (
                            <div key={index} className={`emp-calendar-day ${day ? "active" : "empty"} `}>
                                {day && (
                                    <div>
                                        <div className="emp-day-div">
                                            <div className="day-number">
                                                {day}
                                            </div>

                                        </div>
                                        
                                        <div className="emp-day-shift">
                                            {selectedEmployee && selectedEmployee.shifts && 
                                            (<>
                                                {selectedEmployee.shifts["day"+day][0] === 1 && <div style={{backgroundColor: "#F9E897"}} className="shifts-day-title">בוקר</div>}
                                                {selectedEmployee.shifts["day"+day][1] === 1 && <div style={{backgroundColor: "lightblue"}} className="shifts-day-title">צהריים</div>}
                                                {selectedEmployee.shifts["day"+day][2] === 1 && <div style={{backgroundColor: "#ACE1AF"}} className="shifts-day-title">ערב</div>}
                                            </>)
                                            }
                                        
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    )}
                    {selectedEmployee && !selectedEmployee.shifts &&(
                        <h2>העובד לא הגיש סידור עדיין</h2>
                    )}
                </div>
            </div>
        </div>
            )}

        </>
    )
};

export default View;