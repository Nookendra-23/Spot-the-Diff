Here's the complete `README.md` file in proper Markdown format:

```markdown
# Spot the Difference Game

A dynamic "Spot the Difference" game that loads configurations from JSON and features:
- Multiple image sets with custom differences
- Animated transitions
- Interactive gameplay with sound effects
- Countdown timer
- Responsive design

## 🚀 Getting Started

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Optional: Node.js for local development server

### Installation
1. Clone the repository:

   git clone https://github.com/your-username/spot-the-difference.git

2. Navigate to project directory:
   ```bash
   cd spot-the-difference
   ```

### Running the Game
#### Method 1: Simple Server
```bash
npx serve
```
Then open `http://localhost:3000` in your browser.

#### Method 2: Direct Access
Open `index.html` directly in your browser.

## 🛠 Configuration

The game uses `config.json` to define all game elements:

### File Structure
```json
{
  "gameTitle": "Spot the Difference",
  "timerDuration": 120,
  "imageSets": [
    {
      "image1": "assets/images/set1-left.jpg",
      "image2": "assets/images/set1-right.jpg",
      "differences": [
        {
          "topLeft": {"x": 100, "y": 100},
          "topRight": {"x": 150, "y": 100},
          "bottomLeft": {"x": 100, "y": 150},
          "bottomRight": {"x": 150, "y": 150}
        }
      ]
    }
  ],
  "successMessage": "Great job! Time left: "
}
```

### Key Fields
| Field | Type | Description |
|-------|------|-------------|
| `gameTitle` | String | Game title displayed in header |
| `timerDuration` | Number | Game duration in seconds |
| `imageSets` | Array | Collection of image pairs |
| `image1/image2` | String | Paths to image files |
| `differences` | Array | Polygon coordinates for each difference |
| `successMessage` | String | Victory message template |

## 🎮 How to Play

1. Click "Start Game" button
2. Examine the two side-by-side images
3. Click on differences you find
4. Find all differences before time runs out
5. View your results and click "Play Again" to restart

## 🖼 Adding New Image Sets

1. Add your image pair to `assets/images/`
2. Update `config.json`:
   ```json
   {
     "imageSets": [
       {
         "image1": "assets/images/new-left.jpg",
         "image2": "assets/images/new-right.jpg",
         "differences": [
           {
             "topLeft": {"x": 50, "y": 75},
             "topRight": {"x": 90, "y": 75},
             "bottomLeft": {"x": 50, "y": 120},
             "bottomRight": {"x": 90, "y": 120}
           }
         ]
       }
     ]
   }
   ```
3. Use developer tools (F12) to identify precise coordinates

## 🔊 Sound Effects
| File | Description | Location |
|------|-------------|----------|
| `click.mp3` | Difference found sound | `assets/sounds/` |
| `success.mp3` | Victory sound | `assets/sounds/` |
| `fail.mp3` | Time expired sound | `assets/sounds/` |

## 📁 Project Structure
```
spot-the-difference/
├── assets/
│   ├── images/       # Game images
│   └── sounds/       # Sound effects
├── index.html        # Main HTML file
├── style.css         # Stylesheet
├── script.js         # Game logic
└── config.json       # Game configuration
```

## 🤝 Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.


