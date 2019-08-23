// MAIN SCENE WITH CUBES

// WebGL variables
let baseProgram;
let shadingProgram;

let lookUpMapFbo;
let lookUpTexture;

// Cubes
let allCubes = [];
let firstCube = {
  vertices : [
    vec3(-0.5, -0.5, 0.5), //0
    vec3(-0.5, 0.5, 0.5), //1
    vec3(0.5, 0.5, 0.5), //2
    vec3(0.5, -0.5, 0.5), //3
    vec3(-0.5, -0.5, -0.5), //4
    vec3(-0.5, 0.5, -0.5), //5
    vec3(0.5, 0.5, -0.5), //6
    vec3(0.5, -0.5, -0.5) //7
  ],
  color: vec4(1.0,0.0,0.0,1.0)
};
let predictedCube = [];

// Camera settings
var r = 8;
var theta = -0.2 + Math.PI / 2;
var phi = -20;
var x = 0;
var y = 0;

//Light
var light = vec4(2, 6, 5, 1);
var ka = 0.4;
var kd = 0.6;
var ks = 0.2;
var alpha = 10;
var intensityValue = 1.0;

// Drawing modes
var modes = {
  draw: true,
  add: true,
  shadows: true,
  softNormals: false,
}
// var addingMode = true;
// var shadowMode = true;

// var light = vec3(2, 6, 5);

// SET UP SCENE
function initScene() {

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // INIT WEBGL SHADERS AND BUFFERS
  baseProgram = initShaders(gl, "vertex-shader-base", "fragment-shader-base");
  shadingProgram = initShaders(gl, "vertex-shader-shading", "fragment-shader-shading");

  // Attribute & uniform locations
  baseProgram.vPosition = gl.getAttribLocation(baseProgram, "vPosition");
  baseProgram.vColor = gl.getAttribLocation(baseProgram, "vColor");
  baseProgram.u_ProjectionMatrix = gl.getUniformLocation(baseProgram, 'u_ProjectionMatrix');
  baseProgram.u_ViewMatrix = gl.getUniformLocation(baseProgram, 'u_ViewMatrix');
  baseProgram.u_ModelMatrix = gl.getUniformLocation(baseProgram, 'u_ModelMatrix');

  shadingProgram.vPosition = gl.getAttribLocation(shadingProgram, "vPosition");
  shadingProgram.vColor = gl.getAttribLocation(shadingProgram, "vColor");
  shadingProgram.vNormal = gl.getAttribLocation(shadingProgram, "vNormal");
  shadingProgram.u_ProjectionMatrix = gl.getUniformLocation(shadingProgram, 'u_ProjectionMatrix');
  shadingProgram.u_ViewMatrix = gl.getUniformLocation(shadingProgram, 'u_ViewMatrix');
  shadingProgram.u_ModelMatrix = gl.getUniformLocation(shadingProgram, 'u_ModelMatrix');

  shadingProgram.light_position = gl.getUniformLocation(shadingProgram, "light_position");
  shadingProgram.u_kaLoc = gl.getUniformLocation(shadingProgram, "ka");
  shadingProgram.u_kdLoc = gl.getUniformLocation(shadingProgram, "kd");
  shadingProgram.u_ksLoc = gl.getUniformLocation(shadingProgram, "ks");
  shadingProgram.u_alphaLoc = gl.getUniformLocation(shadingProgram, "alpha");
  shadingProgram.intensity=gl.getUniformLocation(shadingProgram, "intensity");
  shadingProgram.u_NormalMatrix = gl.getUniformLocation(shadingProgram, 'u_NormalMatrix');


  shadingProgram.u_ShadowMap = gl.getUniformLocation(shadingProgram, 'u_ShadowMap');
  shadingProgram.u_MvpMatrixFromLight = gl.getUniformLocation(shadingProgram, 'u_MvpMatrixFromLight');

  // Buffers
  var vBuffer = gl.createBuffer();
  vBuffer.type = gl.FLOAT;
  vBuffer.num = 3;

  var cBuffer = gl.createBuffer();
  cBuffer.type = gl.FLOAT;
  cBuffer.num = 4;

  var nBuffer = gl.createBuffer();
  nBuffer.type = gl.FLOAT;
  nBuffer.num = 3;


  cubeBuffers.vBuffer = vBuffer;
  cubeBuffers.cBuffer = cBuffer;
  cubeBuffers.nBuffer = nBuffer;

  // POSITION CAMERA
  var eye = vec3(
    r * Math.sin(theta) * Math.sin(phi) + x,
    r * Math.cos(theta) + y,
    r * Math.sin(theta) * Math.cos(phi)
  );
  var at = vec3(x, y, 0.0);
  var up = vec3(0, 1, 0);
  viewMatrix = lookAt(eye, at, up);

  // CUBE & FACE LOOK UP MAP
  // Initialize a framebuffer object
  lookUpMapFbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, lookUpMapFbo);
  var renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);

  lookUpTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, lookUpTexture);
  // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, lookUpTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

  var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    alert('Framebuffer Not Complete');
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);


  // INITIALIZE CUBES LIST AND DRAW SCENE
  allCubes.push(firstCube);
  allCubes = Array.from(chicken);

  // Draw current look up map
  drawCubes(allCubes, 1);

  // Draw cubes and shadows
  drawScene();
}


// VIEW
var projectionMatrix = perspective(45, 1, 0.5, 30);
// var eye = vec3(0, 0, 8);
// var at = vec3(0, 0, 0);
// var up = vec3(0, 1, 0);
var viewMatrix = mat4();
var modelMatrix = mat4();

function moveCamera(r, theta, phi, x, y) {
  // Rotate the camera
  var eye = vec3(
    r * Math.sin(theta) * Math.sin(phi),
    r * Math.cos(theta),
    r * Math.sin(theta) * Math.cos(phi)
  );
  var at = vec3(0, 0, 0.0);
  var up = vec3(0, 1, 0);

  // Compute truck translation
  var v = normalize( subtract(at, eye) );  // view direction vector
  var n = normalize( cross(v, up) );       // perpendicular vector
  var u = normalize( cross(n, v) );        // "new" up vector

  var translation = vec3(x * n[0] + y * u[0],
                         x * n[1] + y * u[1],
                         x * n[2] + y * u[2]);

  // eye and at are translated after truck
  eye = add(eye, translation);
  at = add(at, translation);

  viewMatrix = lookAt(eye, at, up);

}

function setModelView(program, projectionMatrix, viewMatrix, modelMatrix) {
  gl.uniformMatrix4fv(program.u_ProjectionMatrix, false, flatten(projectionMatrix));
  gl.uniformMatrix4fv(program.u_ViewMatrix, false, flatten(viewMatrix));
  gl.uniformMatrix4fv(program.u_ModelMatrix, false, flatten(modelMatrix));

  // If needed, compute normal matrix
  if (typeof(program.u_NormalMatrix) !== "undefined") {
    // var ctm = mult(viewMatrix, modelMatrix);
    var ctm = viewMatrix;
    var N = normalMatrix(ctm, true);
    gl.uniformMatrix3fv(program.u_NormalMatrix, false, flatten(N));
  }

  // If needed, compute MVP matrix from light
  if (typeof(program.u_MvpMatrixFromLight) !== "undefined") {
    var at = vec3(x, y, 0.0);
    var up = vec3(0, 1, 0);
    var eye = vec3(0, 0, 0);
    eye[0] = light[0];
    eye[1] = light[1];
    eye[2] = light[2];
    var lightViewMatrix = lookAt(eye, at ,up);
    var MVP = mult(lightViewMatrix, modelMatrix);
    MVP = mult(projectionMatrix, MVP);
    gl.uniformMatrix4fv(program.u_MvpMatrixFromLight, false, flatten(MVP));
  }

}


function drawScene() {
  if (modes.shadows)  drawCubes(allCubes, 2); // Draw shadow map if shadows are on
  drawCubes(allCubes, 0);
  drawLight();
}

function drawLight() {
  let lightCube = {
    vertices: [],
    color: vec4(1,1,0,1)
  };
  firstCube.vertices.forEach(vertices => {
    lightCube.vertices.push(add(vertices, vec3(light[0], light[1], light[2]))); // light cube is first cube translated to light position
  });
  drawCubes([lightCube], 3);
}


function clearScene() {
  firstCube.color = drawingColor;
  allCubes = [firstCube];
  // Center camera
  x = 0;
  y = 0;
  r = 8;
  theta = Math.PI / 2;
  phi = 0;
  moveCamera(r, theta, phi, x, y);
  drawCubes(allCubes, 1); // Draw current look up map
  drawScene();
}

// LIGHTING

function changeLight(position,change){

  light[position]=light[position] +change;

  // gl.uniform3fv( shadingProgram.light_position,light);
  drawScene();

}

function changeIntesity(change){
  if (intensityValue+change > 0) {
    intensityValue=intensityValue+change;
    // gl.uniform1f(shadingProgram.intensity, intensityValue);
    drawScene();
  }
}

function kaFunction(change){
  if (ka+ change > 0) {
    ka = ka+ change;
    // gl.uniform1f(shadingProgram.u_kdLoc, kd);
    drawScene();
  }
};

function kdFunction(change){
  if (kd+ change > 0) {
    kd = kd+ change;
    // gl.uniform1f(shadingProgram.u_kdLoc, kd);
    // console.log("kd"+kd);
    drawScene();
  }
};

function ksFunction(change){
  if (ks+ change > 0) {
    ks = ks+ change;
    drawScene();
  }
};

function alphaFunction(change){
  if (alpha+ change > 0) {
    alpha = alpha+ change;
    drawScene();
  }
};

function setLighting(program, lightPosition, intensityValue, ka, kd, ks, alpha) {
  currentLightParametersDisp.innerHTML = "Position = (" + lightPosition
                                        + "), Intensity = " + intensityValue.toFixed(1)
                                        + "<br/> ka = " + ka.toFixed(1)
                                        + ", kd = " + kd.toFixed(1)
                                        + ", ks = " + ks.toFixed(1)
                                        + ", alpha = " + alpha.toFixed(0);
  gl.uniform4fv(program.light_position, lightPosition);
  gl.uniform1f(program.intensity, intensityValue);
  gl.uniform1f(program.u_kaLoc, ka);
  gl.uniform1f(program.u_kdLoc, kd);
  gl.uniform1f(program.u_ksLoc, ks);
  gl.uniform1f(program.u_alphaLoc, alpha);
}
