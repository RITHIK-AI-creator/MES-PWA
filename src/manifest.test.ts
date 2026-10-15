import fs from 'fs';
import path from 'path';

const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

test('manifest has the required installability fields', () => {
  expect(manifest.name).toBeTruthy();
  expect(manifest.short_name).toBeTruthy();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBeTruthy();
  expect(Array.isArray(manifest.icons)).toBe(true);
});

test('manifest declares a 192x192 and a 512x512 icon, each referencing a file that exists', () => {
  const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
  expect(sizes).toContain('192x192');
  expect(sizes).toContain('512x512');

  for (const icon of manifest.icons) {
    const iconPath = path.join(__dirname, '..', 'public', icon.src);
    expect(fs.existsSync(iconPath)).toBe(true);
  }
});

test('manifest declares at least one maskable icon for adaptive-icon platforms', () => {
  const purposes = manifest.icons.map((icon: { purpose?: string }) => icon.purpose);
  expect(purposes).toContain('maskable');
});

test('the offline fallback page referenced by the service worker exists', () => {
  const offlinePath = path.join(__dirname, '..', 'public', 'offline.html');
  expect(fs.existsSync(offlinePath)).toBe(true);
});
