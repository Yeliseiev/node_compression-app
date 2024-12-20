'use strict';

const { IncomingForm } = require('formidable');
const http = require('http');
const fs = require('fs');
const { createCompressor } = require('./createCompressor');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.url === '/compress') {
      if (req.method === 'GET') {
        res.statusCode = 400;
        res.end('Wrong method');

        return;
      }

      const form = new IncomingForm();

      form.parse(req, (err, fields, files) => {
        if (err) {
          res.statusCode = 500;
          res.end('Form error');
        }

        if (!files.file) {
          res.statusCode = 400;
          res.end('File not attached');

          return;
        }

        const compressionType = fields.compressionType
          ? fields.compressionType[0]
          : '';
        const dataCompressor = createCompressor(compressionType);

        if (dataCompressor === null) {
          res.statusCode = 400;
          res.end('Choose correct comression type');

          return;
        }

        const originalName = files.file[0].originalFilename;
        const fileToCompress = files.file[0].filepath;
        const fullFileName = originalName + dataCompressor.fileExtension;
        const fileStream = fs.createReadStream(fileToCompress);

        res.statusCode = 200;

        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${fullFileName}`,
        );

        fileStream.pipe(dataCompressor.compressor).pipe(res);

        res.on('close', () => fileStream.destroy());
      });

      return;
    }

    const normalizedUrl = new URL(req.url, `http://${req.headers.host}`);
    const fileName = normalizedUrl.pathname.slice(1) || 'index.html';
    const filePath = path.resolve('public', fileName);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('File not found');

      return;
    }

    const stream = fs.createReadStream(filePath);

    res.setHeader('Content-type', 'text/html');

    stream.pipe(res);
    res.on('close', () => stream.destroy());
  });

  server.on('error', (e) => {
    process.stdout.write('Error: ', e);
  });

  return server;
}

module.exports = {
  createServer,
};
