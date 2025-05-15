import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;

let pulseIntensity = 0;
let pulseDirection = 1;

const uniforms = {
  u_time: { value: 0 },
  u_pulse: { value: 0 },
  u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_spherePosition: { value: new THREE.Vector3() }
};

// Вершинный шейдер
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
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
    float pulseFactor = 0.5 * u_pulse;
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
    float rayEffect = smoothstep(0.2, 0.0, abs(rays - radius));
    
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
`;

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  })
);
scene.add(sphere);

function animate() {
  requestAnimationFrame(animate);
  
  uniforms.u_time.value += 0.01;
  pulseIntensity += 0.01 * pulseDirection;
  if (pulseIntensity > 1.0 || pulseIntensity < 0.0) pulseDirection *= -1;
  uniforms.u_pulse.value = pulseIntensity;
  
  uniforms.u_spherePosition.value.copy(sphere.position);
  
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousemove', (e) => {
  uniforms.u_mouse.value.x = e.clientX / window.innerWidth;
  uniforms.u_mouse.value.y = e.clientY / window.innerHeight;
});

animate();
