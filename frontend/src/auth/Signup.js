import React, { useState } from "react";
import { Redirect,Link } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { isAuth } from "./helpers";


const Signup = () => {
    const [values, setValues] = useState({
        name:'Nirupam Debnath',
        email:'nirupamdebnath4@gmail.com',
        password:'123456',
        buttonText:'Submit'
    });

    const { name, email, password, buttonText} = values

    const handleChange = (name) => (event) => {
        setValues({...values, [name]: event.target.value})
    }

    const clickSubmit = event => {
        event.preventDefault();
        setValues({...values, buttonText: 'Submitting ...'})
        axios({
            method: 'POST',
            url: `${process.env.REACT_APP_API}/signup`,
            data: { name, email, password}
        })
        .then( response => {
            console.log("SIGNUP SUCCESS", response);
            setValues({...values, name:'', email:'', password:'', buttonText: 'Submit'});
            toast.success(response.data.message)
        })
        .catch( err => {
            console.log('SIGNUP ERROR', err.response.data);
            setValues({...values, buttonText: "Submit"});
            toast.error(err.response.data.error);

        })
        .catch(err => {
            console.log("Error ", err);
            toast.error("Connection Failure");
            setValues({...values, buttonText: "Submit"});
        });

    }

    const signupForm = () => (
        <form>
            <div className="form-grop">
                <label className="text-muted">Name</label>
                <input onChange={handleChange('name')} value={name} type="text" className="form-control"/>
            </div>

            <div className="form-grop">
                <label className="text-muted">Email</label>
                <input onChange={handleChange('email')} value={email} type="text" className="form-control"/>
            </div>

            <div className="form-grop">
                <label className="text-muted">Password</label>
                <input onChange={handleChange('password')} value={password} type="password" className="form-control"/>
            </div>

            <div>
                <button className="btn btn-primary mt-4 btn-block" onClick={clickSubmit}>{buttonText}</button>
            </div>
        </form>
    )

    return(
        <Layout>
            <div className="col-md-6 offset-md-3">
                <ToastContainer />
                {isAuth() ? <Redirect to="/"/> : null}
                {/* {JSON.stringify({ name, email, password })} */}
                <h1>Signup</h1>
                {signupForm()}
                <br/>
                <Link to="/auth/password/forgot" className="btn btn-sm btn-outline-danger btn-block">
                    Forgot Password
                </Link>
            </div>
        </Layout>
    )
};

export default Signup;