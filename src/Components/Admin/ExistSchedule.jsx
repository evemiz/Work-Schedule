import React from "react";


function ExistSchedule({month, year, employees}) {
    return (
        <div className="container">
            <div className="my-5 text-center">
                <h1>סידור {month}/{year}</h1>
            </div>

        {employees.every(emp => emp.shifts) ? (
            <></>
        ) : (
            <div className="mx-auto emps-no-schedule">
                <h4>עובדים שלא הגישו סידור עדיין :</h4>
                <ul className=" mt-3 text-center">
                    {employees.map(emp => (
                        !emp.shifts ? <li className="emps-no-schedule-li" key={emp.id}>{emp.name}</li> : null
                    ))}
                </ul>
            </div>
        )}
        </div>
    );
}

export default ExistSchedule;
