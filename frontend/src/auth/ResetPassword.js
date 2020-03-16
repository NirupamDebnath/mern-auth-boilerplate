import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import jwt from "jsonwebtoken";
import 'react-toastify/dist/ReactToastify.min.css';


const ResetPassword = ({ match }) => { // props.match from react router dom
    const [values, setValues] = useState({
        name: '',
        token: '',
        newPassword: '',
        buttonText:'Reset Password'
    });

    useEffect(() => {
        let token = match.params.token;
        let {name} = jwt.decode(token);
        if(token){
            setValues({...values, name, token});
        }
    },[])

    const { name, token, newPassword,buttonText} = values;

    const handleChange = (event) => {
        setValues({...values, newPassword: event.target.value})
    }

    const clickSubmit = event => {
        event.preventDefault();
        setValues({...values, buttonText: 'Submitting ...'})
        axios({
            method: 'PUT',
            url: `${process.env.REACT_APP_API}/reset-password`,
            data: { newPassword, resetPasswordLink: token }
        })
        .then( response => {
            console.log("RESET PASSWORD SUCCESS", response);
            // save the response(user,token) in local-storage/cookie
            toast.success(response.data.message);
            setValues({...values, buttonText: "Done"})
        })
        .catch( err => {
            console.log('RESET PASSWORD ERROR', err.response.data);
            setValues({...values, buttonText: "Reset Passwprd"});
            toast.error(err.response.data.error);

        })
        .catch(err => {
            console.log('SIGNUP ERROR', err);
            toast.error("Connection Failure");
            setValues({...values, buttonText: "Submit"});
        });

    }

    const resetPasswordForm = () => (
        <form>
            <div className="form-grop">
                <label className="text-muted">New Password</label>
                <input onChange={handleChange} value={newPassword} type="password" 
                    className="form-control" placeholder="Type new password" required/>
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
                <h1>Hello {name}, Type your new password </h1>
                {resetPasswordForm()}
            </div>
        </Layout>
    )
};

export default ResetPassword;