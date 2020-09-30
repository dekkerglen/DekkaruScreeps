const act = (room, tower) => {
  console.log('controlling tower');

  // attack
  const hostiles = Game.rooms[myRoomName].find(FIND_HOSTILE_CREEPS);

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
  if(tower.getUsedCapacity(RESOURCE_ENERGY) > tower.getFreeCapacity(RESOURCE_ENERGY)) {
    let damaged = room.find(FIND_STRUCTURES, {
      filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
    }).sort((a, b) => {
      const aHits = a.hitsMax / a.hits;
      const bHits = b.hitsMax / b.hits; 
      if (aHits < bHits) {
        return -1;
      } else if (bHits > aHits) {
        return 1;
      } else {
        return 0;
      }
    });

    if(damaged.length > 0) {
      return tower.repair(damaged[0]);
    }

    damaged = room.find(FIND_STRUCTURES).sort((a, b) => {
      const aHits = a.hitsMax / a.hits;
      const bHits = b.hitsMax / b.hits; 
      if (aHits < bHits) {
        return -1;
      } else if (bHits > aHits) {
        return 1;
      } else {
        return 0;
      }
    });

    if(damaged.length > 0) {
      return tower.repair(damaged[0]);
    }
  }
}

module.exports = {
  act
}