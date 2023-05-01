import React from "react"

const dummyParticipants = [
    {
        identity: 'Jake'
    },
    {
        identity: 'Paul'
    },
    {
        identity: 'Test'
    },
    {
        identity: 'Tester'
    }
]

const SingleParticipants = (props) => {
    const { identity, lastItem, participant } = props;

    return <>
        <p className="participants_paragraph">{identity}</p>
        {!lastItem && <span className="participants_separator_line" />}
    </>
}

const Participants = () => {
    return (
        <div className="participants_container">
            {dummyParticipants.map((participant, index) => {
                return (
                    <SingleParticipants
                        key={participant.identity}
                        lastItem={dummyParticipants.length === index + 1}
                        participant={participant}
                        identity={participant.identity}
                    />
                )
            })}
        </div>
    )
}

export default Participants