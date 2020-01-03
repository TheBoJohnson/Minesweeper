const cellEnum = {
	"E": 0,
	"B": 1
};

class GameCell {
	constructor(id) {
		this.id = id;
		this.currentState = cellEnum["E"];
		this.beenPressed = false;
	}

	resetState() {
		this.currentState = cellEnum["E"];
		this.beenPressed = false;
	}

	setPressed() {
		this.beenPressed = true;
		document.querySelector(`#cell-${this.id}`).classList.add("pressed");
	}
}

class GameInstance {
	constructor(boardHeight, boardWidth) {
		this.boardHeight = boardHeight;
		this.boardWidth = boardWidth;
		this.gameBoard = [];
	}

	setUpGameBoard() {
		for (let i = 0; i < this.boardWidth * this.boardHeight; ++i)
			this.gameBoard.push(new GameCell(i));
	}

	initialViewUpdate() {
		let gameGrid = document.querySelector(".game-container__bottom");
		if (gameGrid.children.length === 0) {
			for (let i = 0; i < this.boardWidth * this.boardHeight; ++i) {
				let newButton = document.createElement("button");
				newButton.classList.add("game-cell");
				newButton.id = `cell-${i}`;
				newButton.addEventListener("click", (e) => {
					console.log(e.target.id);
					this.revealGrids(parseInt(e.target.id.substring(5)));
				});

				gameGrid.appendChild(newButton);
			}
		}
	}

	revealGrids(gridId) {
		// Check to see if the current cell has a bomb
		console.log(gridId);
		if (this.gameBoard[gridId].currentState === cellEnum["B"]) {
			// Enter the game over state
			console.log("You hit a bomb so game over");
		} else if(this.gameBoard[gridId].beenPressed) {
			console.log("That cell has already been pressed");
		} else {
			// Show the surrounding squares with BFS
			this.gameBoard[gridId].setPressed();
			let toVisit = [gridId];
			
			while(toVisit.length != 0) {
				// Get the surrounding squares of the initial press and add them to the queue
				let nextCellId = toVisit.pop();
				let adjBombCount = 0;

				// Check the cell to the right of the id
				if ((nextCellId % this.boardWidth != this.boardWidth - 1) && !this.gameBoard[nextCellId + 1].beenPressed) {
					if (this.gameBoard[nextCellId + 1].currentState === cellEnum["B"])
						adjBombCount++;
					else {
						this.gameBoard[nextCellId + 1].setPressed();
						toVisit.push(nextCellId + 1);
					}
				}

				// Check the cell to down of the id
				if ((Math.floor(nextCellId / this.boardHeight) != this.boardHeight - 1) && !this.gameBoard[nextCellId + this.boardHeight].beenPressed) {
					if (this.gameBoard[nextCellId + this.boardHeight].currentState === cellEnum["B"])
						adjBombCount++;
					else {
						this.gameBoard[nextCellId + this.boardHeight].setPressed();
						toVisit.push(nextCellId + this.boardHeight);
					}
				}

				// Check the cell to the left of the id
				if ((nextCellId % this.boardWidth != 0) && !this.gameBoard[nextCellId - 1].beenPressed) {
					if (this.gameBoard[nextCellId - 1].currentState === cellEnum["B"])
						adjBombCount++;
					else {
						this.gameBoard[nextCellId - 1].setPressed();
						toVisit.push(nextCellId - 1);
					}
				}

				// Check the cell to up of the id
				if ((Math.floor(nextCellId / this.boardHeight) != 0) && !this.gameBoard[nextCellId - this.boardHeight].beenPressed) {
					if (this.gameBoard[nextCellId - this.boardHeight].currentState === cellEnum["B"])
						adjBombCount++;
					else {
						this.gameBoard[nextCellId - this.boardHeight].setPressed();
						toVisit.push(nextCellId - this.boardHeight);
					}
				}


				// Check the cell to up and to the right of the id
				if ((nextCellId % this.boardWidth != this.boardWidth - 1 && Math.floor(nextCellId / this.boardHeight) != 0) && !this.gameBoard[nextCellId + 1 - this.boardHeight].beenPressed) {
					if (this.gameBoard[nextCellId + 1 - this.boardHeight].currentState === cellEnum["B"])
						adjBombCount++;
					else {
						this.gameBoard[nextCellId + 1 - this.boardHeight].setPressed();
						toVisit.push(nextCellId + 1 - this.boardHeight);
					}
				}


				// Check the cell to up and to the left of the id
				if ((nextCellId % this.boardWidth != 0 && Math.floor(nextCellId / this.boardHeight) != 0) && !this.gameBoard[nextCellId - 1 - this.boardHeight].beenPressed) {
					if (this.gameBoard[nextCellId - 1 - this.boardHeight].currentState === cellEnum["B"])
						adjBombCount++;
					else {
						this.gameBoard[nextCellId - 1 - this.boardHeight].setPressed();
						toVisit.push(nextCellId - 1 - this.boardHeight);
					}
				}

				// Check the cell to down and to the right of the id
				if ((nextCellId % this.boardWidth != this.boardWidth - 1 && Math.floor(nextCellId / this.boardHeight) != this.boardHeight - 1) && !this.gameBoard[nextCellId + 1 + this.boardHeight].beenPressed) {
					if (this.gameBoard[nextCellId + 1 + this.boardHeight].currentState === cellEnum["B"])
						adjBombCount++;
					else {
						this.gameBoard[nextCellId + 1 + this.boardHeight].setPressed();
						toVisit.push(nextCellId + 1 + this.boardHeight);
					}
				}


				// Check the cell to down and to the left of the id
				if ((nextCellId % this.boardWidth != 0 && Math.floor(nextCellId / this.boardHeight) != this.boardHeight - 1) && !this.gameBoard[nextCellId - 1 + this.boardHeight].beenPressed) {
					if (this.gameBoard[nextCellId - 1 + this.boardHeight].currentState === cellEnum["B"])
						adjBombCount++;
					else {
						this.gameBoard[nextCellId - 1 + this.boardHeight].setPressed();
						toVisit.push(nextCellId - 1 + this.boardHeight);
					}
				}

				if (adjBombCount != 0) {
					document.querySelector(`#cell-${gridId}`).innerText = adjBombCount;
				}
				
			}
			
		}
	}

	setBombs(numBombs) {
		if (numBombs >= (this.boardHeight * this.boardWidth))
			return;

		let numElements = this.boardHeight * this.boardWidth;
		let remaining = numBombs;

		for (let i = 0; i < numElements && remaining > 0; ++i) {
			if (Math.random() < (remaining / (numElements - i))) {
				this.gameBoard[i].currentState = cellEnum["B"];
				remaining--;
				console.log(`Index ${i} has a bomb`);
			}
		}
	}

	resetGrid() {
		// Resets the grid with the current dimensions for another game
		document.querySelectorAll(".game-cell").forEach((cell) => {
			cell.classList.remove("pressed");
			cell.innerText = "";
		});

		this.gameBoard.forEach((cell) => {
			cell.resetState();
		});
	}

	getGameBoard() {
		return this.gameBoard.filter((gameCell) => {
			return gameCell.beenPressed;
		});
	}


	printBoard() {
		console.log(this.gameBoard);
	}
}


// Testing Logic
let test = new GameInstance(8, 8);

document.querySelector(".game-state-btn").addEventListener("click", (e) => {
	test.setUpGameBoard();
	test.initialViewUpdate();
	test.setBombs(20);
	//test.printBoard();
});

document.querySelector("h1").addEventListener("click", (e) => {
	test.resetGrid();
});
