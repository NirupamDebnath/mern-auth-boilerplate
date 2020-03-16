import React, { useState } from "react";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';


const ForgotPassword = ({ history }) => {
    const [values, setValues] = useState({
        email:'nirupamdebnath4@gmail.com',
        buttonText:'Submit'
    });

    const { email, buttonText} = values

    const handleChange = (name) => (event) => {
        setValues({...values, [name]: event.target.value})
    }

    const clickSubmit = event => {
        event.preventDefault();
        setValues({...values, buttonText: 'Submitting ...'})
        axios({
            method: 'PUT',
            url: `${process.env.REACT_APP_API}/forgot-password`,
            data: { email }
        })
        .then( response => {
            console.log("FORGOT PASSWORD SUCCESS", response);
            // save the response(user,token) in local-storage/cookie
            toast.success(response.data.message);
            setValues({...values, buttonText: "Submitted"})
        })
        .catch( err => {
            console.log('FORGOT PASSWORD ERROR', err.response.data);
            setValues({...values, buttonText: "Submit"});
            toast.error(err.response.data.error);

        })
        .catch(err => {
            console.log('SIGNUP ERROR', err);
            toast.error("Connection Failure");
            setValues({...values, buttonText: "Submit"});
        });

    }

    const forgotPasswordForm = () => (
        <form>
            <div className="form-grop">
                <label className="text-muted">Email</label>
                <input onChange={handleChange('email')} value={email} type="text" className="form-control"/>
            </div>

            <div>
                <button className="btn btn-primary" onClick={clickSubmit}>{buttonText}</button>
            </div>
        </form>
    )

    return(
        <Layout>
            {/* {JSON.stringify(isAuth())} */}
            <div className="col-md-6 offset-md-3">
                <ToastContainer />
                {/* {JSON.stringify({ name, email, password })} */}
                <h1>Forgot Password</h1>
                {forgotPasswordForm()}
            </div>
        </Layout>
    )
};

export default ForgotPassword;