# SOS Dine – Smart Ordering System 🍽️

A QR code-based restaurant ordering system. Customers scan table-specific QR codes to browse the menu and place orders. Admins manage orders, menu items, and QR codes from a protected dashboard.

## Features

- **📱 QR Code Ordering** – Each table gets a unique QR code linking directly to the menu
- **🛒 Customer Menu** – Browse categories, add to cart, place orders — no login required
- **📋 Admin Dashboard** – View orders grouped by table, update order status in real-time
- **📖 Menu Management** – Add, edit, delete, and toggle menu items on/off
- **🖨️ QR Code Generator** – Generate and print QR codes for up to 100 tables
- **🌙 Dark Theme** – Premium glassmorphism UI with smooth animations

## How It Works

1. **Admin** generates QR codes from the dashboard and prints them for each table
2. **Customer** scans the QR code → lands on the menu for that specific table
3. Customer browses, adds items to cart, and places an order
4. **Admin** sees the order appear on the dashboard under the correct table number
5. Admin updates order status: **New → Preparing → Ready → Served**

## Tech Stack

- HTML5, Vanilla CSS, Vanilla JavaScript
- QR code generation via [qrcode-generator](https://github.com/nicjohn27/qrcode-generator)
- localStorage for data persistence
- Deployed on Vercel

## Project Structure

```
├── index.html      # Entry point
├── styles.css      # Design system (dark glassmorphism)
├── data.js         # localStorage data layer
├── customer.js     # Customer menu & cart
├── admin.js        # Admin dashboard
├── qr.js           # QR code generation
├── app.js          # Hash-based router
└── vercel.json     # Vercel deployment config
```

## Deployment

This project is deployed on [Vercel](https://vercel.com). Simply push to `main` and Vercel auto-deploys.

## License

MIT
