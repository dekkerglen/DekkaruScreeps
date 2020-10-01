
const {buildWithEqualRations} = require('util');

const roles = {
  upgrader: require('roles.upgrader'),
  builder: require('roles.builder'),
  worker: require('roles.worker'),
}

const buildOrder = [
    {
        creep: roles.worker,
        amount: () => 1,
    },
    {
        creep: roles.upgrader,
        amount: () => 1,
    },
    {
        creep: roles.worker,
        amount: () => 2,
    },
    {
        creep: roles.builder,
        amount: (room) => { // we only want 1 if there is nothing we need to build
          const sites = room.find(FIND_CONSTRUCTION_SITES);
          if(sites.length > 0) {
            return 2;
          }
           return 1;
        },
    },
    {
        creep: roles.worker,
        amount: (room) => numHarvesters(room) - 4, // to limit our workers so we don't over harvest energy
    },
]

const numHarvesters = (room) => {
  // calculate how many work parts we can make on a creep
  const workParts = buildWithEqualRations(room.energyCapacityAvailable,[WORK,CARRY,MOVE]).filter((item) => item == WORK).length;
  const generationCapacity = room.find(FIND_SOURCES).map((source) => source.energyCapacity).reduce((a, b) => a + b, 0) / 300; // takes 300 ticks to regen
  
  // if a third of our workers are harvesting at a time, we should aim for 100% utilization of capacity
  // each workpart takes 2 energy a tick
  return 3 * Math.ceil(generationCapacity / (workParts * 2));
}

const spawnNext = (room, counts) => {
  if(room.energyAvailable >= room.energyCapacityAvailable || (room.energyAvailable >= 300 && room.find(FIND_MY_CREEPS).length == 0)) {
    const spawns = room.find(FIND_MY_SPAWNS, {
        filter: (object) => !object.spawning
    });
    if(spawns.length > 0) {
      const spawn = spawns[0];
      for(const phase of buildOrder) {
          if((counts[phase.creep.role] || 0) < phase.amount(room)) {
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