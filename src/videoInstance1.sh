#!/bin/bash
sudo su
curl --silent --location https://rpm.nodesource.com/setup_16.x | bash -
yum -y install nodejs

su ec2-user

cat >> server.js  << EOF
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send(req.headers)
})

app.listen(port, () => {
  console.log('Server running on port 3000')
})
EOF

npm install express
npm install pm2 -g


sudo amazon-linux-extras install nginx1
sudo rm /etc/nginx/default.d/custom.conf
sudo cat >>  /etc/nginx/default.d/custom.conf << EOF
 location / {
        # root   html;
        # index  index.html;
        proxy_pass      http://127.0.0.1:3000;
        proxy_redirect  off;

        proxy_set_header    Host                \$host;
        proxy_set_header    X-Real-IP           \$remote_addr;
        proxy_set_header    X-Forwarded-For     \$proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto   \$scheme;
    }
EOF

sudo service nginx restart
pm2 start server.js
