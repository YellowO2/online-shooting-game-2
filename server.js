const path = require('path');
const express = require('express');

const {add_game_room,remove_game_room,add_user,get_user, create_player,get_game_room,process_all_room} = require('./utils/user')

const app = express();
const http = require("http").createServer(app);
const io = require('socket.io')(http);


app.use(express.static('./public'))


//const app = express();
// const httpServer = http.createServer();
// const io = new socketio.Server(httpServer, {
//     cors: {
//         allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
//         exposedHeaders: ["authorization"], // you can change the headers
//         origin: "*",
//         methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//         preflightContinue: false
//     },
//   });
//allow other servers to access
// app.use(
// cors({
//     allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
//     exposedHeaders: ["authorization"], // you can change the headers
//     origin: "*",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     preflightContinue: false
//   })
// )

// //this sets static folders as middle ware to connect to server
// app.use('/api', createProxyMiddleware({ target: 'https://unrivaled-dasik-33d573.netlify.app', changeOrigin: true }));
// //../public
// //https://unrivaled-dasik-33d573.netlify.app


//run when client connects
io.on('connection', socket => {
    console.log('new connection');

    var my_interval
    
    //when client joins a room from gate.html, pass the username and room_no.
    socket.on('join_room', ( {user_name,room_number} )=>{
        //Forces disconnect if user did not enter username or room number
        if (user_name == null || room_number == null||user_name == 0|| room_number == 0 ){
            socket.disconnect()
        }

        console.log(user_name,room_number)
        //add user into userlist
        add_user(socket.id,user_name,room_number)

        //let user join room
        socket.join(room_number)

        //check if user is the first person to join room
        if(io.sockets.adapter.rooms.get(room_number).size == 1){
            //let first person be host
            socket.emit('make_host')

            //create room object and store it in room_list
            add_game_room(room_number)
        }

        //create player object and add to the room object, this must be done after the room object is created
        create_player(socket.id,user_name,room_number)

        socket.emit('show_room_number',room_number)
        //socket.broadcast.emit is for everybody except you
        //tell everybody in room that user joined
        socket.broadcast.to(room_number).emit('message', user_name + ' has joined the lobby')

        //when a user sends massage broadcast it to everyone in room
        socket.on('send_message', msg => {
            var full_msg = user_name + ': ' + msg
            io.to(room_number).emit('message',full_msg)
        })

        //When everyone joined and game can be started
        socket.on('host_game_start',()=>{
            //only using Host_game_start to loop game will cause everyone to break if host disconnects
            //therefore i need a everyone_game_start function when host starts game
            console.log('start game for room' + room_number)
            io.to(room_number).emit('everyone_game_start')
        })

        //makes everyone in room go into game loop
        socket.on('confirm_game_start',()=>{
            //get player object
            const player = get_game_room(room_number).player_list[socket.id]

            my_interval = setInterval(() => {
                const room = get_game_room(room_number)
                if(room.game_state == 0){
                    socket.emit('lose')
                }
                //send the state of room over to client
                socket.emit('paint_game',room )
            }, 50);
            

            socket.on('keydown',(key)=>{
                player.key = key
            })
        })

    })


    

    socket.on('disconnect',()=> {
        if (get_user(socket.id)){
            clearInterval(my_interval)
            const user_name = get_user(socket.id).user_name
            console.log(user_name+' left')
            io.emit('message',user_name +  " has left the lobby") //io emit means everybody

            //get room of user and remove it
            const room_id = get_user(socket.id).room
            remove_game_room(room_id)
        }
        
    })


});

//one gameLoop for everyone, everyone shares one game loop
setInterval(() => {
    //might have to add delay within the function to make bullet speed faster than player
    // or i can increase the range and speed of bullet together such that it covers for increase of speed
    process_all_room()
}, 50);


const PORT = process.env.PORT || 5000 ;

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
