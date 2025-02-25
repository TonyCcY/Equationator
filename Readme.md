# Equationator 🧮

A fun and interactive math game for kids to practice arithmetic operations. Built with vanilla JavaScript, HTML, and CSS.

[Live Demo](https://github.com/TonyCcY/Equationator)

## Features 🌟

- Multiple difficulty levels (1-3 digits)
- Various arithmetic operations (➕, ➖, ✖️, ➗)
- Configurable number of operands (2-5 numbers)
- Flexible display formats (horizontal, vertical, or both)
- Progress tracking
- Immediate feedback
- End-game summary with detailed results
- Settings persistence across sessions

## Demo 🎮

![Equationator Demo](demo.gif)

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
- CSS3
- JavaScript (ES6+)
- Express.js
- Local Storage API

## Features in Detail 📝

### Difficulty Levels
- One Digit: Numbers from 1 to 9
- Two Digits: Numbers from 10 to 99
- Three Digits: Numbers from 100 to 999

### Math Operations
- Addition (➕)
- Subtraction (➖)
- Multiplication (✖️)
- Division (➗)

### Display Formats
- Horizontal: Traditional left-to-right format
- Vertical: Stacked number format
- Both: Shows both formats simultaneously

## Game Logic 🎲

1. **Question Generation**
   - Random number generation based on selected digit level
   - Special handling for subtraction (ensures positive results)
   - Special handling for division (ensures whole number results)

2. **Answer Options**
   - One correct answer
   - Three plausible wrong answers
   - Random positioning of options

3. **Scoring**
   - Tracks correct/incorrect answers
   - Calculates completion time
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