import React, { useState, useEffect} from 'react';
import './App.css';
import * as Colyseus from 'colyseus.js';

let room;


function App() {
    const [players, setPlayers] = useState([]);
    const [roomLoaded, setRoomLoaded] = useState(false);

    // Will run on mount and unmount
    // On mount, join or create room and put it in room var
    // On unmount leave the current room
    useEffect(() => {
        if (roomLoaded){
            // Leave room
            console.log('Leave room');
        }else{
            const config = {gameServer : "ws://localhost:3000"}; 
            const client = new Colyseus.Client(config.gameServer);
            client.joinOrCreate("MyRoom").then(roomInstance => {
                room = roomInstance;
                setRoomLoaded(true);
                console.log('Room has been set');
            });
        }
    }, []);

    // When room is loaded, set all handlers
    // ===Initial Render: ===
    // 1. Pets is []
    // 2. setPets(somePets) => trigger re-render
    // 3. Pets is []

    // ===Re-render: ===
    // 4. Pets is somePets

    // On roomload or any players change, run code below
    useEffect(() => {
        if (roomLoaded){
            room.state.players.onAdd = function (player, sessionId){
                
                const { x, y } = player;
                const playerObject = {
                    x,
                    y,
                    sessionId
                };
                setPlayers(players => [...players, playerObject])

                console.log(sessionId + ' Joined.');
            };
            
            room.state.players.onRemove = function (player, sessionId){
                const index = players.findIndex(player => player.sessionId == sessionId);
                if (index > -1){
                    let newPlayersArray = [...players];
                    newPlayersArray.splice(index, 1);
                    setPlayers(newPlayersArray);
                };

                console.log(sessionId + ' Left.');

            };
        
            room.state.players.onChange = function (player, sessionId){
                //Get the index of the player in the current players array state

                const index = players.findIndex(player => player.sessionId == sessionId);
                if (index > -1){
                    let newPlayersArray = [...players];
                    newPlayersArray[index] = {
                        ...newPlayersArray[index], 
                        x: player.x,
                        y: player.y
                    }
                    setPlayers(newPlayersArray);

                    console.log(sessionId + ' Changed.');
                };
            };
        };
    }, [players, roomLoaded]);

    // https://stackoverflow.com/questions/56784954/state-returning-empty-array
    
    const handleMovement = (dir) => {
        if (dir === 'up'){room.send('move', {y: 10})}
        else if (dir === 'right'){room.send('move', {x: 10})}
        else if (dir === 'left'){room.send('move', {x: -10})}
        else room.send('move', {y: -10})
    }

    return (
        <div className="App container">
            <div className="row">
                <div className="col">
                    <h1>Game room</h1>
                </div>
            </div> 
            <div className="row">
                <div className="col" id="game">
                    {players.map((player, index) => (
                        <Player key={index} x={player.x} y={player.y} sessionId={player.sessionId} />
                    ))}
                </div>
            </div>
            <div className="row" style={{paddingTop: '30px'}}>
                <div className="col controls">
                    <button type="button" className="btn btn-dark" onClick={() => handleMovement('up')} >UP</button>
                    <div>
                        <button type="button" className="btn btn-dark" onClick={() => handleMovement('left')} >LEFT</button>
                        <button type="button" className="btn btn-dark" onClick={() => handleMovement('right')} >RIGHT</button>
                    </div>
                    <button type="button" className="btn btn-dark" onClick={() => handleMovement('down')} >DOWN</button>
                </div>
                <div className="col">
                    <ul id="player-list">
                        {players.map(player => (
                            <li>{player.sessionId}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

const Player = ({x, y, sessionId}) => {
    return (
        <div className="player" style={{left: x, bottom: y}}>
            {sessionId}
        </div>
    )
}

export default App;
