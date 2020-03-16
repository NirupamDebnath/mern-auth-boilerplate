import React, {Fragment} from 'react';
import { Link,withRouter } from 'react-router-dom';
import { isAuth, signout } from '../auth/helpers';

const Layout = ({ children, match, history }) => {
    const isActive = path => {
        if ( match.path === path){
            return "nav-item active";
        }
        else{
            return "nav-item";
        }
    }
    const nav = () => (
        <nav className="navbar navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light" id="ftco-navbar">
            <div className="container">
                <Link className="navbar-brand" to="/">Auth Boilerplate</Link>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#ftco-nav" aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="oi oi-menu"></span> Menu
                </button>
                <div className="collapse navbar-collapse" id="ftco-nav">
                    <ul className="navbar-nav ml-auto">
                        <li className={isActive('/')}><Link to="/" className="nav-link">Home</Link></li>
                        {!isAuth() && (
                            <Fragment>
                                <li className={isActive('/signup')}><Link to="/signup" className="nav-link">Signup</Link></li>
                                <li className={isActive('/signin')}><Link to="/signin" className="nav-link">Signin</Link></li>
                            </Fragment>
                        )}
                        {isAuth() && isAuth().role === 'admin' && (
                            <li className={isActive('/admin')}>
                                <Link to="/admin" className="nav-link">Admin</Link>
                            </li>
                        )}
                        {isAuth() && (
                            <li className={isActive('/private')}>
                                <Link to="/private" className="nav-link">{isAuth().name}</Link>
                            </li>
                        )}
                        {isAuth() && (
                            <Fragment>
                                <li className="nav-item">
                                    <span  className="nav-link" onClick={()=>signout(()=>{
                                        history.push('/');
                                    })}
                                    style={{cursor:"pointer"}}
                                    >Signout</span>
                                </li>
                            </Fragment>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
        )

    return (
        <Fragment>
            { nav() }
    <div className="container">{children}</div>
        </Fragment>
    )
}

export default withRouter( Layout );