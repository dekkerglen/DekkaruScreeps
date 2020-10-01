const act = (room, tower) => {
  // attack
  const hostiles = room.find(FIND_HOSTILE_CREEPS);

  //if there are hostiles - attack them    
  if(hostiles.length > 0) {
      Game.notify(`User ${hostiles[0].owner.username} spotted in room ${room.name}`);
      return tower.attack(hostiles[0]);
  }

  // heal
  for (const [name,creep] of Object.entries(Game.creeps)) {
    if(creep.room.name == room.name) {
      if (creep.hits < creep.hitsMax) {
          return tower.heal(creep);
      }
    }
  }  

  // repair
  if(tower.store.getUsedCapacity(RESOURCE_ENERGY) > tower.store.getFreeCapacity(RESOURCE_ENERGY)) {
    let damaged = getMostDamaged(room.find(FIND_STRUCTURES, {
      filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
    }));


    if(damaged) {
      return tower.repair(damaged);
    }

    damaged = getMostDamaged(room.find(FIND_STRUCTURES, {
      filter: (s) => s.hits < s.hitsMax && (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)
    }));

    if(damaged) {
      return tower.repair(damaged);
    }
  }
}

const getMostDamaged = (list) => {
  let most = null;

  for(const item of list) {
    if(!most || (most.hits / most.hitsMax > item.hits / item.hitsMax)) {
      most = item;
    }
  }

  return most;
}

module.exports = {
  act
}