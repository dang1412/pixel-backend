export class TextEncoder {
    encode(input: string): Uint8Array {
        const utf8 = unescape(encodeURIComponent(input));
        const result = new Uint8Array(utf8.length);
        for (let i = 0; i < utf8.length; i++) {
            result[i] = utf8.charCodeAt(i);
        }
        return result;
    }
}

export class TextDecoder {
    decode(input: Uint8Array): string {
        const bytes = new Uint8Array(input);
        let result = '';
        for (let i = 0; i < bytes.length; i++) {
            result += String.fromCharCode(bytes[i]);
        }
        try {
            return decodeURIComponent(escape(result));
        } catch (e) {
            throw new Error('The encoded data was not valid.');
        }
    }
}