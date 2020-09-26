
const roles = {
  harvester: require('roles.harvester'),
  upgrader: require('roles.upgrader'),
  builder: require('roles.builder'),
  worker: require('roles.worker')
}

const buildOrder = [
    {
        creep: roles.worker,
        amount: 1,
        condition: () => true
    },
    {
        creep: roles.upgrader,
        amount: 1,
        condition: () => true
    },
    {
        creep: roles.worker,
        amount: 5,
        condition: () => true
    },
    {
        creep: roles.builder,
        amount: 3,
        condition: (room) => room.find(FIND_CONSTRUCTION_SITES).length > 0 
            || room.find(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
              })
              // we only want to have builders if we have things to build or repair
    },
    {
        creep: roles.worker,
        amount: 10,
        condition: () => true
    },
]

const spawnNext = (room, counts) => {
  if(room.energyAvailable >= room.energyCapacityAvailable) {
    const spawn = room.find(FIND_MY_SPAWNS, {
        filter: (object) => !object.spawning
    })[0];
    for(const phase of buildOrder) {
        if(phase.condition(room) && (counts[phase.creep.role] || 0) < phase.amount) {
          console.log(`trying to spawn ${phase.creep.role}`)
            const res = phase.creep.build(spawn, room.energyAvailable);
            if(res != 0) {
              console.log(`Error spawning: ${res}`);
            }
            return;
        }
    }
  }
}

module.exports = {
  spawnNext
}