function initStage() {
  const mapContainer = $('#map');
  mapContainer.height($(this).height() - $('.controls').height() - 60);
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

  $(window).resize(function () {
    $('#map').height($(this).height() - $('.controls').height() - 60);

    window.map.stage.size({
      width: mapContainer.width(),
      height: mapContainer.height()
    });
  });
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

    circle.on('click', function () {
      if (this.getAttr('selectStatus')) {
        this.setAttr('selectStatus', false);
        this.fill(color.roomFill);
      } else {
        this.setAttr('selectStatus', true);
        this.fill(color.completedRoom);
      }
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
  const newState = !window.map.attributes.lockPanZoom;
  window.map.attributes.lockPanZoom = newState;
  window.map.stage.draggable(newState);
  if (newState) {
    $('.controls__lock-pan button').html('Lock Pan/Zoom');
  } else {
    $('.controls__lock-pan button').html('Unlock Pan/Zoom');
  }
}
