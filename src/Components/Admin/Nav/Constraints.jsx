import React from "react";

function Constraints({constraints, handleConstraintChange}){

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

    return(
        <div>
            {daysOfWeek.map(day => (
            <div key={day.value} className="day-constraints">
                <label className="day-label">{day.label}</label>
                <div className="availability-options">
                    {availabilityOptions.map(option => (
                        <div key={option.value} className="form-check form-check-inline">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`${day.value}-${option.value}`}
                                checked={constraints[day.value]?.includes(option.value) || false}
                                onChange={() => handleConstraintChange(day.value, option.value)}
                            />
                            <label className="form-check-label" htmlFor={`${day.value}-${option.value}`}>
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        ))}
        </div>
    )
}

export default Constraints;