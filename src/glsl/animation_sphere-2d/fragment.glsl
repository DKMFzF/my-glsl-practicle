precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float val = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    val += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return val;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  vec2 mouse = u_mouse / u_resolution;
  vec2 mouseCentered = mouse - 0.5;
  mouseCentered.x *= u_resolution.x / u_resolution.y;

  // Притягиваем к мыши
  float distToMouse = length(p - mouseCentered);
  p += 0.15 * normalize(p - mouseCentered) * exp(-distToMouse * 10.0);

  // Пульсация
  p += 0.15 * sin(5.0 * p.yx + u_time * 1.5);

  float r = length(p);
  float angle = atan(p.y, p.x);

  float n = fbm(p * 3.0 + u_time * 0.5);
  float core = smoothstep(0.3, 0.0, r - n * 0.15);
  float glow = exp(-r * 4.0);

  vec3 gradient = mix(vec3(1.0, 0.2, 0.0), vec3(0.0, 0.0, 1.0), uv.y);
  float rays = sin(angle * 10.0 + u_time * 2.0) * 0.1;
  float rayMask = smoothstep(0.2, 0.0, abs(rays - r));

  vec3 col = vec3(0.0);
  col += core * gradient;
  col += glow * vec3(1.0, 0.0, 1.0);
  col += pow(glow, 1.5) * vec3(0.3, 0.0, 1.0);
  col += rayMask * vec3(1.0, 0.0, 0.8);

  gl_FragColor = vec4(col, 1.0);
}
