const board = document.getElementById("board");

let solutionBoard = [];
let puzzleBoard = [];

const errorDisplay = document.getElementById("errors");

let errors = 0;

const timerDisplay = document.getElementById("timer");
const pauseTimerBtn = document.getElementById("pauseTimerBtn");

let secondsElapsed = 0;
let timerInterval = null;
let timerStarted = false;
let timerPaused = false;

const solveBtn = document.getElementById("solveBtn");

const newGameBtn = document.getElementById("newGameBtn");

const customSolveBtn = document.getElementById("customSolveBtn");

const catGif = document.getElementById("catGif");
const yippeeGif = document.getElementById("yippeeGif");

const winModal = document.getElementById("winModal");
const modalTime = document.getElementById("modalTime");
const modalErrors = document.getElementById("modalErrors");
const modalPlayAgainBtn = document.getElementById("modalPlayAgainBtn");

const sudokuInput = document.getElementById("sudokuInput");

let selectedCell = null;

// create 81 cells
for (let i = 0; i < 81; i++) {

    const cell = document.createElement("input");

    cell.dataset.row = Math.floor(i / 9);
    cell.dataset.col = i % 9;

    cell.type = "text";
    cell.maxLength = 1;
    cell.inputmode = "none";

    cell.classList.add("cell");

    cell.addEventListener("click", () => {

        if (timerPaused) return;

        if (selectedCell) {
            selectedCell.classList.remove("selected");
        }

        selectedCell = cell;
        cell.classList.add("selected");
    });

    const row = Math.floor(i / 9);
    const col = i % 9;

    if (row === 0) cell.style.borderTop = "3px solid #222";
    if (col === 0) cell.style.borderLeft = "3px solid #222";

    if ((row + 1) % 3 === 0)
        cell.style.borderBottom = "3px solid #222";

    if ((col + 1) % 3 === 0)
        cell.style.borderRight = "3px solid #222";

    board.appendChild(cell);
}

// keyboard input
document.addEventListener("keydown", (e) => {
    // Prevent interception when typing in the custom solver or other inputs/textareas
    const activeEl = document.activeElement;
    const isTextareaOrInput = (e.target && (e.target.tagName === "TEXTAREA" || (e.target.tagName === "INPUT" && !e.target.classList.contains("cell")))) ||
        (activeEl && (activeEl.tagName === "TEXTAREA" || (activeEl.tagName === "INPUT" && !activeEl.classList.contains("cell"))));
    if (isTextareaOrInput) {
        return;
    }

    if (timerPaused) {
        e.preventDefault();
        return;
    }

    if (!selectedCell) return;

    if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        fillSelectedCell(Number(e.key));
    }
    else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        selectedCell.value = "";
        selectedCell.classList.remove("wrong");
        updateNumberBar();
    }
    else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const currentRow = Number(selectedCell.dataset.row);
        const currentCol = Number(selectedCell.dataset.col);
        let nextRow = currentRow;
        let nextCol = currentCol;

        if (e.key === "ArrowUp") nextRow = (currentRow - 1 + 9) % 9;
        if (e.key === "ArrowDown") nextRow = (currentRow + 1) % 9;
        if (e.key === "ArrowLeft") nextCol = (currentCol - 1 + 9) % 9;
        if (e.key === "ArrowRight") nextCol = (currentCol + 1) % 9;

        const nextCell = document.querySelector(`.cell[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextCell) {
            selectedCell.classList.remove("selected");
            selectedCell = nextCell;
            selectedCell.classList.add("selected");
            selectedCell.focus();
        }
    }
    else {
        // Block other text input in the cell, but allow keyboard shortcuts/functional keys
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
        }
    }
});

// number bar
const numberBar = document.getElementById("number-bar");

for (let num = 1; num <= 9; num++) {

    const btn = document.createElement("button");

    btn.textContent = num;
    btn.classList.add("number-btn");

    btn.addEventListener("click", () => {

        if (timerPaused) return;

        if (!selectedCell) return;

        fillSelectedCell(num);
    });

    numberBar.appendChild(btn);
}

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}

function isValid(board, row, col, num) {

    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) {
            return false;
        }
    }

    // Check column
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) {
            return false;
        }
    }

    // Check 3x3 box
    let startRow = row - row % 3;
    let startCol = col - col % 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {

            if (board[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }

    return true;
}

function solveBoard(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (board[row][col] === 0) {

                for (let num = 1; num <= 9; num++) {

                    if (isValid(board, row, col, num)) {

                        board[row][col] = num;

                        if (solveBoard(board)) {
                            return true;
                        }

                        board[row][col] = 0;
                    }
                }

                return false;
            }
        }
    }

    return true;
}

function fillBoard(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (board[row][col] === 0) {

                let numbers =
                    shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

                for (let num of numbers) {

                    if (isValid(board, row, col, num)) {

                        board[row][col] = num;

                        if (fillBoard(board)) {
                            return true;
                        }

                        board[row][col] = 0;
                    }
                }

                return false;
            }
        }
    }

    return true;
}

function createPuzzle(board, clues = 35) {

    let puzzle =
        board.map(row => [...row]);

    let positions = [];

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            positions.push([row, col]);
        }
    }

    shuffle(positions);

    let cellsToRemove = 81 - clues;

    for (let [row, col] of positions) {

        if (cellsToRemove === 0) break;

        const backup = puzzle[row][col];

        puzzle[row][col] = 0;

        const copy =
            puzzle.map(r => [...r]);

        const solutions =
            countSolutions(copy);

        if (solutions !== 1) {

            puzzle[row][col] = backup;
        }
        else {

            cellsToRemove--;
        }
    }

    return puzzle;
}

function renderBoard(board) {

    const cells = document.querySelectorAll(".cell");

    cells.forEach((cell, index) => {

        const row = Math.floor(index / 9);

        const col = index % 9;

        const value = board[row][col];

        if (value !== 0) {

            cell.value = value;

            cell.disabled = true;

            cell.classList.add("fixed");
        }
        else {

            cell.value = "";

            cell.disabled = false;

            cell.classList.remove("fixed");
        }

        cell.classList.remove("wrong");
        cell.classList.remove("selected");
        cell.classList.remove("cell-flip");
    });

    // NEW: reset number bar state on every board render
    updateNumberBar();
}

solutionBoard =
    Array(9)
        .fill()
        .map(() => Array(9).fill(0));

// FIX: guard against fillBoard failure (extremely rare but defensive)
if (!fillBoard(solutionBoard)) {
    console.error("Failed to generate a valid Sudoku board.");
}

puzzleBoard = createPuzzle(solutionBoard, 35);

renderBoard(puzzleBoard);

function fillSelectedCell(value) {

    if (timerPaused) return;

    if (!selectedCell) return;

    if (selectedCell.disabled) return;

    if (!timerStarted) {

        startTimer();

        timerStarted = true;
    }

    const row = Number(selectedCell.dataset.row);

    const col = Number(selectedCell.dataset.col);

    selectedCell.value = value;

    // FIX: use strict inequality
    if (value !== solutionBoard[row][col]) {

        errors++;

        errorDisplay.textContent = errors;

        selectedCell.classList.add("wrong");

        showCat();
    }
    else {

        selectedCell.classList.remove("wrong");
    }


    updateNumberBar();

    if (checkWin()) {

        stopTimer();
        timerStarted = false;
        setTimerPaused(false);

        setTimeout(() => {
            showYippee();
            showWinModal();
        }, 500);
    }
}

function startTimer() {

    if (timerInterval) return;

    timerInterval = setInterval(() => {

        secondsElapsed++;

        const minutes = Math.floor(secondsElapsed / 60);

        const seconds = secondsElapsed % 60;

        timerDisplay.textContent =
            String(minutes).padStart(2, "0")
            + ":" +
            String(seconds).padStart(2, "0");

    }, 1000);
}

function stopTimer() {

    clearInterval(timerInterval);
    timerInterval = null;
}

function setTimerPaused(isPaused) {

    timerPaused = isPaused;

    board.classList.toggle("paused", timerPaused);
    pauseTimerBtn.textContent = timerPaused ? "resume" : "pause";
    pauseTimerBtn.setAttribute(
        "aria-label",
        timerPaused ? "Resume timer" : "Pause timer"
    );

    if (timerPaused) {
        stopTimer();

        if (selectedCell) {
            selectedCell.classList.remove("selected");
            selectedCell.blur();
            selectedCell = null;
        }

        return;
    }

    if (timerStarted) {
        startTimer();
    }
}

function toggleTimerPaused() {

    setTimerPaused(!timerPaused);
}

// FIX: verify cell values against solutionBoard directly, not just class state
function checkWin() {

    const cells =
        document.querySelectorAll(".cell");

    for (let cell of cells) {

        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);

        if (cell.value === "" || Number(cell.value) !== solutionBoard[row][col]) {
            return false;
        }
    }

    return true;
}

function showSolvedBoard() {

    const cells =
        document.querySelectorAll(".cell");

    cells.forEach((cell, index) => {

        const row = Math.floor(index / 9);
        const col = index % 9;

        setTimeout(() => {

            cell.classList.add("cell-flip");

            setTimeout(() => {

                cell.value = solutionBoard[row][col];
                cell.disabled = true;
                cell.classList.remove("wrong");

            }, 250);

            setTimeout(() => {

                cell.classList.remove("cell-flip");

            }, 500);

        }, (row + col) * 120);
    });

    // NEW: update number bar after the full solve animation completes
    setTimeout(() => {

        updateNumberBar();

    }, (8 + 8) * 120 + 600);
}

function startNewGame() {

    hideWinModal();

    stopTimer();
    timerStarted = false;
    secondsElapsed = 0;
    timerDisplay.textContent = "00:00";

    errors = 0;
    errorDisplay.textContent = errors;

    if (selectedCell) {
        selectedCell.classList.remove("selected");
        selectedCell = null;
    }

    // FIX: use setTimerPaused to centralize all pause-related state reset
    setTimerPaused(false);

    solutionBoard =
        Array(9)
            .fill()
            .map(() => Array(9).fill(0));

    // FIX: guard against fillBoard failure
    if (!fillBoard(solutionBoard)) {
        console.error("Failed to generate a valid Sudoku board.");
        return;
    }

    puzzleBoard = createPuzzle(solutionBoard, 35);

    renderBoard(puzzleBoard);
}

newGameBtn.addEventListener("click", () => {
    startNewGame();
});

pauseTimerBtn.addEventListener("click", () => {
    toggleTimerPaused();
});

solveBtn.addEventListener("click", () => {

    const confirmSolve =
        confirm(
            "sure?"
        );

    if (!confirmSolve) return;

    showSolvedBoard();

    stopTimer();
    timerStarted = false;
    setTimerPaused(false);
});

function stringToBoard(str) {

    let board = [];

    for (let row = 0; row < 9; row++) {

        let currentRow = [];

        for (let col = 0; col < 9; col++) {

            currentRow.push(
                Number(
                    str[row * 9 + col]
                )
            );
        }

        board.push(currentRow);
    }

    return board;
}

customSolveBtn.addEventListener("click", () => {

    let input = sudokuInput.value.trim();

    if (!/^[0-9]{81}$/.test(input)) {

        alert(
            "Use exactly 81 digits (0-9 only)."
        );

        return;
    }

    let board = stringToBoard(input);

    const validation =
        validateCustomSudoku(board);

    if (!validation.valid) {

        alert(validation.message);

        return;
    }

    solveBoard(board);

    solutionBoard = board.map(row => [...row]);

    stopTimer();
    timerStarted = false;
    setTimerPaused(false);

    renderBoard(board);
});

// FIX: removed the setSelectionRange(0,0) on focus — it reset the cursor
// position unexpectedly. Users can now click/focus normally.

function countSolutions(board) {

    let count = 0;

    function backtrack() {

        if (count > 1) return;

        for (let row = 0; row < 9; row++) {

            for (let col = 0; col < 9; col++) {

                if (board[row][col] === 0) {

                    for (let num = 1; num <= 9; num++) {

                        if (isValid(board, row, col, num)) {

                            board[row][col] = num;

                            backtrack();

                            board[row][col] = 0;
                        }
                    }

                    return;
                }
            }
        }

        count++;
    }

    backtrack();

    return count;
}

function isBoardValid(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            const num = board[row][col];

            if (num === 0) continue;

            board[row][col] = 0;

            if (!isValid(board, row, col, num)) {

                board[row][col] = num;

                return false;
            }

            board[row][col] = num;
        }
    }

    return true;
}

function validateCustomSudoku(board) {

    if (!isBoardValid(board)) {

        return {
            valid: false,
            message:
                "Invalid Sudoku. Duplicate numbers found."
        };
    }

    const solutions =
        countSolutions(
            board.map(row => [...row])
        );

    if (solutions === 0) {

        return {
            valid: false,
            message:
                "This Sudoku has no solution."
        };
    }

    if (solutions > 1) {

        return {
            valid: false,
            message:
                "This Sudoku has multiple solutions."
        };
    }

    return {
        valid: true
    };
}

function showCat() {

    catGif.classList.add("show");

    setTimeout(() => {

        catGif.classList.remove("show");

    }, 1400);
}

function showYippee() {

    yippeeGif.classList.add("show");

}

function updateNumberBar() {

    const cells = document.querySelectorAll(".cell");

    const counts = Array(10).fill(0);

    for (let cell of cells) {

        const val = Number(cell.value);

        if (val >= 1 && val <= 9) {
            counts[val]++;
        }
    }

    const buttons = numberBar.querySelectorAll(".number-btn");

    buttons.forEach((btn) => {

        const num = Number(btn.textContent);

        if (counts[num] === 9) {
            btn.classList.add("number-btn-used");
        }
        else {
            btn.classList.remove("number-btn-used");
        }
    });
}

function showWinModal() {
    modalTime.textContent = timerDisplay.textContent;
    modalErrors.textContent = errors;
    winModal.classList.add("show");
}

function hideWinModal() {
    winModal.classList.remove("show");
    yippeeGif.classList.remove("show");
}

modalPlayAgainBtn.addEventListener("click", () => {
    hideWinModal();
    startNewGame();
});