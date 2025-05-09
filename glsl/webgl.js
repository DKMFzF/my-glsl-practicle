const canvas = document.querySelector('#glshader');

// added context for shader
const gl = canvas.getContext('webgl');

// path on select folder-shader
const pathToTargetFolder = 'bg_color';
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
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Ошибка линковки программы:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'a_position'); // var in file vertex.glsl -> attribute vec4 a_position

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uTimeLocation = gl.getUniformLocation(program, 'u_time');

  function render(time) {
    time *= 0.001;
    gl.uniform1f(uTimeLocation, time);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})
.catch(error => {
  console.error('Ошибка загрузки шейдеров:', error);
});
