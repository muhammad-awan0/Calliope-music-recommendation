import React from "react";
import logo from "../images/calliope-logo.png"

export default function Logo(props) {

    return (
        <div className="logo">
            <img src={logo} alt="calliope"></img>
            {props.white && 
                <p style={{color: 'white'}}>Calliope</p> 
            }
            {!props.white && 
                <p style={{color: 'black'}}>Calliope</p> 
            }
        </div>
    )
}