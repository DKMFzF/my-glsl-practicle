// file for position vertex in space (in viewport browser)

// using if-else for float accuracy
#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position; // this var comes from CPU

// function main starting everytime for everyone pixel in vewport
void main() {
  // this is cordinate
  gl_Position = a_position; // assignment WebGl position on glsl shader position
}
