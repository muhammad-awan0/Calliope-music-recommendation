import React from "react";

export default function Song(props) {

    
    function sendID() {
        console.log(props.id);
        props.onClick(props.id);
    }
    

    return (
        <div className="song-card" onClick={sendID}>
            <img src={props.imageURL} alt='album cover' className="song-card-image" />
            <div className="song-details">
                <h2>{props.name}</h2>
                <h4>{props.artist}</h4>
            </div>
        </div>
    )
}