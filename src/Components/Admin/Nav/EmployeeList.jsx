import React, { useState } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Constraints from "./Constraints";
import { auth, employeesCollection, usersCollection } from "../../../../Utils/firebaseconfig";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";

function EmployeeList({ employees, selectedEmployee, handleEmployeeClick, fetchEmployees, formatConstraints }) {
    const [editModeEmployeeId, setEditModeEmployeeId] = useState(null);
    const [editableEmployee, setEditableEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    const handleEditClick = (employee) => {
        setEditModeEmployeeId(employee.id);
        setEditableEmployee({ ...employee });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableEmployee((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleColorChange = (e) => {
        const { value } = e.target;
        setEditableEmployee((prev) => ({
            ...prev,
            color: value, // Update color in editableEmployee
        }));
    };

    const handleConstraintChange = (day, option) => {
        setEditableEmployee((prev) => {
            const updatedConstraints = { ...prev.constraints };
            if (updatedConstraints[day].includes(option)) {
                updatedConstraints[day] = updatedConstraints[day].filter(time => time !== option);
            } else {
                updatedConstraints[day] = [...updatedConstraints[day], option];
            }
            return { ...prev, constraints: updatedConstraints };
        });
    };

    const handleSave = async () => {
        if (!editModeEmployeeId || !editableEmployee) {
            return;
        }
        try {
            const docRef = doc(employeesCollection, editModeEmployeeId);
            await updateDoc(docRef, {
                constraints: editableEmployee.constraints,
                name: editableEmployee.name,
                color: editableEmployee.color ? editableEmployee.color : "#000000"
            });
            const docRef2 = doc(usersCollection, editableEmployee.user_id);
            await updateDoc(docRef2, {
                name: editableEmployee.name,
            });
            fetchEmployees();
        } catch (err) {
            alert("שגיאה בעדכון העובד")
        } finally {
            setEditModeEmployeeId(null);
        }
    };

    const handleDeleteButtonClick = (employee) => {
        setEmployeeToDelete(employee);
        setShowModal(true); // Show the modal
    };

    const handleDeleteUser = async () => {
        if (!employeeToDelete) return;

        try {
            const employeeDocRef = doc(employeesCollection, employeeToDelete.id);
            const employeeDocSnap = await getDoc(employeeDocRef);
            if (employeeDocSnap.exists()) {
                await deleteDoc(employeeDocRef);
            }
            if(employeeToDelete.user_id) {
                const userDocRef = doc(usersCollection, employeeToDelete.user_id);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    await deleteDoc(userDocRef);
                }
            }
            fetchEmployees();

        } catch (err) {
            alert("שגיאה במחיקת העובד");
        } finally {
            setShowModal(false); // Close the modal
            setEmployeeToDelete(null); // Reset the employee to delete
        }
    };

    const handleCancel = () => {
        setEditModeEmployeeId(null);
    };

    return (
        <div>
            <h3>העובדים שלי</h3>
            <ul className="list-group list-group-flush p-0 mt-2">
                {employees.map((emp) => (
                    <li
                        key={emp.id}
                        className={`emp-li list-group-item ${selectedEmployee && selectedEmployee.id === emp.id ? 'selected-employee' : ''}`}
                        onClick={() => handleEmployeeClick(emp)}
                        style={{ cursor: "pointer" }} 
                    >
                        {editModeEmployeeId === emp.id ? (
                            <div>
                                <button className="btn btn-outline-secondary my-3" onClick={handleCancel}>
                                    בטל עריכה
                                </button>
                                <input
                                    type="text"
                                    name="name"
                                    value={editableEmployee.name}
                                    onChange={handleInputChange}
                                    className="form-control mb-2"
                                />
                                <label htmlFor="colorPicker">בחר צבע:</label>
                                <input
                                    type="color"
                                    id="colorPicker"
                                    name="color"
                                    value={editableEmployee.color} // Set the current color value
                                    onChange={handleColorChange} // Handle color change
                                    className="form-control mb-2"
                                />
                                <Constraints 
                                    constraints={editableEmployee.constraints || {}} 
                                    handleConstraintChange={handleConstraintChange} 
                                />
                                <button className="btn btn-outline-primary m-2" onClick={handleSave}>
                                    שמור
                                </button>
                                <button type="button" className="btn btn-outline-danger m-2" onClick={() => handleDeleteButtonClick(emp)}>
                                    מחק משתמש   
                                </button>
                            </div>
                        ) : (
                            <div>
                                <strong className="emp-name" style={{ color: emp.color }}>{emp.name}</strong>
                                {selectedEmployee && selectedEmployee.id === emp.id && (
                                    <div className="mt-2">
                                        <button
                                            className="edit-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(emp);
                                            }}
                                        >
                                            <i className="edit-icon bi-pencil-square"></i>
                                        </button>
                                        <p>ת.ז: {emp.id}</p>
                                        {emp.email ? (
                                            <p>אימייל: {emp.email}</p>
                                        ) : (
                                            <p style={{ color: "red" }}>המשתמש אינו רשום</p>
                                        )}
                                        {emp.constraints &&
                                            <div>
                                                <p>לא יכול/ה לעבוד ב:</p>
                                                <ul>
                                                    {formatConstraints(emp.constraints).map((constraint, index) => (
                                                        <li key={index}>{constraint}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {/* Modal for delete confirmation */}
            {showModal && (
                <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>האם אתה בטוח שאתה רוצה למחוק את המשתמש ?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ביטול</button>
                                <button type="button" className="btn btn-danger" onClick={handleDeleteUser}>מחק</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeList;
