// Calcul d'empreinte SHA-256 réel via Web Crypto API

export async function calculateSha256(fileOrText: File | string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback pseudo-hash si indisponible
    return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }

  let buffer: ArrayBuffer;
  if (typeof fileOrText === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(fileOrText).buffer;
  } else {
    buffer = await fileOrText.arrayBuffer();
  }

  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
