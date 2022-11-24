var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const CELL_SIZE = WIDTH / 8;

const GRID_COLOUR1 = "#ebecd0";
const GRID_COLOUR2 = "#779556";
const SELECTED_COLOUR = "#f7f769";
const COLOURS = [GRID_COLOUR2, GRID_COLOUR1];

var board = [];
var white = [];
var black = [];

const ICON_WIDTH = 60;
const ICON_HEIGHT = 60;
const ICON_X_PADDING = (CELL_SIZE - ICON_WIDTH) / 2;
const ICON_Y_PADDING = (CELL_SIZE - ICON_HEIGHT) / 2;

const ANIMATION_STEPS = 10;
var animatedPiece = null;
var animationStep = 0;
var animationX = 0;
var animationY = 0;


function cellToCoord(x, y) {
    return [x * ICON_WIDTH, y*ICON_HEIGHT];
}

function s2b(x, y) {
    return [x, 7-y];
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

class Pawn {
    constructor(x, y, colour) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.moved = false;
        this.icon = new Image();

        this.icon.src = this.icon_path();
    }

    icon_path() {
        return `images/${this.colour}pawn.png`;
    }

    move(x, y) {
        if (x == this.x && y == this.y) {
            return false;
        }

        var targetPiece = board[x][y];

        if (targetPiece && targetPiece.colour == this.colour) {
            return false;
        }

        var xDiff = Math.abs(this.x - x);
        var yDiff = y - this.y;

        if (this.colour == "b") {
            yDiff = -yDiff;
        }

        if (yDiff == 1) {
            if (xDiff == 0) {
                if (targetPiece != null) {
                    return false;
                }
                return true;
            } else if (xDiff == 1) {
                if (targetPiece != null) {
                    return true;
                }
            }
            return false;
        } else if (yDiff == 2) {
            var middleOffset = (this.colour == "w") ? 1 : -1
            if (!this.moved && xDiff == 0 && !board[this.x][this.y+middleOffset] && !targetPiece) {
                return true;
            }
            return false;
            
        }
        return false;
    }
}

class Rook {
    constructor(x, y, colour) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.moved = false;
        this.icon = new Image();

        this.icon.src = this.icon_path();
    }

    icon_path() {
        return `images/${this.colour}rook.png`;
    }

    move(x, y) {
        if (x == this.x && y == this.y) {
            return false;
        }

        var targetPiece = board[x][y];

        if (targetPiece && targetPiece.colour == this.colour) {
            return false;
        }

        var xDiff = x - this.x;
        var yDiff = y - this.y;

        if (xDiff && yDiff) {
            return false;
        }

        if (xDiff) {
            var sgn = (xDiff > 0) ? 1 : -1
            if (sgn == 1) {
                for (var n=this.x+1; n < x; n++) {
                    var currPiece = board[n][this.y];
                    if (currPiece) {
                        return false;
                    }
                }
            } else {
                for (var n=this.x-1; n > x; n--) {
                    var currPiece = board[n][this.y];
                    if (currPiece) {
                        return false;
                    }
                }
            }
        } else {
            var sgn = (yDiff > 0) ? 1 : -1
            
            if (sgn == 1) {
                for (var n=this.y+1; n < y; n++) {
                    var currPiece = board[this.x][n];
                    if (currPiece) {
                        return false;
                    }
                }
            } else {
                for (var n=this.y-1; n > y; n--) {
                    var currPiece = board[this.x][n];
                    if (currPiece) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

class Knight {
    constructor(x, y, colour) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.icon = new Image();

        this.icon.src = this.icon_path();
    }

    icon_path() {
        return `images/${this.colour}knight.png`;
    }

    move(x, y) {
        if (x == this.x && y == this.y) {
            return false;
        }

        var targetPiece = board[x][y];

        if (targetPiece && targetPiece.colour == this.colour) {
            return false;
        }

        var xDiff = Math.abs(this.x - x);
        var yDiff = Math.abs(y - this.y);

        if (xDiff == 1) {
            if (yDiff == 2) {
                return true;
            }
        } else if (xDiff == 2) {
            if (yDiff == 1) {
                return true;
            }
        }
        return false;
    }
}

class Bishop {
    constructor(x, y, colour) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.icon = new Image();

        this.icon.src = this.icon_path();
    }

    icon_path() {
        return `images/${this.colour}bishop.png`;
    }

    move(x, y) {
        if (x == this.x && y == this.y) {
            return false;
        }

        var targetPiece = board[x][y];

        if (targetPiece && targetPiece.colour == this.colour) {
            return false;
        }

        var xDiff = x - this.x;
        var yDiff = y - this.y;

        if (Math.abs(xDiff) != Math.abs(yDiff)) {
            return false;
        } else {
            if (xDiff > 0) {
                if (yDiff > 0) {
                    for (var n=1; n<Math.abs(xDiff); n++) {
                        if (board[this.x + n][this.y + n]) {
                            return false;
                        }
                    }
                } else {
                    for (var n=1; n<Math.abs(xDiff); n++) {
                        if (board[this.x + n][this.y - n]) {
                            return false;
                        }
                    }
                }
            } else {
                if (yDiff > 0) {
                    for (var n=1; n<Math.abs(xDiff); n++) {
                        if (board[this.x - n][this.y + n]) {
                            return false;
                        }
                    }
                } else {
                    for (var n=1; n<Math.abs(xDiff); n++) {
                        if (board[this.x - n][this.y - n]) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
}

class Queen {
    constructor(x, y, colour) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.icon = new Image();

        this.icon.src = this.icon_path();
    }

    icon_path() {
        return `images/${this.colour}queen.png`;
    }

    move(x, y) {
        if (x == this.x && y == this.y) {
            return false;
        }

        var targetPiece = board[x][y];

        if (targetPiece && targetPiece.colour == this.colour) {
            return false;
        }

        var xDiff = x - this.x;
        var yDiff = y - this.y;

        if (xDiff && !yDiff) {
            var sgn = (xDiff > 0) ? 1 : -1
            if (sgn == 1) {
                for (var n=this.x+1; n < x; n++) {
                    var currPiece = board[n][this.y];
                    if (currPiece) {
                        return false;
                    }
                }
            } else {
                for (var n=this.x-1; n > x; n--) {
                    var currPiece = board[n][this.y];
                    if (currPiece) {
                        return false;
                    }
                }
            }
            return true;
        } else if (yDiff && !xDiff) {
            var sgn = (yDiff > 0) ? 1 : -1
            
            if (sgn == 1) {
                for (var n=this.y+1; n < y; n++) {
                    var currPiece = board[this.x][n];
                    if (currPiece) {
                        return false;
                    }
                }
            } else {
                for (var n=this.y-1; n > y; n--) {
                    var currPiece = board[this.x][n];
                    if (currPiece) {
                        return false;
                    }
                }
            }
            return true;
        } else if (Math.abs(xDiff) != Math.abs(yDiff)) {
            return false;
        } else {
            if (xDiff > 0) {
                if (yDiff > 0) {
                    for (var n=1; n<Math.abs(xDiff); n++) {
                        if (board[this.x + n][this.y + n]) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    for (var n=1; n<Math.abs(xDiff); n++) {
                        if (board[this.x + n][this.y - n]) {
                            return false;
                        }
                    }
                    return true;
                }
            } else {
                if (yDiff > 0) {
                    for (var n=1; n<Math.abs(xDiff); n++) {
                        if (board[this.x - n][this.y + n]) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    for (var n=1; n<Math.abs(xDiff); n++) {
                        if (board[this.x - n][this.y - n]) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        }
    }
}

class King {
    constructor(x, y, colour) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.moved = false;
        this.icon = new Image();

        this.icon.src = this.icon_path();
    }

    icon_path() {
        return `images/${this.colour}king.png`;
    }

    move(x, y) {
        if (x == this.x && y == this.y) {
            return false;
        }

        var targetPiece = board[x][y];

        if (targetPiece && targetPiece.colour == this.colour) {
            return false;
        }

        var xDiff = Math.abs(x - this.x);
        var yDiff = Math.abs(y - this.y);

        if (xDiff > 1 || yDiff > 1) {
            return false;
        }
        return true;
    }
}

var wk;
var bk;

function initiateBoard() {
    var wp1 = new Pawn(0, 1, "w");
    var wp2 = new Pawn(1, 1, "w");
    var wp3 = new Pawn(2, 1, "w");
    var wp4 = new Pawn(3, 1, "w");
    var wp5 = new Pawn(4, 1, "w");
    var wp6 = new Pawn(5, 1, "w");
    var wp7 = new Pawn(6, 1, "w");
    var wp8 = new Pawn(7, 1, "w");
    var wr1 = new Rook(0, 0, "w");
    var wr2 = new Rook(7, 0, "w");
    var wk1 = new Knight(1, 0, "w");
    var wk2 = new Knight(6, 0, "w");
    var wb1 = new Bishop(2, 0, "w");
    var wb2 = new Bishop(5, 0, "w");
    var wq = new Queen(3, 0, "w");
    wk = new King(4, 0, "w");
    
    var bp1 = new Pawn(7, 6, "b");
    var bp2 = new Pawn(6, 6, "b");
    var bp3 = new Pawn(5, 6, "b");
    var bp4 = new Pawn(4, 6, "b");
    var bp5 = new Pawn(3, 6, "b");
    var bp6 = new Pawn(2, 6, "b");
    var bp7 = new Pawn(1, 6, "b");
    var bp8 = new Pawn(0, 6, "b");
    var br1 = new Rook(7, 7, "b");
    var br2 = new Rook(0, 7, "b");
    var bk1 = new Knight(6, 7, "b");
    var bk2 = new Knight(1, 7, "b");
    var bb1 = new Bishop(5, 7, "b");
    var bb2 = new Bishop(2, 7, "b");
    var bq = new Queen(3, 7, "b");
    bk = new King(4, 7, "b");

    board = [
        [wr1, wp1, null, null, null, null, bp8, br2],
        [wk1, wp2, null, null, null, null, bp7, bk2],
        [wb1, wp3, null, null, null, null, bp6, bb2],
        [wq, wp4, null, null, null, null, bp5, bq],
        [wk, wp5, null, null, null, null, bp4, bk],
        [wb2, wp6, null, null, null, null, bp3, bb1],
        [wk2, wp7, null, null, null, null, bp2, bk1],
        [wr2, wp8, null, null, null, null, bp1, br1]
    ];

    white = [
        wp1, wp2, wp3, wp4, wp5, wp6, wp7, wp8,
        wr1, wk1, wb1, wq, wk, wb2, wk2, wr2
    ];
    black = [
        bp1, bp2, bp3, bp4, bp5, bp6, bp7, bp8,
        br1, bk1, bb1, bq, bk, bb2, bk2, br2,
    ];
}

function copyBoard() {
    var copy = [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]
    ];

    for (var x=0; x<8; x++) {
        for (var y=0; y<8; y++) {
            let obj = board[x][y];

            if (obj == null) {
                continue;
            }

            let oX = obj.x;
            let oY = obj.y;
            let oC = obj.colour;
            let oM = obj.moved;
            let copy = obj.__proto__.constructor(oX, oY, oC);
            copy.moved = oM;

            copy[x][y] = copy;
        }
    }

    return copy;
}

function copyTeam(board, colour) {
    var copy = [];

    for (var x=0; x<8; x++) {
        for (var y=0; y<8; y++) {
            if (board[x][y].colour == colour) {
                copy.push(board[x][y]);
            }
        }
    }

    return copy;
}

function isChecked(colour) {
    var king = (colour == "w") ? wk : bk;

    var team = (colour == "b") ? white : black;

    for (pieceI in team) {
        if (team[pieceI].move(king.x, king.y)) {
            return true;
        }
    }
    return false;
}

function isMated(colour) {
    var checkmate = true;

    var team = (colour == "w") ? white : black;
    var opp = (colour == "w") ? black : white;

    for (var pieceI=0; pieceI<team.length; pieceI++) {
        for (var i=0; i<8; i++) {
            for (var j=0; j<8; j++) {       
                let currentPiece = team[pieceI];
                
                let bPos = s2b(i, j);
                if (currentPiece.move(bPos[0], bPos[1])) {
                    let replacedPiece = board[bPos[0]][bPos[1]];
                    let oldX = currentPiece.x;
                    let oldY = currentPiece.y;
                    
                    executeMove(currentPiece.x, currentPiece.y, bPos);

                    if (!isChecked(colour)) {
                        checkmate = false;
                    }

                    if (replacedPiece) {
                        opp.push(replacedPiece);
                    }
                    board[bPos[0]][bPos[1]] = replacedPiece;
                    board[oldX][oldY] = currentPiece;
                    currentPiece.x = oldX;
                    currentPiece.y = oldY;

                    if (!checkmate) {
                        return checkmate;
                    }
                }
            }
        }
    }

    return checkmate;
}

function drawGrid() {
    // Draw cells
    for (var i=0; i<8; i++) {
        for (var j=0; j<8; j++) {
            if (isCellSelected && arrayEquals(selectedCell, [i,7-j]))
                ctx.fillStyle = SELECTED_COLOUR
            else {
                ctx.fillStyle = COLOURS[(i+j) % 2];
            }

            ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

function drawBoard() {
    for (var i=0; i<8; i++) {
        for (var j=0; j<8; j++) {
            var [x, y] = s2b(i, j);
            
            var piece = board[x][y];

            var animationDecimal = animationStep / ANIMATION_STEPS;

            var animationNum = animatedPiece == piece ? animationDecimal : 1;
            var animationPadding = animatedPiece == piece ? (ICON_WIDTH - ICON_WIDTH * animationDecimal) / 2 : 0;

            var movementAnimationX = animatedPiece == piece ? animationX * (1 - animationDecimal) : 0;
            var movementAnimationY = animatedPiece == piece ? animationY * (1 - animationDecimal) : 0;

            // sizing and movement
            // var pieceX = i * CELL_SIZE + ICON_X_PADDING + animationPadding + movementAnimationX;
            // var pieceY = j * CELL_SIZE + ICON_Y_PADDING + animationPadding + movementAnimationY;

            // if (piece) {
            //     ctx.drawImage(piece.icon, pieceX, pieceY, ICON_WIDTH * animationNum, ICON_HEIGHT * animationNum);
            // }

            // just movement
            var pieceX = i * CELL_SIZE + ICON_X_PADDING - movementAnimationX;
            var pieceY = j * CELL_SIZE + ICON_Y_PADDING + movementAnimationY;

            if (piece) {
                ctx.drawImage(piece.icon, pieceX, pieceY, ICON_WIDTH, ICON_HEIGHT);
            }

        }
    }
}

function executeMove(sX, sY, bPos) {
    if (board[sX][sY].moved != undefined) {
        board[sX][sY].moved = true;
    }
    
    var target = board[bPos[0]][bPos[1]]
    if (target) {
        var index = white.indexOf(target);
        if (index > -1) {
            white.splice(index, 1);
        } else {
            var index = black.indexOf(target);
            if (index > -1) {
                black.splice(index, 1);
            }
        }
    }
    
    board[sX][sY].x = bPos[0];
    board[sX][sY].y = bPos[1];
    board[bPos[0]][bPos[1]] = board[sX][sY];
    board[sX][sY] = null;
}

function stepAnimation() {
    if (animatedPiece == null) {
        return;
    }

    if (animationStep == ANIMATION_STEPS) {
        animationStep = ANIMATION_STEPS / 2;
        animatedPiece = null;
        return;
    }

    animationStep++;
}

var isCellSelected = false;
var selectedCell = [-1,-1];


addEventListener("mousedown", (event) => {
    var x = event.x;
    var y = event.y
    for (var i=0; i<8; i++) {
        for (var j=0; j<8; j++) {
            if (x > (i*CELL_SIZE) && x < ((i+1)*CELL_SIZE) && y > (j*CELL_SIZE) && y < ((j+1)*CELL_SIZE)) {
                if (isCellSelected) {
                    sX = selectedCell[0];
                    sY = selectedCell[1];

                    bPos = s2b(i,j)
                    
                    if (board[sX][sY].move(bPos[0], bPos[1])) {
                        executeMove(sX, sY, bPos);

                        animatedPiece = board[bPos[0]][bPos[1]];
                        let targetCoord = cellToCoord(bPos[0], bPos[1]);
                        let currCoord = cellToCoord(sX, sY);
                        animationX = targetCoord[0] - currCoord[0];
                        animationY = targetCoord[1] - currCoord[1];

                        if (isChecked("w")) {
                            console.log(`White checkmate: ${isMated("w")}`);
                        }

                        if (isChecked("b")) {
                            console.log(`Black checkmate: ${isMated("b")}`);
                        }
                    }

                    isCellSelected = false;
                    selectedCell = [-1,-1];
                } else {
                    selectedCell = s2b(i,j);

                    if (board[selectedCell[0]][selectedCell[1]]) { 
                        isCellSelected = true;
                    }
                                     
                }
                return;
            }
        }
    }
});

function loop() {
    drawGrid();
    drawBoard();
    stepAnimation();

    requestAnimationFrame(loop);
}

initiateBoard();
loop();