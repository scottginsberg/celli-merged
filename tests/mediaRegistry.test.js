/**
 * Media Registry Tests
 * Ensures asset manifest covers required cinematic/media assets
 */

import { TestRunner, Assert } from './test-runner.js';
import { assetManifest } from '../src/scripts/init.js';

const runner = new TestRunner();

const REQUIRED_MEDIA_ASSETS = [
  { key: 'video_key_alternate_c', preload: false, tags: ['video', 'key'] },
  { key: 'audio_visicell_reboot_theme', preload: true, tags: ['audio', 'scene', 'visicell'] },
  { key: 'audio_visicell_telos_theme', preload: true, tags: ['audio', 'scene', 'visicell'] },
  { key: 'audio_fullhand_leopard_os', preload: true, tags: ['audio', 'scene', 'fullhand'] },
  { key: 'sfx_fullhand_clicker', preload: true, tags: ['audio', 'scene', 'fullhand'] },
  { key: 'sfx_fullhand_keyspam_primary', preload: true, tags: ['audio', 'scene', 'fullhand'] },
  { key: 'sfx_fullhand_keyspam_variant_a', preload: true, tags: ['audio', 'scene', 'fullhand'] },
  { key: 'sfx_fullhand_keyspam_variant_b', preload: true, tags: ['audio', 'scene', 'fullhand'] },
  { key: 'sfx_fullhand_keyspam_variant_c', preload: true, tags: ['audio', 'scene', 'fullhand'] }
];

runner.suite('Media Registry Manifest', ({ test }) => {
  test('registers required cinematic assets', () => {
    REQUIRED_MEDIA_ASSETS.forEach(({ key }) => {
      Assert.truthy(assetManifest[key], `Expected asset "${key}" to be registered in manifest`);
    });
  });

  test('applies expected preload policy', () => {
    REQUIRED_MEDIA_ASSETS.forEach(({ key, preload }) => {
      const entry = assetManifest[key];
      Assert.truthy(entry, `Missing manifest entry for ${key}`);
      Assert.equal(Boolean(entry.preload), preload, `Unexpected preload flag for ${key}`);
    });
  });

  test('tags assets for scene routing', () => {
    REQUIRED_MEDIA_ASSETS.forEach(({ key, tags }) => {
      const entry = assetManifest[key];
      Assert.truthy(entry, `Missing manifest entry for ${key}`);
      const entryTags = entry.tags || [];
      tags.forEach(tag => {
        Assert.truthy(entryTags.includes(tag), `Expected tag "${tag}" on ${key}`);
      });
    });
  });
});

export default runner;
