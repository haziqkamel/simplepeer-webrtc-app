import React, { useState } from 'react'
import MicButtonImg from '../../resources/images/mic.svg'
import MicButtonImgOff from '../../resources/images/micOff.svg'

const MicButton = () => {

    const [isMicMuted, setIsMicMuted] = useState(false);

    const handleMicButtonPressed = () => {
        setIsMicMuted(!isMicMuted)
    }

    return (
        <div className='video_button_container'>
            <img
                src={isMicMuted ? MicButtonImg : MicButtonImgOff}
                onClick={handleMicButtonPressed}
                className='video_button_img'
                alt='mic button' />
        </div>
    )
}

export default MicButton
