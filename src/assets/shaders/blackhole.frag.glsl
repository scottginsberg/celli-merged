// Black Hole Fragment Shader
// Creates the central black hole with organic pulsing

varying vec2 vUv;
uniform float time;
uniform float pulseFactor;

void main() {
  vec2 center = vec2(0.5);
  float dist = distance(vUv, center);
  
  // Organic pulsing with multiple harmonics
  float baseRadius = 0.08 + pulseFactor * 0.28;
  float pulse1 = 0.015 * sin(time * 3.5);
  float pulse2 = 0.008 * sin(time * 7.3 + 1.5);
  float radius = baseRadius + pulse1 + pulse2;
  
  // Ultra-soft gradient fade for dreamy quality
  float fadeDistance = radius * 1.6;
  float alpha = 1.0 - smoothstep(radius - fadeDistance, radius, dist);
  
  // Softer alpha curve with slight glow at edges
  alpha = pow(alpha, 0.6) * 0.9;
  
  gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
}


