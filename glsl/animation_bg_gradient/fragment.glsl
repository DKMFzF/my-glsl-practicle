#ifdef GL_ES
precision lowp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void coswarp(inout vec3 trip, float warpsScale ) {
  trip.xyz += warpsScale * .1 * cos(3. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .05 * cos(11. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .025 * cos(17. * trip.yzx + (u_time * .25));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * .5) / u_resolution.yy + 0.5;
  float t = u_time * 0.1;

  vec3 baseColor = vec3(0.9, 0.8, 0.7);
  vec3 variation = vec3(
    0.05 * cos(t + uv.x * 2.0),
    0.05 * cos(t + uv.y * 1.5 + 1.0),
    0.05 * cos(t + uv.x * 1.0 + 2.0)
  );

  vec3 color = baseColor + variation;

  coswarp(color, 1.5);

  color = mix(color, vec3(0.8), 0.3);

  gl_FragColor = vec4(color, 1.0);
}
