//manage rooms
const unit = 4

const room_list = new Map()
const user_list = new Map()

//called when host starts game 
function add_game_room(room_id){
    var bullet_list = []
    const player_list = {}
    const monster_list = []
    const game_state = 1
    const room = {bullet_list,player_list,monster_list,game_state}
    room_list.set(room_id,room)
}

function remove_game_room(room_id){
    if (room_list.has(room_id)){
        room_list.delete(room_id)
    }
    
}

//REEEEE maps cant use [] to access values while obj can
function get_game_room(room_id){
    if (room_list.has(room_id)){
        return room_list.get(room_id)
    }
    
}

function remove_player_from_room(room_obj,socket_id){
    delete room_obj.player_list[socket_id]
}

var counter = 0
function process_all_room(){

    counter += 1

    //loop through rooms
    //take note of key words of and in
    for(const [key,room] of room_list.entries()){
        //loop through player list of room obj and modify its position
        const player_list = room.player_list
        
        for(const key in player_list){
            const player = player_list[key]
            process_player(player,room)
        }

        //loop through bullet list and process it to see if it hits anyone

        const monster_list = room.monster_list

        //this foreach might not be necessary
        room.bullet_list.forEach(check_collision_with_monster)

        function check_collision_with_monster(bullet){

            if(bullet.x > 1200){
                bullet.deleted = 1
            }
            monster_list.forEach( (monster,monster_index) =>{
                

                if ( Math.abs(monster.x - bullet.x) < bullet.range + monster.range ){
                    if( Math.abs(monster.y - bullet.y) < bullet.range + monster.range ){

                        //TWO ways to implement this
                        //1. return when hit -> this means that 1 bullet would only hit one
                        //2.continue looping when hit-> 1 bullet hit multiple monster
                        //bullet_list.splice(index,1) //apparently delete does not delete the key of bullet
                        //bullets_to_remove.push(index)
                        bullet.deleted = 1
                        monster.hp -= 1
                        if (monster.hp == 0){
                            monster_list.splice(monster_index,1)
                        }
                        return true
                    }
                }
            })
            bullet.x += unit*2
            return false
        }

        room.bullet_list = room.bullet_list.filter(bullet=>{
            return !bullet.deleted
        })

        console.log(room.bullet_list)


        //move monsters
        monster_list.forEach(monster=>{
            monster.x -= unit*0.5
            if (monster.x < -1){
                console.log('game state change to false')
                room.game_state = 0
            }
        })

        //loop through monster list very 4 counter
        if (counter%64 == 0){ ///control speed of monster production
            ///const monster_list = room.monster_list
            ///monster_list.forEach(create_monster)
            //^^for later when processing monsters

            //creates monster every few seconds and add to room
            create_monster(room)
        }
//------------------DELETE IF CAN REMOVE ROOM------------
        // if (room.game_state == 0){
        //     //if all players have been removed
        //     if (room.player_list == 0){
        //         delete room_list[room_id]
        //         console.log('remove room')
        //     }
        // }
        
    }
}


////PLAYER FUNCTIONS _________________________________
function create_player(user_id,user_name,room_id){
    //randomise y position on creation
    y = Math.floor(Math.random()*100 )
    x = 10
    key = 0

    const player = {user_name,x,y,key}
    if (room_list.has(room_id)){
        //userid is being used to create the key for playelist
        room_list.get(room_id).player_list[user_id] = player
    }
    
}

function process_player(player,room){
    const player_unit = unit*0.5
    if (player.key == 1){
        player.x -= player_unit
    }
    else if (player.key == 2){
        player.x += player_unit
    }
    else if (player.key == 3){
        player.y -= player_unit
    }
    else if (player.key == 4){
        player.y += player_unit
    }
    else if(player.key == 5){
        console.log('fired')
        //create and add bullet if user press space bar
        create_bullet(player,room)

        //Move key away so player dont keep shooting
        //omg made a stupid mistake of using == instead of = to assign value
        player.key = 0
    }
}


/////////BULLET FUNCTIONS__________________________________________________
//if the function uses inner_global_objects, i cannot treat them as global_objects and just include them in function
//instead i must take in the object first with my functions
function create_bullet(player,room){
    x = player.x + unit
    y = player.y 
    const range = unit
    const deleted = 0
    const bullet = {x,y,range,deleted}
    //add bullet into bullet list of room obj
    room.bullet_list.push(bullet)
}





/////////MONSTER FUNCTIONS__________________________
function create_monster(room){
    const hp = 4
    const x = 400
    const y = Math.floor((Math.random()+1)*200)
    const range = 2*unit
    const monster = {x,y,hp,range}
    room.monster_list.push(monster)
}


function add_user(id,user_name,room){
    const user = {user_name,room}
    user_list.set(id,user)
}

function get_user(id){
    return user_list.get(id)
}

module.exports = {
    add_game_room,
    remove_game_room,
    get_game_room,
    remove_player_from_room,
    add_user,
    get_user,
    create_player,
    process_all_room
}

