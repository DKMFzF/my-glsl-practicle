#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
// uniform vec2 u_mouse;
uniform float u_time;

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution;

  float r = 0.5 + 0.5 * sin(u_time + st.x * 0.5);
  float g = 0.5 + 0.5 * cos(u_time + st.y * 0.5);
  float b = 0.5 + 0.5 * abs(sin(u_time + (st.x + st.y) * 0.5));

	gl_FragColor = vec4(r,g,b,1.0);
}
