import React, {useState} from "react";
import Close from "./CloseSchedModal";
import { savedScheduleCollection, scheduleCollection, usersCollection } from "../../../Utils/firebaseconfig";
import { deleteDoc, getDocs, updateDoc, deleteField } from "firebase/firestore";

function Footer({ setLoading, setDate }) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    async function closeSched() {
        setLoading(true);
        try {
            // Delete all documents in savedScheduleCollection
            const querySnapshotSaved = await getDocs(savedScheduleCollection);
            if (!querySnapshotSaved.empty) {
                const deletePromises = querySnapshotSaved.docs.map((doc) =>
                    deleteDoc(doc.ref)
                );
                await Promise.all(deletePromises);
            }
    
            // Delete all documents in scheduleCollection
            const querySnapshotSched = await getDocs(scheduleCollection);
            if (!querySnapshotSched.empty) {
                const deletePromises = querySnapshotSched.docs.map((doc) =>
                    deleteDoc(doc.ref)
                );
                await Promise.all(deletePromises);
            }
    
            // Remove the 'shifts' field from all documents in usersCollection
            const querySnapshotUsers = await getDocs(usersCollection);
            if (!querySnapshotUsers.empty) {
                const removeShiftsPromises = querySnapshotUsers.docs.map((doc) => {
                    const docData = doc.data();
                    if (docData.shifts !== undefined) {
                        return updateDoc(doc.ref, { shifts: deleteField() });
                    }
                    return Promise.resolve(); 
                });
                await Promise.all(removeShiftsPromises);
            }
            setDate(null);
        } catch (err) {
            alert("שגיאה בסגירת הסידור");
        }
        finally {
            (setLoading(false))
        }
    }

    return(
        <div className="container-fluid">
            <div style={{height: '20vh'}}></div>
            <nav className="navbar fixed-bottom bg-body-tertiary">
                <div className="container-fluid">
                    <button type="button" onClick={() => setIsModalVisible(true)} className="btn btn-outline-danger">סגור סידור</button>
                </div>
            </nav>
            {isModalVisible && 
                <Close 
                    setIsModalVisible={setIsModalVisible}
                    closeSched={closeSched}
                />
        }
        </div>
        );
}

export default Footer;
