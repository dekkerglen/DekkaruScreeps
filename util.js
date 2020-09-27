const {partCosts} = require('constants') 

const buildWithEqualRations = (energy, parts) => {
  const res = [];

  let done = false;
  let cost = 0;
  while(!done) {
    done = true;
    for(const part of parts) {
      if(cost + partCosts[part] <= energy) {
        res.push(part);
        done = false;
        cost += partCosts[part];
      }
    }
  }
  res.sort();
  return res;
}

const getUniqueName = (name) => {
  let i = 0;
  while(Game.creeps[`${name}${i}`]) {
    i++;
  }
  return `${name}${i}`;
}

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

const getSpiralAroundSpot = (x, y, room, index) => {
  let direction = RIGHT;
  let distance = 1;
  let amount = 0;

  const current = {
    x,
    y:y-1,
    room: room.name
  }

  for(let i = 0; i < index; i++) {
    switch(direction) {
      case UP:
        current.y--;
        break;
      case DOWN:
        current.y++;
        break;
      case LEFT:
        current.x--;
        break;
      case RIGHT:
        current.x++;
        break;
    }

    amount ++;
    if(amount >= distance) {
      amount = 0;
      switch(direction) {
        case UP:
          direction = RIGHT;
          break;
        case DOWN:
          direction = LEFT;
          break;
        case LEFT:
          distance++;
          direction = UP;
          break;
        case RIGHT:
          distance++;
          direction = DOWN;
          break;
      }
    }
  }

  return current;
}

const distance = (pos1, pos2) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y-pos2.y);;
}

const getPositionsAround = (terrain, pos) => {
  const res = [];

  for(let x = 0; x < 3; x++) {
    for(let y = 0; y < 3; y++) {
      if(!(y == 1 && x == 1)) {
        if(terrain.get(pos.x - 1 + x,pos.y - 1 + y) != 1) {
          res.push({x: pos.x - 1 + x, y: pos.y - 1 + y});
        }
      }
    }
  }

  return res;
}

const getOrthogonalPositionsAround = (terrain, pos) => {
  const res = [];

  if(terrain.get(pos.x - 1,pos.y) != 1) {
    res.push({x: pos.x - 1, y: pos.y});
  }
  if(terrain.get(pos.x + 1,pos.y) != 1) {
    res.push({x: pos.x + 1, y: pos.y});
  }
  if(terrain.get(pos.x, pos.y + 1) != 1) {
    res.push({x: pos.x, y: pos.y + 1});
  }
  if(terrain.get(pos.x,pos.y - 1) != 1) {
    res.push({x: pos.x, y: pos.y - 1});
  }

  return res;
}

const groupConsecutivePos = (posList) => {
  const res = [];
  let current = [];

  for(const pos of posList) {
    // if this is too far from the last entry, we push current list to result, and create a new list
    if(current.length > 0 && distance(pos, current[current.length-1]) > 1) {
      res.push(current);
      current = [];
    }
    current.push(pos);
  }

  // push remaining group to result]
  if(current.length > 0) {
    res.push(current);
  }

  return res;
}

module.exports = {
  buildWithEqualRations,
  getUniqueName,
  getSpiralAroundSpot,
  distance,
  getPositionsAround,
  getOrthogonalPositionsAround,
  groupConsecutivePos
} 