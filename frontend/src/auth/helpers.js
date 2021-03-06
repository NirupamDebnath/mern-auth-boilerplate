import cookie from 'js-cookie';

// set key value in cookie
export const setCookie = (key, value) => {
    if( window !== 'undefined'){
        cookie.set(key, value,{
            expires: 1
        });
    }
}


// remove from cookie
export const removeCookie = (key) => {
    if( window !== 'undefined'){
        cookie.remove(key,{
            expires: 1
        });
    }
}

// get value from in cookie
export const getCookie = (key) => {
    if( window !== 'undefined'){
        return cookie.get(key);
    }
}

// set in local storage
export const setLocalStorage = (key, value) => {
    if( window !== 'undefined'){
        localStorage.setItem(key, JSON.stringify(value));
    }
}


// set in local storage
export const removeLocalStorage = (key) => {
    if( window !== 'undefined'){
        localStorage.removeItem(key);
    }
}

// saving token and user data after sign in
export const setAuthenticattionInfo = ( response, next ) => {
    setCookie('token', response.data.token);
    setLocalStorage('user', response.data.user);
    next();
}

export const updateUserInfo = ( response, next ) => {
    let user = response.data.updatedUser;
    console.log("Update user info in localstorage ",user);
    if (window !== 'undefined'){
        setLocalStorage('user', {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    }

    user = localStorage.getItem("user");
    if(user === undefined){
        signout();
    }
    next();
}

// access user info from localstorage
export const isAuth = () => {
    if (window !== 'undefined'){
        const cookieChecked = getCookie('token');
        if(cookieChecked){
            const user = localStorage.getItem('user');
            if(user){
                return JSON.parse(user);
            }
            else{
                return false;
            }
        }
    }
}

export const signout = next => {
    removeCookie('token');
    removeLocalStorage('user');
    next()
}
