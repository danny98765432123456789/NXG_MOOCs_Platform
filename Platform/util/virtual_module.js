// virtual_module.js
var randgen = require("randgen");

var alpha = 205;
var p = 4;
var std = 1.5;
var tx_speed = 400;

var anchors = [new Anchor(3, [0, 10]),
  new Anchor(2, [5, 0]),
  new Anchor(5, [10, 10])
];

var devices = [new Device(1, [3, 7]),
  new Device(4, [7, 4]),
  new Device(6, [5, 1])
];

setInterval(function() {
  move(devices[2]);
}, 3000)

function Device(mac, loc) {
  this.mac = mac;
  this.loc = loc;
};

function Anchor(mac, loc) {
  this.mac = mac;
  this.loc = loc;
};

Anchor.prototype.getRSSI = function(device) {
  var distance = Math.sqrt(Math.pow((device.loc[0] - this.loc[0]), 2) +
    Math.pow((device.loc[1] - this.loc[1]), 2));
  var rssi = alpha - 10 * p * Math.log10(distance);
  return Math.round(randgen.rnorm(rssi, std));
}

Anchor.prototype.genPacket = function(device) {
  var packet = [0, device.mac, 0, this.mac, 1];
  packet.push(this.getRSSI(device));
  // transform the packet
  tPacket = "";
  for (var i = 0; i < packet.length; i++) {
    tPacket += String.fromCharCode(packet[i]);
  }
  return tPacket;
}

function receive(sp, anchor, devices) {
  var rand = Math.round(Math.random() * tx_speed);
  setTimeout(function() {
    var receivedPacket;
    var temp = Math.random();
    if (temp <= 0.33333333)
      receivedPacket = anchor.genPacket(devices[0])
    if (temp > 0.33333333 && temp <= 0.66666666)
      receivedPacket = anchor.genPacket(devices[1])
    if (temp > 0.66666666)
      receivedPacket = anchor.genPacket(devices[2])
    sp.write(receivedPacket);
    receive(sp, anchor, devices);
  }, tx_speed);
}

// For the dynamic device
function move(device) {

  if (device.loc[0] <= 5 && device.loc[1] < 5) { //left down
    device.loc[0]-=0.25;
    device.loc[1]+=0.25;
  }
  else if (device.loc[0] < 5 && device.loc[1] >= 5) { //left up
    device.loc[0]+=0.25;
    device.loc[1]+=0.25;
  }
  else if (device.loc[0] >= 5 && device.loc[1] > 5) { //right up
    device.loc[0]+=0.25;
    device.loc[1]-=0.25;
  }
  else if (device.loc[0] > 5 && device.loc[1] <= 5) { //right down
    device.loc[0]-=0.25;
    device.loc[1]-=0.25;
  }
  return device;

}

module.exports = {
  start: function(sp) {
    sp.on("dataToDevice", function(data) {
      sp.writeToComputer(data);
    });
    receive(sp, anchors[0], devices);
    receive(sp, anchors[1], devices);
    receive(sp, anchors[2], devices);
  }
};
