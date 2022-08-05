import * as Map from './map.js';

(function () {
  window.addEventListener('load', function (event) {
    window.map = {};
    window.map.attributes = {
      direction: 0,
      size: 7,
      shape: 'diamond',
      invertZoom: true,
      lockPanZoom: false,
      color: {
        start: '#32322c',
        connection: '#13c4a3',
        background: '#d9fcf5',
        room: '#39a0ed',
        roomFill: '#fafafa',
        completedRoom: '#435475'
      }
    };
    Map.initStage();
    Map.drawMap();
    Map.renderUI();

    $('[name="direction"]').change(function () {
      window.map.attributes.direction = parseInt($(this).val());
      Map.drawMap();
    });
    $('[name="size"]').change(function () {
      window.map.attributes.size = parseInt($(this).val());
      Map.drawMap();
    });
    $('[name="shape"]').change(function () {
      window.map.attributes.shape = $(this).val();
      Map.drawMap();
    });
    $('[name="lock_pan"]').on('click', Map.toggleLockPanZoom);
    $('[name="reset"]').on('click', Map.clearMapSelection);
  });
})();
