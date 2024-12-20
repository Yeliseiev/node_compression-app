const zlib = require('zlib');

const compressors = {
  gzip: { extension: '.gzip', create: zlib.createGzip },
  deflate: { extension: '.deflate', create: zlib.createDeflate },
  br: { extension: '.br', create: zlib.createBrotliCompress },
};

function createCompressor(compressionType) {
  const compressorConfig = compressors[compressionType];

  if (!compressorConfig) {
    return null;
  }

  return {
    fileExtension: compressorConfig.extension,
    compressor: compressorConfig.create(),
  };
}

module.exports = {
  createCompressor,
};
