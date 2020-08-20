import React, { useState } from 'react';
import { Link, Switch, Route, useHistory } from 'react-router-dom';
import MyRoom from './MyRoom.js'

const App = () => {

    return(
        <div className="App">
            <Switch>
                <Route exact path="/" component={JoinCreateRoom} />
                <Route path="/game" component={MyRoom} />
            </Switch>
            
        </div>
    )
}

const JoinCreateRoom = () => {
    const history = useHistory();
    const [gameIdInput, setGameIdInput] = useState('');
    
    const handleJoinRoom = e => {
        e.preventDefault();
        history.push(`/game?ID=${gameIdInput}`)
    }

    return(
        <div className="JoinCreateRoom">
            <button onClick={() => history.push('/game') }>Create room</button>
            <form onSubmit={handleJoinRoom} >
                <input type="text" placeholder="Room ID" onChange={e => setGameIdInput(e.target.value)} />
                <button type="submit">Join</button>
            </form>
        </div>
    )
}

export default App;