import { PassThrough, Readable, ReadableOptions, Stream } from "stream";

export function bufferToStream(buffer: Buffer): Stream {
    const bufferStream: PassThrough = new PassThrough();
    bufferStream.end(buffer);
    return bufferStream;
}

export function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const buffers: Buffer[] = [];
        stream.on('data', (buffer) => buffers.push(buffer));
        stream.on('error', (error) => reject(error));
        stream.on('end', () => resolve(Buffer.concat(buffers)));
    });
}

export class MultiStream extends Readable {
  _object: any;
  constructor(object: any, options: ReadableOptions) {
    super(object instanceof Buffer || typeof object === "string" ? options : { objectMode: true });
    this._object = object;
  }
  _read = () => {
    this.push(this._object);
    this._object = null;
  };
}