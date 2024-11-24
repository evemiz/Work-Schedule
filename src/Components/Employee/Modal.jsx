import React, { useEffect, useState } from 'react';
import '../../../public/modal.css'

function Modal(props) {
  const { title, bodyContent, button, isVisible, onConfirm } = props;
  const [shake, setShake] = useState(false); // State to manage shake animation

  useEffect(() => {
    if (isVisible) {
      setShake(true); // Trigger the shake animation when the modal is visible
      const timer = setTimeout(() => setShake(false), 1000); // Reset shake state after animation
      return () => clearTimeout(timer); // Clean up timer on unmount
    }
  }, [isVisible]);

  if (!isVisible) return null; // If the modal should not be visible, return null

  return (
    <>
      <div className="modal-overlay"></div>
      <div className={`modal fade show ${shake ? 'shake' : ''}`} style={{ display: 'block' }} aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">{title}</h1>
            </div>
            <div className="modal-body">
              {bodyContent}
              {title === "האם אתה בטוח שברצונך לשלוח את הסידור ?" && 
              <p className="mt-3" style={{color: 'red'}}>* תזכורת - חופשה ארוכה יש לעדכן חודש לפני !</p>
              }
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={props.onClose}>{button}</button>
              {props.close && 
                <button type="button" className="btn btn-primary" onClick={onConfirm}>שלח סידור</button>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;

