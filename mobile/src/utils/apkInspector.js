import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

const MAX_FULL_HASH_BYTES = 25 * 1024 * 1024;
const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes < 0) {
    return 'Unknown';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function decodeBase64ToBytes(base64) {
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  let padding = 0;
  if (clean.endsWith('==')) {
    padding = 2;
  } else if (clean.endsWith('=')) {
    padding = 1;
  }

  const byteLength = (clean.length * 3) / 4 - padding;
  const output = new Uint8Array(byteLength);
  let outIndex = 0;

  for (let i = 0; i < clean.length; i += 4) {
    const c1 = BASE64_ALPHABET.indexOf(clean[i]);
    const c2 = BASE64_ALPHABET.indexOf(clean[i + 1]);
    const c3 = clean[i + 2] === '=' ? 0 : BASE64_ALPHABET.indexOf(clean[i + 2]);
    const c4 = clean[i + 3] === '=' ? 0 : BASE64_ALPHABET.indexOf(clean[i + 3]);

    const triplet = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
    if (outIndex < byteLength) output[outIndex++] = (triplet >> 16) & 0xff;
    if (outIndex < byteLength) output[outIndex++] = (triplet >> 8) & 0xff;
    if (outIndex < byteLength) output[outIndex++] = triplet & 0xff;
  }

  return output;
}

function bufferToHex(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function containsAsciiMarker(bytes, marker) {
  if (!bytes || bytes.length < marker.length) {
    return false;
  }
  const target = [];
  for (let i = 0; i < marker.length; i += 1) {
    target.push(marker.charCodeAt(i));
  }

  outer: for (let i = 0; i <= bytes.length - target.length; i += 1) {
    for (let j = 0; j < target.length; j += 1) {
      if (bytes[i + j] !== target[j]) {
        continue outer;
      }
    }
    return true;
  }
  return false;
}

function hasValidZipHeader(bytes) {
  return (
    Boolean(bytes) &&
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  );
}

export async function inspectApkFile(asset) {
  if (!asset || !asset.uri) {
    throw new Error('No file selected.');
  }

  const info = await FileSystem.getInfoAsync(asset.uri);
  if (!info.exists) {
    throw new Error('Selected file could not be accessed on device.');
  }

  const fileSize = typeof info.size === 'number' ? info.size : asset.size || 0;
  const headerBase64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
    position: 0,
    length: Math.min(64, Math.max(fileSize, 4))
  });
  const headerBytes = decodeBase64ToBytes(headerBase64);
  const validZipSignature = hasValidZipHeader(headerBytes);

  let sha256 = 'Skipped (file exceeds 25 MB on-device hash cap)';
  let hasSigningBlockV2V3 = false;
  let hasAndroidManifest = false;

  if (fileSize > 0 && fileSize <= MAX_FULL_HASH_BYTES) {
    const fullBase64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64
    });
    const fullBytes = decodeBase64ToBytes(fullBase64);
    const digestBuffer = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, fullBytes);
    sha256 = bufferToHex(digestBuffer);
    hasSigningBlockV2V3 = containsAsciiMarker(fullBytes, 'APK Sig Block 42');
    hasAndroidManifest = containsAsciiMarker(fullBytes, 'AndroidManifest.xml');
  } else if (fileSize > MAX_FULL_HASH_BYTES) {
    const tailLength = 256 * 1024;
    const tailBase64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
      position: Math.max(0, fileSize - tailLength),
      length: tailLength
    });
    const tailBytes = decodeBase64ToBytes(tailBase64);
    hasSigningBlockV2V3 = containsAsciiMarker(tailBytes, 'APK Sig Block 42');
    hasAndroidManifest = containsAsciiMarker(tailBytes, 'AndroidManifest.xml');
  }

  return {
    source: 'device',
    fileName: asset.name || 'selected-package.apk',
    sizeBytes: fileSize,
    formattedSize: formatBytes(fileSize),
    sha256,
    validZipSignature,
    hasSigningBlockV2V3,
    hasAndroidManifest
  };
}
