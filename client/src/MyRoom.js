import React, { useState, useEffect} from 'react';
import * as Colyseus from 'colyseus.js';
import './MyRoom.css';
import { useHistory } from 'react-router-dom';

let room;


function MyRoom() {
    const [players, setPlayers] = useState([]);
    const [roomLoaded, setRoomLoaded] = useState(false);
    const [roomId, setRoomId] = useState('');
    const history = useHistory();

    // Will run on mount and unmount
    // On mount, join or create room and put it in room var
    // On unmount leave the current room
    useEffect(() => {
        if (!roomLoaded){
            let CLIENT_URI;
            if (process.env.NODE_ENV === 'development') {
                CLIENT_URI = 'ws://localhost:3030';
            }else{
                const host = window.location.host.replace(/:.*/, '');
                CLIENT_URI = window.location.protocol.replace("http", "ws") + "//" + host + (window.location.port ? ':' + window.location.port : '');
            }

            const config = {gameServer : CLIENT_URI}; 
            const client = new Colyseus.Client(config.gameServer);

            // Get room ID from URL
            const url = new URL(window.location);
            const gameId = url.searchParams.get('ID');

            // If room ID try to join
            // If no room ID given, create new room
            if (gameId && gameId.length > 0){
                client.joinById(gameId).then(roomInstance => {
                    room = roomInstance;
                    setRoomId(room.id);
                    setRoomLoaded(true);
                    console.log('Room has been set');  
                })
                .catch(() => history.push('/?error=true'));
            }else{
                client.create("MyRoom").then(roomInstance => {
                    setRoomId(roomInstance.id);
                    room = roomInstance;
                    setRoomLoaded(true);
                    console.log('Room has been set');
                });
            }
        }else{
            // Leave room
            console.log('Leave room');
            room = {};
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
                    <h1>Game room {roomId}</h1>
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
                        {players.map((player, index) => (
                            <li key={index} >{player.sessionId}</li>
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

export default MyRoom;
