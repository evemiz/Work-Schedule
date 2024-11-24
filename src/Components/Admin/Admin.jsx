import React, { useState, useEffect } from "react";
import Navbar from "./Nav/AdminNav";
import { getDocs, doc, setDoc, getDoc } from "firebase/firestore"; 
import { scheduleCollection, employeesCollection, usersCollection, auth, adminsCollection } from "../../../Utils/firebaseconfig";
import '../../../public/admin.css'
import NewSchedule from "./NewSchedule";
import ExistSchedule from "./ExistSchedule";
import Loading from "../Loading";
import Generate from "./GenerateSchedule";
import Footer from "./FooterCloseSchedule";
import { useNavigate } from "react-router-dom";

function Admin() {
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(null);
    const [loggedUser, setLoggedUser] = useState(null);
    const navigate = useNavigate(); 
    const [employees, setEmployees] = useState([]);
    const [adminName, setAdminName] = useState("");

      useEffect(() => {
        setLoading(true);
        const currentUser = auth.currentUser;

        async function verifyAdmin(user) {
            try {
                const adminDocRef = doc(adminsCollection, user.uid);
                const adminDocSnap = await getDoc(adminDocRef);

                if (!adminDocSnap.exists()) {
                    navigate('/');
                } else {
                    const adminData = adminDocSnap.data();
                    setAdminName(adminData.name || '');
                    checkCollectionExists();
                    fetchEmployees();
                }
            } catch (error) {
                alert("שגיאה לא צפויה");
                navigate('/');
            } finally {
                setLoading(false);
            }
        }

        if (currentUser) {
            setLoggedUser(currentUser);
            verifyAdmin(currentUser);
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setLoggedUser(user);
                verifyAdmin(user);
            } else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, []);

    function handelLogout() {
        auth.signOut()
        .then(() => {
        })
        .catch(err => {
        })
      }

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(employeesCollection);

            const employeesData = await Promise.all(
                querySnapshot.docs.map(async (docSnapshot) => {
                    const employee = {
                        id: docSnapshot.id,
                        ...docSnapshot.data(),
                    };
                    if (employee.user_id) {
                        const userDocRef = doc(usersCollection, employee.user_id);
                        const userDocSnap = await getDoc(userDocRef);
                        employee.email = userDocSnap.exists() ? userDocSnap.data().email : "";
                        employee.shifts = userDocSnap.exists() ? userDocSnap.data().shifts :"";
                        employee.comments = userDocSnap.exists() ? userDocSnap.data().comments :"";
                    } else {
                        employee.email = ""; 
                        employee.shifts = "";
                        employee.comments ="";
                    }
                    return employee;
                })
            );
            setEmployees(employeesData);
        } catch (error) {
            alert("שגיאה לא צפויה");
        } finally {
            setLoading(false);
        }
    };

    const checkCollectionExists = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(scheduleCollection);
            
            if (querySnapshot.empty) {
                setDate(null);
            } else {
                const scheduleDoc = querySnapshot.docs[0].data();
                setDate(scheduleDoc);
            }
        } catch (error) {
            alert("שגיאה לא צפויה");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = async (selectedMonth, selectedYear, constraints, modified, missings) => {
        setLoading(true);
        try {
            const newScheduleRef = doc(scheduleCollection);
            await setDoc(newScheduleRef, { month: selectedMonth, year: selectedYear, constraints: parseInt(constraints, 10), modifyEmpsNum: modified, missings: parseInt(missings, 10)});
            setDate({ month: selectedMonth, year: selectedYear });
        } catch (error) {
            console.log(error);
            alert("שגיאה לא צפויה");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-main">
            {loading ? (
                <div className='py-5 my-5 text-center'>
                    <Loading />
                </div>
            ) : (
                <>
                    <Navbar 
                        openSchedule={date}
                        setLoading={setLoading}
                        employees={employees}
                        fetchEmployees={fetchEmployees}
                        adminName={adminName}
                        handelLogout={handelLogout}
                        date={date}
                    />
                    {date ? (
                        <div>
                        <ExistSchedule 
                            month={date.month}
                            year={date.year}
                            employees={employees}
                            setLoading={setLoading}
                        />
                        <Generate
                           month={date.month}
                            year={date.year}
                            employeesList = {employees}
                        />
                        
                        <Footer 
                            setLoading={setLoading}
                            setDate={setDate}
                        />
                        </div>
                    ) : (
                        <NewSchedule 
                            handleCreateSchedule={handleCreateSchedule}
                            employees={employees}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default Admin;
