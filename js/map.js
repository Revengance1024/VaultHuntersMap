function initStage() {
  const mapContainer = $('#map');
  mapContainer.height($(this).height() - $('.controls').height() - 60);

  Konva.hitOnDragEnabled = true;
  window.map.stage = new Konva.Stage({
    container: 'map',
    width: mapContainer.width(),
    height: mapContainer.height(),
    draggable: !window.map.attributes.lockPanZoom
  });
  window.map.stage.container().style.backgroundColor = '#d9fcf5';

  window.map.connectorLayer = new Konva.Layer();
  window.map.roomLayer = new Konva.Layer();
  window.map.uiLayer = new Konva.Layer();
  window.map.stage.add(window.map.connectorLayer, window.map.roomLayer, window.map.uiLayer);

  const scaleBy = 1.1;
  window.map.stage.on('wheel', function (event) {
    event.evt.preventDefault();

    const oldScale = this.scaleX();
    const pointer = this.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - this.x()) / oldScale,
      y: (pointer.y - this.y()) / oldScale,
    };

    let direction = ((event.evt.deltaY > 0) ^ window.map.attributes.invertZoom) ? 1 : -1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (event.evt.ctrlKey) {
      direction = -direction;
    }

    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    this.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    this.position(newPos);
  });

  function getCenter(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  window.map.stage.on('touchmove', function (e) {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      // if the stage was under Konva's drag&drop
      // we need to stop it, and implement our own pan logic with two pointers
      if (window.map.stage.isDragging()) {
        window.map.stage.stopDrag();
      }

      const p1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      const p2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };

      if (!window.map.lastCenter) {
        window.map.lastCenter = getCenter(p1, p2);
        return;
      }
      const newCenter = getCenter(p1, p2);
      const dist = getDistance(p1, p2);

      if (!window.map.lastDist) {
        window.map.lastDist = dist;
      }

      // local coordinates of center point
      const pointTo = {
        x: (newCenter.x - window.map.stage.x()) / window.map.stage.scaleX(),
        y: (newCenter.y - window.map.stage.y()) / window.map.stage.scaleX(),
      };

      const scale = window.map.stage.scaleX() * (dist / window.map.lastDist);

      window.map.stage.scaleX(scale);
      window.map.stage.scaleY(scale);

      // calculate new position of the stage
      const dx = newCenter.x - window.map.lastCenter.x;
      const dy = newCenter.y - window.map.lastCenter.y;

      const newPos = {
        x: newCenter.x - pointTo.x * scale + dx,
        y: newCenter.y - pointTo.y * scale + dy,
      };

      window.map.stage.position(newPos);

      window.map.lastDist = dist;
      window.map.lastCenter = newCenter;
    }
  });

  window.map.stage.on('touchend', function () {
    window.map.lastDist = 0;
    window.map.lastCenter = null;
  });

  $(window).resize(function () {
    $('#map').height($(this).height() - $('.controls').height() - 60);

    window.map.stage.size({
      width: mapContainer.width(),
      height: mapContainer.height()
    });
  });

  window.map.roomLayer.on('click', toggleRoom);
  window.map.roomLayer.on('tap', toggleRoom);
}

function toggleRoom(evt) {
  const target = evt.target;
  if (target.getAttr('selectStatus')) {
    target.setAttr('selectStatus', false);
    target.fill(window.map.attributes.color.roomFill);
  } else {
    target.setAttr('selectStatus', true);
    target.fill(window.map.attributes.color.completedRoom);
  }
}

function drawMap() {
  const shape = window.map.attributes.shape;
  const size = window.map.attributes.size;
  const direction = window.map.attributes.direction;

  const map = generateMap(shape, size, direction);
  renderMap(map);
}

function centerMap() {
  window.map.stage.x(window.map.stage.width() / 2);
  window.map.stage.y(window.map.stage.height() / 2);
}

function renderMap(map) {
  const color = window.map.attributes.color;
  const gridSize = 20,
    connectionWidth = 4,
    connectionLength = gridSize;

  centerMap();

  window.map.connectorLayer.destroyChildren();
  window.map.roomLayer.destroyChildren();

  for (let i = 0; i < map.connectionList.length; i++) {
    const connection = map.connectionList[i];

    const rect = new Konva.Rect({
      fill: color.connection
    });
    if (connection.d === 'h') {
      rect.x((connection.x * gridSize) - (connectionLength / 2));
      rect.y((connection.y * gridSize) - (connectionWidth / 2));
      rect.width(connectionLength);
      rect.height(connectionWidth);
    } else {
      rect.x((connection.x * gridSize) - (connectionWidth / 2));
      rect.y((connection.y * gridSize) - (connectionLength / 2));
      rect.width(connectionWidth);
      rect.height(connectionLength);
    }

    window.map.connectorLayer.add(rect);
  }

  const startRect = new Konva.Rect({
    fill: color.start
  });
  switch (map.orientation) {
    case 0:
      startRect.setAttrs({
        x: (map.startConnection.x * gridSize) - (connectionWidth / 2),
        y: (map.startConnection.y * gridSize),
        width: connectionWidth,
        height: connectionLength / 2,
      });
      break;
    case 1:

      // noinspection JSSuspiciousNameCombination
      startRect.setAttrs({
        x: (map.startConnection.x * gridSize) - (connectionLength / 2),
        y: (map.startConnection.y * gridSize) - (connectionWidth / 2),
        width: connectionLength / 2,
        height: connectionWidth,
      });
      break;
    case 2:
      startRect.setAttrs({
        x: (map.startConnection.x * gridSize) - (connectionWidth / 2),
        y: (map.startConnection.y * gridSize) - (connectionLength / 2),
        width: connectionWidth,
        height: connectionLength / 2,
      });
      break;
    case 3:
      // noinspection JSSuspiciousNameCombination
      startRect.setAttrs({
        x: (map.startConnection.x * gridSize),
        y: (map.startConnection.y * gridSize) - (connectionWidth / 2),
        width: connectionLength / 2,
        height: connectionWidth,
      });
      break;
  }
  window.map.connectorLayer.add(startRect);

  for (let i = 0; i < map.roomList.length; i++) {
    const room = map.roomList[i];

    const circle = new Konva.Circle({
      x: room.x * gridSize,
      y: room.y * gridSize,
      radius: gridSize / 1.3,
      stroke: color.room,
      strokeWidth: 2,
      fill: color.roomFill,
      selectStatus: false
    });

    window.map.roomLayer.add(circle);
  }
}

function clearMapSelection() {
  window.map.roomLayer.getChildren().forEach((room) => {
    room.fill(window.map.attributes.color.roomFill);
  });
}

function toggleLockPanZoom() {
  const lock = !window.map.attributes.lockPanZoom;
  window.map.attributes.lockPanZoom = lock;
  window.map.stage.draggable(!lock);
  if (lock) {
    $('.controls__lock-pan button').html('Unlock Pan/Zoom');
  } else {
    $('.controls__lock-pan button').html('Lock Pan/Zoom');
  }
}
