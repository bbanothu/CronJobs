let cron = require('node-cron');
let nodemailer = require('nodemailer');
const axios = require('axios');

// e-mail transport configuration
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});

// Retieve data 
const makeRequest = async url => {
  let viseTypes = ["Visitor Visa", "Student/Exchange Visitor Visas", "All Other Nonimmigrant Visas"]
  let returnResponse = "";
  try {
    let response = await axios.get(url);
    let json = JSON.stringify(response.data);
    let data = json.split(",")
    data[0] = data[0].toString().substr(13);
    for (let i = 0; i < 3; i++) {
      returnResponse += viseTypes[i] + ": " + data[i] + '\n';
    }
    console.log(returnResponse);
    return returnResponse;
  } catch (error) {
    console.log(error);
  }
}
let response = ""
cron.schedule('* * * * *', async () => {
  // Make the response
  let CityCodes = ["P140", "P29", "P68"];
  let Cities = ["Munich", "Berlin", "FrankFurt"];
  for (let i = 0; i < CityCodes.length; i++) {
    response += Cities[i] + ":" + '\n';
    response += await makeRequest("https://travel.state.gov/content/travel/resources/database/database.getVisaWaitTimes.html?cid=" + CityCodes[i] + "&aid=VisaWaitTimesHomePage") + '\n';
    response += "---------------------------------------------------------" + '\n';
  }

  // Mail options
  let mailOptions = {
    from: '',
    to: '',
    subject: 'Visa Status',
    text: response
  };

  // Send e-mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});