import React from "react";

function AlertModal({setIsModalVisible, handel, btn }) {
    return(
        <>
            <div className="modal-overlay"></div>
            <div className={`modal fade show`} style={{ display: 'block' }} aria-labelledby="staticBackdropLabel" aria-hidden="true">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h1 className="modal-title fs-5" id="staticBackdropLabel">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="grey" className=" ms-3 bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                  </svg>
                  </h1>
                  </div>
                  <div className="modal-body">
                  האם אתה בטוח שברצונך לצאת מדף זה ? לאחר היציאה לא ניתן לשחזר סידור שלא נשמר
                  </div>
                  <div className="modal-footer">
                      <button type="button" onClick={handel} className="btn btn-primary">{btn}</button>
                      <button type="button" onClick={() => setIsModalVisible(false)} className="btn btn-primary">בטל</button>
                  </div>
                </div>
              </div>
            </div>
            </>
    )
}

export default AlertModal;