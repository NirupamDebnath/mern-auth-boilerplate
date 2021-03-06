import React, { useState } from "react";
import { Redirect, Link } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { setAuthenticattionInfo, isAuth } from "./helpers";
import Google from './Google';
import Facebook from "./Facebook";

const Signin = ({ history }) => {
    const [values, setValues] = useState({
        email:'nirupamdebnath4@gmail.com',
        password:'123456',
        buttonText:'Submit'
    });

    const { email, password, buttonText} = values

    const handleChange = (name) => (event) => {
        setValues({...values, [name]: event.target.value})
    }

    const informParent = response => {
        setAuthenticattionInfo(response, () => {
            const user = isAuth();
            user && user.role === 'admin' ? history.push('/admin') : history.push('/private');
        });
    }

    const clickSubmit = event => {
        event.preventDefault();
        setValues({...values, buttonText: 'Submitting ...'})
        axios({
            method: 'POST',
            url: `${process.env.REACT_APP_API}/signin`,
            data: { email, password}
        })
        .then( response => {
            console.log("SIGNIN SUCCESS", response);
            // save the response(user,token) in local-storage/cookie
            setAuthenticattionInfo(response, () => {
                setValues({...values, email:'', password:'', buttonText: 'Submit'});
                const user = isAuth();
                user && user.role === 'admin' ? history.push('/admin') : history.push('/private');
            });
        })
        .catch( err => {
            console.log('SIGNUP ERROR', err.response.data);
            setValues({...values, buttonText: "Submit"});
            toast.error(err.response.data.error);

        })
        .catch(err => {
            console.log('SIGNUP ERROR', err);
            toast.error("Connection Failure");
            setValues({...values, buttonText: "Submit"});
        });

    }

    const signinForm = () => (
        <form>
            <div className="form-grop">
                <label className="text-muted">Email</label>
                <input onChange={handleChange('email')} value={email} type="text" className="form-control"/>
            </div>

            <div className="form-grop">
                <label className="text-muted">Password</label>
                <input onChange={handleChange('password')} value={password} type="password" className="form-control"/>
            </div>

            <div className="text-center">
                <button className="btn btn-primary mt-4 btn-block" onClick={clickSubmit}>{buttonText}</button>
            </div>
        </form>
    )

    return(
        <Layout>
            {/* {JSON.stringify(isAuth())} */}
            <div className="col-md-6 offset-md-3">
                <ToastContainer />
                {isAuth() ? <Redirect to="/"/> : null}
                {/* {JSON.stringify({ name, email, password })} */}
                <h1>Signin</h1>
                {signinForm()}
                <br/>
                <div className="text-center">
                    <Link to="/auth/password/forgot" className="btn btn-sm btn-outline-danger btn-block">
                        Forgot Password
                    </Link>
                </div>
                <br/>
                <br/>
                <Google informParent={informParent}/>
                <Facebook informParent={informParent}/>
            </div>
        </Layout>
    )
};

export default Signin;