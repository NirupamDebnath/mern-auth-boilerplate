import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { isAuth, getCookie, signout, updateUserInfo } from "../auth/helpers";


const Private = ({history}) => {
    const [values, setValues] = useState({
        role: '',
        name:'',
        email:'',
        password:'',
        buttonText:'Submit'
    });

    const token = getCookie("token");

    useEffect(() => {
        loadProfile()
    })
    

    const loadProfile = () => {
        axios({
            method: 'GET',
            url: `${process.env.REACT_APP_API}/user/${isAuth()._id}`,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            console.log("Profile update", response);
            const {role, name, email} = response.data;
            setValues({...values, role, name, email})
        })
        .catch(error => {
            console.log('Profie update error', error.response.data.error);
            signout(() => {
                history.push('/');
            })
        })

    }
    
    const { role, name, email, password, buttonText} = values

    const handleChange = (name) => (event) => {
        setValues({...values, [name]: event.target.value})
    }

    const clickSubmit = event => {
        event.preventDefault();
        setValues({...values, buttonText: 'Submitting ...'})
        axios({
            method: 'PUT',
            url: `${process.env.REACT_APP_API}/user/update`,
            data: { name, password},
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then( response => {
            console.log("PROFILE PROFILE UPDATE SUCCESS", response);
            updateUserInfo(response,() => {
                setValues({...values, buttonText: 'Submit'});
                toast.success("Profile updated successfully");
            });
        })
        .catch( err => {
            console.log('PROFILE PROFILE UPDATE ERROR', err.response.data.error);
            setValues({...values, buttonText: "Submit"});
            toast.error(err.response.data.error);

        })
        .catch(err => {
            console.log("Error ", err);
            toast.error("Connection Failure");
            setValues({...values, buttonText: "Submit"});
        });

    }

    const updateForm = () => (
        <form>
            <div className="form-grop">
                <label className="text-muted">Role</label>
                <input defaultValue={role} type="text" className="form-control" disabled/>
            </div>
            <div className="form-grop">
                <label className="text-muted">Name</label>
                <input onChange={handleChange('name')} value={name} type="text" className="form-control"/>
            </div>

            <div className="form-grop">
                <label className="text-muted">Email</label>
                <input defaultValue={email} type="text" className="form-control" disabled/>
            </div>

            <div className="form-grop">
                <label className="text-muted">Password</label>
                <input onChange={handleChange('password')} autoComplete="off" value={password} type="password" className="form-control"/>
            </div>

            <div>
                <button className="btn btn-primary mt-4" onClick={clickSubmit}>{buttonText}</button>
            </div>
        </form>
    )

    return(
        <Layout>
            <div className="col-md-6 offset-md-3">
                <ToastContainer />
                {/* {JSON.stringify({ name, email, password })} */}
                <h1>Profile Update</h1>
                {updateForm()}
            </div>
        </Layout>
    )
};

export default Private;