# Equationator 🧮

A fun and interactive math game for kids to practice arithmetic operations. Built with vanilla JavaScript, HTML, and CSS.

## Features 🌟

- Multiple difficulty levels (1-3 digits)
- Various arithmetic operations (➕, ➖, ✖️, ➗)
- Configurable number of operands (2-5 numbers)
- Flexible display formats (horizontal, vertical, or both)
- Real-time progress tracking with visual progress bar
- Timer display in MM:SS format
- Immediate feedback on answers
- End-game summary with detailed results
- Settings persistence across sessions

## Game Interface 🎮

- **Progress Tracking**:
  - Visual progress bar showing completion status
  - Current question number display
  - Timer showing elapsed time in MM:SS format

- **Question Display**:
  - Clean, readable equation presentation
  - Multiple choice answers
  - Immediate visual feedback
  - Support for both horizontal and vertical formats

- **Results Summary**:
  - Total score and percentage
  - Time taken to complete
  - Detailed review of all questions
  - Option to play again

## Installation 🚀

1. Clone the repository:

    ```bash
    git clone https://github.com/TonyCcY/Equationator.git
    cd equationator
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the server:

    ```bash
    node app.js
    ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure 📁

    ```
    equationator/
    ├── app.js
    ├── public/
    │   ├── css/
    │   │   └── styles.css
    │   ├── js/
    │   │   ├── game.js
    │   │   └── utils.js
    │   └── index.html
    └── package.json
    ```

## Technologies Used 💻

- HTML5
- CSS3 (with modern features like Flexbox and Grid)
- JavaScript (ES6+)
- Express.js
- Local Storage API
- MathJax for equation rendering

## Features in Detail 📝

### Difficulty Levels
- One Digit: Numbers from 1 to 9
- Two Digits: Numbers from 10 to 99
- Three Digits: Numbers from 100 to 999

### Math Operations
- Addition (➕)
- Subtraction (➖) with non-negative results
- Multiplication (✖️)
- Division (➗) with whole number results

### Display Formats
- Horizontal: Traditional left-to-right format
- Vertical: Stacked number format
- Both: Random alternation between formats

### Progress Tracking
- Visual progress bar with gradient fill
- Current question counter
- Timer display in MM:SS format
- Persistent game state

## Game Logic 🎲

1. **Question Generation**
   - Random number generation based on selected digit level
   - Special handling for subtraction (ensures positive results)
   - Special handling for division (ensures whole number results)

2. **Answer Options**
   - One correct answer
   - Three plausible wrong answers
   - Random positioning of options

3. **Scoring and Timing**
   - Tracks correct/incorrect answers
   - Measures completion time
   - Provides detailed review of all questions

## Local Storage 💾

The game remembers user preferences:
- Selected digit level
- Number of operands
- Chosen operators
- Number of questions
- Display format preference

## Contributing 🤝

1. Fork the repository from [TonyCcY/Equationator](https://github.com/TonyCcY/Equationator)
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 👏

- Font: Comic Sans MS for kid-friendly interface
- Icons: Emoji icons for intuitive understanding
- Color Scheme: Bright, engaging colors suitable for children
- MathJax: For beautiful mathematical equation rendering