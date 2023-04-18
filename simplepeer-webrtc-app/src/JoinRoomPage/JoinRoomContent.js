import React, { useState } from 'react'
import JoinRoomInputs from './JoinRoomInputs'
import { connect } from 'react-redux'
import OnlyWithAudioCheckBox from './OnlyWithAudioCheckBox'
import { setConnectOnlyWithAudio } from '../store/action'
import ErrorMessage from './ErrorMessage'
import JoinRoomButtons from './JoinRoomButtons'
import { getRoomExists } from '../utils/api'
import { useLocation } from 'react-router-dom'

const JoinRoomContent = (props) => {

    const { isRoomHost, setConnectOnlyWithAudio, connectOnlyWithAudio } = props
    const [roomIdValue, setRoomIdValue] = useState('')
    const [nameValue, setNameValue] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)

    const location = useLocation()

    const handleJoinRoom = async () => {
        if (isRoomHost) {
            createRoom()
        } else {
            joinRoom()
        }
    }

    const joinRoom = async () => {
        const responseMessage = await getRoomExists(roomIdValue);

        const { roomExists, full } = responseMessage;

        if (roomExists) {
            if (full) {
                setErrorMessage('Max participant reached!. Please try again later')
            }
            // Save meeting ID in redux store.
            location('/room')
        } else {
            setErrorMessage('Room not found. Incorrect meeting ID')
        }
    }

    const createRoom = () => {
        location('/room')
    }

    return <>
        <JoinRoomInputs
            roomIdValue={roomIdValue}
            etRoomIdValue={setRoomIdValue}
            nameValue={nameValue}
            setNameValue={setNameValue}
            isRoomHost={isRoomHost}
        />
        <OnlyWithAudioCheckBox
            setConnectOnlyWithAudio={setConnectOnlyWithAudio}
            connectOnlyWithAudio={connectOnlyWithAudio}
        />
        <ErrorMessage errorMessage={errorMessage} />
        <JoinRoomButtons handleJoinRoom={handleJoinRoom} isRoomHost={isRoomHost} />
    </>
}

const mapStoreSatateToProps = (state) => {
    return {
        ...state,
    }
}

const mapActionsToProps = (dispatch) => {
    return {
        setConnectOnlyWithAudio: (onlyWithAudio) => dispatch(setConnectOnlyWithAudio(onlyWithAudio))
    }
}

export default connect(mapStoreSatateToProps, mapActionsToProps)(JoinRoomContent)
