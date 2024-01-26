import React from "react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Logo from "../components/Logo";


export default function SignUp() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [creationSuccess, setCreationSuccess] = useState('');
    const [invalidMessage, setInvalidMessage] = useState('Invalid Details');

    function handleUsername (event) {
        setUsername(event.target.value);
    }

    function handlePassword (event) {
        setPassword(event.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (username==='' || password==='') {
            setInvalidMessage('Invalid Details')
            setCreationSuccess(false);
        }
        else {
            try {
                const response = await fetch('http://localhost:3001/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    })
                });
                console.log(`RESPONSE: ${response}`);
                if (response.ok) {
                    console.log("success")
                    setCreationSuccess(true)
                }
                else {
                    const responseData = await response.json();
                    setInvalidMessage(responseData.msg);
                    setCreationSuccess(false);
                }
            }
            catch (err) {
                console.log(`Error: + ${err}`);
            }
        }
        
    }

    if (creationSuccess) {
        return <Navigate to="/login"></Navigate>
    }

    return (
        <div className="signup-page">
            <Link to={'/home'} id="topleftname"><Logo white={false}></Logo></Link>
            <div className="signup-part">
                <div className="signup-part-text">
                    <h1>Create an Account</h1>
                    {creationSuccess!==true && creationSuccess!==false &&
                    <h3 className="explore-text">Sign up now to discover new tunes!</h3>}
                    {creationSuccess===false && 
                    <h3 className="invalid-credentials">{invalidMessage}</h3>}
                    <form className="signup-form" id="signup__form" onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            className="username-signup" 
                            placeholder="Username" 
                            value={username}
                            onChange={handleUsername}
                        >
                        </input>
                        <input 
                            type="password" 
                            className="password-signup" 
                            placeholder="Password"
                            value={password}
                            onChange={handlePassword}
                        >
                        </input>
                        <input 
                            type="submit" 
                            className="submit-button mobile" 
                            form="signup__form" 
                            value="Sign Up" 
                            onClick={handleSubmit}
                        >
                        </input>
                        <p className="signup-text">Have an Account? <Link to={'/login'}>Login</Link></p>
                    </form>
                </div>
            </div>
        </div>
    )
}