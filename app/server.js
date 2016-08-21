import webpack from 'webpack';
import webpackConfig from '../webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';

const app = express();
app.use(fileUpload());
const compiler = webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  lazy: false,
  watchOptions: {
    aggregateTimeout: 300,
    poll: true
  },
  publicPath: webpackConfig.output.publicPath
}));

app.use(webpackHotMiddleware(compiler, {
  log: console.log
}));

app.use(express.static('./public'));

app.post('/api/uploaded-images', function(req, res) {
  const imageFile = req.files.image;
  const targetName = generateTargetName(imageFile.name);
  imageFile.mv('./public/uploaded-images/' + targetName, function(err) {
    if (err) return res.status(500).send('Error happens when uploading');
    res.status(201).send('/uploaded-images/' + targetName);
  })
});

function generateTargetName(fileName) {
  const extName = path.extname(fileName);
  const prefixName = path.basename(fileName, extName);
  const timestamp = Date.now();
  return prefixName + '-' + timestamp + extName;
}

app.listen(3000, function() {
  console.log('Listening on 3000');
});