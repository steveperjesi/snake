requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        moment: 'moment.min'
    }
});


requirejs(['underscore-min'], function (_, $) {
  requirejs(['app/main']);
});

// require(['moment'], function(moment) {
//   console.log(moment().format('dddd, MMMM Do YYYY, h:mm:ss a'));
// });

