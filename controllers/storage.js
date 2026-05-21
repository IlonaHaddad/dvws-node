const jwt = require('jsonwebtoken');
const url = require('url');
const fs = require('fs');
const http = require('http');
const path = require('path');
const os = require('os');

const options = {
    expiresIn: '2d',
    issuer: 'https://github.com/snoopysecurity',
    algorithms: ["HS256", "none"],
    ignoreExpiration: true
  };


module.exports = {
    post: (req, res) => {

        let sampleFile;
        let uploadPath;

        let result = {}

        const token = req.headers.authorization.split(' ')[1]; 
        result = jwt.verify(token, process.env.JWT_SECRET, options);
        const safeUser = path.basename(result.user);

        if (!req.files.file || Object.keys(req.files.file).length === 0) {
            res.status(400).send('No files were uploaded.');
            return;
        }


        sampleFile = req.files.file;
        const safeFileName = path.basename(sampleFile.name);
        uploadPath = path.join(__dirname, '/../public/uploads/', safeUser);


        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }

        if (typeof sampleFile.name !== 'undefined') {
            if ( safeFileName.endsWith(".xml") == false ) {
                res.status(400).send("Uploaded file is not an XML file.");
                return;
            }
            }

        filePath = path.join(__dirname, '/../public/uploads/', safeUser, safeFileName);


        sampleFile.mv(filePath, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
            res.json('File uploaded to your private user directory');
        });

    },

    fetch: (req, res) => {
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        result = jwt.verify(token, process.env.JWT_SECRET, options);
        const safeUser = path.basename(result.user);
        const safeFilename = path.basename(req.body.filename);
        var filename = path.resolve(path.join(process.cwd(), 'public/uploads/', safeUser, safeFilename)); 
        res.download(filename);
          
      },

    get: (req, res) => {

        let result = {}
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        result = jwt.verify(token, process.env.JWT_SECRET, options);
        const safeUser = path.basename(result.user);

        uploadPath = path.join(__dirname, '/../public/uploads/', safeUser);
        var resultData = [];

        fs.readdir(uploadPath, function (err, files) {
            if (err) {
                res.json('No files Uploaded ' + err);
            } else {
            files.forEach(function (file) {
                resultData.push(file);
                
            });
            res.json(resultData);
        }
            
        });


    }
};