import React, { useState,useEffect } from "react";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import jwt from "jsonwebtoken";


const Activate = ({match}) => {
    const [values, setValues] = useState({
        name: "",
        token: "",
        show: true
    });

    useEffect(() => {
        let token = match.params.token;
        let {name} = jwt.decode(token);
        // console.log(token);

        if(token){
            setValues({...values, name, token})
        }
    },[])

    const { name, token } = values

    const clickSubmit = event => {
        event.preventDefault();
        setValues({...values, buttonText: 'Submitting ...'})
        axios({
            method: 'POST',
            url: `${process.env.REACT_APP_API}/account-activation`,
            data: { token }
        })
        .then( response => {
            console.log("Account Activation", response);
            // save the response(user,token) in local-storage/cookie
            setValues({...values, show: false});
            toast.success(response.data.message);
        })
        .catch( err => {
            console.log('Account Activation ERROR', err.response.data);
            toast.error(err.response.data.error);

        })
        .catch(err => {
            console.log('SIGNUP ERROR', err);
            toast.error("Connection Failure");
        });

    };

    const actiavteLink = () => (
        <div className="text-center">
            <h1 className="p-5">Hey {name} Ready to activate your account?</h1>
            <button className="btn btn-primary" onClick={clickSubmit}>Activate Account</button>
        </div>
    )

    return(
        <Layout>
            <div className="col-md-6 offset-md-3">
                <ToastContainer />
                
                {actiavteLink()}
            </div>
        </Layout>
    )
};

export default Activate;