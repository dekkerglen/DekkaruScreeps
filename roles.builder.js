const actions = require('./actions')
const {buildWithEqualRations, getUniqueName} = require('util');

const role = 'builder';

module.exports = {
  run: (creep) => {
      if (creep.memory.working && creep.carry.energy == 0) {
          creep.memory.working = false;
      } else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
          creep.memory.working = true;
      }

      if (creep.memory.working) {
        // if there are any wall or ramparts with less than one percent, we must repair those
        // this is important so we don't build a rampart or wall and have it decay immediately 
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits / s.hitsMax < 0.01
        });

        if(target) {
          actions.repairWalls(creep);
        } else {
          actions.build(creep);
        }       

      } else {
        actions.mine(creep);
      }
  },
  build: (spawn, energy) => spawn.spawnCreep(buildWithEqualRations(energy,[WORK,CARRY,MOVE]), getUniqueName(role), {memory:{ role, working: false}}),
  role
};