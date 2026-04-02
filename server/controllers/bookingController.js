const crypto = require("crypto");
require('dotenv').config();

function verifyWebhookSignature(payload, signature){
  const mySignature = crypto.createHmac('sha256', process.env.CAL_WEBHOOK_SECRET).update(payload).digest('hex');
  let res = false
  
  if(mySignature===signature){
    res = true
  }

  return res
}

module.exports = {verifyWebhookSignature}