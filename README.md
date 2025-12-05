# 🎮 Balance Ball

A physics-based browser game where you control a tilting platform to keep a ball balanced while avoiding black holes, collecting score balls, and managing power-ups and power-downs.

**🌐 Play Now: [jurigregg.com/balance-ball](https://jurigregg.com/balance-ball)**

![Balance Ball Game](https://img.shields.io/badge/Status-Live-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎯 Gameplay

Control a platform by tilting and moving it horizontally to keep a ball balanced. Avoid black holes that scroll down the screen, collect score balls to increase your score, and grab power-ups to help you survive longer—but watch out for power-downs!

**Compete for the top spot on the global leaderboard!**

### Controls

| Key | Action |
|-----|--------|
| **A** | Tilt platform left |
| **Z** | Tilt platform right |
| **N** | Move platform left |
| **M** | Move platform right |
| **P** | Pause/Resume game |
| **Space** | Restart game (when game over) |
| **Escape** | Close settings/leaderboard |

## ✨ Features

### Core Mechanics
- **Physics-based ball movement** - Realistic rolling, gravity, and momentum
- **Dual control system** - Tilt AND move the platform independently
- **Auto-leveling** - Platform gradually returns to level when not tilting
- **Score-based gameplay** - Collect score balls to increase your score
- **Pause functionality** - Press P to pause/resume at any time
- **Progressive difficulty** - Black holes speed up as your score increases
- **Frame-rate independent** - Consistent gameplay speed on all devices (30Hz to 144Hz+)

### 🏆 Online Leaderboard
- **Global top 10** - Compete with players worldwide
- **Submit your score** - Enter your name and an optional message
- **Top 3 display** - See the best scores right on the game over screen

### Score Balls
| Points | Size | Speed | Color |
|--------|------|-------|-------|
| 1 | Large | Slow | Gold |
| 3 | Medium | Moderate | Green |
| 5 | Small | Fast | Purple |

### Hazards
- **Black Holes** - Scroll down with gravitational pull
  - Speed increases by 5% every 20 points (max 150%)
  - Getting caught triggers a dramatic sucking animation
  - Game over if the ball is consumed

### Power-Ups (Good Effects)
| Icon | Name | Effect | Duration |
|------|------|--------|----------|
| 🛡️ | Shield | Immunity from black holes | 12 seconds |
| 📏 | Wide Platform | Platform 30% wider | 12 seconds |
| 🧲 | Magnet | Ball grips platform & resists pull | 12 seconds |
| 🔮 | Shrink Ball | Ball shrinks 50% | Permanent |
| 🏀 | Big Ballz | Ball grows 40% | Permanent |
| ⏸️ | Time Freeze | Black holes stop moving | 12 seconds |
| ⚾ | Extra Ball | Second ball - survive if one lost | Until lost |
| 🎲 | Random | Random power-up OR power-down | Varies |

### Power-Downs (Bad Effects)
| Icon | Name | Effect | Duration |
|------|------|--------|----------|
| 📏 | Narrow Platform | Platform shrinks 30% | 12 seconds |
| 🧊 | Ice Mode | Platform super slippery | 12 seconds |
| 👁️ | Blinking Eye | Ball invisible every other second | 12 seconds |
| 📳 | Earthquake | Platform shakes violently | 12 seconds |

### Customization (Settings ⚙️)
- **Ball Color** - White, Red, or Black
- **Platform Width** - Short, Normal, or Wide
- **Music** - Toggle background music on/off
- **Power-Ups** - Enable/disable individual power-ups
- **Power-Downs** - Enable/disable individual power-downs

### Visual Effects
- Cyberpunk/neon aesthetic with animated starfield background
- Particle trails, glowing effects, pulsing auras
- Unique visual feedback for each power-up/power-down
- Dramatic black hole sucking animation

## 🏗️ Architecture

### Frontend (Hostinger)
```
balance-ball/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js          # Game loop & initialization
│   ├── config.js        # Constants & settings
│   ├── state.js         # Game state management
│   ├── entities.js      # Ball, platform, black holes
│   ├── powerups.js      # Power-up system
│   ├── renderer.js      # Canvas drawing
│   ├── ui.js            # UI & leaderboard
│   ├── input.js         # Keyboard handling
│   ├── audio.js         # Music & sound effects
│   └── leaderboard.js   # API calls
└── assets/
    └── sounds/          # Audio files
```

### Backend (Render)
- Node.js + Express API
- Endpoints: GET/POST scores

### Database (Supabase)
- PostgreSQL leaderboard table
- Top 10 scores with names, dates, messages

## 🎨 Technical Details

- **ES6 Modules** - Clean, modular architecture
- **HTML5 Canvas** - All game rendering
- **CSS3** - UI styling with animations
- **LocalStorage** - Persists settings and local best score
- **Delta Time** - Frame-rate independent physics

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🚀 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/balance-ball.git
   cd balance-ball
   ```

2. Start a local server (ES6 modules require this):
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server -c-1
   ```

3. Open `http://localhost:8000/frontend/`

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Developed with assistance from Claude AI
- Inspired by classic balance and tilt games
- 🎵 Music by [Boiling The Ocean](https://www.youtube.com/@boilingtheocean9441)

---

**Have fun balancing! Try to reach the top of the leaderboard!** 🎱🏆

*Live at [jurigregg.com/balance-ball](https://jurigregg.com/balance-ball)*
