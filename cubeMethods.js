// CUBE METHODS

let cubeBuffers = {};

function createNewCube(cubeIndex,direction,colorCube){
  verticesNewCube=[];
  var vertices= allCubes[cubeIndex].vertices;

  switch(direction){
    case 0: //front
      for(var i = 0; i < 8; i++) {
        verticesNewCube.push(vec3(vertices[i][0], vertices[i][1], vertices[i][2] + 1));
      }
      break;

    case 1: //right
      for(var i = 0; i < 8; i++) {
        verticesNewCube.push(vec3(vertices[i][0] + 1, vertices[i][1], vertices[i][2]));
      }
      break;

    case 2://back
      for(var i = 0; i < 8; i++) {
        verticesNewCube.push(vec3(vertices[i][0], vertices[i][1], vertices[i][2] - 1));
      }
      break;

    case 3: //left
      for(var i = 0; i < 8; i++) {
        verticesNewCube.push(vec3(vertices[i][0] - 1, vertices[i][1], vertices[i][2]));
      }
      break;

    case 4://top
      for(var i = 0; i < 8; i++) {
        verticesNewCube.push(vec3(vertices[i][0], vertices[i][1] + 1, vertices[i][2]));
      }
      break;

    case 5://bottom
      for(var i = 0; i < 8; i++) {
        verticesNewCube.push(vec3(vertices[i][0], vertices[i][1] - 1, vertices[i][2]));
      }
      break;
  }

  var newCube= {
    vertices: verticesNewCube,
    color: colorCube ? colorCube : vec4(1.0,0.0,0.0,1.0)
  }
  // allCubes.push(newCube);
  // drawScene();
  return(newCube);
}

function removeCube(cubeInd){
  if (allCubes.length > 1) {
    allCubes.splice(cubeInd, 1);
    drawScene();
  }
}

function initCubeBuffers(cubes, lookUpMap) {
  let vertices = [];
  let colors = [];
  let normals = [];

  let center = vec3(0, 0, 0);
  if (modes.softNormals) {
    // Compute center of the figure
    cubes.forEach((cube) => {
      let cubeCenter = scale(0.5, add(cube.vertices[2], cube.vertices[4]));
      center = add(center, cubeCenter);
    })
    center = scale(1/cubes.length, center);
  }

  cubes.forEach((cube, index) => {

    quad(0, 3, 2, 1, lookUpMap ? vec4(index/255, 0, 0, 1) : cube.color); // Face 0, +z
    quad(3, 7, 6, 2, lookUpMap ? vec4(index/255, 1/5, 0, 1) : cube.color); // Face 1, +x
    quad(7, 6, 5, 4, lookUpMap ? vec4(index/255, 2/5, 0, 1) : cube.color); // Face 2, -z
    quad(4, 5, 1, 0, lookUpMap ? vec4(index/255, 3/5, 0, 1) : cube.color); // Face 3, -x
    quad(5, 1, 2, 6, lookUpMap ? vec4(index/255, 4/5, 0, 1) : cube.color); // Face 4, +y
    quad(4, 7, 3, 0, lookUpMap ? vec4(index/255, 1, 0, 1) : cube.color); // Face 5, -y

    if (!modes.softNormals) {
      // Add normals for each face
      normals = normals.concat(Array(6).fill(vec3(0, 0, 1)))
                       .concat(Array(6).fill(vec3(1, 0, 0)))
                       .concat(Array(6).fill(vec3(0, 0, -1)))
                       .concat(Array(6).fill(vec3(-1, 0, 0)))
                       .concat(Array(6).fill(vec3(0, 1, 0)))
                       .concat(Array(6).fill(vec3(0, -1, 0)));
   }

    function quad(a, b, c, d, color) {
      var indices = [ a, b, c, c, d, a ];
      for (var i = 0; i < indices.length; ++i) {
        vertices.push(cube.vertices[indices[i]]);
        colors.push(color);
        if (modes.softNormals) normals.push(subtract(cube.vertices[indices[i]], center));
      }
    }
  });

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

  return vertices.length;
}


// Render modes
// 0 = normal drawing
// 1 = draw on look up map
// 2 = draw shadow map
// 3 = predicted cube

// DRAW CUBES IN COLOR BUFFER OR LOOK UP MAP
function drawCubes(cubes, renderMode) {

  let program;
  let framebuffer;
  let texture;
  let glDrawingMode;

  // Set up according to render mode
  switch(renderMode) {
    case 0:
      program = shadingProgram;
      glDrawingMode = gl.TRIANGLES;
      gl.clearColor(0.9, 0.9, 0.9, 1.0);
      gl.viewport(0, 0, canvas.width, canvas.height);
      break;
    case 1:
      program = baseProgram;
      framebuffer = lookUpMapFbo;
      texture = lookUpTexture;
      glDrawingMode = gl.TRIANGLES;
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.viewport(0, 0, canvas.width, canvas.height);
      break;
    case 2:
      program = shadowProgram;
      framebuffer = shadowMapFbo;
      texture = shadowTexture;
      glDrawingMode = gl.TRIANGLES;
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
      gl.viewport(0, 0, shadowFboSize[0], shadowFboSize[1]);
      break;
    case 3:
      program = baseProgram;
      glDrawingMode = gl.LINE_STRIP;
      gl.viewport(0, 0, canvas.width, canvas.height);
      break;
    default:
      program = shadingProgram;
      glDrawingMode = gl.TRIANGLES;
      gl.clearColor(0.9, 0.9, 0.9, 1.0);
      gl.viewport(0, 0, canvas.width, canvas.height);
      break;
  }

  // Set up the buffers
  let nVertices = initCubeBuffers(cubes, renderMode == 1);

  // Choose program
  gl.useProgram(program);

  let shadowViewMatrix;
  // If drawing shadow map
  if (renderMode == 2) {
    var at = vec3(x, y, 0.0);
    var up = vec3(0, 1, 0);
    var eye = vec3(0, 0, 0);
    eye[0] = light[0];
    eye[1] = light[1];
    eye[2] = light[2];
    shadowViewMatrix = lookAt(eye, at, up);
  }

  setModelView(program, projectionMatrix, shadowViewMatrix || viewMatrix, modelMatrix);
  if (renderMode == 0) setLighting(program, light, intensityValue, ka, kd, ks, alpha);

  initAttributeVariable(gl, program.vPosition, cubeBuffers.vBuffer);
  initAttributeVariable(gl, program.vColor, cubeBuffers.cBuffer);
  if (program.vNormal) {
    initAttributeVariable(gl, program.vNormal, cubeBuffers.nBuffer);
  }

  // Choose framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.enable(gl.DEPTH_TEST);

  if (texture) {
    if (renderMode == 1) { gl.activeTexture(gl.TEXTURE0); }
    if (renderMode == 2) { gl.activeTexture(gl.TEXTURE1); }
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  // Use shadow map if shadows are on
  if (renderMode == 0 && modes.shadows) {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.uniform1i(program.u_ShadowMap, 1); // Shadow map is texture 1
  }
  // Use blank shadow map if shadows are off
  if (renderMode == 0 && !modes.shadows) {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, blankShadowTexture);
    gl.uniform1i(program.u_ShadowMap, 1); // Shadow map is texture 1
  }

  if (renderMode != 3)  {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
  gl.drawArrays(glDrawingMode, 0, nVertices);

}
// Assign buffer to an attribute and enable it
function initAttributeVariable(gl, attributeIndex, buffer) {
  if (typeof attributeIndex !== 'undefined') {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attributeIndex, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(attributeIndex);
  }
}
