const express = require('express');
const fetch = require('node-fetch');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Замените на ID вашей таблицы
const SHEET_NAME = 'CS2 Cases';
const CLIENT_ID = 'YOUR_CLIENT_ID'; // Замените на client_id из Google Cloud
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET'; // Замените на client_secret из Google Cloud
const REDIRECT_URI = 'http://localhost:3000/oauth2callback'; // Для локального тестирования

// Настройка Google Sheets API
const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
auth.setCredentials({
  // Укажите токен доступа, полученный через OAuth 2.0 (см. ниже)
  access_token: 'YOUR_ACCESS_TOKEN'
});
const sheets = google.sheets({ version: 'v4', auth });

// Прокси для SteamWebAPI
app.get('/steam/price', async (req, res) => {
  const { market_hash_name } = req.query;
  try {
    const response = await fetch(`https://www.steamwebapi.com/market/item?api_key=D7FRHWZYHG9PTJ35&app_id=730&market_hash_name=${encodeURIComponent(market_hash_name)}&currency=RUB`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Чтение данных из Google Sheets
app.get('/sheets/read', async (req, res) => {
  const { spreadsheetId, sheetName } = req.query;
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:B${caseData.length + 1}`
    });
    res.json({ success: true, values: response.data.values });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Запись данных в Google Sheets
app.post('/sheets/write', async (req, res) => {
  const { spreadsheetId, sheetName, name, count, price, totalCost } = req.body;
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:A${caseData.length + 1}`
    });
    const rowIndex = response.data.values.findIndex(row => row[0] === name) + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!B${rowIndex}:D${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[count, price, totalCost]] }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));