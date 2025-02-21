SpendNot makes paying with UPI seamless while helping you stay on budget. Built with the MERN stack, spendNot streamlines your UPI payment experience by automatically pre-filling the recipient and amount details based on your input and personalized spending limits.

How It Works
Scan to Retrieve Recipient:

Use the in-browser QR scanner to scan a UPI QR code.
The app extracts and verifies the recipient’s UPI ID from the code so that payments can be correctly forwarded.
Select Category & Enter Amount:

Choose from predefined spending categories.
Manually type in the amount you wish to pay—just like a regular UPI transaction.
Budget Verification & Payment Flow:

Behind the scenes, spendNot checks your entered amount against your remaining budget for that category (saved via your user account).
If within budget: The app generates a UPI payment link with the recipient and amount pre-filled and seamlessly redirects you to your UPI app for payment (all you need is to enter your UPI MPIN).
If the payment would exceed your budget: The app deducts habit points as a gentle penalty and displays a pop-up warning—preventing the payment and helping you stick to your spending limits.
Tech Stack
Frontend: React
Backend: Node.js with Express
Database: MongoDB (for saving user accounts, spending limits, and transaction history)
QR Scanning: Integrated browser-based solution



Getting Started
Clone the Repository:

git clone https://github.com/15xa/SpendNot
cd spendNot
Install Dependencies:


npm install
cd client && npm install && cd ..
Configure Environment Variables:
Create a .env file in the root directory with your configurations

Run the Application:

npm run dev
This command runs the Node.js backend and the React frontend concurrently.




