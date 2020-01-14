/* Emum Objects for Global Use */
const cellEnum = Object.freeze({
	"E": 0,
	"B": 1
});

const directionEnum = Object.freeze({
	"UP": 0,
	"UP-RIGHT": 1,
	"RIGHT": 2,
	"DOWN-RIGHT": 3,
	"DOWN": 4,
	"DOWN-LEFT": 5,
	"LEFT": 6,
	"UP-LEFT": 7
});

const difficultyEnum = Object.freeze({
	"EASY": 0,
	"INTERMEDIATE": 1,
	"HARD": 2
});


/* Classes for displaying and managing the GameBoard and State */

class Dimension {
	constructor(boardWidth, boardHeight) {
		this.boardWidth = boardWidth;
		this.boardHeight = boardHeight;
	}
}

class Cell {
	constructor(id) {
		this.id = id;
		this.currentState = cellEnum["E"];
		this.beenPressed = false;
		this.numBombAdj = 0;
	}

	setPressed() {
		this.beenPressed = true;
	}

	reset() {
		this.beenPressed = false;
		this.numBombAdj = 0;
		this.currentState = cellEnum["E"];
	}
}

class GameBoard {
	constructor(boardWidth, boardHeight) {
		this.boardWidth = boardWidth;
		this.boardHeight = boardHeight;
		this.cellArray = [];
		this.init();
	}

	init() {
		for (let i = 0; i < this.boardWidth * this.boardHeight; ++i) {
			this.cellArray.push(new Cell(i));
		}
	}

	setBombs(numBombs) {
		if (numBombs >= this.cellArray.length) {
			console.log("Too many bombs for this GameBoard");
			return;
		}

		let numElements = this.cellArray.length;
		let remaining = numBombs;

		for (let i = 0; i < numElements && remaining > 0; ++i) {
			if (Math.random() < (remaining / (numElements - i))) {
				this.cellArray[i].currentState = cellEnum["B"];
				remaining--;
			}
		}
	}

	revealCells(startingID) {
		// Reveals the squares around the starting ID
		if (this.cellArray[startingID].beenPressed) {
			return 0;
		}

		let toVisit = [startingID];
		let visitCount = 0;

		while (toVisit.length !== 0) {
			let nextCellID = toVisit.shift();

			if (this.cellArray[nextCellID].isPressed)
				continue;

			this.cellArray[nextCellID].setPressed();
			visitCount++;
			let adjBombCount = 0;
			let tempVisit = [];

			for (let i = 0; i < Object.keys(directionEnum).length; ++i) {
				if (this.revealCell(nextCellID, i, tempVisit)) {
					adjBombCount++;
				}
			}

			if (adjBombCount > 0) {
				this.cellArray[nextCellID].numBombAdj = adjBombCount;
			} else {
				tempVisit = tempVisit.filter((id) => !toVisit.includes(id));
				tempVisit.forEach((id) => toVisit.push(id));
			}
		}


		return visitCount;
	}

	revealCell(nextCellID, direction, visitArray) {
		let adjCellID = 0;

		switch (direction) {
		case directionEnum["UP"]:
			adjCellID = nextCellID - this.boardWidth;
			break;
		case directionEnum["UP-RIGHT"]:
			adjCellID = nextCellID + 1 - this.boardWidth;
			break;
		case directionEnum["RIGHT"]:
			adjCellID = nextCellID + 1;
			break;
		case directionEnum["DOWN-RIGHT"]:
			adjCellID = nextCellID + 1 + this.boardWidth;
			break;
		case directionEnum["DOWN"]:
			adjCellID = nextCellID + this.boardWidth;
			break;
		case directionEnum["DOWN-LEFT"]:
			adjCellID = nextCellID - 1 + this.boardWidth;
			break;
		case directionEnum["LEFT"]:
			adjCellID = nextCellID - 1;
			break;
		case directionEnum["UP-LEFT"]:
			adjCellID = nextCellID - 1 - this.boardWidth;
			break;
		}

		if (this.verifyCellDirection(nextCellID, direction) && !this.cellArray[adjCellID].beenPressed) {

			if (this.cellArray[adjCellID].currentState === cellEnum["B"])
				return true;
			else
				visitArray.push(adjCellID);
		}

		return false;
	}

	// Direction Verify Methods don't use these methods directly instead use verifyCellDirection
	verifyUP(currentID) { return Math.floor(currentID / this.boardWidth) !== 0; }
	verifyRIGHT(currentID) { return currentID % this.boardWidth !== this.boardWidth - 1; }
	verifyDOWN(currentID) {return Math.floor(currentID / this.boardWidth) !== this.boardHeight - 1; }
	verifyLEFT(currentID) {return currentID % this.boardWidth !== 0; }

	verifyCellDirection(currentID, direction) {
		switch(direction) {
		case directionEnum["UP"]:
			return this.verifyUP(currentID);
		case directionEnum["UP-RIGHT"]:
			return this.verifyUP(currentID) && this.verifyRIGHT(currentID);
		case directionEnum["RIGHT"]:
			return this.verifyRIGHT(currentID);
		case directionEnum["DOWN-RIGHT"]:
			return this.verifyDOWN(currentID) && this.verifyRIGHT(currentID);
		case directionEnum["DOWN"]:
			return this.verifyDOWN(currentID);
		case directionEnum["DOWN-LEFT"]:
			return this.verifyDOWN(currentID) && this.verifyLEFT(currentID);
		case directionEnum["LEFT"]:
			return this.verifyLEFT(currentID);
		case directionEnum["UP-LEFT"]:
			return this.verifyUP(currentID) && this.verifyLEFT(currentID);
		}

		return false;
	}


	resetBoard() {
		cellArray.forEach((cell) => cell.reset());
	}
}

class GameInstance {
	constructor() {
		// Model Variables
		this.boardWidth = 0;
		this.boardHeight = 0;
		this.gameBoard = null;
		this.numBombs = 0;
		this.bombsRemaining = 0;
		this.numFreeCells = 0;
		this.isGameOver = false;
		this.isGameWon = false;
		this.gameStarted = false;
		this.gameIntervalID = null;
		this.currentSeconds = 0;
		this.difficulty = null;

		// View Variables
		this.boardContainerElement = document.querySelector(".game-container__bottom");
		this.smileyButton = document.querySelector(".game-state-btn");
		this.smileyButton.addEventListener("click", (event) => this.resetGame());
		this.bombsScreen = document.querySelector("#bombs-screen h1");
		this.bombsScreen.innerText = this.bombsRemaining;
	}

	importGameSettings(gameSettings) {
		// Import the difficulty level
		switch(gameSettings.difficultyLevel) {
		case difficultyEnum["EASY"]:
			this.difficulty = difficultyEnum["EASY"];
			this.numBombs = 10;
			break;

		case difficultyEnum["INTERMEDIATE"]:
			this.difficulty = difficultyEnum["INTERMEDIATE"];
			this.numBombs = 40;
			break;

		case difficultyEnum["HARD"]:
			this.difficulty = difficultyEnum["HARD"];
			this.numBombs = 99;
			break;
		}

		// Import Dimension
		this.boardWidth = gameSettings.dimension.boardWidth;
		this.boardHeight = gameSettings.dimension.boardHeight;

		this.gameBoard = new GameBoard(this.boardWidth, this.boardHeight);

		// Get the number of free cells
		this.numFreeCells = this.boardWidth * this.boardHeight - this.numBombs;

		// Change the CSS representation if necessary
		let gridClass = this.boardContainerElement.classList[1].substring(10); 
		let gridClassArray = gridClass.split("x");
		if (parseInt(gridClassArray[0], 10) !== this.boardWidth || parseInt(gridClassArray[1], 10) !== this.boardHeight) {
			this.boardContainerElement.classList.remove(this.boardContainerElement.classList[1]);
			this.boardContainerElement.classList.add(`game-grid-${this.boardWidth}x${this.boardHeight}`);
		}
		
		this.resetGame();
	}

	displayGameBoard() {
		// Remove all of the previous cells
		this.boardContainerElement.innerHTML = ""; // removed from the view

		// Add all the buttons to the grid with the correct event listener
		for (let i = 0; i < this.gameBoard.cellArray.length; ++i) {
			let newButton = document.createElement("button");
			newButton.classList.add("game-cell");
			newButton.id = `cell-${i}`;
			newButton.addEventListener("click", (event) => {
				if (event.target.className !== "cell-icon")
					this.processButtonClick(parseInt(event.target.id.substring(5), 10));
			});
			newButton.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				if (event.target.className !== "cell-icon") {
					this.toggleFlagOn(parseInt(event.target.id.substring(5), 10));
				} else {
					this.toggleFlagOn(parseInt(event.target.parentElement.id.substring(5), 10));
				}
			});

			this.boardContainerElement.appendChild(newButton);
		}
	}

	processButtonClick(cellID) {
		if (this.isGameOver)
			return;

		if (!this.gameStarted) {
			this.gameStarted = true;
			this.startTimer();
		}

		// Check to see if the button has a bomb
		if (this.gameBoard.cellArray[cellID].currentState === cellEnum["B"]) {
			this.processBombPress(cellID);
		} else {
			let numVisited = this.gameBoard.revealCells(parseInt(cellID, 10));
			this.numFreeCells -= numVisited;
			this.updateGameBoard();

			if (this.numFreeCells === 0) {
				this.isGameOver = true;
				this.isGameWon = true;
				this.showWin();
			}
		}
	}

	showWin() {
		if (!this.isGameWon || !this.isGameOver)
			return;

		this.stopTimer();
		
		// Show win message
		console.log("You won!");
		showNewScoreModal(this.difficulty, this.boardWidth, this.boardHeight, this.currentSeconds);
	}

	processBombPress(cellID) {
		this.stopTimer();
		this.isGameOver = true;
		document.querySelector(`#cell-${cellID}`).classList.add("pressed-bomb");
		//this.smileyButton.innerText = "Frown";
		this.smileyButton.children[0].src = "img/frowny-icon.png";
		this.updateGameBoard();
	}

	updateGameBoard() {
		if (!this.isGameOver) {
			this.gameBoard.cellArray.forEach((cell) => {
				if (cell.beenPressed) {
					let currentCellElement = document.querySelector(`#cell-${cell.id}`);
					currentCellElement.classList.add("pressed");

					if (cell.numBombAdj > 0) {
						switch (cell.numBombAdj) {
						case 1:
							currentCellElement.style.color = "blue";
							break;
						case 2:
							currentCellElement.style.color = "green";
							break;
						case 3:
							currentCellElement.style.color = "red";
							break;
						case 4:
							currentCellElement.style.color = "purple";
							break;
						case 5:
							currentCellElement.style.color = "maroon";
							break;
						case 6:
							currentCellElement.style.color = "CornflowerBlue";
							break;
						case 7:
							currentCellElement.style.color = "black";
							break;
						case 8:
							currentCellElement.style.color = "gray";
							break;
						}

						currentCellElement.innerText = cell.numBombAdj;
					}
				}
			});
		} else {
			this.revealAllBombs();
		}
	}

	revealAllBombs() {
		this.gameBoard.cellArray.forEach((cell) => {
			if (cell.currentState === cellEnum["B"]) {
				document.querySelector(`#cell-${cell.id}`).innerHTML = "<img class='cell-icon' src='img/bomb-icon.png'/>";
			}
		});
	}

	toggleFlagOn(cellID) {
		if (this.isGameOver || this.gameBoard.cellArray[cellID].beenPressed)
			return;

		let targetCell = document.querySelector(`#cell-${cellID}`);

		if (targetCell.innerHTML === "") {
			if (this.bombsRemaining !== 0) {
				targetCell.innerHTML = "<img class='cell-icon' src='img/flag-icon.png'/>";
				this.bombsRemaining--;
			}
		} else {
			targetCell.innerHTML = "";
			this.bombsRemaining += 1;
		}

		this.bombsScreen.innerText = this.bombsRemaining;

	}

	startTimer() {
		this.gameIntervalID = window.setInterval(() => {
			this.currentSeconds++;
			document.querySelector("#time-screen h1").innerText = this.currentSeconds;
		}, 1000);
	}

	stopTimer() {
		window.clearInterval(this.gameIntervalID);
		this.gameIntervalID = null;
	}

	resetGame() {
		// Reset Game State
		this.bombsRemaining = this.numBombs;
		this.isGameOver = false;
		this.isGameWon = false;
		this.numFreeCells = this.gameBoard.boardWidth * this.gameBoard.boardHeight - this.numBombs;
		this.smileyButton.children[0].src = "img/smiley-icon.png";
		this.bombsScreen.innerText = this.bombsRemaining;
		this.gameStarted = false;
		this.currentSeconds = 0;
		document.querySelector("#time-screen h1").innerText = this.currentSeconds;
		this.stopTimer();

		// Reset the state of all the model cells
		this.gameBoard.cellArray.forEach((cell) => cell.reset());

		// Reset the view of the game
		document.querySelectorAll(".game-cell").forEach((cell) => {
			cell.classList.remove("pressed");
			cell.classList.remove("pressed-bomb");
			cell.innerText = "";
		});

		// Generate new bombs
		this.gameBoard.setBombs(this.numBombs);
	}
}

class GameSettings {
	constructor(difficultyLevel, dimension) {
		this.difficultyLevel = difficultyLevel;
		this.dimension = dimension;
	}
}

const diffSelect = document.querySelector("#difficulty-select");
const boardSelect = document.querySelector("#board-size-select");
const selectList = boardSelect.querySelectorAll("option");

function showGridOptions(optionIndexList) {
	let showClass = "valid-board-size";
	let hideClass = "invalid-board-size";

	for (let i = 0; i < selectList.length; ++i) {
		if (optionIndexList.includes(i)) {
			selectList[i].classList.add(showClass);
			selectList[i].classList.remove(hideClass);
		} else {
			selectList[i].classList.add(hideClass);
			selectList[i].classList.remove(showClass);
		}
	}

	boardSelect.value = selectList[optionIndexList[0]].value;
}

// UI Functions and Event Listeners
function changeGameSetting() {
	let dimensionArray = boardSelect.value.split("x");
	return new GameSettings(difficultyEnum[diffSelect.value], new Dimension(parseInt(dimensionArray[0], 10), parseInt(dimensionArray[1], 10)));
}

diffSelect.addEventListener("change", (event) => {
	switch (diffSelect.value) {
	case "EASY":
		showGridOptions([0, 1, 2]);
		break;

	case "INTERMEDIATE":
		showGridOptions([3, 4]);
		break;

	case "HARD":
		showGridOptions([5, 6]);
		break;
	}

	gameObject.importGameSettings(changeGameSetting());
	gameObject.displayGameBoard();
});

boardSelect.addEventListener("change", (event) => {
	gameObject.importGameSettings(changeGameSetting());
	gameObject.displayGameBoard();
});

// Modal UI Variables
const modalArea = document.querySelector(".modal-area");
const modalAreaEnter = document.querySelector(".modal-area__enter");
const modalCloseBtn = document.querySelector(".x-mark");
const difficultyLabel = document.querySelector(".enter__bottom__left p");
const dimensionLabel = document.querySelector(".enter__bottom__middle p");
const timeLabel = document.querySelector(".enter__bottom__right p");


// Functions for UI Event Listeners
function showNewScoreModal(gameDiff, boardWidth, boardHeight, gameTime) {
	modalArea.style.display = "flex";
	modalAreaEnter.style.display = "block";

	switch(gameDiff) {
	case difficultyEnum["EASY"]:
		difficultyLabel.innerText = "Easy";
		break;

	case difficultyEnum["INTERMEDIATE"]:
		difficultyLabel.innerText = "Intermediate";
		break;

	case difficultyEnum["HARD"]:
		difficultyLabel.innerText = "Hard";
		break;
	}

	dimensionLabel.innerText = `${boardWidth} x ${boardHeight}`;
	timeLabel.innerText = gameTime;

	// Setting event listeners
	modalArea.addEventListener("click", closeNewScoreModal);
	modalAreaEnter.addEventListener("click", (event) => event.stopPropagation());
	modalCloseBtn.addEventListener("click", closeNewScoreModal);
}

function closeNewScoreModal() {
	// Clear labels
	difficultyLabel.innerText = "";
	dimensionLabel.innerText = "";
	timeLabel.innerText = "";
	
	// Clear Event Listeners
	modalArea.removeEventListener("click", closeNewScoreModal);
	modalAreaEnter.removeEventListener("click", (event) => event.stopPropagation());
	modalCloseBtn.removeEventListener("click", closeNewScoreModal);

	// Close the Modal
	modalArea.style.display = "none";
	modalAreaEnter.style.display = "none";
}

// Initial Game Object and Setup
const gameObject = new GameInstance();
gameObject.importGameSettings(new GameSettings(difficultyEnum["EASY"], new Dimension(8, 8)));
gameObject.displayGameBoard();
