# 🎮 Balance Ball

A physics-based browser game where you control a tilting platform to keep a ball balanced while avoiding black holes, collecting score balls, and managing power-ups and power-downs.

![Balance Ball Game](https://img.shields.io/badge/Status-In%20Development-yellow)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎯 Gameplay

Control a platform by tilting and moving it horizontally to keep a ball balanced. Avoid black holes that scroll down the screen, collect score balls to increase your score, and grab power-ups to help you survive longer—but watch out for power-downs!

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
- **Score-based gameplay** - Collect score balls to increase your score

### Score Balls
| Points | Size | Speed | Color |
|--------|------|-------|-------|
| 1 | Large (black hole size) | Slow | Gold |
| 3 | Medium (default ball size) | Moderate | Green |
| 5 | Small (shrunk ball size) | Fast | Purple |

### Hazards
- **Black Holes** - Scroll down the screen with gravitational pull
  - Gravity field pulls the ball when nearby
  - Getting too close results in a dramatic sucking animation
  - Game over if the ball gets caught

### Power-Ups
| Icon | Name | Effect | Duration |
|------|------|--------|----------|
| 🛡️ | Shield | Immunity from black holes and their gravity | 12 seconds |
| 📏 | Wide Platform | Platform becomes 30% wider | 12 seconds |
| 🧲 | Magnet | Ball grips platform & resists black hole pull (90%) | 12 seconds |
| 🔮 | Shrink Ball | Ball shrinks to 50% size (counters Big Ballz) | Permanent |
| 🏀 | Big Ballz | Ball grows to 140% size (counters Shrink Ball) | Permanent |
| ⏸️ | Time Freeze | Black holes and score balls stop moving | 12 seconds |

### Power-Downs
| Icon | Name | Effect | Duration |
|------|------|--------|----------|
| 📏 | Narrow Platform | Platform shrinks 30% | 12 seconds |
| 🧊 | Ice Mode | Platform becomes super slippery | 12 seconds |

### Customization (Settings)
- **Ball Color** - White, Red, or Black
- **Platform Width** - Short (-10%), Normal, or Wide (+10%)
- **Sound Effects** - Toggle on/off (coming soon)
- **Power-Ups** - Enable/disable individual power-ups
- **Power-Downs** - Enable/disable individual power-downs

### Visual Effects
- Cyberpunk/neon aesthetic
- Particle trails on the ball
- Glowing effects on platform and power-ups
- Pulsing shield aura when protected
- Magnetic field effect when magnet is active
- Frozen cyan effect when time freeze is active
- Icy blue platform when ice mode is active
- Dramatic black hole sucking animation
- Animated background with twinkling stars

## 🚀 Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/balance-ball.git
   cd balance-ball
   ```

2. **Important:** This game uses ES6 modules, so you need to run a local server:
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
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styling
├── js/
│   ├── main.js             # Entry point & game loop
│   ├── config.js           # Constants & settings
│   ├── state.js            # Game state management
│   ├── entities.js         # Ball, platform, black holes, score balls
│   ├── powerups.js         # Power-up system
│   ├── renderer.js         # All drawing functions
│   ├── ui.js               # UI & settings management
│   └── input.js            # Keyboard handling
├── README.md               # This file
├── PROJECT_STATUS.md       # Development roadmap
└── .gitignore              # Git ignore rules
```

## 🎨 Technical Details

- **ES6 Modules** - Clean, modular code architecture
- **HTML5 Canvas** - All game rendering
- **CSS3** - UI styling with animations
- **LocalStorage** - Persists best score and settings

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note:** ES6 modules require running from a web server (not file://)

## 🔧 Configuration

Settings are automatically saved to localStorage and persist between sessions.

### Default Settings
```javascript
{
    ballColor: 'red',
    platformWidth: 'normal',
    soundEnabled: false,
    powerUpShield: true,
    powerUpWidePlatform: true,
    powerUpMagnet: true,
    powerUpShrinkBall: true,
    powerUpBigBallz: true,
    powerUpTimeFreeze: true,
    powerDownNarrowPlatform: true,
    powerDownIceMode: true
}
```

## 🏆 Leaderboard (Coming Soon)

Top 20 high scores will be stored using Supabase PostgreSQL, featuring:
- Player name
- Score
- Date achieved

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Developed with assistance from Claude AI
- Inspired by classic balance and tilt games

---

**Have fun balancing!** 🎱

*Last updated: December 2025*
