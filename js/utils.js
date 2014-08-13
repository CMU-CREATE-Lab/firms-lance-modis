var pi_180 = Math.PI / 180.0;
var pi_4 = Math.PI * 4;

function LatLongToPixelXY(latitude, longitude) {
  var sinLatitude = Math.sin(latitude * pi_180);
  var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) /(pi_4)) * 256;
  var pixelX = ((longitude + 180) / 360) * 256;
  var pixel =  { x: pixelX, y: pixelY };

  return pixel;
}

Date.prototype.yyyymmdd = function() {         
  var yyyy = this.getUTCFullYear().toString();                                    
  var mm = (this.getUTCMonth()+1).toString();
  var dd  = this.getUTCDate().toString();             
  return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};  