var mysql = require("mysql");
var clusterfck = require("clusterfck");
var fs = require('fs');
var args = process.argv.slice(2);

var pi_180 = Math.PI / 180.0;
var pi_4 = Math.PI * 4;

Date.prototype.yyyymmdd = function() {         
  var yyyy = this.getUTCFullYear().toString();                                    
  var mm = (this.getUTCMonth()+1).toString();
  var dd  = this.getUTCDate().toString();             
  return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};  

function average(a) {
  var r = { mean: 0, variance: 0, deviation: 0 };
  var t = a.length;
  var s = 0;
  for (var i = 0; i < t; i++) {
    s += a[i];
  }
  r.mean = s / t;
  for (var i = 0; i < t; i++) {
    r.variance += Math.pow(a[i] - r.mean,2)
  }
  r.variance = r.variance / t;
  r.deviation = Math.sqrt(r.variance);
  return r;  
}    

function radius(xmean, xx, ymean, yy) {
  var r = 0;
  for (var i = 0; i < xx.length; i++) {
    r += (Math.pow(xx[i] - xmean,2) + Math.pow(yy[i] - ymean,2));
  }
  r = Math.sqrt(r);
  return r;
}

function LatLngToPixelXY(latitude, longitude) {
  var sinLatitude = Math.sin(latitude * pi_180);
  var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) /(pi_4)) * 256;
  var pixelX = ((longitude + 180) / 360) * 256;
  var pixel =  { x: pixelX, y: pixelY };
  return pixel;
}


function scale(oldValue, oldMin, oldMax, newMin, newMax) {
  var newValue = ((((oldValue - oldMin) * (newMax - newMin))/(oldMax - oldMin)) + newMin);
  return newValue;
}

function MySQL(config) {
  this.config = config;
  this.query = "";
}

MySQL.prototype.init = function() {
  this.connection = mysql.createConnection(this.config);
  this.connection.connect();
}

MySQL.prototype.close = function() {
  this.connection.end();
}

MySQL.prototype.setQuery = function(startTime,endTime) {
//  this.query = "SELECT * FROM " + this.config.table + " WHERE acq_date >= '" + startTime + "' AND acq_date <= '" + endTime + "' ORDER BY acq_date";
  this.query = "SELECT * FROM " + this.config.table + " WHERE latitude <= -13 and latitude >= -27 and longitude >= 43 and longitude <= 53 and acq_date >= '" + startTime + "' AND acq_date <= '" + endTime + "' ORDER BY acq_date";
  console.log("MySQL query is " + this.query);
}

MySQL.prototype.execQuery = function(callback) {
  var that = this;
  this.connection.query(this.query, function(err, rows, fields) {
    if (err) throw err;
    callback(rows);
  });
}

function KMeans(points, k) {
  this.clusters = clusterfck.kmeans(points, k);
  this.centroids = [];
  for (var i = 0; i < this.clusters.length; i++) {
    if (this.clusters[i].length > 0) {
      var centroid = this.average(this.clusters[i]);
      this.centroids.push(centroid);
    }
  }
  console.log("this.clusters[0] = " + this.clusters[0]);
  console.log("this.centroids[0] = " + this.centroids[0].x.mean + ", " + this.centroids[0].y.mean + ", " + this.centroids[0].time.mean + ", " + this.centroids[0].size + ", " +  this.centroids[0].radius);
}

// Assumes a is an array of 3d vectors[x,y,t]
KMeans.prototype.average = function(a) {
  var xx = [];
  var yy = [];
  var tt = [];
  var len = a.length;
  for (var i = 0; i < len; i++) {
    xx[i] = a[i][0];
    yy[i] = a[i][1];
    tt[i] = a[i][2];    
  }
  var xAverage = average(xx);
  var yAverage = average(yy);
  var tAverage = average(tt);
  var r = radius(xAverage.mean, xx, yAverage.mean, yy);
  return { 'x': xAverage, 'y': yAverage, 'time': tAverage, 'size': len, 'radius': r};
}

KMeans.prototype.setBuffer = function() {
  this.buf = new Buffer(this.centroids.length*5*4);
  for (var i = 0; i < this.centroids.length*5; i+=5) {
    var x = this.centroids[i/5].x.mean;
    var y = this.centroids[i/5].y.mean;
    //var t = this.centroids[i/5].time.mean;
    // scale time back to original values
    var t = scale(this.centroids[i/5].time.mean, 0, 1, new Date('2000-11-01').getTime(), new Date('2001-12-31'));
    var s = this.centroids[i/5].size;
    var r = this.centroids[i/5].radius;
    this.buf.writeFloatLE(x, i*4);
    this.buf.writeFloatLE(y, (i+1)*4);
    this.buf.writeFloatLE(t, (i+2)*4);
    this.buf.writeInt32LE(s, (i+3)*4);
    this.buf.writeFloatLE(r, (i+4)*4);
  }
}

function Driver(filename) {
  var config = require(__dirname + '/' + filename);
  var m = new MySQL(config);
  m.init();
  var startDate = new Date('2000-11-01');
  var endDate = new Date('2001-12-31');
  m.setQuery(startDate.yyyymmdd(), endDate.yyyymmdd());
  m.execQuery(function(result) { 
    var points = [];
    for (var i = 0; i < result.length; i++) {
      var lat = result[i].latitude;
      var lng = result[i].longitude;
      var t = result[i].acq_date.getTime();
      var pixel = LatLngToPixelXY(lat,lng);
      var point = [];
      point[0] = pixel.x;
      point[1] = pixel.y;
      //point[2] = t; // TODO: Start scaling time again?
      point[2] = scale(t, startDate.getTime(), endDate.getTime(), 0, 1); // scaling time to 0..1
      points.push(point);
    }
    if (result.length > 1) {
      var k = Math.floor(points.length/4);
      console.log("Using k = " + k); 
      console.log("points[0] = " + points[0]);
      var kk = new KMeans(points, k);
      kk.setBuffer();
      var ofile = 'kmeans-timeScaled-' + k + '.bin';
      console.log('Writing out to ' + ofile);
      var wstream = fs.createWriteStream(ofile);
      wstream.write(kk.buf);
      wstream.end();
    }
  });
  m.close();
}

function main() {
  if (args.length != 1) {
    console.log("Missing filename");
    return;
  }
  var filename = args[0];
  var driver = new Driver(filename);
}

main();
