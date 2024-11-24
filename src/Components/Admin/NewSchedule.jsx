import React, { useState, useEffect } from "react";
import Select from 'react-select';
import '../../../public/admin.css';
import { styled } from '@mui/system';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';


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

function NewSchedule({ handleCreateSchedule, employees }) {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [shake, setShake] = useState(false);
    const [constraints, setConstraints] = useState("");
    const [missings, setMissings] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [morningEmployees, setMorningEmployees] = useState(3);
    const [eveningEmployees, setEveningEmployees] = useState(2);
    const [nightEmployees, setNightEmployees] = useState(1);
    const [comment, setComment] = useState("");
    const [selectedEmps, setSelectedEmps] = useState([]);
    const [modified, setModified] = useState({});

    const hebrewMonths = [
        { value: 1, label: "ינואר" },
        { value: 2, label: "פברואר" },
        { value: 3, label: "מרץ" },
        { value: 4, label: "אפריל" },
        { value: 5, label: "מאי" },
        { value: 6, label: "יוני" },
        { value: 7, label: "יולי" },
        { value: 8, label: "אוגוסט" },
        { value: 9, label: "ספטמבר" },
        { value: 10, label: "אוקטובר" },
        { value: 11, label: "נובמבר" },
        { value: 12, label: "דצמבר" }
    ];

    const hebrewWeekdays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

    const handleSubmit = (event) => {
        event.preventDefault();
    
        // Check if constraints contains only digits, if not, reset it
        if (!/^\d+$/.test(constraints)) {
            setConstraints(""); // Reset constraints if it's not a number
        }

        if (!/^\d+$/.test(missings)) {
            setMissings(""); // Reset constraints if it's not a number
        }
    
        if (!selectedMonth || !selectedYear || constraints === "" || !/^\d+$/.test(constraints) || !/^\d+$/.test(missings)) {
            setShake(true);
            return;
        }
    
        handleCreateSchedule(selectedMonth, selectedYear, constraints, modified, missings);
    };

    // Remove shake effect after a short delay
    useEffect(() => {
        if (shake) {
            const timer = setTimeout(() => setShake(false), 500);
            return () => clearTimeout(timer);
        }
    }, [shake]);

    const handleDateChange = (date) => {
        setSelectedDate(date); 
        const day = (date.date());

        console.log(modified);

        if(modified.hasOwnProperty(day)){
            setComment(modified[day].comment);
            setSelectedEmps(modified[day].notWorking);
        }

        else{
            setComment("");
            setSelectedEmps([]);
        }
      
        const offcanvas = new window.bootstrap.Offcanvas(document.getElementById('offcanvasBottom'));
        offcanvas.show();
      };

    function handleDayModify(e) {
        e.preventDefault();
        const day = {
            morning: morningEmployees,
            evening: eveningEmployees,
            night: nightEmployees,
            comment: comment,
            notWorking: selectedEmps
        }
        const dayKey = parseInt(selectedDate.format('DD'), 10);

        // Update the modified state
        setModified((prev) => ({
            ...prev,
            [dayKey]: day,
        }));

        const selectedButton = document.querySelector('[aria-selected="true"]');
        if (selectedButton) {
        selectedButton.style.backgroundColor = '#C9E6F0'; 
        selectedButton.style.color = "black"; 
        }

        document.getElementById('offcanvasBottom').classList.remove('show');
        document.body.removeAttribute('style');
        const backdrop = document.querySelector('.offcanvas-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }

    const handleEmployeeClick = (emp) => {
        setSelectedEmps((prevSelectedEmps) => {
            if (prevSelectedEmps.includes(emp.user_id)) {
                return prevSelectedEmps.filter((user_id) => user_id !== emp.user_id);
            } else {
                return [...prevSelectedEmps, emp.user_id];
            }
        });
        console.log(selectedEmps);
    };

    return (
        <div>
            <div className="container mt-5">
                <h1 className="text-center mb-5">יצירת סידור חדש</h1>
                
                <form onSubmit={handleSubmit} className='admin-date-form mx-auto'>
                    <div className="my-3">
                        <Select 
                            className={`admin-date-select ${!selectedMonth && shake ? 'is-invalid shake' : ''}`}
                            options={hebrewMonths}
                            placeholder="בחר חודש"
                            onChange={(selectedOption) => setSelectedMonth(selectedOption.value)}
                        />
                    </div>
                    <div className="my-3">
                        <Select 
                            className={`admin-date-select ${!selectedYear && shake ? 'is-invalid shake' : ''}`}
                            options={Array.from({ length: 10 }, (_, index) => {
                                const year = new Date().getFullYear() + index; // Next 10 years
                                return { value: year, label: year };
                            })}
                            placeholder="בחר שנה"
                            onChange={(selectedOption) => setSelectedYear(selectedOption.value)}
                        />
                    </div>
                    <div className="my-4">
                        <input 
                            value={constraints} 
                            onChange={(event) => setConstraints(event.target.value)} 
                            className={`form-control ${constraints === "" && shake ? 'shake' : ''}`}
                            placeholder="מספר אילוצים" 
                            id="floatingTextarea"
                        />
                    </div>
                    <div className="my-4">
                        <input 
                            value={missings} 
                            onChange={(event) => setMissings(event.target.value)} 
                            className={`form-control ${constraints === "" && shake ? 'shake' : ''}`}
                            placeholder="מספר היעדרויות" 
                            id="floatingTextarea"
                        />
                    </div>

                    {selectedMonth && selectedYear && (
                        <div className="mx-auto">
                            <p className="text-center">כדי לשנות את מספר העובדים במשמרת - בחר את התאריך הרצוי :</p>
                            <div className="set-sced-calander-div">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <HideNavigationButtons>
                                    <DateCalendar
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        minDate={dayjs().year(selectedYear).month(selectedMonth - 1).startOf('month')} 
                                        maxDate={dayjs().year(selectedYear).month(selectedMonth - 1).endOf('month')} 
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
                            </div>
                        </div>
                    )}

                <button type="submit" className="btn btn-outline-primary mt-4 d-block mx-auto px-5">צור סידור</button>
                </form>
            </div>

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
                    <div>
                        <h5>{selectedDate.format('DD/MM/YYYY')}</h5>
                    </div>
                )}
                </div>
                    <div className="offcanvas-body mx-5">
                        <form onSubmit={(e) => { handleDayModify(e)}} >

                            <div className="container">
                                <div className="row g-5">
                                    <div className="col-8">
                                        {/* Morning Shift */}
                                        <div className="mb-3">
                                            <label>מספר עובדים לבוקר</label>
                                            <div className="input-group">
                                                <input 
                                                    type="number" 
                                                    className="form-control text-center" 
                                                    value={morningEmployees} 
                                                    onChange={(e) => setMorningEmployees(parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        {/* Evening Shift */}
                                        <div className="mb-3">
                                            <label>מספר עובדים לערב</label>
                                            <div className="input-group">
                                                <input 
                                                    type="number" 
                                                    className="form-control text-center" 
                                                    value={eveningEmployees} 
                                                    onChange={(e) => setEveningEmployees(parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        {/* Night Shift */}
                                        <div className="mb-3">
                                            <label>מספר עובדים ללילה</label>
                                            <div className="input-group">
                                                <input 
                                                    type="number" 
                                                    className="form-control text-center" 
                                                    value={nightEmployees} 
                                                    onChange={(e) => setNightEmployees(parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        {/* Comment Section */}
                                        <div className="mb-3">
                                            <label>הוסף הערה ליום זה</label>
                                            <textarea 
                                                className="form-control" 
                                                placeholder="הערה..." 
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="col pe-5">
                                        <label className="">סמן את העובדים שביום חופש</label>
                                        {employees && employees.length > 0 ? (
                                            <ul className="list-group list-group-flush p-0 mt-2">
                                            {employees.map((emp) => (
                                                <li 
                                                    key={emp.id}
                                                    className={`emp-li list-group-item ${selectedEmps.some((selectedEmp) => selectedEmp === emp.user_id) ? 'selected' : ''}`}
                                                    onClick={() => handleEmployeeClick(emp)}
                                                    style={{cursor: 'pointer'}}
                                                >
                                                {emp.name}
                                                </li>
                                            ))}
                                            </ul>
                                        ) : (
                                            <p>לא נמצאו עובדים</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            

                            {/* Submit Button */}
                            <button type="submit" className="btn btn-primary mt-3">שמור</button>
                        </form>
                    </div>

            </div>

        </div>
    );
}

export default NewSchedule;
