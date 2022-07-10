const socket = io();
//'https://nameless-inlet-82361.herokuapp.com/'
const chatbox = document.getElementById('chatbox')
const msgbox = document.getElementById('msg')
const leave = document.getElementById('leave')
const room_display = document.getElementById('room_display')
const game_container = document.getElementById('game_container')
const {user_name,room_number} = Qs.parse(location.search, {ignoreQueryPrefix: true}) //{ignore}
// IMPORTANT: variable above needs to have the same 'name' of the input in html tags
console.log(user_name,room_number)

if(user_name == null || room_number == null||user_name == 0|| room_number == 0 ){
    confirm ('you did not enter name or room number')
    window.location = 'gate.html'

}

socket.emit('join_room',{user_name,room_number})


socket.on('make_host',()=>{
    make_start()
})

socket.on('show_room_number', (room_number)=>{
    room_display.innerText = 'Room: ' + room_number
})

socket.on('message', ( full_msg ) => {
    console.log('message');
    display_msg(full_msg);
});

//display game_container when game starts
socket.on('everyone_game_start',()=>{
    socket.emit('confirm_game_start')
    document.getElementById('game_container').style.display = 'inline'
    document.getElementById('main_container').style.display = 'none'
})

socket.on('lose',()=>{
    window.location = 'gate.html'
})

//update game screen per frame
socket.on('paint_game',(room)=>{
    paint_game(room)
})

//DOCUMENT EVENT LISTENERS-----------------
chatbox.addEventListener('submit', (e)=>{
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    msgbox.value = "";
    socket.emit("send_message",msg);
} )

leave.onclick = function(){
    const want_to_leave = confirm('Are you sure you want to leave?')
    if (want_to_leave){
        window.location = 'gate.html'
    }
}


//get player action
document.addEventListener("keydown",function(e){
    //must be var not const as key property has to be updated later on 
    var key = 0
    if (e.key == "ArrowLeft"){
        key = 1
        //$('.player').css("left",count +"px") 
    
    }
    else if (e.key == "ArrowRight"){
        key = 2
        //$('.player').css("left",count +"px") 
    
    }
    else if (e.key == "ArrowUp"){
        key = 3
        //$('.player').css("left",count +"px") 
    
    }
    else if(e.key == "ArrowDown"){
        key = 4
        //$('.player').css("left",count +"px") 
    
    }

    //fire bullet on spacebar
    else if(e.key == " "){
        key = 5
    }

    socket.emit('keydown',key)
    console.log('key emitted')
})









function display_msg(msg,user_name){
   const div = document.createElement('div');
   div.classList.add('message');
   div.innerText = msg;
   document.getElementById('chat_display').appendChild(div);
}

function make_start(){
    const button = document.createElement('button');
    button.id = 'start'
    button.innerText = 'Start game';
    document.getElementById('main_container').appendChild(button);


    //only access start button after it is created otherwise it will be null
    start_button = document.getElementById('start')
    start_button.onclick = function(){
        console.log('start pressed')
        socket.emit('host_game_start')
    }
 }

function paint_game(room){
    console.log(room)
    game_container.innerHTML = ''
    const player_list = room.player_list
    const bullet_list = room.bullet_list
    const monster_list = room.monster_list
    paint_player(player_list)
    paint_bullet(bullet_list)
    paint_monster(monster_list)
}



///////Functions for processing the game objects sent

function paint_player(player_list){
    //make and add element into game container
    for (const key in player_list){
        make_player(player_list[key])
    }
    
}

function paint_bullet(bullet_list){
    //check if list is empty
    if (bullet_list){
        console.log(bullet_list)
        bullet_list.forEach(bullet =>{
            make_bullet(bullet)
        })
    }
    }


function paint_monster(monster_list){
    if (monster_list){
        monster_list.forEach(monster =>{
            make_monster(monster)
        })
    }

}





///////functions for making html tags
function make_element(tag,class_name){
    const div = document.createElement(tag);
    div.classList.add(class_name);
    game_container.append(div)
}

//general function for making a game element
function make_obj(class_name,x,y){
    const div = document.createElement('div');
    div.classList.add(class_name);
    div.style.left = x + 'px'
    div.style.top = y + 'px'
    game_container.append(div)
}

function make_player(player){
    make_obj('player',player.x,player.y)
}

function make_bullet(bullet){
    make_obj('bullet',bullet.x,bullet.y)
}

function make_monster(monster){
    make_obj('monster',monster.x,monster.y)
}