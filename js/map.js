import { generateMap } from './mapGenerator.js';

export function initStage() {
  const mapContainer = $('#map');
  mapContainer.height($(window).height() - $('.controls').height() - 60);

  Konva.hitOnDragEnabled = true;
  window.map.stage = new Konva.Stage({
    container: 'map',
    width: mapContainer.width(),
    height: mapContainer.height(),
  });

  window.map.roomLayer = new Konva.Layer();
  window.map.uiLayer = new Konva.Layer();
  window.map.stage.add(window.map.roomLayer, window.map.uiLayer);

  window.map.mapGroup = new Konva.Group({
    draggable: !window.map.attributes.lockPanZoom
  });
  window.map.roomLayer.add(window.map.mapGroup);

  window.map.connectionGroup = new Konva.Group();
  window.map.mapGroup.add(window.map.connectionGroup);
  window.map.roomGroup = new Konva.Group();
  window.map.mapGroup.add(window.map.roomGroup);

  const scaleBy = 1.1;
  window.map.mapGroup.on('wheel', function (event) {
    if (window.map.attributes.lockPanZoom) return;
    event.evt.preventDefault();

    const oldScale = this.scaleX();
    const pointer = window.map.stage.getPointerPosition();

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

  window.map.roomGroup.on('click tap', toggleRoom);
}

export function drawMap() {
  const shape = window.map.attributes.shape;
  const size = window.map.attributes.size;
  const direction = window.map.attributes.direction;

  const map = generateMap(shape, size, direction);
  renderMap(map);
}

function renderMap(map) {
  const color = window.map.attributes.color;
  const gridSize = 20,
    connectionWidth = 4,
    connectionLength = gridSize;


  if (!window.map.attributes.lockPanZoom) {
    centerMap();
  }

  window.map.connectionGroup.destroyChildren();
  window.map.roomGroup.destroyChildren();

  const background = new Konva.Rect({
    fill: color.background,
    x: -10000,
    y: -10000,
    width: 20000,
    height: 20000
  });
  window.map.connectionGroup.add(background);

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

    window.map.connectionGroup.add(rect);
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
  window.map.connectionGroup.add(startRect);

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

    window.map.roomGroup.add(circle);
  }
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

export function centerMap() {
  window.map.mapGroup.x(window.map.stage.width() / 2);
  window.map.mapGroup.y(window.map.stage.height() / 2);
}

export function clearMapSelection() {
  window.map.roomGroup.getChildren().forEach((room) => {
    room.fill(window.map.attributes.color.roomFill);
  });
}

export function toggleLockPanZoom() {
  const lock = !window.map.attributes.lockPanZoom;
  window.map.attributes.lockPanZoom = lock;
  window.map.mapGroup.draggable(!lock);
  if (lock) {
    $('.controls__lock-pan button').html('Unlock Pan/Zoom');
  } else {
    $('.controls__lock-pan button').html('Lock Pan/Zoom');
  }
}

export function renderUI() {
  const zoomInButton = new Konva.Rect({
    width: 48,
    height: 48,
    x: 20,
    y: 20
  });

  const plusIcon = new Image();
  plusIcon.onload = function () {
    zoomInButton.fillPatternImage(plusIcon);
    window.map.uiLayer.add(zoomInButton);
  }
  plusIcon.src = 'img/icon-plus.png';

  zoomInButton.on('click tap', function () {
    if (window.map.attributes.lockPanZoom) return;
    const oldScale = window.map.mapGroup.scale();
    const scaleMulti = 1.2;
    window.map.mapGroup.scale({
      x: oldScale.x * scaleMulti,
      y: oldScale.y * scaleMulti
    });
  });

  const zoomOutButton = new Konva.Rect({
    width: 48,
    height: 48,
    x: 20,
    y: 20 + 48 + 20
  });

  const minusIcon = new Image();
  minusIcon.onload = function () {
    zoomOutButton.fillPatternImage(minusIcon);
    window.map.uiLayer.add(zoomOutButton);
  }
  minusIcon.src = 'img/icon-minus.png';

  zoomOutButton.on('click tap', function () {
    if (window.map.attributes.lockPanZoom) return;
    const oldScale = window.map.mapGroup.scale();
    const scaleMulti = 1.2;
    window.map.mapGroup.scale({
      x: oldScale.x / scaleMulti,
      y: oldScale.y / scaleMulti
    });
  });
}
