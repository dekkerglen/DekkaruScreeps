const construction = require('construction')
const spawning = require('spawning')
const towerControl = require('tower')

const roles = {
    upgrader: require('roles.upgrader'),
    builder: require('roles.builder'),
    worker: require('roles.worker'),
}  
  
module.exports.loop = () => {
    // cleanup dead creeps
    for (const name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }

    // update each room we have a controller inz
    for(const key in Game.rooms ) {
        const room = Game.rooms[key];
        if(room.controller.my) {
            update(room);
        }
    }
};

const update = (room) => {
    // move creeps in this room
    counts = {};
    for (const [name,creep] of Object.entries(Game.creeps)) {
        if(creep.room.name == room.name) {
            roles[creep.memory.role].run(creep);

            if(!counts[creep.memory.role]) {
                counts[creep.memory.role] = 0;
            }
            counts[creep.memory.role]++;
        }
    }

    const towers = room.find(FIND_MY_STRUCTURES,{
        filter: (s) => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });

    for(const tower of towers) {
        towerControl.act(room, tower);
    }

    // spawn new creeps in this room
    spawning.spawnNext(room, counts);

    // lay down construction sites in this room
    construction.buildSites(room);
}
