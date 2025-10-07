# 🎅 Secret Santa Generator

A beautiful, modern web application to organize and manage Secret Santa gift exchanges with ease.

## ✨ Features

### Currently Implemented ✅
- 🎨 **Beautiful Festive UI** - Clean, responsive design with Tailwind CSS
- 👥 **Dynamic Participant Management** - Add/remove participants with smooth animations
- ✍️ **Real-time Form Validation** - Instant feedback on errors
- 📧 **Email Validation** - Ensures valid and unique email addresses
- 📅 **Date Validation** - Prevents selection of past dates
- 🎁 **Wish List Support** - Optional gift preferences for each participant
- 🔔 **Alert Notifications** - Success, error, and warning messages
- 💾 **Supabase Database** - PostgreSQL backend with Row Level Security
- 📱 **Mobile Responsive** - Works perfectly on all devices

### Coming Soon 🚧
- 🎲 Random assignment generation algorithm
- 📨 Email notifications to participants
- 🔒 Anonymous reveal pages
- 🚫 Exclusion rules (e.g., couples, previous matches)
- 📊 Event dashboard
- 📤 Export assignments

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gvzardetto/secret-santa-generator.git
   cd secret-santa-generator
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up the database**
   - Go to your Supabase project SQL Editor
   - Run the SQL script from `database/schema.sql`
   - See `database/README.md` for detailed instructions

4. **Open the application**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   npx serve .
   # Then visit http://localhost:3000
   ```

## 📖 Documentation

- **Database Schema:** [database/README.md](database/README.md)
- **JavaScript Documentation:** [js/README.md](js/README.md)

## 🎯 Usage

1. **Create an Event**
   - Enter event name (e.g., "Office Christmas Party 2025")
   - Select exchange date
   - Set budget (optional)
   - Enter your email as organizer

2. **Add Participants**
   - Enter name and email for each participant
   - Add wish lists (optional)
   - Add more participants with the (+) button
   - Minimum 3 participants required

3. **Submit**
   - Click "🎁 Create Secret Santa Event"
   - Assignments will be generated automatically
   - Each participant receives an email with their assignment

## 🛠️ Technology Stack

- **Frontend:**
  - HTML5
  - Tailwind CSS (via CDN)
  - Vanilla JavaScript (ES6+)

- **Backend:**
  - Supabase (PostgreSQL)
  - Row Level Security (RLS)
  - RESTful API

- **Version Control:**
  - Git
  - GitHub

## 📁 Project Structure

```
secret-santa-generator/
├── index.html              # Main application page
├── js/
│   ├── app.js             # JavaScript functionality
│   └── README.md          # JS documentation
├── database/
│   ├── schema.sql         # Database schema
│   └── README.md          # Database documentation
├── .gitignore             # Git ignore rules
├── env.example            # Environment variables template
└── README.md              # This file
```

## 🔒 Security

- ✅ Environment variables stored in `.env` (not committed)
- ✅ Row Level Security enabled on all tables
- ✅ Email validation and sanitization
- ✅ SQL injection prevention via Supabase client
- ✅ No sensitive data in frontend code

## 🎨 Design Philosophy

- **Festive but Professional** - Holiday-themed without being overwhelming
- **User-Friendly** - Intuitive interface requiring no instructions
- **Accessible** - Keyboard navigation, screen reader support
- **Responsive** - Beautiful on desktop, tablet, and mobile
- **Fast** - Minimal dependencies, optimized performance

## 🐛 Known Issues

- Assignment generation algorithm not yet implemented
- Email sending functionality pending
- No edit functionality for existing events

See [Issues](https://github.com/gvzardetto/secret-santa-generator/issues) for full list.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see below:

```
MIT License

Copyright (c) 2025 Guilherme Zardetto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👨‍💻 Author

**Guilherme Zardetto**
- GitHub: [@gvzardetto](https://github.com/gvzardetto)

## 🎄 Acknowledgments

- Inspired by the joy of holiday gift exchanges
- Built with ❤️ for spreading holiday cheer
- Special thanks to the open-source community

---

**Happy Holidays! 🎅🎁🎄**

