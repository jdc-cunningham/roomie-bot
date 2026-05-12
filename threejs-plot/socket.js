const connectToRobot = () => {
  const socket = new WebSocket('ws://192.168.1.118:5000/tof-data');

  socket.addEventListener('open', function (event) {
    // keep connection to pico w
    socketInterval = setInterval(() => {
      socket.send('ping');
    }, 3000);
  });

  socket.addEventListener('message', function (event) {
    const eventData = JSON.parse(event.data);

    if (eventData.length) {
      plotSensorData(eventData);
    }
  });

  socket.addEventListener('close', function (event) {
    console.log('close');
  });
};

connectToRobot();
