import React, {useState, useEffect} from 'react';
import dayjs from 'dayjs';
import '../../../public/newEmp.css'
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { styled } from '@mui/system';
import Loading from '../Loading';
import { auth, employeesCollection, savedScheduleCollection, scheduleCollection, usersCollection } from '../../../Utils/firebaseconfig';
import { getDoc, getDocs, doc, setDoc, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const HideNavigationButtons = styled('div')`
.MuiPickersCalendarHeader-root .MuiButtonBase-root {
    display: none;
}

.MuiPickersCalendarHeader-label {
    display: none;
}

.MuiButtonBase-root {
font-size: 1.2rem;
font-family: "Fredoka";
}
`;

const hebrewWeekdays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

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

function BasicDateCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availability, setAvailability] = useState({});
  const [noChecked, setNoChecked] = useState(false);
  const [shifts, setShifts] = useState({
    morning: false,
    evening: false,
    night: false,
  });
  const [constraintsCounter, setConstraintsCounter] = useState(0);
  const [missingsCounter, setMissingsCounter] = useState(0);
  const [month, setMonth] = useState(dayjs('2024-11-01'));
  const [maxConstraints, setMaxConstraints] = useState(10);
  const [maxMissings, setMaxMissings] = useState(10);
  const [shake, setShake] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalButton, setModalButton] = useState("");
  const [modalButtonClose, setModalButtonClose] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [submittedDays, setSubmittedDays] = useState([]);
  const [constraints, setConstraints] = useState({});
  const [constantConstraint, setConstantConstraint] = useState(false);
  const [comments, setComments] = useState("");
  const [modifiedDays, setModifiedDays] = useState({});
  const [daysOff, setDaysOff] = useState([]);

  const navigate = useNavigate(); 

  useEffect(() => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      setLoggedUser(currentUser);
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedUser(user);
        checkIfAlreadySubmited(user.uid);
        fetchDate();
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, []);

  async function checkIfAlreadySubmited(userId) {
    try {
      const q = query(savedScheduleCollection);
      const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          navigate('/existSchedule');
          return;
        }

      const docRef = doc(usersCollection, userId);
      const docSnap = await getDoc(docRef); 
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const shifts =  userData.shifts || [];


        if(shifts.length !== 0){
          navigate('/noSchedule');
        } else {
          const empId = userData.empoyee_id;
          setUserName(userData.name)
          const docRefEmp = doc(employeesCollection, empId);
          const docSnapEmp = await getDoc(docRefEmp);
          const fetchConstraints = docSnapEmp.data().constraints;

          let startOfMonth;
          let endOfMonth;

          const querySnapshot = await getDocs(scheduleCollection);
          if(querySnapshot.empty){
            navigate('/noSchedule');
          } else {
            const scheduleDoc = querySnapshot.docs[0].data();
            let temp = dayjs(`${scheduleDoc.year}-${scheduleDoc.month}-01`);
            startOfMonth = temp;
            endOfMonth = temp.endOf('month');
          }

          for(let i=0 ; i<7 ; i++) {
            if(fetchConstraints[i].length !== 0){
              let tempDay = [0,0,0];
              if(!fetchConstraints[i].includes("morning")){
                tempDay[0] = 1;
              } 
              if(!fetchConstraints[i].includes("evening")){
                tempDay[1] = 1;
              }
              if(!fetchConstraints[i].includes("night")){
                tempDay[2] = 1;
              }


              for (let day = startOfMonth; day.isBefore(endOfMonth+1, 'day'); day = day.add(1, 'day')) {
                if (day.day() === i) { 
                  setConstraints( prev => ({
                    ...prev, 
                    [day.format('DD')]: tempDay
                  }))
                }
              }
            }
          }
        }
      } 
    } catch (err) {
      alert("שגיאה לא צפויה, אנא נסה שוב מאוחר יותר");
    }
  }

  async function fetchDate() {
    try {
      const querySnapshot = await getDocs(scheduleCollection);
      if(querySnapshot.empty){
        navigate('/noSchedule');
      } else {
        const scheduleDoc = querySnapshot.docs[0].data();
        setMonth(dayjs(`${scheduleDoc.year}-${scheduleDoc.month}-01`));
        setMaxConstraints(scheduleDoc.constraints);
        setModifiedDays(scheduleDoc.modifyEmpsNum);
        setMaxMissings(scheduleDoc.missings);

        let notWorkingDays = [];
        for(let day in scheduleDoc.modifyEmpsNum){
          for(let emp in scheduleDoc.modifyEmpsNum[day].notWorking){
            const curEmp = scheduleDoc.modifyEmpsNum[day].notWorking[emp];
            if(curEmp === auth.currentUser.uid){
              notWorkingDays.push(parseInt(day, 10));
            }
          }
        }

        setDaysOff(notWorkingDays);

        const daysInMonth = dayjs(new Date(scheduleDoc.year, scheduleDoc.month, 0)).date();
        const initialAvailability = Array.from({ length: daysInMonth }, () => [0, 0, 0]);
        setAvailability(initialAvailability);

      }
    } catch (error) {
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

  function submit() {
    const lastDayOfMonth = month.endOf('month').date();
    if (submittedDays.length !== lastDayOfMonth) {
      setModalTitle("שגיאה בשליחת הסידור");
      setModalContent("מלא את כל הימים");
      setModalButton("הבנתי");
      setModalButtonClose(false);
      setModalVisible(true);
    } else {
      setModalTitle("האם אתה בטוח שברצונך לשלוח את הסידור ?");
      setModalContent("לאחר השליחה אין אפשרות לערוך את המשמרות.");
      setModalButton("המשך עריכה");
      setModalButtonClose(true);
      setModalVisible(true);
    }
  }

  function confirmSubmit() {
    setModalVisible(false);
  
    const userId = loggedUser.uid;
    const userRef = doc(usersCollection, userId);

    const availabilityObject = {};

    availability.forEach((shifts, index) => {
        const dayKey = `day${index + 1}`;
        availabilityObject[dayKey] = shifts;
    });
  
    setDoc(userRef, { shifts: availabilityObject, comments: comments }, { merge: true })
      .then(() => {
        handelLogout();
      })
      .catch((error) => {
        alert("שגיאה לא צפויה, המשמרות לא נשמרו. אנא נסה שוב מאוחר יותר");
      });
  }

const handleDateChange = (date) => {
  setSelectedDate(date); 
  const curDay = parseInt(date.format('DD'), 10) - 1;
  setConstantConstraint(false);
  if (availability[curDay][0] === 0 && availability[curDay][1] === 0 && availability[curDay][2] === 0) {
      setShifts({ morning: false, evening: false, night: false });
      setNoChecked(true);
  } else {
      setNoChecked(false);
      setShifts({ morning: false, evening: false, night: false });

      if (availability[curDay][0] === 1) {
          setShifts(prev => ({ ...prev, morning: true }));
      }
      if (availability[curDay][1] === 1) {
          setShifts(prev => ({ ...prev, evening: true }));
      }
      if (availability[curDay][2] === 1) {
          setShifts(prev => ({ ...prev, night: true }));
      }
  }

  const offcanvas = new window.bootstrap.Offcanvas(document.getElementById('offcanvasBottom'));
  offcanvas.show();
};

const saveInAvailability = (event) => {
    event.preventDefault();
    if(!noChecked  && !shifts.morning && !shifts.evening && !shifts.night){
        setShake(true);
        setTimeout(() => {
            setShake(false);
        }, 500);
        return;
    }
    let isNew = true;
    const curDay = parseInt(selectedDate.format('DD'), 10) - 1;
    if(submittedDays.includes(curDay+1)){
        isNew = false;
    }
    else {
        submittedDays.push(curDay+1);
    }
    if(constantConstraint){
      if (constraintsCounter > 0 && !isNew && (!shifts.morning || !shifts.evening || !shifts.night) && noChecked){
        setConstraintsCounter(prev => prev-1);
      }
    }
    if(missingsCounter > 0 && !isNew && !shifts.morning && !shifts.evening && !shifts.night && !daysOff.includes(curDay+1)){
      setMissingsCounter(prev => prev-1);
    }
    if(missingsCounter > 0 && !isNew && !(!shifts.morning && !shifts.evening && !shifts.night) && !daysOff.includes(curDay+1)){
      setMissingsCounter(prev => prev-1);
    }
    if(noChecked && !daysOff.includes(curDay+1)) {
        if(missingsCounter >= maxMissings){
          setModalTitle("הגעת למגבלת ההיעדרויות");
          setModalContent(`לא ניתן לקבוע יותר מ-${maxMissings} חופשים בחודש.`);
          setModalButton("הבנתי");
          setModalVisible(true);
          return;
        }
        setMissingsCounter(prev => prev+1);
    }

    if(!noChecked  && (!shifts.morning || !shifts.evening || !shifts.night) && isNew && !constantConstraint){
        if(constraintsCounter >= maxConstraints){
            setModalTitle("הגעת למגבלת האילוצים");
            setModalContent(`לא ניתן לקבוע יותר מ-${maxConstraints} אילוצים בחודש.`);
            setModalButton("הבנתי");
            setModalVisible(true);
            return;
        }
        setConstraintsCounter(prev => prev+1);
    }
    if(constraintsCounter > 0 && (noChecked || (!shifts.morning && !shifts.evening && !shifts.night)) && !isNew
        && (availability[curDay][0] === 1 || availability[curDay][1] === 1 || availability[curDay][2] === 1)
    ){
        setConstraintsCounter(prev => prev-1);
    }
    if(constraintsCounter > 0 && shifts.morning && shifts.evening && shifts.night && !isNew
        && (availability[curDay][0] === 1 || availability[curDay][1] === 1 || availability[curDay][2] === 1)
        && noChecked
    ){
        setConstraintsCounter(prev => prev-1);
    }
    if(
        !isNew && ((availability[curDay][0] === 0 && availability[curDay][1] === 0 && availability[curDay][2] === 0)
        || (availability[curDay][0] === 1 && availability[curDay][1] === 1 && availability[curDay][2] === 1))
        && !noChecked  && (!shifts.morning || !shifts.evening || !shifts.night) && !constantConstraint
    ) {
        if(constraintsCounter >= maxConstraints){
            setModalTitle("הגעת למגבלת האילוצים");
            setModalContent(`לא ניתן לקבוע יותר מ-${maxConstraints} אילוצים בחודש.`);
            setModalButton("הבנתי");
            setModalVisible(true);
            return;
        }
        setConstraintsCounter(prev => prev+1);
    }

    let updateShifts = [0,0,0];
    Object.keys(shifts).forEach((shift, index) => {
        if (shifts[shift]) {
            updateShifts[index] = 1;
        }
    });
    
    setAvailability((prevAvailability) => {
        const updatedAvailability = [ ...prevAvailability ];
        updatedAvailability[curDay] = updateShifts;
        return updatedAvailability;
    });

    let color= 'transperent';
    if(updateShifts[0]===0 && updateShifts[1]===0 && updateShifts[2]===0){
        color = 'red';
    } else if(updateShifts[0]===1 && updateShifts[1]===1 && updateShifts[2]===1){
        color = 'green';
    } else {
        color = 'orange';
    }

    const selectedButton = document.querySelector('[aria-selected="true"]');
    if (selectedButton) {
      selectedButton.style.backgroundColor = color; 
      selectedButton.style.color = "white"; 
    }

    document.getElementById('offcanvasBottom').classList.remove('show');
    document.body.removeAttribute('style');
    const backdrop = document.querySelector('.offcanvas-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
}

const handleAvailabilityChoice = (event) => {
    const btnId = event.target.id;
    setConstantConstraint(false);
    if(btnId === 'no') {
        const newNoChecked = !noChecked;
        setNoChecked(newNoChecked);
        if (newNoChecked) {
          setShifts({ morning: false, evening: false, night: false });
        }
    } else if(btnId === 'allDay'){
      setNoChecked(false);
      setShifts(() => ({
        morning: true,
        evening: true,
        night: true
      }));
    } else {
        setNoChecked(false);
        setShifts((prevShifts) => ({
          ...prevShifts,
          [btnId]: !prevShifts[btnId],
        }));
    }
  }

    function handleConstraintsClick() {
      const curConstraint = constraints[selectedDate.format('DD')];
      setConstantConstraint(true);
      setShifts({
        morning: false,
        evening: false,
        night: false
      })
      setNoChecked(false);

      if(curConstraint[0] === 0 && curConstraint[1] === 0 && curConstraint[2] === 0){
        setNoChecked(true);
      }

      if (curConstraint[0] === 1) {
        setShifts(prev => ({
          ...prev,
          morning: true
        }))
      }
      if (curConstraint[1] === 1) {
        setShifts(prev => ({
          ...prev,
          evening: true
        }))
      }
      if (curConstraint[2] === 1) {
        setShifts(prev => ({
          ...prev,
          night: true
        }))
      }

    }

  return (
    <div className='emp-main'>
        {loading ? (
        <div className='py-5 my-5 text-center'>
            <Loading />
        </div>
        ): (
            <div>
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
                        {constraintsCounter == maxConstraints ?<p className='constraint-p'>לא נותרו אילוצים </p>: <p className='constraint-p'>אילוצים : {maxConstraints} / {constraintsCounter}</p>}
                        {missingsCounter == maxMissings ?<p className='constraint-p me-4'>לא נותרו חופשים </p>: <p className='constraint-p me-4'>חופשים : {maxMissings} / {missingsCounter}</p>}
                        </div>
                        <div>
                        <button onClick={submit} className="btn btn-outline-success">הגש סידור</button>
                        <IconButton onClick={handelLogout} aria-label="delete">
                            <LogoutIcon color="success"/>
                        </IconButton>
                        </div>
                    </div>
                </nav>

            <h1 className='me-3 costume-header-emp'>
                {hebrewMonthes[month.month()+1]}, {month.year()}
            </h1>{' '}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <HideNavigationButtons>
                        <DateCalendar
                            value={selectedDate}
                            minDate={month.startOf('month')}
                            maxDate={month.endOf('month')}
                            onChange={handleDateChange}
                            dayOfWeekFormatter={(date) => hebrewWeekdays[date.day()]}
                            sx={{
                                '& .MuiTypography-root': {
                                    fontSize: '1.7rem',
                                    fontFamily: "Fredoka",
                                    fontWeight: "500"
                                },
                            }}
                        />
                    </HideNavigationButtons>
                </LocalizationProvider>

                <div className="container-fluid colors-div">
                    <div className="row">
                    <div className="col d-flex flex-column align-items-center">
                        <div className="row red mb-2"></div>
                            <div className="row"><span>לא יכול לעבוד</span></div>
                        </div>
                        <div className="col d-flex flex-column align-items-center">
                            <div className="row green mb-2"></div>
                            <div className="row"><span>יכול לעבוד</span></div>
                        </div>
                        <div className="col d-flex flex-column align-items-center">
                            <div className="row orange mb-2"></div>
                            <div className="row"><span>אילוצים</span></div>
                        </div>
                    </div>
                </div>

                <div className="container">
                  <div className="form-floating m-5">
                    <textarea value={comments}  onChange={(e) => setComments(e.target.value)} className="form-control" placeholder="Leave a comment here" id="floatingTextarea2" style={{height: '100px'}}></textarea>
                    <label htmlFor="floatingTextarea2">הערות</label>
                  </div>
                </div>

            {/* Offcanvas Component */}
            <div
                className="offcanvas offcanvas-bottom customOffcanvasStyle"
                tabIndex="-1"
                id="offcanvasBottom"
                aria-labelledby="offcanvasBottomLabel"
            >
                <div className="offcanvas-header">
                <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
                {selectedDate && (
                    <h5 className="offcanvas-title" id="offcanvasBottomLabel">
                        {`${selectedDate.format('DD/MM/YYYY')}`}
                    </h5>
                )}
                </div>
                <div className="offcanvas-body small">

                    {selectedDate && modifiedDays[parseInt(selectedDate.format('DD'), 10)] && modifiedDays[parseInt(selectedDate.format('DD'), 10)].comment && modifiedDays[parseInt(selectedDate.format('DD'), 10)].comment !== "" && (
                        <div className="day-comment mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-exclamation-diamond-fill mx-3" viewBox="0 0 16 16">
                            <path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                          </svg>
                            {modifiedDays[parseInt(selectedDate.format('DD'), 10)].comment}
                        </div>
                        )}

                    {selectedDate && daysOff.length > 0 && daysOff.includes(parseInt(selectedDate.format('DD'), 10)) && (
                      <div className='mb-3'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="green" className="bi bi-check-circle-fill ms-3" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                        יום חופש מאושר
                      </div>
                    )}
                    <form onSubmit={saveInAvailability}>

                    {selectedDate && constraints.hasOwnProperty(selectedDate.format('DD')) && (
                        <button 
                          type="button" 
                          className="btn btn-outline-primary mb-3" 
                          onClick={handleConstraintsClick}
                        >
                            אילוץ קבוע
                        </button>
                    )}
                      
                        <p className='me-2'>סמן את המשמרות בהן אתה יכול לעבוד :</p>

                        <input checked={shifts.morning} type="checkbox" onChange={handleAvailabilityChoice} className="btn-check" id="morning" autoComplete="off" />
                        <label className={`btn mx-2 ${shake ? 'shake' : ''}`} htmlFor="morning">בוקר</label>

                        <input checked={shifts.evening} type="checkbox" onChange={handleAvailabilityChoice} className="btn-check" id="evening" autoComplete="off" />
                        <label className={`btn mx-2 ${shake ? 'shake' : ''}`} htmlFor="evening">ערב</label>

                        <input checked={shifts.night} type="checkbox" onChange={handleAvailabilityChoice} className="btn-check" id="night" autoComplete="off" />
                        <label className={`btn mx-2 ${shake ? 'shake' : ''}`} htmlFor="night">לילה</label>
                        <hr />
                        <input checked={noChecked} type="checkbox" onChange={handleAvailabilityChoice} className="btn-check" id="no" autoComplete="off" />
                        <label className={`btn mb-4 ${shake ? 'shake' : ''} ${noChecked ? 'no-checked' : ''}`} htmlFor="no">לא יכול לעבוד</label>

                        <input checked={shifts.morning && shifts.evening && shifts.night} type="checkbox" onChange={handleAvailabilityChoice} className="btn-check" id="allDay" autoComplete="off" />
                        <label className={`btn mb-4 me-4 yes-checked ${shake ? 'shake' : ''} ${shifts.morning && shifts.evening && shifts.night ? 'all-day-checked' : ''}`} htmlFor="allDay">יכול לעבוד כל היום</label>

                        <button type="submit" className="btn mt-4 btn-primary d-block">שמור</button>
                    </form>
                </div>
            </div>
        </div>
        )
        }
        {isModalVisible && (
        <Modal
          title={modalTitle}
          bodyContent={modalContent}
          button={modalButton}
          isVisible={isModalVisible}
          close={modalButtonClose}
          onConfirm={confirmSubmit}
          onClose={() => {
            setModalVisible(false);
          }}
        />
      )}
    </div>
  );
}

export default BasicDateCalendar;