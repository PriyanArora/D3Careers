const crypto = require("crypto");
require('dotenv').config();

function verifyWebhookSignature(payload, signature){
  if (!process.env.CAL_WEBHOOK_SECRET) {
      throw new Error("CAL_WEBHOOK_SECRET is not set.");
  }
  
  const mySignature = crypto.createHmac('sha256', process.env.CAL_WEBHOOK_SECRET).update(payload).digest('hex');
  let res = false
  
  if(mySignature===signature){
    res = true
  }

  return res
}

module.exports = {verifyWebhookSignature}