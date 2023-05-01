import React, { useState } from 'react'
import CameraButtonImg from '../../resources/images/camera.svg'
import CameraButtonImgOff from '../../resources/images/cameraOff.svg'

const CameraButton = () => {

  const [isLocalVideoDisabled, setIsLocalVideoDisable] = useState(false)

  const handleCameraButtonPressed = () => {
    setIsLocalVideoDisable(!isLocalVideoDisabled)
  }

  return (
    <div className='video_button_container'>
      <img
        src={isLocalVideoDisabled ? CameraButtonImg : CameraButtonImgOff}
        onClick={handleCameraButtonPressed}
        className='video_button_img'
        alt='video button' />
    </div>
  )
}

export default CameraButton
