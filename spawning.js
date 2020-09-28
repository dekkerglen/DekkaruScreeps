
const roles = {
  upgrader: require('roles.upgrader'),
  builder: require('roles.builder'),
  worker: require('roles.worker'),
  mason: require('roles.mason')
}

const buildOrder = [
    {
        creep: roles.worker,
        amount: 1,
    },
    {
        creep: roles.upgrader,
        amount: 1,
    },
    {
        creep: roles.worker,
        amount: 5,
    },
    {
        creep: roles.builder,
        amount: 2,
    },
    {
        creep: roles.mason,
        amount: 1,
    },
    {
        creep: roles.worker,
        amount: 4, //TODO: make this scale off of how many WORK parts per creep, based on how much energy output the room has
    },
]

const spawnNext = (room, counts) => {
  if(room.energyAvailable >= room.energyCapacityAvailable) {
    const spawns = room.find(FIND_MY_SPAWNS, {
        filter: (object) => !object.spawning
    });
    if(spawns.length > 0) {
      const spawn = spawns[0];
      for(const phase of buildOrder) {
          if((counts[phase.creep.role] || 0) < phase.amount) {
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
}

module.exports = {
  spawnNext
}