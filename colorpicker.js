// COLOR PICKER

let drawingColor = vec4(1, 0, 0, 1);

function initColorPicker() {
  glC.viewport(0, 0, colorsCanvas.width, colorsCanvas.height);
  glC.clearColor(1.0, 1.0, 1.0, 1.0);

  glS.viewport(0, 0, sliderCanvas.width, sliderCanvas.height);
  glS.clearColor(1.0, 1.0, 1.0, 1.0);

  // COLOR PICKER

  var programC = initShaders(glC, "vertex-shaderC", "fragment-shaderC");
  glC.useProgram(programC);
//Center
  var vertices = [
    vec2(0.0, 0.0)
  ];
  //center color
  var colors = [
    vec4(1.0,1.0,1.0,1.0)

  ]

  var nbTriangles = 24;
  let angle = Math.PI * 2 / nbTriangles;
  for (i = 0; i <= nbTriangles; i++) {
    let circleVertex = vec2(
      Math.cos(angle * i) * 0.9 ,
      Math.sin(angle * i) * 0.9
    );
    vertices.push(circleVertex);
  }


          colors.push(vec4(1.0,0.0,0.0,1.0));
          colors.push(vec4(1.0,0.25,0.0,1.0));
          colors.push(vec4(1.0,0.5,0.0,1.0));
          colors.push(vec4(1.0,0.75,0.0,1.0));
          colors.push(vec4(1.0,1.0,0.0,1.0));
          colors.push(vec4(0.75,1.0,0.0,1.0));
          colors.push(vec4(0.5,1.0,0.0,1.0));
          colors.push(vec4(0.25,1.0,0.0,1.0));
          colors.push(vec4(0.0,1.0,0.0,1.0));
          colors.push(vec4(0.0,1.0,0.25,1.0));
          colors.push(vec4(0.0,1.0,0.5,1.0));
          colors.push(vec4(0.0,1.0,0.75,1.0));
          colors.push(vec4(0.0,1.0,1.0,1.0));

          colors.push(vec4(0.0, 0.75,1.0,1.0));
          colors.push(vec4(0.0, 0.5,1.0,1.0));
          colors.push(vec4(0.0, 0.25,1.0,1.0));
          colors.push(vec4(0.0, 0.0,1.0,1.0));
          colors.push(vec4(0.25,0.0,1.0, 1.0));
          colors.push(vec4(0.5, 0.0, 1.0 , 1.0));
          colors.push(vec4(0.75,0.0,1.0,1.0));
          colors.push(vec4(1.0,0.0,1.0,1.0));
          colors.push(vec4(1.0,0.0,0.75,1.0));
          colors.push(vec4(1.0,0.0,0.5,1.0));
          colors.push(vec4(1.0,0.0,0.25,1.0));
          colors.push(vec4(1.0,0.0,0.0,1.0));





  var buffer = glC.createBuffer();
  glC.bindBuffer(glC.ARRAY_BUFFER, buffer);
  glC.bufferData(glC.ARRAY_BUFFER, flatten(vertices), glC.STATIC_DRAW);

  var vPosition = glC.getAttribLocation(programC, "vPositionC");
  glC.vertexAttribPointer(vPosition, 2, glC.FLOAT, false, 0, 0);
  glC.enableVertexAttribArray(vPosition);

  var colorBuffer = glC.createBuffer();
  glC.bindBuffer(glC.ARRAY_BUFFER, colorBuffer);
  glC.bufferData(glC.ARRAY_BUFFER, flatten(colors), glC.STATIC_DRAW);

  var vertexColor = glC.getAttribLocation(programC, "vertexColorC");
  glC.vertexAttribPointer(vertexColor, 4, glC.FLOAT, false, 0, 0);
  glC.enableVertexAttribArray(vertexColor);


  var verticesSlider= [
    vec2(0.0, -1.0),//1
    vec2(-1.0, 1.0),
    vec2(1.0, 1.0),

  ];

  var colorSlider = [

      vec4(1.0,  1.0,  1.0,  1.0),
      vec4(0.0,  0.0,  0.0,  1.0),
      vec4(1.0,  0.0,  0.0,  1.0),



    ];
    function setColorSlider(newColorSlider){
      var remainedcolorSlider=[];
      for(var i=0;i<2;i++){
        remainedcolorSlider.push(colorSlider[i]);
      }
      remainedcolorSlider.push(newColorSlider);
      colorSlider=[];
      colorSlider=remainedcolorSlider;
      console.log(colorSlider);
      glS.bindBuffer(glS.ARRAY_BUFFER, colorSliderBuffer);
      glS.bufferData(glS.ARRAY_BUFFER, flatten(colorSlider), glS.STATIC_DRAW);
      render();


    }
  var programSlider = initShaders(glS,  "vertex-shaderSlider", "fragment-shaderSlider");
  glS.useProgram(programSlider);

  var bufferSlider = glS.createBuffer();
  glS.bindBuffer(glS.ARRAY_BUFFER, bufferSlider);
  glS.bufferData(glS.ARRAY_BUFFER, flatten(verticesSlider), glS.STATIC_DRAW);

  var vPositionSlider = glS.getAttribLocation(programSlider, "vPositionC");
  glS.vertexAttribPointer(vPositionSlider, 2, glS.FLOAT, false, 0, 0);
  glS.enableVertexAttribArray(vPositionSlider);

  var colorSliderBuffer = glS.createBuffer();
  glS.bindBuffer(glS.ARRAY_BUFFER, colorSliderBuffer);
  glS.bufferData(glS.ARRAY_BUFFER, flatten(colorSlider), glS.STATIC_DRAW);

  var vertexColorSlider = glS.getAttribLocation(programSlider, "vertexColorC");
  glS.vertexAttribPointer(vertexColorSlider, 4, glS.FLOAT, false, 0, 0);
  glS.enableVertexAttribArray(vertexColorSlider);

  sliderCanvas.addEventListener("click", function(event) {

    render();

    // Get click coordinates
    var correction = event.target.getBoundingClientRect();
    var t = vec2(event.clientX-correction.left,
      sliderCanvas.height-(event.clientY-correction.top));

    // Get color in look up map
    selectedColorBuffer = new Uint8Array(4);
    glS.bindFramebuffer(glS.FRAMEBUFFER, null);
    glS.readPixels(t[0], t[1], 1, 1, glS.RGBA, glS.UNSIGNED_BYTE, selectedColorBuffer);
    //glC.bindFramebuffer(gl.FRAMEBUFFER, null);

      drawingColor=vec4(selectedColorBuffer[0]/255,selectedColorBuffer[1]/255,selectedColorBuffer[2]/255,1.0);
  // console.log("selected " + drawingColor);
    // console.log("cubeIndex = " + cubeIndex + ", faceIndex = " + faceIndex);

  });

  colorsCanvas.addEventListener("click", function(event) {

    render();

    // Get click coordinates
    var correction = event.target.getBoundingClientRect();
    var t = vec2(event.clientX-correction.left,
      colorsCanvas.height-(event.clientY-correction.top));

    // Get color in look up map
    selectedColorBuffer = new Uint8Array(4);
    glC.bindFramebuffer(glC.FRAMEBUFFER, null);
    glC.readPixels(t[0], t[1], 1, 1, glC.RGBA, glC.UNSIGNED_BYTE, selectedColorBuffer);
    //glC.bindFramebuffer(gl.FRAMEBUFFER, null);
      // console.log(selectedColorBuffer);
      drawingColor=vec4(selectedColorBuffer[0]/255,selectedColorBuffer[1]/255,selectedColorBuffer[2]/255,1.0);
 //  console.log(selectedColor);
    // console.log("cubeIndex = " + cubeIndex + ", faceIndex = " + faceIndex);
    setColorSlider(drawingColor);


  });

render();

function render(){


  glC.clear(glC.COLOR_BUFFER_BIT);
  glC.drawArrays(glC.TRIANGLE_FAN, 0, nbTriangles + 2);

  glS.clear(glS.COLOR_BUFFER_BIT);
  glS.lineWidth(10);
  glS.drawArrays(glS.TRIANGLES, 0, 3);


}
}
