import noUiSlider from 'nouislider';

var slider = document.querySelector('.filters__range');

noUiSlider.create(slider, {
  start: [1200, 4000],
  tooltips: true,
  connect: true,
  range: {
      'min': 0,
      'max': 5000
  },
  // pips: {
  //   mode: 'values',
  //   values: [1000, 2000, 3000, 4000],
  //   density: 4
  // }
});