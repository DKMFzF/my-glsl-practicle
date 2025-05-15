precision highp float;
uniform float u_time;
uniform float u_pulse;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_spherePosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// Шумовые функции
float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Основная функция рендеринга
void main() {
  vec2 uv = vUv - 0.5;
  uv.x *= u_resolution.x / u_resolution.y;
  
  // Эффект глубины
  float depth = dot(normalize(vNormal), vec3(0,0,1));
  
  // Динамические искажения
  float pulseFactor = 0.1 * u_pulse;
  uv += 0.1 * sin(u_time + uv.yx * 5.0) * (1.0 + pulseFactor);
  
  // Ядро энергии
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  float n = fbm(uv * 3.0 + u_time * 0.5);
  
  float core = smoothstep(0.3 + pulseFactor*0.1, 0.0, radius - n*0.1);
  float glow = exp(-radius * (4.0 + pulseFactor*2.0));
  
  // Цветовые градиенты
  vec3 colorGradient = mix(
    vec3(1.0, 0.2, 0.0),
    vec3(0.0, 0.5, 1.0),
    vUv.y + 0.2*sin(u_time*0.5)
  );
  
  // Световые лучи
  float rays = sin(angle*10.0 + u_time*2.0) * 0.1;
  float rayEffect = smoothstep(0.2, 0.0, abs(rays - radius)) * (0.8 + 0.2*depth);
  
  // Эффект от мыши - основная сторона
  vec2 mouseUV = vec2(u_mouse.x, 1.0 - u_mouse.y);
  float mouseDist = distance(vUv, mouseUV);
  float mouseEffect = smoothstep(0.3, 0.0, mouseDist) * 0.5;
  
  // Эффект от мыши - противоположная сторона
  vec2 oppositeMouseUV = vec2(1.0 - u_mouse.x, u_mouse.y);
  float oppositeDist = distance(vUv, oppositeMouseUV);
  float oppositeEffect = smoothstep(0.4, 0.0, oppositeDist) * 0.3;
  
  // Собираем все эффекты
  vec3 color = vec3(0.0);
  color += core * colorGradient * (1.0 + pulseFactor);
  color += glow * vec3(1.0, 0.5, 0.8);
  color += rayEffect * vec3(1.0, 0.8, 0.5);
  color += mouseEffect * vec3(1.0, 0.8, 0.2);
  color += oppositeEffect * vec3(0.8, 0.9, 1.0);
  
  gl_FragColor = vec4(color, 1.0);
}
