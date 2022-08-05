(function () {
  window.addEventListener('load', function(event) {
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
    initStage();
    drawMap();

    $('[name="direction"]').change(function () {
      window.map.attributes.direction = parseInt($(this).val());
      drawMap();
    });
    $('[name="size"]').change(function () {
      window.map.attributes.size = parseInt($(this).val());
      drawMap();
    });
    $('[name="shape"]').change(function () {
      window.map.attributes.shape = $(this).val();
      drawMap();
    });
  });
})();
