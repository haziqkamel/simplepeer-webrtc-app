# Project
A simple WebRTC app using SimplePeer Library

# Tech Stack
1. MERN
2. Simple Peer JS Library

## The IDEA
1. STUN Server
- STUN (Session Traversal Utilities for NAT) that allows clients to discover their public IP address
and the type of NAT they are behind. This information is used to establish the media connection.
- In 15-20% cases STUN server will fail and to establish connection between the peers we will need TURN server

2. TURN Server
- TURN (Traversal Using Relay NAT), and it is a protocol for relaying network traffic.
- TURN server will be used if STUN server failed
- TURN server will be used as an assist to establish connection between the peers
- TURN servers are not public because of the costs which they can generate because of the traffic which is going through them.

3. SDP (Session Description Protocol)
- The SDP is a format to describing multimedia communication sessions for the purposes of session announcement and session invitation
- It does not deliver the media data but is used for negotation between peers of various audio and video codecs, source address, timing information of audio and video

4. ICE Candidates
- As well as exchanging information about the media(discussed in SDP), peers must exchange information about the network connection. This is known as an ICE candidate and details the available methods the peer is able to communicate (directly or through a TURN server).
- Typically each peer will propose its best cadidates first, making their way down the line toward their worse candidates. 
- Ideally, candidates are UDP (since it's faster, and media streams are able to recover from interruptions relatively easily), but the ICE standart does allow TCP candidates as well.

