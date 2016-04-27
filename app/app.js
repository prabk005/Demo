'use strict';

var myApp = angular.module('myApp', []);

// Service Call to make http call to JSON file
myApp.service("myService", function($http, $q){
    //define defered promise interface
    var deferred = $q.defer();
    $http.get('../data/demo.json').then(function(data) {
        // defer promise
        deferred.resolve(data);
    });
    this.getTeams = function(){
        // return promise
        return deferred.promise;
    };
});

// Main controller for all the graphs
myApp.controller('mainController', function($scope, $http, myService) {
  // get data from myService
  var promise = myService.getTeams();

  promise.then(function(response) {
    // define variable for data arrays
    var logretData = [];
    var logretBenchmarkData = [];
    var notationalData = [];
    var accountData = [];

    // $scope variable for JSON data
    $scope.data = response.data;
    console.log("DATA:", $scope.data);

    // SQL query used to group timeseries data
    // Average of logret_daily, logret_daily_benchmark, and notional calculated for each year
    var series = alasql('SELECT YEAR(date) AS date, AVG(logret_daily) AS logret_daily, AVG(logret_daily_benchmark) as logret_daily_benchmark, ROUND(AVG(notional),0) as notional \
    FROM ? \
    GROUP BY date \
    ORDER BY date ASC',[$scope.data.timeseries]);
    var seriesData = series;

    // Series data grouped into years
    var timeSeries = alasql('SELECT date, ROUND(AVG(logret_daily),5) AS logret_daily, ROUND(AVG(logret_daily_benchmark),5) as logret_daily_benchmark, ROUND(AVG(notional),0) as notional \
    FROM ? \
    GROUP BY date \
    ORDER BY date ASC',[seriesData]);
    console.log(JSON.stringify(timeSeries));

    // Data pushed to arrays which will serve as datapoints for x-axis and y-axis
    for (var i = 0; i < timeSeries.length; i++){
      // datapoints for Daily Logret
      logretData.push({
        x: timeSeries[i].date,
        y: timeSeries[i].logret_daily
      });
      // datapoints for Daily Benchmark Log
      logretBenchmarkData.push({
        x: timeSeries[i].date,
        y: timeSeries[i].logret_daily_benchmark
      });
      // datapoints for notational
      notationalData.push({
        x: timeSeries[i].date,
        y: timeSeries[i].notional
      });
    };

    // Run for loop to set datapoints for Schwab Brokerage account
    for (var i = 0; i < $scope.data.account_positions[0].positions.length; i++){
      accountData.push({
        x: $scope.data.account_positions[0].positions[i].shares,
        y: $scope.data.account_positions[0].positions[i].price
      });
    };

    // define the timeseries graph to element with id = "timeseries"
    var timeSeriesChart = new CanvasJS.Chart("timeSeries", {
      theme: "theme2", // Set to theme 1
      title:{
        text: "Time Series" //set title for the graph
      },
      axisX:{
        title: "Year",  // title for the x-axis
        valueFormatString: "####", //format text for years
      },
      animationEnabled: true,   //set to animate graph
      toolTip: {
        shared: true,
        content: function(e){
          var body = new String;
          var head ;
          // set content for hover display window
          for (var i = 0; i < e.entries.length; i++){
            var  str = "<span style= 'color:"+e.entries[i].dataSeries.color + "'> " + e.entries[i].dataSeries.name +
            "</span>: <strong>"+  e.entries[i].dataPoint.y + "</strong>'' <br/>" ;
            body = body.concat(str);
          }
          head = "<span style = 'color:red; '><strong>Year: "+ (e.entries[0].dataPoint.x) + "</strong></span><br/>";
          return (head.concat(body));
        }
      },
      data: [
        {
          type: "spline",         //show spline graph - other options --> line, area, column, pie, etc
          name: "Daily Logret",   //data for the first line
          showInLegend: true,     //show name of the data under the graph
          dataPoints: logretData  //data points for x and y axis
        },
        {
          type: "spline",
          name: "Daily Benchmark Logret",
          showInLegend: true,
          dataPoints: logretBenchmarkData
        }
      ]
    });
    timeSeriesChart.render();

    var notionalChart = new CanvasJS.Chart("notional", {
      theme: "theme1",
      title:{
        text: "Average Yearly Notional"
      },
      axisX:{
        title: "Year",
        valueFormatString: "####",
      },
      animationEnabled: true,
      toolTip: {
        shared: true,
        content: function(e){
          var body = new String;
          var head ;
          for (var i = 0; i < e.entries.length; i++){
            var  str = "<span style= 'color:"+e.entries[i].dataSeries.color + "'> " + e.entries[i].dataSeries.name +
            "</span>: <strong>"+  e.entries[i].dataPoint.y + "</strong>'' <br/>" ;
            body = body.concat(str);
          }
          head = "<span style = 'color:red; '><strong>Year: "+ (e.entries[0].dataPoint.x) + "</strong></span><br/>";
          return (head.concat(body));
        }
      },
      data: [
        {
          type: "column",
          name: "notational",
          dataPoints: notationalData
        }
      ]
    });
    notionalChart.render();

    var accountChart = new CanvasJS.Chart("account", {
      theme: "theme3",
      title:{
        text: "Schwab Brokerage Account Positions"
      },
      axisX:{
        title: "Shares",
      },
      axisY:{
        title: "Price",
        valueFormatString:  "#,##0.##", // formatting for currency
        prefix: "$"  // currency prefix
      },
      animationEnabled: true,
      toolTip: {
        shared: true,
        content: function(e){
          var body = new String;
          var head ;
          for (var i = 0; i < e.entries.length; i++){
            var  str = "<span style= 'color:"+e.entries[i].dataSeries.color + "'> " + e.entries[i].dataSeries.name +
            "</span>: <strong>"+  e.entries[i].dataPoint.y + "</strong>'' <br/>" ;
            body = body.concat(str);
          }
          head = "<span style = 'color:red; '><strong>Year: "+ (e.entries[0].dataPoint.x) + "</strong></span><br/>";
          return (head.concat(body));
        }
      },
      data: [
        {
          type: "area",
          name: "notational",
          dataPoints: accountData
        }
      ]
    });
    accountChart.render();
  });
});
