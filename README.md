BLKBox Social Network

How to Install

1#
Create an env file in the root of the project named .env and fill in the follwing variables: PORT, DB_HOST, DB_PORT, DB_USERNAME, DB_USERNAME_PASSWORD, DB_NAME, ACCESS_TOKEN_SECRET

2# generate ACCESS_TOKEN_SECRET
$ node
> require("crypto").randomBytes(64).toString("hex")
//This will generate a RANDOM string, you can cut paste this string in the .env file

3# 
npm install

4# 
For dev env:
npm run dev

For prod env
npm start

5# Deployment on cpanel server
Create cpanel managed Git repo. .e.g. blk-repo
Create and download public/privates keys from cpanel Security > SSH Access
Put public/private keys in `C:\Users\AC\.ssh` folder in your local computer
Connect with Cpanel Git using ssh link .e.g. ssh://winnyweb@winnyweb.com:7822/home/winnyweb/public_html/blk-repo

Setup nodejs app on cpanel by following this article
    ### Setup Nodejs app on cpanel ###
    https://www.a2hosting.com/kb/cpanel/cpanel-software/create-application-with-nodejs-selector

    example settings:
        Node.js version = latest
        Application mode = Production
        Application root = public_html/blk  // this should not be git repo folder
        Application URL = blkbox.winnyweb.com
        Application startup file = ./src/index.js
        Passenger log file = blk.log  // not working
        Add environment variables
        PORT = 3001 // can 3002,3,4 etc
        DB_HOST = localhost
        DB_PORTDB_USERNAME = DB_USER_ON_SERVER
        DB_USERNAME_PASSWORD = PASSWORD_ON_SERVER
        DB_NAME = DB_NME_ON_SERVER
        ACCESS_TOKEN_SECRET = 3fsfsdferewrwerewrewrwer324322222222222324

Create application.

Create .cpanel.yml file in your app root on your computer. This is for auto deployment. 
The script below will copy files from blk-repo folder to blk folder
    ---
    deployment:
    tasks:
        - export DEPLOYPATH=/home/winnyweb/public_html/blk
        - /bin/cp -R config $DEPLOYPATH
        - /bin/cp -R src $DEPLOYPATH
        - /bin/cp package.json $DEPLOYPATH

Push files to cpanel git.

Click npm install button once the package.json is detected.
Wait for npm install to complete. Error may show up and but app will still work.
Connect with postman to test.

////////////////////////// 
# For htaccess error
create following .htaccess file
    ### .htaccess ###
    DirectoryIndex disabled
    RewriteEngine On
    RewriteRule ^$ http://127.0.0.1:3001/ [P,L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]

# For debugging
Change to development mode
Go to cpanel terminal Advanced > Terminal
run provided command from node.js setup
    source /home/winnyweb/nodevenv/public_html/blk-api/16/bin/activate && cd /home/winnyweb/public_html/blk-api
Then run: `npm start` to run the application