const actions = require('./actions')
const {buildWithEqualRations, getUniqueName} = require('util');

const role = 'upgrader';

module.exports = {
  run: (creep) => {
      // turn into a worker if we don't have any left
      if(creep.room.find(FIND_MY_CREEPS).filter((item) => item.memory.role == 'worker') == 0) {
        creep.memory.role == 'worker'
      }
      
      if (creep.memory.working && creep.carry.energy == 0) {
          creep.memory.working = false;
      } else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
          creep.memory.working = true;
      }

      if (creep.memory.working) {
        actions.upgrade(creep);
      } else {
        actions.mine(creep);
      }
  },
  build: (spawn, energy) => spawn.spawnCreep(buildWithEqualRations(energy,[WORK,CARRY,MOVE]), getUniqueName(role), {memory:{ role, working: false}}),
  role
};