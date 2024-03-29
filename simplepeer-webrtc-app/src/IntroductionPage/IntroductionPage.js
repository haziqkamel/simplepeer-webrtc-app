import { connect } from 'react-redux'
import { setIsRoomHost } from '../store/action'
import { useEffect } from 'react'
import logo from '../resources/images/logo.png'
import "./IntroductionPage.css"
import ConnectingButtons from './ConnectingButtons'


const IntroductionPage = ({ setIsRoomHostAction }) => {

  useEffect(() => {
    setIsRoomHostAction(false)
  }, [setIsRoomHostAction])

  return (
    <div className='introduction_page_container'>
      <div className='introduction_page_panel'>
        <img src={logo} className='introduction_page_image' alt='App Logo' />
        <ConnectingButtons />
      </div>
    </div>
  )
}

const mapActionsToProps = (dispatch) => {
  return {
    setIsRoomHostAction: (isRoomHost) => dispatch(setIsRoomHost(isRoomHost))
  }
}

export default connect(null, mapActionsToProps)(IntroductionPage)
