import React, { useState } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { setDoc, doc } from "firebase/firestore";
import { employeesCollection } from "../../../../Utils/firebaseconfig";
import NewEmployeeForm from "./NewEmployeeForm";
import EmployeeList from "./EmployeeList";
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from "react-router-dom";

function Navbar({ adminName, setLoading, employees, fetchEmployees, handelLogout, date }) {
    const [employee, setEmployee] = useState({ name: '', id: '' });
    const [inputValidityName, setInputValidityName] = useState(null);
    const [inputValidityId, setInputValidityId] = useState(null);
    const [shake, setShake] = useState(false);
    const [constraints, setConstraints] = useState({
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const navigate = useNavigate();
    

    const daysOfWeek = [
        { label: "ראשון", value: 0 },
        { label: "שני", value: 1 },
        { label: "שלישי", value: 2 },
        { label: "רביעי", value: 3 },
        { label: "חמישי", value: 4 },
        { label: "שישי", value: 5 },
        { label: "שבת", value: 6 },
    ];

    const availabilityOptions = [
        { label: "בוקר", value: "morning" },
        { label: "ערב", value: "evening" },
        { label: "לילה", value: "night" },
    ];

    // New function to handle color changes
    const handleColorChange = (event) => {
        setEmployee((prev) => ({
            ...prev,
            color: event.target.value // Update the color in state
        }));
    };

    function handleInputChange(event) {
        const { name, value } = event.target;

        if (name === "name") {
            value === "" ? setInputValidityName(false) : setInputValidityName(true);
        } else if (name === "id") {
            value === "" ? setInputValidityId(false) : setInputValidityId(true);
        }

        setEmployee((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const availabilityTranslations = {
        morning: "בוקר",
        evening: "ערב",
        night: "לילה"
    };
    
    const formatConstraints = (constraints) => {
        return Object.keys(constraints).map(day => {
            const dayLabel = daysOfWeek[day].label;
            const availableOptions = constraints[day];
    
            // Translate available options to Hebrew
            const translatedOptions = availableOptions.map(option => availabilityTranslations[option]);
    
            if (translatedOptions.length > 0) {
                return `${dayLabel} - ${translatedOptions.join(", ")}`;
            }
            return null;
        }).filter(item => item !== null);
    };

    function handleConstraintChange(day, optionValue) {
        setConstraints(prev => {
            const isChecked = prev[day].includes(optionValue);
            return {
                ...prev,
                [day]: isChecked 
                    ? prev[day].filter(value => value !== optionValue) 
                    : [...prev[day], optionValue]                     
            };
        });
    }

    async function submitNewEmployee(event) {
        event.preventDefault();

        let hasError = false;

        if (!employee.name) {
            setInputValidityName(false);
            hasError = true;
        }
        if (!employee.id) {
            setInputValidityId(false);
            hasError = true;
        }

        if (hasError) {
            setShake(true);
            setTimeout(() => setShake(false), 500); 
            return;
        }
        
        setLoading(true);
        try {
            const employeeData = {
                name: employee.name,
                constraints: constraints,
                color: employee.color ? employee.color : "#000000"
            };
        
            await setDoc(doc(employeesCollection, employee.id), employeeData);
            setIsFormVisible(false);
            fetchEmployees();
        } catch (err) {
            alert("שגיאה בשמירת המשתמש");
        } finally {
            setLoading(false);
        }
    }

    const toggleFormVisibility = () => {
        setIsFormVisible(prevState => !prevState);
    };

    const handleEmployeeClick = (emp) => {
        if(emp === selectedEmployee){
            setSelectedEmployee(null);
        }
        else {
            setSelectedEmployee(emp);
        }
    };

    function handleShiftsView() {
        navigate('/view', {
            state: { 
                employees: employees,
                date: date
            },
        });
    }

    return (
        <div>
            <nav className="navbar bg-body-tertiary">
                <div className="container-fluid">
                    {adminName && 
                    <div className="row d-flex align-items-center">
                        <div className="col-2">
                            <IconButton onClick={handelLogout} aria-label="delete">
                                <LogoutIcon color="success"/>
                            </IconButton>
                        </div>
                        <div className="col-5">
                            <div className='admin-name'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="user-bi bi-person-circle" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"></path>
                                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"></path>
                                </svg>
                                {adminName}
                            </div>
                        </div>
                        <div className="col-4">
                            {date && 
                                <button onClick={handleShiftsView} className="btn btn-outline-primary">משמרות</button>
                            }
                        </div>
                    </div>
                }
                    
                    <button className="menu-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <i className="bi bi-grid-fill"></i>
                    </button>

                    
                </div>
            </nav>

            <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
                <div className="offcanvas-header">
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>

                <div className="offcanvas-body">
                    <EmployeeList 
                        employees={employees}
                        selectedEmployee={selectedEmployee}
                        handleEmployeeClick={handleEmployeeClick}
                        fetchEmployees={fetchEmployees}
                        formatConstraints={formatConstraints}
                    />
                    <button className="btn btn-outline-secondary mt-4" onClick={toggleFormVisibility}>
                        {isFormVisible ? "ביטול" : "הוסף עובד חדש"}
                    </button>

                    {isFormVisible && (
                        <NewEmployeeForm 
                            submitNewEmployee={submitNewEmployee}
                            handleColorChange={handleColorChange}
                            employee={employee}
                            handleInputChange={handleInputChange}
                            inputValidityName={inputValidityName}
                            inputValidityId={inputValidityId}
                            shake={shake}
                            constraints={constraints}
                            handleConstraintChange={handleConstraintChange}
                        />
                    )}
                </div>
            </div>

        </div>
    );
}

export default Navbar;
