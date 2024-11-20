import React from "react";

function ScheduleModal({setIsModalVisible, allSchedule, day, month, year, employees}) {
    return(
        <>
            <div className="modal-overlay"></div>
            <div className={`modal fade show`} style={{ display: 'block' }} aria-labelledby="staticBackdropLabel">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h1 className="modal-title fs-5" id="staticBackdropLabel">
                      {day}/{month}/{year}
                    </h1>
                  </div>
                  <div className="modal-body">
                    <span className="emp-modal-sched-title" style={{backgroundColor: "#F9E897"}}>בוקר</span>
                    {Object.entries(allSchedule[day]?.morning || {}).map(([key, value]) => (
                      <div key={key}>
                        {employees[value] || "No name available"}
                      </div>
                    ))}
                    <hr />
                    <span className="emp-modal-sched-title" style={{backgroundColor: "lightblue"}}>ערב</span>
                    {Object.entries(allSchedule[day]?.evening || {}).map(([key, value]) => (
                      <div key={key}>
                        {employees[value] || "No name available"}
                      </div>
                    ))}
                    <hr />
                    <span className="emp-modal-sched-title" style={{backgroundColor: "#ACE1AF"}}>לילה</span>
                    {Object.entries(allSchedule[day]?.night || {}).map(([key, value]) => (
                      <div key={key}>
                        {employees[value] || "No name available"}
                      </div>
                    ))}
                  </div>
                  <div className="modal-footer">
                      <button type="button" onClick={() => setIsModalVisible(false)} className="btn btn-primary">סגור</button>
                  </div>
                </div>
              </div>
            </div>
            </>
    )
}

export default ScheduleModal;