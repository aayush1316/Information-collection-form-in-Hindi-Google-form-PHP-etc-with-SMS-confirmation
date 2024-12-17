const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();


app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get('/', (req, res) => {
    res.render('form');
});

app.post('/submit', (req, res) => {
    const { name, mobile, product, year, stock, rate, whatsapp } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

    // Send OTP via WhatsApp
    client.messages.create({
        body: `Your OTP is ${otp}`,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${whatsapp}`
    }).then(message => {
        console.log(`OTP sent: ${message.sid}`);
        res.render('verify', { otp, formData: req.body });
    }).catch(error => {
        console.error(error);
        res.send('Failed to send OTP. Please try again.');
    });
});

app.post('/verify', (req, res) => {
    const { enteredOtp, otp, formData } = req.body;

    if (enteredOtp === otp) {
        console.log('Form data:', formData);
        res.send('Form submitted successfully!');
    } else {
        res.send('Invalid OTP. Please try again.');
    }
});

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content));
});

function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
        // Now you can call your function to save data to Google Sheets
    });
}

function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            // Now you can call your function to save data to Google Sheets
        });
    });
}

app.get('/', (req, res) => {
    res.render('form');
});

app.post('/submit', (req, res) => {
    const formData = req.body;
    console.log(formData);
    saveToGoogleSheets(formData);
    res.send('Form submitted successfully!');
});

function saveToGoogleSheets(data) {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), (auth) => {
            const sheets = google.sheets({ version: 'v4', auth });
            const values = [
                [data.name, data.mobile, data.product, data.year, data.stock, data.rate, data.whatsapp]
            ];
            const resource = {
                values,
            };
            sheets.spreadsheets.values.append({
                spreadsheetId: 'your-spreadsheet-id',
                range: 'Sheet1!A1',
                valueInputOption: 'RAW',
                resource,
            }, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(`${result.data.updates.updatedCells} cells appended.`);
                }
            });
        });
    });
}

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});