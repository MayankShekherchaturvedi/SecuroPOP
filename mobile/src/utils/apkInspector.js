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
    hasAndroidManifest,
    readOnlyDclReady: null,
    receiverPolicyReady: null
  };
}

export function getSampleApkProfile() {
  const sampleSize = 14829568;
  return {
    source: 'sample',
    fileName: 'corp-notes-android14-sample.apk',
    sizeBytes: sampleSize,
    formattedSize: formatBytes(sampleSize),
    sha256: '4f8c9b2e1d7a6053c8e4b912d6f0a34b8c71e29d04a56f8e2b31c90a7d4e612f',
    validZipSignature: true,
    hasSigningBlockV2V3: true,
    hasAndroidManifest: true,
    readOnlyDclReady: true,
    receiverPolicyReady: true
  };
}

export function buildReadinessChecklist(inspection, enabledCount, totalCount) {
  if (!inspection) {
    return [];
  }

  const archiveStatus = !inspection.validZipSignature
    ? 'fail'
    : inspection.hasAndroidManifest
      ? 'pass'
      : 'warn';

  const archiveDetail = !inspection.validZipSignature
    ? 'Missing PK\\x03\\x04 ZIP header — file does not appear to be an APK.'
    : inspection.hasAndroidManifest
      ? 'Valid ZIP archive header and AndroidManifest.xml detected.'
      : 'Valid ZIP header found, but AndroidManifest.xml was not detected in scanned range.';

  const dclStatus = inspection.readOnlyDclReady === true ? 'pass' : 'warn';
  const dclDetail =
    inspection.readOnlyDclReady === true
      ? 'Sample profile conforms to Android 14+ read-only DCL rules.'
      : 'Verify any dynamically loaded DEX/JAR files call setReadOnly() before loading on Android 14+.';

  const receiverStatus = inspection.receiverPolicyReady === true ? 'pass' : 'warn';
  const receiverDetail =
    inspection.receiverPolicyReady === true
      ? 'Sample profile declares explicit RECEIVER_EXPORTED / NOT_EXPORTED flags.'
      : 'Confirm runtime Context.registerReceiver() calls specify export flags for API 34+.';

  const policyStatus =
    enabledCount === totalCount ? 'pass' : enabledCount > 0 ? 'warn' : 'fail';

  return [
    {
      id: 'archive-header',
      title: 'APK / ZIP Container Integrity',
      status: archiveStatus,
      detail: archiveDetail
    },
    {
      id: 'sig-v2-v3',
      title: 'Signature Scheme v2 / v3 Block',
      status: inspection.hasSigningBlockV2V3 ? 'pass' : 'warn',
      detail: inspection.hasSigningBlockV2V3
        ? 'APK Signing Block v2/v3 marker ("APK Sig Block 42") detected.'
        : 'Signing Block v2/v3 marker not detected; Android 14+ rejects v1-only installs.'
    },
    {
      id: 'dcl-readonly',
      title: 'Read-Only DCL Readiness (Android 14+)',
      status: dclStatus,
      detail: dclDetail
    },
    {
      id: 'exported-receiver',
      title: 'Exported Receiver Policy (API 34+)',
      status: receiverStatus,
      detail: receiverDetail
    },
    {
      id: 'securopop-policy',
      title: 'SecuroPOP Wrapper Guardrails',
      status: policyStatus,
      detail: `${enabledCount} of ${totalCount} runtime protection toggles enabled.`
    }
  ];
}
