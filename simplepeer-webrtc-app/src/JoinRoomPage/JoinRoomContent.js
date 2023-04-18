import React, { useState } from 'react'
import JoinRoomInputs from './JoinRoomInputs'
import { connect } from 'react-redux'
import OnlyWithAudioCheckBox from './OnlyWithAudioCheckBox'
import { setConnectOnlyWithAudio } from '../store/action'
import ErrorMessage from './ErrorMessage'
import JoinRoomButtons from './JoinRoomButtons'
import { getRoomExists } from '../utils/api'
import { useNavigate } from 'react-router-dom'

const JoinRoomContent = (props) => {

    const { isRoomHost, setConnectOnlyWithAudio, connectOnlyWithAudio } = props
    const [roomIdValue, setRoomIdValue] = useState('')
    const [nameValue, setNameValue] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)

    const navigate = useNavigate()

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
            navigate('/room')
        } else {
            setErrorMessage('Room not found. Incorrect meeting ID')
        }
    }

    const createRoom = () => {
        navigate('/room')
    }

    return <>
        <JoinRoomInputs
            roomIdValue={roomIdValue}
            setRoomIdValue={setRoomIdValue}
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

const mapStoreStateToProps = (state) => {
    return {
        ...state,
    }
}

const mapActionsToProps = (dispatch) => {
    return {
        setConnectOnlyWithAudio: (onlyWithAudio) => dispatch(setConnectOnlyWithAudio(onlyWithAudio))
    }
}

export default connect(mapStoreStateToProps, mapActionsToProps)(JoinRoomContent)
