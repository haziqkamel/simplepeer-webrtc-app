import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import './JoinRoomPage.css'
import { setIsRoomHost } from '../store/action'
import JoinRoomTitle from './JoinRoomTitle'
import JoinRoomContent from './JoinRoomContent'

const JoinRoomPage = (props) => {
    const { setIsRoomHostAction, isRoomHost } = props
    const search = useLocation().search

    useEffect(() => {
        const isRoomHost = new URLSearchParams(search).get('host')
        if (isRoomHost) {
            setIsRoomHostAction(true);
        }
    }, [search, setIsRoomHostAction])

    return (
        <div className='join_room_page_container'>
            <div className='join_room_page_panel'>
                <JoinRoomTitle isRoomHost={isRoomHost} />
                <JoinRoomContent />
            </div>
        </div>
    )
}

const mapStoreSatateToProps = (state) => {
    return {
        ...state
    }
}

const mapActionsToProps = (dispatch) => {
    return {
        setIsRoomHostAction: (isRoomHost) => dispatch(setIsRoomHost(isRoomHost))
    }
}

export default connect(mapStoreSatateToProps, mapActionsToProps)(JoinRoomPage);
