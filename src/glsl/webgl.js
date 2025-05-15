/**
 * the webgl x glsl starter configurator
 * My practices are distributed under the MIT license
 * some of the practices were taken from the book thebookofshaders
 * book => https://thebookofshaders.com
 */

const canvas = document.querySelector('#glshader');

const timeSpeed = 0.001;

// added context for shader
const gl = canvas.getContext('webgl');

// path on select folder-shader

const pathToTargetFolder = 'animation_bg_gradient'; // !select any folder in glsl/ to run the script!

const pathFragmentShader = `./glsl/${pathToTargetFolder}/fragment.glsl`;
const pathVertexShader = `./glsl/${pathToTargetFolder}/vertex.glsl`;

// create-shader
// or vertext shader (VERTEX_SHADER)
// or fragment shader (FRAGMENT_SHADER)
const createShader = (context, type, source) => {
  const shader = context.createShader(type);

  // download source in shader context
  context.shaderSource(shader, source);
  
  // compile shader
  context.compileShader(shader);
  
  // check error shader
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    console.error('Error compile shader:', context.getShaderInfoLog(shader));
    context.deleteShader(shader);
    return null;
  }

  return shader;
}

const loadShader = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error load shader');
  return response.text();
}

// dowload shader file
Promise.all([
  loadShader(pathFragmentShader),
  loadShader(pathVertexShader),
])
.then(([fragmentShaderSource, vertexShaderSource]) => {

  // init shader
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // combination vertex and fragment shader 
  const program = gl.createProgram();

  // added shaders in program because webgl requires
  // vertex and fragment shader whatever work 
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  // added two shaders (vertex and fragment) in one chank for GPU
  gl.linkProgram(program);

  // check program status
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error link program:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer(); // create chunk data in GPU 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // say: working with this buffer now (positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    // first 
    -1, -1, // left-bottom
     1, -1, // right-bottom
    -1,  1, // left-top

    // second
    -1,  1, // left-top
     1, -1, // right-bottom
     1,  1, // right-top
  ]), gl.STATIC_DRAW);

  // search attr a_position for transfer vertex in shader
  const positionLocation = gl.getAttribLocation(program, 'a_position'); // var in file vertex.glsl -> attribute vec4 a_position

  // combination data in shader with data in webgl
  gl.enableVertexAttribArray(positionLocation);

  // description format data for var positionLocation in shader
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // search vars uniform in shaders
  const uTimeLocation = gl.getUniformLocation(program, 'u_time'); // time animation
  const uResolutionLocation = gl.getUniformLocation(program, 'u_resolution'); // viewport sizing

  function render(time) {
    time *= timeSpeed; // using for animation

    gl.uniform1f(uTimeLocation, time); // replace state in vars uniform
    gl.uniform2f(uResolutionLocation, gl.canvas.width, gl.canvas.height); // viewport animation

    // installation sizing for viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    // clear viewport before next frame
    gl.clear(gl.COLOR_BUFFER_BIT);

    // added in canvas new frame
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render); // start next cycle
  }
  requestAnimationFrame(render); // start animation
})
.catch(error => {
  console.error('Error load shader:', error);
});
