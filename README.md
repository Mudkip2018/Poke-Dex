# PokéDex - The Ultimate Pokémon Encyclopedia

A comprehensive, responsive, and feature-rich Pokémon encyclopedia built with vanilla JavaScript, HTML, and CSS. This application interacts with the [PokéAPI](https://pokeapi.co/) to provide detailed information about every Pokémon from Generation I through Generation IX.

**[Live Demo](https://pokestatistic.netlify.app)**

## Features

*   **Complete Pokémon Database**: Access data for over 1000+ Pokémon across all 9 generations.
*   **Advanced Search**: Instantly search for Pokémon by name or ID with fuzzy matching capabilities.
*   **Smart Filtering**:
    *   **By Generation**: Filter Pokémon by their region/generation (Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea).
    *   **By Type**: Filter by any of the 18 elemental types (Fire, Water, Grass, Dragon, etc.).
    *   **Legendary/Mythical**: Special filter to quickly showcase legendary and mythical Pokémon.
*   **Detailed Insights**: Click on any Pokémon card to view:
    *   **Base Stats**: Visual progress bars for HP, Attack, Defense, Sp. Atk, Sp. Def, and Speed.
    *   **Moveset**: Comprehensive list of moves, including learn levels and methods.
    *   **Sprites**: View Normal and Shiny variations (Front and Back).
    *   **Flavor Text**: Interesting facts and descriptions from the Pokédex.
*   **Multi-Language Support**: Full support for **English** and **Chinese (Simplified)**, including Pokémon names, moves, types, and interface elements.
*   **Infinite Scrolling**: Seamlessly browse through the list without manual pagination.
*   **Responsive Design**: Fully optimized for a great experience on desktop, tablet, and mobile devices.

## Tech Stack

*   **HTML5**: Semantic structure.
*   **CSS3**: Custom styling, responsive flexbox/grid layouts, and animations.
*   **JavaScript (ES6+)**:
    *   Async/Await for efficient API data fetching.
    *   Dynamic DOM manipulation.
    *   Local Storage for saving language preferences.
*   **API**: Integrated with [PokéAPI](https://pokeapi.co/) for real-time data.

## Installation & Usage

Since this project uses vanilla technologies, no build process or package manager (npm/yarn) is required to run it locally.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/pokestatistic.git
    ```
2.  **Navigate to the project folder:**
    ```bash
    cd pokestatistic
    ```
3.  **Run the application:**
    *   Simply open the `index.html` file in your preferred web browser.
    *   *Optional:* For a better specific experience (especially to avoid CORS issues with some advanced fetch operations if modified), you can use a simple local server extension (like "Live Server" in VS Code).

## Project Structure

*   `index.html`: Main entry point and application structure.
*   `styles.css`: All application styling, definitions for variables, and responsive media queries.
*   `app.js`: Core application logic, including:
    *   API configuration and fetching functions.
    *   State management (filters, language, loading).
    *   Event listeners and UI rendering.
    *   Internationalization (all translation dictionaries).

## License

This project is open source and available under the [MIT License](LICENSE).

---
*Built with ❤️ for Pokémon fans.*
