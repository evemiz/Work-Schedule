import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from "./Components/User/Login";
import Calendar from "./Components/Employee/Calendar";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <main role="main">
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/calendar' element={<Calendar />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default AppRoutes;
