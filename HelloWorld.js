var vertexShaderSource;
var fragmentShaderSource;
//var image = new Image();
var image = document.querySelector("#img");
var bmp;

var startTime = Date.now();
const deltaAngle = 1.0;
var newAngle = 0.0;

function main() {
  var canvas = document.querySelector("#c");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    // no webgl2 for you!
    return;
  }

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  var program = createProgram(gl, vertexShader, fragmentShader);

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

  var resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );

  var rotationMatrixLocation = gl.getUniformLocation(program, "rotationMatrix");
  var imageLocation = gl.getUniformLocation(program, "u_image");

  var positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var positions = [10, 20,
    180, 20,
    10, 130,
    10, 130,
    180, 20,
    180, 130];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);

  var size = 2;
  var type = gl.FLOAT;
  var normalize = false;
  var stride = 0;
  var offset = 0;
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // vertex attribute array texcoord

  var texCoords = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0];

  // bind buffer data for texcoord
  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordAttributeLocation);
  size = 2;
  type = gl.FLOAT;
  normalize = false;
  stride = 0;
  offset = 0;
  gl.vertexAttribPointer(
    texCoordAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // create texture
  var texture = gl.createTexture();

  // bind texture
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // load image to texture
  var mipLevel = 0;
  var internalFormat = gl.RGBA;
  var srcFormat = gl.RGBA;
  var srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(
    gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    image
  );

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BI | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  function updateFrame(){
    // draw loop
    gl.bindVertexArray(vao);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // sampler uniform
    gl.uniform1i(imageLocation, 0);

    var rotMatrix = setRotationMatrix();
    gl.uniformMatrix2fv(rotationMatrixLocation, false, rotMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var primitiveType = gl.TRIANGLES;
    offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);

    window.requestAnimationFrame(updateFrame);

  }

  window.requestAnimationFrame(updateFrame);

  return;
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function setRotationMatrix(){
  var timeNow = Date.now();
  var deltaTime = timeNow - startTime;
  startTime = timeNow;

  newAngle += (deltaAngle * deltaTime)/1000.0;
  const cos = Math.cos(newAngle);
  const sin = Math.sin(newAngle);
  return [cos, sin, -sin, cos];
}

fetch("helloWorld.vs")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.text();
  })
  .then((vsSource) => {
    vertexShaderSource = vsSource;

    fetch("helloWorld.fs")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.text();
      })
      .then((fsSource) => {
        fragmentShaderSource = fsSource;

        // test for CORS
        function requestCORSIfNotSameOrigin(img, url) {
          if (
            new URL(url, window.location.href).origin !== window.location.origin
          ) {
            img.crossOrigin = "";
          }
        }

        // load image object

        var url = "lava_texture.jpg";
        // var url = "https://c1.staticflickr.com/9/8873/18598400202_3af67ef38f_q.jpg";
        image.onload = function () {

          main();
          // createImageBitmap(image).then(
          //   (imgBmp) => {
          //     bmp = imgBmp;
          //     main();
          //   }
          // )
        };
        //requestCORSIfNotSameOrigin(image, url);
        image.src = url;
      });
  });
