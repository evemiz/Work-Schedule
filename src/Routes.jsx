import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from "./Components/User/Login";
import SignUp from "./Components/User/Register";
import Admin from "./Components/Admin/Admin";
import NoSchedule from "./Components/Employee/NoSchedule";
import ExistSchedule from "./Components/Employee/ExistSchedule";

import Emp from "./Components/Employee/Emp";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <main role="main">
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/signUp' element={<SignUp />} />
                    <Route path='/emp' element={<Emp />} />
                    <Route path='/admin' element={<Admin />} />
                    <Route path='/noSchedule' element={<NoSchedule />} />
                    <Route path='/existSchedule' element={<ExistSchedule />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default AppRoutes;
