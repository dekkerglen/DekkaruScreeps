const actions = require('./actions')
const {buildWithEqualRations, getUniqueName} = require('util');
const construction = require('./construction');

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

        // if there are construction sites (excluding walls and ramparts, builders will take care of those), we build
        if(creep.room.find(FIND_CONSTRUCTION_SITES).filter((s) => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART).length > 0 ) {
          return actions.build(creep);
        }

        // otherwise we'll transfer to a tower
        actions.transferTower(creep);
      } else {
        actions.mine(creep);
      }
  },
  build: (spawn, energy) => spawn.spawnCreep(buildWithEqualRations(energy,[WORK,CARRY,MOVE]), getUniqueName(role), {memory:{ role, working: false}}),
  role
};