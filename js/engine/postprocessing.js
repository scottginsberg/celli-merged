import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const MotionBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    velocityFactor: { value: 0.0 },
    delta: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float velocityFactor;
    uniform vec2 delta;
    varying vec2 vUv;

    void main() {
      vec4 color = vec4(0.0);
      float total = 0.0;

      float samples = 5.0;
      float intensity = velocityFactor * 0.015;

      for (float i = 0.0; i < samples; i++) {
        float t = (i / (samples - 1.0)) - 0.5;
        vec2 offset = delta * t * intensity;
        color += texture2D(tDiffuse, vUv + offset);
        total += 1.0;
      }

      gl_FragColor = color / total;
    }
  `
};

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.5 },
    softness: { value: 0.5 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float softness;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);
      float vignette = smoothstep(softness, softness - intensity, dist);
      gl_FragColor = vec4(color.rgb * vignette, color.a);
    }
  `
};

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.002 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;

    void main() {
      vec2 direction = vUv - vec2(0.5);
      float r = texture2D(tDiffuse, vUv + direction * amount).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - direction * amount).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};

export function createPostProcessing({ THREE, renderer, scene, camera, settings }) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    settings.bloomStrength,
    settings.bloomRadius,
    settings.bloomThreshold
  );
  bloomPass.enabled = settings.bloomEnabled;
  composer.addPass(bloomPass);

  const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
  ssaoPass.kernelRadius = settings.ssaoRadius;
  ssaoPass.minDistance = 0.001;
  ssaoPass.maxDistance = 0.1;
  ssaoPass.enabled = settings.ssaoEnabled;
  composer.addPass(ssaoPass);

  const dofPass = new BokehPass(scene, camera, {
    focus: settings.dofFocus,
    aperture: settings.dofAperture,
    maxblur: settings.dofMaxBlur,
    width: window.innerWidth,
    height: window.innerHeight
  });
  dofPass.enabled = settings.dofEnabled;
  composer.addPass(dofPass);

  const filmPass = new FilmPass(settings.filmIntensity, 0.025, 648, settings.filmGrayscale);
  filmPass.enabled = settings.filmEnabled;
  composer.addPass(filmPass);

  const vignettePass = new ShaderPass(VignetteShader);
  vignettePass.uniforms.intensity.value = settings.vignetteIntensity;
  vignettePass.uniforms.softness.value = settings.vignetteSoftness;
  vignettePass.enabled = settings.vignetteEnabled;
  composer.addPass(vignettePass);

  const chromaticAberrationPass = new ShaderPass(ChromaticAberrationShader);
  chromaticAberrationPass.uniforms.amount.value = settings.chromaticAberrationAmount;
  chromaticAberrationPass.enabled = settings.chromaticAberrationEnabled;
  composer.addPass(chromaticAberrationPass);

  const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight);
  smaaPass.enabled = settings.aaEnabled;
  composer.addPass(smaaPass);

  const motionBlurPass = new ShaderPass(MotionBlurShader);
  motionBlurPass.uniforms.delta.value = new THREE.Vector2(0, 0);
  motionBlurPass.enabled = settings.motionBlurEnabled;
  composer.addPass(motionBlurPass);

  return {
    composer,
    bloomPass,
    ssaoPass,
    dofPass,
    filmPass,
    vignettePass,
    chromaticAberrationPass,
    motionBlurPass,
    smaaPass
  };
}
