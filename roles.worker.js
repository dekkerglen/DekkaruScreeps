const actions = require('./actions')
const {buildWithEqualRations, getUniqueName} = require('util');

const role = 'worker';

module.exports = {
  run: (creep) => {
      if (creep.memory.working && creep.carry.energy == 0) {
          creep.memory.working = false;
      } else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
          creep.memory.working = true;
      }

      if (creep.memory.working) {
        // if we are less than our energy cap, we collect        
        if(creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
          return actions.collect(creep);
        }

        // if there are construction sites, we build
        if(creep.room.find(FIND_CONSTRUCTION_SITES).length > 0 ) {
          return actions.build(creep);
        }

        // otherwise we'll upgrade
        actions.upgrade(creep);
      } else {
        actions.mine(creep);
      }
  },
  build: (spawn, energy) => spawn.spawnCreep(buildWithEqualRations(energy,[WORK,CARRY,MOVE]), getUniqueName(role), {memory:{ role, working: false}}),
  role
};