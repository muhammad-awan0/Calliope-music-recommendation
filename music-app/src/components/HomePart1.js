import React from "react";

import { Link } from "react-router-dom";
import Logo from "./Logo";

function HomePart1() {

    return (
        <div className = "page-one">
            <div className="logo-container">
                <Logo white={true}></Logo>
            </div>
            <div className="person-description-container">
                <img src={'person.jpg'} alt="person" className="person"></img>
                <div className="po-description">
                    <h1 className="po-toptext">Input Your Tunes.</h1>
                    <h1>Discover Your Sounds.</h1>
                    <Link to={"/login"} >
                        <button className='po-signup'>Sign Up</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default HomePart1; 