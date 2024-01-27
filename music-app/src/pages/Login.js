import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setId } from "../state/actions/setId";
import { setAccessToken } from "../state/actions/setAccessToken";
import Logo from "../components/Logo";

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginSuccess, setLoginSuccess] = useState('');
    const [userId, setUserId] = useState('');

    const doesIdExist = useSelector((state) => state.userId);
    const dispatch = useDispatch();

    if (doesIdExist && localStorage.getItem('token')!==null) {
        return <Navigate to="/main" />
    }

    function handleUsername(event) {
        setUsername(event.target.value);
    }

    function handlePassword(event) {
        setPassword(event.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                })
            })
            
            const spotifyResponse = await fetch("https://accounts.spotify.com/api/token", {
                body: "grant_type=client_credentials&client_id=ea264bab04d84c00a06fe5e32134640c&client_secret=c641689fee7345acbd2d4b061c3c89a7",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST"
            });

            if (response.ok && spotifyResponse.ok) {
                const data = await response.json();
                const spotifyData = await spotifyResponse.json();
                const { token } = data;
                setUserId(data.user._id);
                localStorage.setItem('token', token);
                dispatch(setAccessToken(spotifyData.access_token));
                dispatch(setId(data.user._id));
                setLoginSuccess(true);
                console.log(loginSuccess);

            } else {
                setLoginSuccess(false);
            }
        } catch (err) {
            console.log(`Error: ${err}`);
        }
    }

    if (loginSuccess) {
        return <Navigate to="/main" state={{ userId: userId }} />;
    }

    return (
        <div className="login-page">
            <Link to={'/home'} id="topleftname"><Logo white={false}></Logo></Link>
            <div className="login-part mobile">
                <div className="login-part-text mobile">
                    <h1>Login</h1>
                    {loginSuccess !== true && loginSuccess !== false &&
                        <h3 className="explore-text mobile">Explore more of the sounds you love.</h3>}
                    {loginSuccess === false &&
                        <h3 className="explore-text invalid-credentials mobile">
                            Invalid Credentials.
                        </h3>}
                    <form className="login-form mobile" id="login__form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className="username-input mobile"
                            placeholder="Username"
                            value={username}
                            onChange={handleUsername}>
                        </input>
                        <input
                            type="password"
                            className="password-input mobile"
                            placeholder="Password"
                            value={password}
                            onChange={handlePassword}>
                        </input>
                        <input type="submit" className="submit-button mobile" form="login__form" value="Login"></input>
                        <p className="signup-text">New to Calliope? <Link to={'/signup'}>Sign Up!</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}
