// INTERACTIONS

const rotPerDrag = 1/800;
const truckperDrag = 1/1000;

var firstClickPos = null;
var drag = false;
var down = false;
var button = null;

// CLICK AND DRAG ON CANVAS EVENTS

function getCubeFace(event, canvas) {
  // Get click coordinates
  var correction = canvas.getBoundingClientRect();
  var t = vec2(event.clientX-correction.left,
               canvas.height-(event.clientY-correction.top));

  // Get color in look up map
  var lookUpColor = new Uint8Array(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, lookUpMapFbo);
  gl.readPixels(t[0], t[1], 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, lookUpColor);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // Get cube and face indices from color in look up map
  var cubeIndex = null;
  var faceIndex = null;

  if(lookUpColor[3] !== 0){
      cubeIndex = lookUpColor[0];
      faceIndex = lookUpColor[1] * 5 / 255;
  }
  return {cubeIndex: cubeIndex, faceIndex: faceIndex};
}

function clickOnCanvas(event) {
  let clickedFace = getCubeFace(event, canvas);
  if (clickedFace.cubeIndex !== null) {
    if (modes.draw) {
      if (modes.add) {
        allCubes.push(createNewCube(clickedFace.cubeIndex, clickedFace.faceIndex, drawingColor));
      }
      else {
        if (allCubes.length > 1) removeCube(clickedFace.cubeIndex);
      }
      drawScene();
    }
    else {
      // Color pick
      let color = allCubes[clickedFace.cubeIndex].color;
      drawingColor = vec4(color[0],
                          color[1],
                          color[2],
                          color[2]);
    }
  }
  // console.log("cubeIndex = " + cubeIndex + ", faceIndex = " + faceIndex);

}

function hoverCanvas(event, canvas) {
  let hoveredFace = getCubeFace(event, canvas);
  if (hoveredFace.cubeIndex !== null) {
    let newPredictedCube;
    if (modes.draw) {
      if ( modes.add){
        newPredictedCube = createNewCube(hoveredFace.cubeIndex, hoveredFace.faceIndex, drawingColor);
      }
      else {
        newPredictedCube = {
          vertices: allCubes[hoveredFace.cubeIndex].vertices,
          color: vec4(1, 0, 0, 1)
        }
      }
    }
    else {
      // Color picker mode
      newPredictedCube = {
        vertices: allCubes[hoveredFace.cubeIndex].vertices,
        color: vec4(1, 1, 1, 1)
      }
    }

    if (!predictedCube[0] || !predictedCube[0].vertices.equals(newPredictedCube.vertices)) {
      predictedCube = [newPredictedCube];
      drawCubes(allCubes, 0); // Doesn't work without redrawing the main scene first
      drawCubes(predictedCube, 3);
      drawLight();
    }
  }
  else {
    if (predictedCube.length > 0) {
      drawCubes(allCubes, 0); // Necessary to remove the previously predicted cube wireframe
      drawLight();
      predictedCube = [];
    }
  }
}

function mousedown(e, canvas) {
  // Get click coordinates
  var correction = canvas.getBoundingClientRect();
  firstClickPos = vec2(e.clientX-correction.left,
               canvas.height-(e.clientY-correction.top));
  drag = false; // Reinitialize drag flag
  down = true;
  button = e.button;
}

function mousemove(event, canvas) {
  if (down) {
    // Get click coordinates
    var correction = canvas.getBoundingClientRect();
    var secondClickPos = vec2(event.clientX-correction.left,
                 canvas.height-(event.clientY-correction.top));

    if (firstClickPos) {
      var dist = subtract(firstClickPos, secondClickPos);
      // console.log("deltaX= " + dist[0] + " deltaY= " + dist[1]);
      if (Math.pow(dist[0], 2) + Math.pow(dist[1], 2) > 10) {
        // It was a drag
        drag = true;
        if (button == 0) {
          var deltaPhi = rotPerDrag * dist[0];
          var deltaTheta = - rotPerDrag * dist[1];
          rotate(deltaTheta, deltaPhi);
        }
        if (button == 2) {
          truck(dist[0] * truckperDrag, dist[1] * truckperDrag);
        }
      }
    }
  }
  else {
    hoverCanvas(event, canvas);
  }
}

function mouseup(event, canvas) {
  // Check if drag or click
  if (drag) {
    // Stop dragging
    firstClickPos = null;
  }
  else {
    // It was a click
    firstClickPos = null;
    clickOnCanvas(event);
  }
  down = false;
  drag = false;
  button = null;

  // Draw current look up map
  // Drawing look up map only once the mouse movement is finished leads to fewer calls to gl.drawArrays
  drawCubes(allCubes, 1);

}

function zoomWheel(event) {
  event.preventDefault(); // Prevent scrolling
  if (event.deltaY < 0) {
    zoom(0.5);
  }
  if (event.deltaY > 0) {
    zoom(-0.5);
  }
}

function toggleMode(button, mode) {
  if (button.classList.contains("active")) return; // If already selected, do nothing
  button.classList.add("active");
  let otherButton = button.nextElementSibling || button.previousElementSibling;
  otherButton.classList.remove("active");
  modes[mode] = !modes[mode];
  drawScene();
}

function truck(dx, dy) {
  x += dx;
  y += dy;
  moveCamera(r, theta, phi, x, y);
  // Draw current look up map
  drawCubes(allCubes, 1);
  drawScene();
}

function zoom(factor) {
  if (r - factor > 3 && r - factor < 25) {
    r -= factor;
    moveCamera(r, theta, phi, x, y);
    // Draw current look up map
    drawCubes(allCubes, 1);
    drawScene();
  }
}

function rotate(dtheta, dphi) {
  phi += dphi;
  if (theta + dtheta > 0 && theta + dtheta < 3.1) {
    theta += dtheta;
  }
  moveCamera(r, theta, phi, x, y);
  // Draw current look up map
  drawCubes(allCubes, 1);
  drawScene();
}
