const express = require("express");
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const Conversation = require('./models/conversation');
const { getUserPhone, getMessageId, getMessageText } = require("./utilities");
const handle = require("./handle");

app.use(express.json());

// Move to .env file
const token = process.env.WEBHOOK_TOKEN || "token";
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

const META_API_VERSION = 'v22.0';
const PHONE_NUMBER_ID = '634437293095412';


app.get("/", (req, res) => {
  try {
    if (
      req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === token
    ) {
      console.log('Webhook verified:', req.query);
      res.send(req.query['hub.challenge']);
    } else {
      console.log('Webhook verification failed');
      res.sendStatus(403);
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.sendStatus(500);
  }
});



async function sendTypingIndicator(req) {
  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/${META_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: {
  "messaging_product": "whatsapp",
  "status": "read",
  "message_id": getMessageId(req),
  "typing_indicator": {
    "type": "text"
  }
    }});
  
  } catch (error) {
    console.error('Error sending typing indicator:', error);
  }
}

app.post("/", async (req, res) => {
  try {
    if (!getUserPhone(req) || !getMessageId(req) || !getMessageText(req)) 
      return res.sendStatus(200);
        // To start typing indicator
sendTypingIndicator(req);
    const data = await handle(req);
    if (!data)
      return res.sendStatus(200);
    const { phoneNumber, aiResponse } = data;

      const url = `https://graph.facebook.com/${META_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
      await axios.post(url, {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        text: { body: aiResponse || "Sorry! Something went wrong." }
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      return res.sendStatus(200);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      payload: error.config?.data
    });
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));