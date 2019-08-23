let shadowProgram;
let shadowMapFbo;
let shadowTexture;

let shadowFboSize = [];

function initShadows() {

  shadowFboSize[0] = 1024;
  shadowFboSize[1] = 1024;

  shadowProgram = initShaders(gl, "vertex-shader-shadow", "fragment-shader-shadow");

  // Shadow program
  shadowProgram.vPosition = gl.getAttribLocation(shadowProgram, "vPosition");
  shadowProgram.u_ProjectionMatrix = gl.getUniformLocation(shadowProgram, "u_ProjectionMatrix");
  shadowProgram.u_ViewMatrix = gl.getUniformLocation(shadowProgram, "u_ViewMatrix");
  shadowProgram.u_ModelMatrix = gl.getUniformLocation(shadowProgram, "u_ModelMatrix");

  // Initialize a framebuffer object
  shadowMapFbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFbo);
  var renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowFboSize[0], shadowFboSize[1]);

  // Texture 1 (shadow map)
  shadowTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
  // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  // console.log(shadowFboSize[0]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, shadowFboSize[0], shadowFboSize[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowTexture, 0);

  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

  var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    alert('Framebuffer Not Complete');
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  // Texture 2 (blank shadow map)
  var white = new Uint8Array(4);
  white[0] = 255;
  white[1] = 255;
  white[2] = 255;
  white[3] = 255;
  blankShadowTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, blankShadowTexture);
  // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  // console.log(shadowFboSize[0]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, white);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


}
