import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

class Vector2{
    public x: number = 0;
    public y: number = 0;

    constructor(x: number, y:number){
        this.x = x || 0;
        this.y = y || 0;
    };
}

class Player extends Schema{
    @type('number')
    x = 0;

    @type('number')
    y = 0;
}

class State extends Schema{
    @type({ map: Player })
    players = new MapSchema<Player>();

    createPlayer(id: string){
        this.players [ id ] = new Player();
        console.log(this.players)
    }

    removePlayer(id: string){
        delete this.players [ id ];
    }

    movePlayer(id: string, dir: Vector2){
        if (dir.x){
            this.players[ id ].x += dir.x
        }else{
            this.players[ id ].y += dir.y            
        } 
    }
}

export class MyRoom extends Room<State> {
    // When room is initialized
    onCreate (options: any) { 
        console.log("MyRoom created!", options);

        // Initialize the state
        this.setState(new State());

        // On 'move' message
        this.onMessage('move', (client, data) => {
            const V2 = new Vector2(data.x, data.y);
            console.log(V2);
            
            this.state.movePlayer(client.sessionId, V2)
        })
    }

    onJoin (client: Client, options: any, auth: any) { 
        console.log(`${client.sessionId} Just entered the room.`);
        this.state.createPlayer(client.sessionId);
    }

    onLeave(client: Client){
        this.state.removePlayer(client.sessionId);
        console.log(client.sessionId + ' Just left the room.');
        
    };

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }
}