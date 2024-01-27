import React from "react";
import { useState, useRef } from "react";
import play from '../images/play-button.png'
import stop from '../images/stop-button.png'

export default function SongResult(props) {
    console.log(props.id);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePreview = () => {
        setIsPlaying(!isPlaying);
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
      };

    let artist = props.artist.replace(/;/g, ', ');

    return (
        <div className="song-result">
            {props.preview_url && 
                <audio ref={audioRef} src={props.preview_url} />
            }
            <img src={props.image_url} style={{height: "5rem"}}></img>
            <div className="song-result-details">
                <a 
                    className="song-link" 
                    href={`https://open.spotify.com/track/${props.id}`} // Use the actual ID prop here
                    target="_blank" // To open link in new tab
                    rel="noopener noreferrer" // For security purposes
                >
                <h3>{props.name}</h3>
                </a>
                <h4>{artist}</h4>
            </div>
            {props.preview_url && 
                <img className="preview-button" onClick={handlePreview} src={isPlaying ? stop : play}></img>
            }
            {!props.preview_url && 
                <a 
                    href={`https://www.youtube.com/results?search_query=${props.name}+${encodeURIComponent(artist)}`}
                    target="_blank"
                    className="preview-link"
                >
                    <img className="preview-button" src={play}></img>
                </a>
            }
        </div>

    )
}