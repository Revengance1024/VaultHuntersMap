function initStage() {
  const mapContainer = $('#map');
  window.mapStage = new Konva.Stage({
    container: 'map',
    width: mapContainer.width(),
    height: mapContainer.height(),
    draggable: true
  });

  const scaleBy = 1.1;
  window.mapStage.on('wheel', function (event) {
    event.evt.preventDefault();

    const oldScale = this.scaleX();
    const pointer = this.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - this.x()) / oldScale,
      y: (pointer.y - this.y()) / oldScale,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = ((event.evt.deltaY > 0) ^ window.mapAttributes.invertZoom) ? 1 : -1;

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
    window.mapStage.size({
      width: mapContainer.width(),
      height: mapContainer.height()
    });
    centerMap();
  });
}

function drawMap() {
  const shape = window.mapAttributes.shape;
  const size = window.mapAttributes.size;
  const direction = window.mapAttributes.direction;

  const map = generateMap(shape, size, direction);

  renderMap(map, window.mapStage);
}

function centerMap() {
  window.mapStage.x(window.mapStage.width() / 2);
  window.mapStage.y(window.mapStage.height() / 2);
}

function renderMap(map, stage) {
  const gridSize = 20,
    connectionWidth = 4,
    connectionLength = gridSize;

  centerMap();
  window.mapStage.destroyChildren();

  const roomLayer = new Konva.Layer();

  for (let i = 0; i < map.connectionList.length; i++) {
    const connection = map.connectionList[i];

    const rect = new Konva.Rect({
      fill: 'red'
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

    roomLayer.add(rect);
  }

  const startRect = new Konva.Rect({
    fill: 'orange'
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
  roomLayer.add(startRect);

  for (let i = 0; i < map.roomList.length; i++) {
    const room = map.roomList[i];

    const circle = new Konva.Circle({
      x: room.x * gridSize,
      y: room.y * gridSize,
      radius: gridSize / 2,
      stroke: 'cyan',
      strokeWidth: 2,
      selectStatus: false
    });

    circle.on('click', function (event) {
      if (this.getAttr('selectStatus')) {
        this.setAttr('selectStatus', false);
        this.fill('white');
      } else {
        this.setAttr('selectStatus', true);
        this.fill('red');
      }
    });

    roomLayer.add(circle);
  }

  stage.add(roomLayer);
}
