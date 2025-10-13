/**
 * Ocean Shader - Ported from merged2.html
 * 
 * Gerstner wave-based ocean with:
 * - Multiple wave frequencies
 * - Foam rendering
 * - Dynamic lighting
 * - Wind direction
 * - Configurable wave parameters
 */

export const OceanShaderUniforms = {
  time: { value: 0.0 },
  waveAmplitude: { value: 0.08 },
  waveFrequency: { value: 1.5 },
  waveSpeed: { value: 0.8 },
  windDirection: { value: [1.0, 0.3] },
  foamAmount: { value: 0.15 },
  waterColor: { value: [0.0, 0.15, 0.25] },
  foamColor: { value: [0.9, 0.95, 1.0] },
  lightDirection: { value: [0.5, 1.0, 0.3] }
};

export const OceanShaderVertexShader = `
  uniform float time;
  uniform float waveAmplitude;
  uniform float waveFrequency;
  uniform float waveSpeed;
  uniform vec2 windDirection;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vWaveHeight;
  
  // Gerstner wave function
  vec3 gerstnerWave(vec2 pos, float amplitude, float wavelength, float speed, vec2 direction) {
    float k = 2.0 * 3.14159265 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(direction);
    float f = k * (dot(d, pos) - c * time * speed);
    float a = amplitude / k;
    
    return vec3(
      d.x * a * cos(f),
      a * sin(f),
      d.y * a * cos(f)
    );
  }
  
  void main() {
    vPosition = position;
    
    // Multiple Gerstner waves for realistic ocean
    vec3 wave1 = gerstnerWave(position.xz, waveAmplitude, 1.0 / waveFrequency, waveSpeed, windDirection);
    vec3 wave2 = gerstnerWave(position.xz, waveAmplitude * 0.5, 1.5 / waveFrequency, waveSpeed * 1.2, windDirection * 1.3);
    vec3 wave3 = gerstnerWave(position.xz, waveAmplitude * 0.25, 0.8 / waveFrequency, waveSpeed * 0.9, windDirection * 0.7);
    
    vec3 waveOffset = wave1 + wave2 + wave3;
    vec3 newPosition = position + waveOffset;
    
    vWaveHeight = waveOffset.y;
    
    // Calculate normal for lighting
    float delta = 0.01;
    vec3 waveX1 = gerstnerWave(position.xz + vec2(delta, 0.0), waveAmplitude, 1.0 / waveFrequency, waveSpeed, windDirection);
    vec3 waveX2 = gerstnerWave(position.xz + vec2(delta, 0.0), waveAmplitude * 0.5, 1.5 / waveFrequency, waveSpeed * 1.2, windDirection * 1.3);
    vec3 waveX3 = gerstnerWave(position.xz + vec2(delta, 0.0), waveAmplitude * 0.25, 0.8 / waveFrequency, waveSpeed * 0.9, windDirection * 0.7);
    
    vec3 waveZ1 = gerstnerWave(position.xz + vec2(0.0, delta), waveAmplitude, 1.0 / waveFrequency, waveSpeed, windDirection);
    vec3 waveZ2 = gerstnerWave(position.xz + vec2(0.0, delta), waveAmplitude * 0.5, 1.5 / waveFrequency, waveSpeed * 1.2, windDirection * 1.3);
    vec3 waveZ3 = gerstnerWave(position.xz + vec2(0.0, delta), waveAmplitude * 0.25, 0.8 / waveFrequency, waveSpeed * 0.9, windDirection * 0.7);
    
    vec3 tangentX = vec3(delta, (waveX1 + waveX2 + waveX3).y - waveOffset.y, 0.0);
    vec3 tangentZ = vec3(0.0, (waveZ1 + waveZ2 + waveZ3).y - waveOffset.y, delta);
    
    vNormal = normalize(cross(tangentZ, tangentX));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const OceanShaderFragmentShader = `
  uniform float time;
  uniform float foamAmount;
  uniform vec3 waterColor;
  uniform vec3 foamColor;
  uniform vec3 lightDirection;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vWaveHeight;
  
  // Noise function for foam
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    // Lighting
    vec3 lightDir = normalize(lightDirection);
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    
    // Fresnel effect (rim lighting)
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
    
    // Base water color
    vec3 color = waterColor + diffuse * 0.3;
    
    // Foam at wave peaks
    float foamNoise = noise(vPosition.xz * 10.0 + time * 0.5);
    float foamMask = smoothstep(foamAmount - 0.05, foamAmount + 0.05, vWaveHeight + foamNoise * 0.05);
    color = mix(color, foamColor, foamMask * 0.8);
    
    // Add fresnel highlight
    color += fresnel * 0.2;
    
    // Slight depth fade
    color *= 0.8 + diffuse * 0.2;
    
    gl_FragColor = vec4(color, 0.95);
  }
`;

// Create ocean shader material
export function createOceanMaterial(options = {}) {
  const uniforms = {
    time: { value: 0.0 },
    waveAmplitude: { value: options.waveAmplitude || 0.08 },
    waveFrequency: { value: options.waveFrequency || 1.5 },
    waveSpeed: { value: options.waveSpeed || 0.8 },
    windDirection: { value: options.windDirection || [1.0, 0.3] },
    foamAmount: { value: options.foamAmount || 0.15 },
    waterColor: { value: options.waterColor || [0.0, 0.15, 0.25] },
    foamColor: { value: options.foamColor || [0.9, 0.95, 1.0] },
    lightDirection: { value: options.lightDirection || [0.5, 1.0, 0.3] }
  };
  
  return {
    uniforms,
    vertexShader: OceanShaderVertexShader,
    fragmentShader: OceanShaderFragmentShader,
    transparent: true,
    side: 2 // DoubleSide
  };
}

export default {
  uniforms: OceanShaderUniforms,
  vertexShader: OceanShaderVertexShader,
  fragmentShader: OceanShaderFragmentShader,
  createMaterial: createOceanMaterial
};


