function getStartConnection(orientation) {
  switch (orientation) {
    case 1: // E
      return {
        x: 1,
        y: 0,
        d: 'h'
      };
    case 2: // S
      return {
        x: 0,
        y: 1,
        d: 'v'
      };
    case 3: // W
      return {
        x: -1,
        y: 0,
        d: 'h'
      };
    default:
      return {
        x: 0,
        y: -1,
        d: 'v'
      };
  }
}

function matchesStartingConnection(x, y, startingConnection) {
  return x === startingConnection.x && y === startingConnection.y;
}

function generateDiamondMap(size, orientation) {
  const startConnection = getStartConnection(orientation);
  const rooms = ((size + 1) ^ 2) / 2;
  const map = {
    width: (size * 2) - 1,
    height: (size * 2) - 1,
    orientation,
    rooms,
    roomList: [],
    connectionList: [],
    startConnection
  };

  const radius = (size - 1) / 2;
  let roomId = 1;
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (Math.abs(x) + Math.abs(y) > radius) {
        continue;
      }

      const cx = x * 2,
        cy = y * 2,
        isEdge = (Math.abs(x) + Math.abs(y) === radius);

      map.roomList.push({
        id: roomId,
        x: cx,
        y: cy
      });

      if ((!isEdge || x < 0) && !matchesStartingConnection(cx + 1, cy, startConnection)) {
        map.connectionList.push({
          x: cx + 1,
          y: cy,
          d: 'h'
        });
      }
      if ((!isEdge || y < 0) && !matchesStartingConnection(cx, cy + 1, startConnection)) {
        map.connectionList.push({
          x: cx,
          y: cy + 1,
          d: 'v'
        });
      }
    }
  }

  return map;
}

function generateSquareMap(size, orientation) {
  const startConnection = getStartConnection(orientation);
  const rooms = size * size;
  const map = {
    width: (size * 2) - 1,
    height: (size * 2) - 1,
    orientation,
    rooms,
    roomList: [],
    connectionList: [],
    startConnection
  };

  const radius = (size - 1) / 2;
  let roomId = 1;
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const cx = x * 2,
        cy = y * 2;

      map.roomList.push({
        id: roomId,
        x: cx,
        y: cy
      });

      if ((x < radius) && !matchesStartingConnection(cx + 1, cy, startConnection)) {
        map.connectionList.push({
          x: cx + 1,
          y: cy,
          d: 'h'
        });
      }
      if ((y < radius) && !matchesStartingConnection(cx, cy + 1, startConnection)) {
        map.connectionList.push({
          x: cx,
          y: cy + 1,
          d: 'v'
        });
      }
    }
  }

  return map;
}

function withinRadius(x, y, radius) {
  return Math.sqrt(x * x + y * y) <= radius;
}

function generateCircleMap(size, orientation) {
  const startConnection = getStartConnection(orientation);
  const rooms = size * size;
  const map = {
    width: (size * 2) - 1,
    height: (size * 2) - 1,
    orientation,
    rooms,
    roomList: [],
    connectionList: [],
    startConnection
  };

  const radius = (size - 1) / 2;
  let roomId = 1;
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const cx = x * 2,
        cy = y * 2;

      if (!withinRadius(x, y, radius)) {
        continue;
      }

      map.roomList.push({
        id: roomId,
        x: cx,
        y: cy
      });

      if (withinRadius(x + 1, y, radius) && !matchesStartingConnection(cx + 1, cy, startConnection)) {
        map.connectionList.push({
          x: cx + 1,
          y: cy,
          d: 'h'
        });
      }
      if (withinRadius(x, y + 1, radius) && !matchesStartingConnection(cx, cy + 1, startConnection)) {
        map.connectionList.push({
          x: cx,
          y: cy + 1,
          d: 'v'
        });
      }
    }
  }

  return map;
}

function withinTriangle(x, y, radius) {
  return (x === 0 || (y >= 2 * Math.abs(x) - radius - 1)) && (y < radius);
}

function generateTriangleMap(size, orientation) {
  const startConnection = getStartConnection(orientation);
  let rooms = 0;
  const map = {
    width: (size * 2) - 1,
    height: (size * 2) + 1,
    orientation,
    rooms,
    roomList: [],
    connectionList: [],
    startConnection
  };

  const radius = (size - 1) / 2;
  let roomId = 1;
  for (let y = -radius - 2; y <= radius - 1; y++) {
    for (let x = -radius; x <= radius; x++) {
      const cx = x * 2,
        cy = y * 2;

      if (!withinTriangle(x, y, radius)) {
        continue;
      }

      map.roomList.push({
        id: roomId,
        x: cx,
        y: cy
      });
      rooms++;

      if (withinTriangle(x + 1, y, radius) && !matchesStartingConnection(cx + 1, cy, startConnection)) {
        map.connectionList.push({
          x: cx + 1,
          y: cy,
          d: 'h'
        });
      }
      if (withinTriangle(x, y + 1, radius) && !matchesStartingConnection(cx, cy + 1, startConnection)) {
        map.connectionList.push({
          x: cx,
          y: cy + 1,
          d: 'v'
        });
      }
    }
  }

  map.rooms = rooms;

  return map;
}

/**
 * @param {string} shape - diamond, square, circle, triangle
 * @param {number} size - diameter
 * @param {number} orientation - direction of the starting room exit (0 - north, 1 - east, 2 - south, 3 - west)
 * @return {object}
 */
export function generateMap(shape, size, orientation) {
  switch (shape) {
    case 'square':
      return generateSquareMap(size, orientation);
    case 'circle':
      return generateCircleMap(size, orientation);
    case 'triangle':
      return generateTriangleMap(size, orientation);
    default:
      return generateDiamondMap(size, orientation);
  }
}
