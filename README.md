# 🎮 Balance Ball

A physics-based browser game where you control a tilting platform to keep a ball balanced while avoiding black holes and collecting power-ups.

![Balance Ball Game](https://img.shields.io/badge/Status-In%20Development-yellow)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎯 Gameplay

Control a platform by tilting and moving it horizontally to keep a ball balanced. Avoid black holes that scroll down the screen and collect power-ups to help you survive longer!

### Controls

| Key | Action |
|-----|--------|
| **A** | Tilt platform left |
| **Z** | Tilt platform right |
| **N** | Move platform left |
| **M** | Move platform right |
| **Enter** | Restart game (when game over) |
| **Escape** | Close settings |

## ✨ Features

### Core Mechanics
- **Physics-based ball movement** - Realistic rolling, gravity, and momentum
- **Dual control system** - Tilt AND move the platform independently
- **Auto-leveling** - Platform gradually returns to level when not tilting

### Hazards
- **Black Holes** - Scroll down the screen with gravitational pull
  - Gravity field pulls the ball when nearby
  - Getting too close results in a dramatic sucking animation
  - Game over if the ball gets caught

### Power-Ups
| Icon | Name | Effect | Duration |
|------|------|--------|----------|
| 🛡️ | Shield | Immunity from black holes and their gravity | 5 seconds |
| 📏 | Wide Platform | Platform becomes 30% wider | 6 seconds |

### Customization (Settings)
- **Ball Color** - White, Red, or Black
- **Platform Width** - Short (-10%), Normal, or Wide (+10%)
- **Sound Effects** - Toggle on/off (coming soon)
- **Power-Ups** - Enable/disable individual power-ups

### Visual Effects
- Cyberpunk/neon aesthetic
- Particle trails on the ball
- Glowing effects on platform and power-ups
- Pulsing shield aura when protected
- Dramatic black hole sucking animation
- Animated background with twinkling stars

## 🚀 Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/balance-ball.git
   cd balance-ball
   ```

2. Open `index.html` in a web browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server
   ```

3. Navigate to `http://localhost:8000`

### Project Structure

```
balance-ball/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   └── game.js         # Game logic
├── README.md           # This file
├── PROJECT_STATUS.md   # Development roadmap
└── .gitignore          # Git ignore rules
```

## 🎨 Technical Details

- **Pure vanilla JavaScript** - No frameworks or libraries required
- **HTML5 Canvas** - All game rendering
- **CSS3** - UI styling with animations
- **LocalStorage** - Persists best time and settings

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🔧 Configuration

Settings are automatically saved to localStorage and persist between sessions.

### Default Settings
```javascript
{
    ballColor: 'red',
    platformWidth: 'normal',
    soundEnabled: false,
    powerUpShield: true,
    powerUpWidePlatform: true
}
```

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Developed with assistance from Claude AI
- Inspired by classic balance and tilt games

---

**Have fun balancing!** 🎱
