import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../Loading';
import '../../../public/userForm.css';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { auth, usersCollection, employeesCollection } from '../../../Utils/firebaseconfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDocs, updateDoc } from "firebase/firestore";

function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [employeesObj, setEmployeesObj] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [inputValidityEmployee, setInputValidityEmployee] = useState(null);
    const [idInput, setIdInput] = useState("");
    const [inputValidityID, setInputValidityID] = useState(null);
    const [emailInput, setEmailInput] = useState("");
    const [inputValidityEmail, setInputValidityEmail] = useState(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [inputValidityPassword, setInputValidityPassword] = useState(null);
    const [secondPasswordInput, setSecondPasswordInput] = useState("");
    const [inputValiditySecondPassword, setInputValiditySecondPassword] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [shake, setShake] = useState(false);
    const [error, setError] = useState("");


    async function getEmployees() {
        try {
            const snapshot = await getDocs(employeesCollection);
            const employees = snapshot.docs.map(doc => ({
                id: doc.id, 
                ...doc.data()
            }));
            return employees;
        } catch (error) {
            alert("שגיאה לא צפויה, אנא נסה שוב מאוחר יותר");
            return []; // Return an empty array on error
        }
    }

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true); 
            try {
                const employees = await getEmployees();
                setEmployeesObj(employees);
            } catch (error) {
                alert("שגיאה לא צפויה, אנא נסה שוב מאוחר יותר");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees().catch(error => alert("שגיאה לא צפןיה, אנא נסה שוב מאוחר יותר"));
    }, []);


    async function handelSubmit(event) {
        event.preventDefault();
    
        let hasError = false; // Flag to check if there are any errors
    
        // Check validation inputs
        if (selectedEmployee === "") {
            setInputValidityEmployee(false);
            hasError = true;
        }
        if (inputValidityID === null || inputValidityID === false) {
            setInputValidityID(false);
            hasError = true;
        }
        if (inputValidityEmail === null || inputValidityEmail === false) {
            setInputValidityEmail(false);
            hasError = true;
        }
        if (inputValidityPassword === null || inputValidityPassword === false) {
            setInputValidityPassword(false);
            hasError = true;
        }
        if (inputValiditySecondPassword === null || inputValiditySecondPassword === false) {
            setInputValiditySecondPassword(false);
            hasError = true;
        }
    
        // Apply shake effect for all invalid inputs
        if (hasError) {
            setTimeout(() => {
                // Clear shake effect by removing the class after the shake animation
                const inputs = document.querySelectorAll('.user-form-input');
                inputs.forEach(input => {
                    if (input.classList.contains('is-invalid')) {
                        input.classList.add('shake');
                    }
                });
                setTimeout(() => {
                    inputs.forEach(input => {
                        input.classList.remove('shake');
                    });
                }, 500); // Duration of the shake effect
            }, 0);
            return; // Stop the submission process
        }
    
        // Only if all inputs are valid, sign in the user
        setLoading(true); 
        await createUserWithEmailAndPassword(auth, emailInput, passwordInput)
            .then(user => {
                handelStoreNewUser(user);
                navigate('/emp');
            })
            .catch(err => {
                let errorMessage;
                switch (err.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = "הכתובת דוא\"ל הזו כבר בשימוש.";
                        break;
                    default:
                        errorMessage = "שגיאה לא צפויה. אנא נסה שוב מאוחר יותר.";
                        break;
                }
                setError(errorMessage)
            })
        setLoading(false)
            
    }
    

    async function handelStoreNewUser(data) {
        try {
            await setDoc(doc(usersCollection, data.user.uid), {
                email: data.user.email,
                empoyee_id: idInput,
                name: selectedEmployee
            });
            await updateDoc(doc(employeesCollection, idInput), { 
                user_id: data.user.uid
            });

        } catch (err) {
            alert("שגיאה לא צפויה, אנא נסה שוב מאוחר יותר");
        }
    }

    function handleIdChange(event) {
        const input = event.target.value;
        setIdInput(input);

        const foundEmployee = employeesObj.find(employee => 
            employee.id === input && employee.name === selectedEmployee
        );

        if (input === "") {
            setInputValidityID(null);
        } else if (foundEmployee) {
            setInputValidityID(true);
        } else {
            setInputValidityID(false);
        }
    }

    function handleEmployeeChange(event) {
        const employeeName = event.target.value;
        setSelectedEmployee(employeeName);
        setIdInput("");
        setInputValidityID(null);
        setInputValidityEmployee(null);
    }

    function handleEmailChange(event) {
        const input = event.target.value;
        setEmailInput(input.toLowerCase());

        // Simple email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input === "") {
            setInputValidityEmail(null);
        } else if (emailRegex.test(input)) {
            setInputValidityEmail(true);
        } else {
            setInputValidityEmail(false);
        }
    }

    function handlePasswordChange(event) {
        const input = event.target.value;
        setPasswordInput(input);

        // Strong password validation
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
        if (input === "") {
            setInputValidityPassword(null);
        } else if (passwordRegex.test(input)) {
            setInputValidityPassword(true);
        } else {
            setInputValidityPassword(false);
        }
    }

    function handleSecondPasswordChange(event) {
        const input = event.target.value;
        setSecondPasswordInput(input);
        
        // Check if the first password matches the second
        setInputValiditySecondPassword(passwordInput === input);
    }

    const toggleTooltip = () => {
        setShowTooltip(!showTooltip);
    };

    return (
        <div className='py-5 my-5 text-center user-login-container'>
            {loading && <Loading />}
            {!loading && 
                <form onSubmit={handelSubmit} className="p-5 p-md-5 border rounded-3 bg-body-tertiary">
                    <h2 className='mb-4'>סידור עבודה מוקד תפעולי</h2>

                    <select 
                        className={`form-control user-form-input ${inputValidityEmployee === true ? 'is-valid' : inputValidityEmployee === false ? 'is-invalid' : ''} ${shake && inputValidityEmployee === false ? 'shake' : ''}`} 
                        aria-label="Default select example" 
                        value={selectedEmployee} 
                        onChange={handleEmployeeChange}
                    >
                        <option value="">בחר שם</option>
                        {employeesObj.map((employee, index) => (
                            <option key={index} value={employee.name}>{employee.name}</option>
                        ))}
                    </select>
                    {selectedEmployee && 
                        <div className="my-3">
                            <input 
                                type="text" 
                                id="employeeId"
                                onChange={handleIdChange} 
                                className={`form-control user-form-input ${inputValidityID === true ? 'is-valid' : inputValidityID === false ? 'is-invalid' : ''} ${shake && inputValidityID === false ? 'shake' : ''}`} 
                                placeholder="ת.ז" 
                            />
                        </div>
                    }       
                    <hr className="my-4" />
                    <div className="my-3">
                        <input 
                            onChange={handleEmailChange}
                            value={emailInput} 
                            type="text" 
                            className={`form-control user-form-input ${inputValidityEmail === true ? 'is-valid' : inputValidityEmail === false ? 'is-invalid' : ''} ${shake && inputValidityEmail === false ? 'shake' : ''}`}
                            placeholder="אימייל" 
                        />                    
                    </div>
                    <div className="my-3">
                        <div className="input-group">
                            <input 
                                onChange={handlePasswordChange} 
                                value={passwordInput} 
                                type="password" 
                                className={`form-control user-form-input ${inputValidityPassword === true ? 'is-valid' : inputValidityPassword === false ? 'is-invalid' : ''} ${shake && inputValidityPassword === false ? 'shake' : ''}`} // Validate password input
                                placeholder="סיסמא" 
                            />
                            <button type="button" className="help-btn me-3" onClick={toggleTooltip}>
                                <HelpOutlineIcon color="primary"/>
                                {showTooltip && (
                                    <div 
                                    className="tooltip-style  tooltip bs-tooltip-top show">
                                        <div className="tooltip-arrow"></div>
                                        <div className="tooltip-inner">
                                            סיסמא צריכה להיות לפחות 8 תווים, מכילה אותיות, מספרים ותו מיוחד.
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>
                        
                    </div>
                    <div className="my-3">
                        <input 
                            onChange={handleSecondPasswordChange} 
                            value={secondPasswordInput} 
                            type="password" 
                            className={`form-control user-form-input ${inputValiditySecondPassword === true ? 'is-valid' : inputValiditySecondPassword === false ? 'is-invalid' : ''} ${shake && inputValiditySecondPassword === false ? 'shake' : ''}`} // Validate second password input
                            placeholder="אימות סיסמא" 
                        />                    
                    </div>
                    <p className='error-login '>{error}</p>
                    <button className="w-100 btn btn-lg btn-primary" type="submit">הירשם</button>
                    
                    <hr className="my-4" />
                    <div className="mx-5 px-5">
                        <p className="text-body-secondary ms-1 login-p">
                            משתמש רשום ? <a href="/">לחץ כאן כדי להתחבר</a>
                        </p>
                    </div>
                </form>
            }
        </div>
    )
}

export default Register;
