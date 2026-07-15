

export function toAsciiEmail(originalEmail: string): string {

  const atIndex = originalEmail.indexOf('@');

  if (atIndex === -1) return originalEmail;

  const localPart = originalEmail.substring(0, atIndex);     
  const domain = originalEmail.substring(atIndex + 1);       

  const asciiLocal = encodeLocalPart(localPart);

  const asciiDomain = /^[\x20-\x7e]+$/.test(domain) ? domain : encodeLocalPart(domain);

  return `${asciiLocal}@${asciiDomain}`;
}

function encodeLocalPart(input: string): string {

  if (/^[\x20-\x7E]+$/.test(input)) {
    return input;
  }

  let result = '';

  for (const char of input) {
    if (/^[\x20-\x7E]$/.test(char)) {

      result += char;
    } else {

      const cp = char.codePointAt(0) || 0;

      result += 'u' + cp.toString(16).padStart(4, '0');
    }
  }

  return result;
}
