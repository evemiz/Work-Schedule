import React from "react";
import Constraints from "./Constraints";

function NewEmployeeForm(props) {
    const { submitNewEmployee, employee, handleInputChange, inputValidityName, inputValidityId, shake, constraints, handleConstraintChange, handleColorChange } = props;

    return (
        <div>
            <form onSubmit={submitNewEmployee}>
                <div className="my-3">
                    <input 
                        value={employee.name} 
                        type="text" 
                        onChange={handleInputChange} 
                        className={`form-control ${inputValidityName === false ? 'is-invalid' : ''} ${shake && inputValidityName === false ? 'shake' : ''}`}
                        name="name"
                        placeholder="שם מלא" 
                    />
                </div>
                <div className="my-3">
                    <input 
                        value={employee.id}
                        type="text" 
                        onChange={handleInputChange} 
                        className={`form-control ${inputValidityId === false ? 'is-invalid' : ''} ${shake && inputValidityId === false ? 'shake' : ''}`}
                        name="id"
                        placeholder="ת.ז" 
                    />
                </div>
                <div className="my-3">
                    <label htmlFor="colorPicker">בחר צבע:</label>
                    <input 
                        type="color" 
                        id="colorPicker" 
                        name="color" 
                        value={employee.color} 
                        onChange={handleColorChange} 
                        className="form-control"
                    />
                </div>
                <p>לא יכול לעבוד ב:</p>
                <Constraints 
                    constraints={constraints}
                    handleConstraintChange={handleConstraintChange}
                />
                <button className="btn btn-outline-secondary" type="submit">הוסף עובד חדש</button>
            </form>
        </div>
    );
}

export default NewEmployeeForm;
