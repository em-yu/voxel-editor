window.onload = main;

let gl;
let canvas;

let glC;
let colorsCanvas;

let glS;
let sliderCanvas;


function main() {
  // CANVASES
  canvas = document.querySelector("#glCanvas");
  colorsCanvas = document.querySelector("#colorsCanvas");
  sliderCanvas = document.querySelector("#sliderCanvas");

  // Initialize the GL context
  gl = canvas.getContext("webgl");
  glC=colorsCanvas.getContext("webgl");
  glS=sliderCanvas.getContext("webgl");
  // Only continue if WebGL is available and working
  if (!gl || !glC || !glS) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // Set color picker
  initColorPicker();

  // Set interactions on canvas and buttons
  setInteractions();

  // Set main scene
  initShadows();
  initScene();




}

function setInteractions() {
  const clearButton = document.querySelector("#clearButton");
  const removeCubeButton = document.querySelector("#removeCubeButton");
  const addCubeButton = document.querySelector("#addCubeButton");

  const zoomOutButton = document.querySelector("#zoomOutButton");
  const zoomInButton = document.querySelector("#zoomInButton");

  const thetaPlusButton = document.querySelector("#thetaPlusButton");
  const thetaMinusButton = document.querySelector("#thetaMinusButton");

  const phiPlusButton = document.querySelector("#phiPlusButton");
  const phiMinusButton = document.querySelector("#phiMinusButton");

  const truckXPlusButton = document.querySelector("#truckXPlusButton");
  const truckXMinusButton = document.querySelector("#truckXMinusButton");

  const truckYPlusButton = document.querySelector("#truckYPlusButton");
  const truckYMinusButton = document.querySelector("#truckYMinusButton");

  const currentLightParametersDisp = document.querySelector("#currentLightParametersDisp");

  const LightX = document.querySelector("#LightX");
  const LightXMinus = document.querySelector("#LightXMinus");

  const LightY = document.querySelector("#LightY");
  const LightYMinus = document.querySelector("#LightYMinus");

  const LightZ = document.querySelector("#LightZ");
  const LightZMinus = document.querySelector("#LightZMinus");

  const kaButton = document.querySelector("#kaButton");
  const kdButton = document.querySelector("#kdButton");
  const kaButtonMinus = document.querySelector("#kaButtonMinus");
  const kdButtonMinus = document.querySelector("#kdButtonMinus");
  const ksButtonMinus = document.querySelector("#ksButtonMinus");
  const ksButton = document.querySelector("#ksButton");
  const alphaButtonMinus = document.querySelector("#alphaButtonMinus");
  const alphaButton = document.querySelector("#alphaButton");

  const Intensity = document.querySelector("#intensity");
  const IntensityMinus = document.querySelector("#intensityMinus");

  const shadowsOnButton = document.querySelector("#shadowsOnButton");
  const shadowsOffButton = document.querySelector("#shadowsOffButton");

  const hardNormalsButton = document.querySelector("#hardNormalsButton");
  const softNormalsButton = document.querySelector("#softNormalsButton");

  const chickenButton = document.querySelector("#chickenButton");
  const appleButton = document.querySelector("#appleButton");
  const guyButton = document.querySelector("#guyButton");

  const phongDemoButton = document.querySelector("#phongDemoButton");

  canvas.addEventListener("mousedown", function(event){ mousedown(event, canvas); });
  canvas.addEventListener("mousemove", function(event){ mousemove(event, canvas); });
  canvas.addEventListener("mouseup", function(event){ mouseup(event, canvas); });
  canvas.addEventListener("wheel", function(event){ zoomWheel(event); });

  clearButton.addEventListener("click", function(){ clearScene()});
  removeCubeButton.addEventListener("click", function(){ toggleMode(removeCubeButton, 'add')});
  addCubeButton.addEventListener("click", function(){ toggleMode(addCubeButton, 'add')});
  colorPickButton.addEventListener("click", function(){ toggleMode(colorPickButton, 'draw')});
  drawButton.addEventListener("click", function(){ toggleMode(drawButton, 'draw')});

  truckXPlusButton.addEventListener("click", function() { truck(1, 0) });
  truckXMinusButton.addEventListener("click", function() { truck(-1, 0) });
  truckYPlusButton.addEventListener("click", function() { truck(0, 1) });
  truckYMinusButton.addEventListener("click", function() { truck(0, -1) });
  zoomOutButton.addEventListener("click", function() { zoom(-0.5) });
  zoomInButton.addEventListener("click", function() { zoom(0.5) });
  thetaPlusButton.addEventListener("click", function() { rotate(0.1, 0) });
  thetaMinusButton.addEventListener("click", function() { rotate(-0.1, 0) });
  phiPlusButton.addEventListener("click", function() { rotate(0, 0.1) });
  phiMinusButton.addEventListener("click", function() { rotate(0, -0.1) });


  LightX.addEventListener("click", function() { changeLight(0,1.0) });
  LightXMinus.addEventListener("click", function() { changeLight(0,-1.0) });
  LightY.addEventListener("click", function() { changeLight(1,1.0) });
  LightYMinus.addEventListener("click", function() { changeLight(1,-1.0) });
  LightZ.addEventListener("click", function() { changeLight(2,1.0) });
  LightZMinus.addEventListener("click", function() { changeLight(2,-1.0) });

  Intensity.addEventListener("click", function() { changeIntesity(0.1) });
  IntensityMinus.addEventListener("click", function() { changeIntesity(-0.1) });

  kaButton.addEventListener("click", function() { kaFunction(0.1)});
  kaButtonMinus.addEventListener("click", function() { kaFunction(-0.1)});
  kdButtonMinus.addEventListener("click", function() {kdFunction(-0.1)});
  kdButton.addEventListener("click", function() {kdFunction(0.1)});
  ksButtonMinus.addEventListener("click", function() {ksFunction(-0.1)});
  ksButton.addEventListener("click", function() {ksFunction(0.1)});
  alphaButton.addEventListener("click", function() {alphaFunction(1)});
  alphaButtonMinus.addEventListener("click", function() {alphaFunction(-1)});

  shadowsOnButton.addEventListener("click", function(){ toggleMode(shadowsOnButton, 'shadows')});
  shadowsOffButton.addEventListener("click", function(){ toggleMode(shadowsOffButton, 'shadows')});

  hardNormalsButton.addEventListener("click", function(){ toggleMode(hardNormalsButton, 'softNormals')});
  softNormalsButton.addEventListener("click", function(){ toggleMode(softNormalsButton, 'softNormals')});

  chickenButton.addEventListener("click", function(){ setModel("chicken") });
  appleButton.addEventListener("click", function(){ setModel("apple") });
  guyButton.addEventListener("click", function(){ setModel("guy") });

  phongDemoButton.addEventListener("click", function(){ specularDemo(); });

  // Prevent context menu from opening on right click
  canvas.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    e.stopPropagation();
  });

}
