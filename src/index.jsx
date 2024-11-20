import React from "react";
import ReactDOM from "react-dom";
import { auth } from "../Utils/firebaseconfig";
import AppRoutes from "./Routes";

ReactDOM.render(<AppRoutes />, document.getElementById("root"));

auth.onAuthStateChanged( user => {
    if(user){
        console.log(user.email);
    }
    else {
        console.log("no user");
    }
})
