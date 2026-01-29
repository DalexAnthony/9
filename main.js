

let chosenWord = ""; // This will now represent the full phrase
let guessedLetters = [];
let wrongGuesses = 0;
const MAX_GUESSES = 4; // Game has 4 attempts.

// Elements
const wordDisplay = document.getElementById('word-display');
const keyboard = document.getElementById('keyboard');
const wrongCountSpan = document.getElementById('wrong-count');
const resetBtn = document.getElementById('reset-btn');
const statsDisplay = document.getElementById('stats-display');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');

function initGame() {
    chosenWord = PHRASE.toUpperCase();
    guessedLetters = [];
    wrongGuesses = 0;

    // Reset UI
    wordDisplay.innerHTML = '';
    keyboard.innerHTML = '';

    // Reset Stats & Interaction
    statsDisplay.innerHTML = 'Intentos: <span id="wrong-count">0</span> / 4';
    statsDisplay.style.color = "inherit";
    keyboard.style.pointerEvents = 'auto'; // Fix: Re-enable keyboard

    // Create phrase structure
    const words = chosenWord.split(' ');
    words.forEach(word => {
        const wordContainer = document.createElement('div');
        wordContainer.className = 'word-group';

        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const slot = document.createElement('div');

            // Check if it's a letter or punctuation
            if (/[A-ZÁÉÍÓÚÑ]/.test(char)) {
                slot.className = 'letter-slot';
            } else {
                slot.className = 'punctuation';
                slot.textContent = char;
            }
            wordContainer.appendChild(slot);
        }
        wordDisplay.appendChild(wordContainer);
    });

    // Create keyboard
    const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    for (const letter of alphabet) {
        const button = document.createElement('button');
        button.textContent = letter;
        button.className = 'key';
        button.addEventListener('click', () => handleGuess(letter, button));
        keyboard.appendChild(button);
    }

    // Reset Hangman
    document.querySelectorAll('.hangman-part').forEach(part => {
        part.classList.remove('visible');
    });
}

function handleGuess(letter, button) {
    if (guessedLetters.includes(letter) || wrongGuesses >= MAX_GUESSES) return;

    guessedLetters.push(letter);
    button.classList.add('disabled');

    // Simplified normalization for accented letters
    const normalizedLetter = normalizeChar(letter);
    const phraseContainsLetter = chosenWord.split('').some(char => normalizeChar(char) === normalizedLetter);

    if (phraseContainsLetter) {
        button.classList.add('correct');
        updateWordDisplay();
        checkWin();
    } else {
        button.classList.add('wrong');
        wrongGuesses++;
        document.getElementById('wrong-count').textContent = wrongGuesses;
        if (wrongGuesses === 1) showHangmanPart(0); // Head
        else if (wrongGuesses === 2) { showHangmanPart(1); showHangmanPart(2); } // Body & Left Arm
        else if (wrongGuesses === 3) { showHangmanPart(3); showHangmanPart(4); } // Right Arm & Left Leg
        else if (wrongGuesses === 4) showHangmanPart(5); // Right Leg
        checkLoss();
    }
}

function normalizeChar(char) {
    const map = {
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
    };
    return map[char] || char;
}

function updateWordDisplay() {
    const slots = wordDisplay.querySelectorAll('.letter-slot');
    let slotIndex = 0;

    for (let i = 0; i < chosenWord.length; i++) {
        const char = chosenWord[i];
        if (/[A-ZÁÉÍÓÚÑ]/.test(char)) {
            const normalizedChar = normalizeChar(char);
            if (guessedLetters.includes(normalizedChar)) {
                slots[slotIndex].textContent = char;
                slots[slotIndex].classList.add('revealed');
            }
            slotIndex++;
        }
    }
}

function showHangmanPart(index) {
    const part = document.querySelector(`.part-${index}`);
    if (part) part.classList.add('visible');
}

function checkWin() {
    const lettersInPhrase = chosenWord.split('').filter(char => /[A-ZÁÉÍÓÚÑ]/.test(char));
    const isWon = lettersInPhrase.every(char => guessedLetters.includes(normalizeChar(char)));
    if (isWon) {
        // Show message inline instead of modal
        statsDisplay.innerHTML = `<div style="margin-top:20px; font-size:1.2rem; color:#4a148c;">¡Te Amo! ❤️<br><br>"${PHRASE}"</div>`;
        keyboard.style.pointerEvents = 'none';
    }
}

function checkLoss() {
    if (wrongGuesses >= MAX_GUESSES) {
        // Just disable interaction, the hangman drawing is enough
        keyboard.style.pointerEvents = 'none';
    }
}

resetBtn.addEventListener('click', initGame);


// Initialize on load
initGame();

/* Dynamic Hearts Feature */
function createFloatingHearts() {
    const container = document.querySelector('.background-decorations');
    // Clear existing static hearts if any remain
    container.innerHTML = '';

    const heartCount = 150; // Number of hearts to display

    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');

        // Randomize properties
        const randomLeft = Math.random() * 100; // 0% to 100%
        // We will scale the heart instead of changing width/height to avoid layout issues
        const randomScale = Math.random() * 1.5 + 0.5; // Scale from 0.5 to 2.0
        const randomDuration = Math.random() * 10 + 10; // 10s to 20s
        const randomDelay = Math.random() * -20; // Start immediately at different cycles

        // Apply styles
        heart.style.left = `${randomLeft}%`;
        // Use a custom property for scale if needed, but since keyframe uses transform, we should be careful.
        // The keyframe 'float' does: transform: translateY(...) rotate(45deg) scale(0.5) -> scale(1.2).
        // If we want random sizes, we can't easily override scale in inline style if the animation overrides it.
        // The animation changes scale. So simply resizing width/height is better if CSS supports it.
        // I updated CSS to be relative (width: 100% for ::before/after).
        // So simply setting width/height on the parent .heart works perfectly now.
        const size = 20 * randomScale;
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;

        heart.style.animationDuration = `${randomDuration}s`;
        heart.style.animationDelay = `${randomDelay}s`;

        // Interaction: Split on click
        heart.onclick = function (e) {
            const rect = heart.getBoundingClientRect();
            heart.remove();
            createSplitHeart(rect.left, rect.top, -30); // Move left
            createSplitHeart(rect.left, rect.top, 30);  // Move right
        };

        container.appendChild(heart);
    }
}

function createSplitHeart(x, y, tx) {
    const container = document.querySelector('.background-decorations');
    const heart = document.createElement('div');
    heart.classList.add('heart');

    // Set position to where the click happened
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.position = 'fixed'; // Ensure it stays where clicked
    heart.style.width = '15px';
    heart.style.height = '15px';
    heart.style.opacity = '0.8';

    // Custom animation
    heart.style.setProperty('--tx', `${tx}px`);
    heart.style.animation = 'drift 1s forwards ease-out';

    container.appendChild(heart);

    // Remove after animation
    setTimeout(() => {
        heart.remove();
        // Optionally respawn a new floating heart to maintain density
        spawnSingleFloatingHeart();
    }, 1000);
}

function spawnSingleFloatingHeart() {
    const container = document.querySelector('.background-decorations');
    const heart = document.createElement('div');
    heart.classList.add('heart');
    const randomLeft = Math.random() * 100;
    const randomScale = Math.random() * 1.5 + 0.5;
    const randomDuration = Math.random() * 10 + 10;
    heart.style.left = `${randomLeft}%`;
    const size = 20 * randomScale;
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.animationDuration = `${randomDuration}s`;

    // Interaction
    heart.onclick = function (e) {
        const rect = heart.getBoundingClientRect();
        heart.remove();
        createSplitHeart(rect.left, rect.top, -30);
        createSplitHeart(rect.left, rect.top, 30);
    };

    container.appendChild(heart);
}

// Call function
createFloatingHearts();
