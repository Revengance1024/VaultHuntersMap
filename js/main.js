(function () {
  window.addEventListener('load', function(event) {
    window.mapAttributes = {
      direction: 0,
      size: 7,
      shape: 'diamond',
      invertZoom: true
    };
    initStage();
    drawMap();

    $('[name="direction"]').change(function () {
      window.mapAttributes.direction = parseInt($(this).val());
      drawMap();
    });
    $('[name="size"]').change(function () {
      window.mapAttributes.size = parseInt($(this).val());
      drawMap();
    });
    $('[name="shape"]').change(function () {
      window.mapAttributes.shape = $(this).val();
      drawMap();
    });
  });
})();
