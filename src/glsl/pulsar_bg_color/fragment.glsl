#ifdef GL_ES
precision mediump float;
#endif

// uniform ver2 u_resolution; // sizing img (width x height)
// uniform vec2 u_mous; // cursor coordinate
uniform float u_time; // time in second moment load

void main() {
  gl_FragColor = vec4(abs(sin(u_time)), 0.000,0.0,1.0);
}
