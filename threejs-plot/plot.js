// https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
THREE.Object3D.DefaultUp.set(0, 0, 1); // set Z as vertical axes
const scene = new THREE.Scene();
// 10 z distanece
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const canvas = document.getElementById("plot");
const renderer = new THREE.WebGLRenderer({ canvas: canvas }); // https://stackoverflow.com/a/21646450/2710227
const canvasParent = document.querySelector('.app');

scene.background = new THREE.Color( 0xffffff );

renderer.setSize(canvasParent.offsetWidth, canvasParent.offsetHeight); // add false for lower resolution after dividing x/y values
// renderer.setPixelRatio(window.devicePixelRatio);
renderer.setPixelRatio(2); // looks great
// https://discourse.threejs.org/t/render-looks-blurry-and-pixelated-even-with-antialias-true-why/12381/5

// add orbit controls
const controls = new THREE.OrbitControls( camera, renderer.domElement );
const axesHelper = new THREE.AxesHelper(70);
// const controls = new OrbitControls( camera, renderer.domElement );

// add axes helper
// x = red, y = green, z = blue
// east, north, down
scene.add(axesHelper);

// add grid overlay
const size = 100;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
// const zVector = new THREE.Vector3(0, 0, 1);
gridHelper.rotateX(Math.PI / 2); // https://stackoverflow.com/a/58554774/2710227
// gridHelper.lookAt(zVector);
scene.add(gridHelper);

controls.update();

function animate() {
  requestAnimationFrame( animate );
  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();
  renderer.render( scene, camera );
}

// camera
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );
renderer.render(scene, camera);
animate();

// line material
let material = new THREE.LineBasicMaterial({ color: 0x00FF00 });
let lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000FF }); // FF0000 red

const blue = 0x0000FF;
const red = 0xFF0000;
const green = 0x00FF00;

// to make distinguishable panels, will eventually add a nice color pallete/ranging
const getRandomHex = (returnRandom = true) => {
  if (!returnRandom) {
    return '#B6B6B6';
  }
  // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  var result           = '';
  var characters       = 'abcdef0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return parseInt(`0x${result}`, 16);
}

// plot mesh
const plotFourPointsAsPlane = (planePoints) => {
  let points = [];

  planePoints.forEach((panelPoint) => {
    points.push(new THREE.Vector3(panelPoint[0], panelPoint[1], panelPoint[2]));
  });

  material = new THREE.LineBasicMaterial({ color: getRandomHex() });
  meshGeometry = new THREE.ConvexGeometry( points ); // points = vertices array
  mesh = new THREE.Mesh(meshGeometry, material);
  scene.add(mesh);
}

const mmToIn = (mm) => (mm * 0.0393701).toFixed(2);
let points = [];

const plotSensorData = (sensorData) => {
  points = [];
  scene.remove.apply(scene, scene.children);
  scene.add(axesHelper);
  scene.add(gridHelper);

  // split into 8x8
  const rows = [];
  let curRow = [];
  let counter = 0;

  // need to group into 8s
  // and re-arrange to match scan pattern
  sensorData.forEach((val, index) => {
    if (counter > 7) {
      rows.unshift(curRow);
      curRow = [];
      counter = 0;
    }

    curRow.push(mmToIn(val));
    counter++;
  });

  rows.unshift(curRow);

  // I'm a dumbass I manually measured these in Google SketchUp 😭
  // coordinate system is [x, y, z] where z is going to the sky
  const angleMap = [
    [[-21.4, 19.9],  [-15.7, 19.9],  [-9.6, 19.9],  [-3.2, 19.9],  [3.2, 19.9],  [9.6, 19.9],  [15.7, 19.9],  [21.4, 19.9]],
    [[-21.4, 14.5],  [-15.7, 14.5],  [-9.6, 14.5],  [-3.2, 14.5],  [3.2, 14.5],  [9.6, 14.5],  [15.7, 14.5],  [21.4, 14.5]],
    [[-21.4, 8.8],   [-15.7, 8.8],   [-9.6, 8.8],   [-3.2, 8.8],   [3.2, 8.8],   [9.6, 8.8],   [15.7, 8.8],   [21.4, 8.8]],
    [[-21.4, 3.0],   [-15.7, 3.0],   [-9.6, 3.0],   [-3.2, 3.0],   [3.2, 3.0],   [9.6, 3.0],   [15.7, 3.0],   [21.4, 3.0]],
    [[-21.4, -3.0],  [-15.7, -3.0],  [-9.6, -3.0],  [-3.2, -3.0],  [3.2, -3.0],  [9.6, -3.0],  [15.7, -3.0],  [21.4, -3.0]],
    [[-21.4, -8.8],  [-15.7, -8.8],  [-9.6, -8.8],  [-3.2, -8.8],  [3.2, -8.8],  [9.6, -8.8],  [15.7, -8.8],  [21.4, -8.8]],
    [[-21.4, -14.5], [-15.7, -14.5], [-9.6, -14.5], [-3.2, -14.5], [3.2, -14.5], [9.6, -14.5], [15.7, -14.5], [21.4, -14.5]],
    [[-21.4, -19.9], [-15.7, -19.9], [-9.6, -19.9], [-3.2, -19.9], [3.2, -19.9], [9.6, -19.9], [15.7, -19.9], [21.4, -19.9]],
  ];

  // we're taking two rows of data, getting four adjacent points and making a plot
  // you need 3 coordinates per point eg. vertice
  // the sensor has 45% FOV in x and y direction
  rows.forEach((row, xIndex) => {
    row.forEach((sVal, yIndex) => {
      const x = getXCoordinate(angleMap[xIndex][yIndex][0], sVal);
      const y = getYCoordinate(angleMap[xIndex][yIndex][0], sVal);
      const z = getZCoordinate(angleMap[xIndex][yIndex][1], sVal);
      console.log('plot', x, y, z);
      points.push(new THREE.Vector3(x, y, z));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      // const line = new THREE.Line(geometry, lineMaterial);
      const material = new THREE.PointsMaterial({ 
        color: 0xff0000
      });
      const point = new THREE.Points(geometry, material);
      scene.add(point);
    });
  });

  renderer.render(scene, camera);
  animate();

  // stored in array as this
  // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

  // scanned like this
  // 13 14 15 16
  // 9  10 11 12
  // 5  6  7  8
  // 1  2  3  4

  // takes in 1D array 64 values of depth from 8x8 ToF sensor
  // threejsPlotChart(sampleData);
};
