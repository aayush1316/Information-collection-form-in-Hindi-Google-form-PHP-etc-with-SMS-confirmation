# Form Application with OTP Verification

This project is a Node.js application that creates a form to collect user information in Hindi and verifies the user's WhatsApp number using OTP. Additionally, it includes instructions for hosting a Google Form on a custom domain using Google Workspace.

## Features

- Collects user information in Hindi
- Sends OTP to the user's WhatsApp number for verification
- Verifies the OTP before submitting the form data

## Prerequisites

- Node.js and npm installed
- Twilio account for sending OTPs via WhatsApp
- Google Workspace account for hosting Google Forms

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/form-otp-verification.git
   cd form-otp-verification
2. Install the dependencies:
   ```bash
   npm install
3. Set up environment variables in a `.env` file:

   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number   
