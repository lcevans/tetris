
// Global vars
let canvas
let ctx
let next_piece_canvas
let next_piece_ctx
let board
const block_size = 20;
let score = 0;

let COLORS = {
    // 0 is used for empty
    1 : 'rgb(224, 20, 47)', // RED
    2 : 'rgb(82, 199, 105)', // GREEN
    3 : 'rgb(55, 160, 230)', // BLUE
    4 : 'rgb(227, 232, 95)', // YELLOW
    5 : 'rgb(196, 114, 237)', // PURPLE
    6 : 'rgb(245, 190, 103)', // ORANGE
}
const BORDER_COLOR = 'rgb(0, 0, 0)'

let PIECES = {
    // Offsets of the 4 squares which make up the tetris piece
    1 : [[0, 0], [1, 0], [0, 1], [0, -1]],   // T block
    2 : [[0, 0], [-1, 0], [1, 0], [2, 0]],   // I block
    3 : [[0, 0], [1, 0], [0, 1], [1, 1]],    // Square block
    4 : [[0, 0], [-1, 0], [0, 1], [1, 1]],   // S block
    5 : [[0, 0], [-1, 0], [0, -1], [1, -1]], // S block
    6 : [[0, 0], [1, 0], [0, 1], [0, 2]],    // L block
    7 : [[0, 0], [-1, 0], [0, 1], [0, 2]],   // L block
}

// Current piece
let x;
let y = 0;
let color_idx;
let piece;
let next_piece_color_idx = 2; // TODO Dont initialize here!

// Board
initializeBoard = function() {
    board = new Array(canvas.width / block_size);
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(canvas.height / block_size);
        for (let j = 0; j < board[i].length; j++) {
            board[i][j] = 0;
        }
    }
}

initializeCanvas = function() {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    next_piece_canvas = document.getElementById('next_piece_canvas')
    next_piece_ctx = next_piece_canvas.getContext('2d')
}

initializePiece = function() {
    do
    {
        i = Math.floor(Math.random() * canvas.width / block_size);
        j = 0;
        x = i * block_size;
        y = j * block_size;
        color_idx = next_piece_color_idx
        next_piece_color_idx = 1 + Math.floor(Math.random() * 6);
        piece = PIECES[color_idx]; // TODO: Deep copy? Maybe doesn't matter...

        // TODO: Random rotation
    }
    while (piece.some(offset => collision(i + offset[0], j + offset[1]))) // Make sure piece is not already blocked
}

render = function() {
    // clear
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    next_piece_ctx.beginPath();
    next_piece_ctx.clearRect(0, 0, next_piece_canvas.width, next_piece_canvas.height);

    // draw board
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] != 0) {
                ctx.beginPath();
                ctx.fillStyle = COLORS[board[i][j]];
                ctx.strokeStyle = BORDER_COLOR;
                ctx.lineWidth = 1;
                ctx.rect(i * block_size, j * block_size, block_size, block_size);
                ctx.fill();
                ctx.stroke();

            }
        }
    }

    // draw current piece
    for (let offset of piece) {
        px = x + offset[0] * block_size;
        py = y + offset[1] * block_size;
        ctx.beginPath();
        ctx.fillStyle = COLORS[color_idx];
        ctx.strokeStyle = BORDER_COLOR;
        ctx.lineWidth = 1;
        ctx.rect(px, py, block_size, block_size);
        ctx.fill();
        ctx.stroke();
    }

    // draw next piece
    let next_piece = PIECES[next_piece_color_idx]
    for (let offset of next_piece) {
        px = (2 + offset[0]) * block_size;
        py = (2 + offset[1]) * block_size;
        next_piece_ctx.beginPath();
        next_piece_ctx.fillStyle = COLORS[next_piece_color_idx];
        next_piece_ctx.strokeStyle = BORDER_COLOR;
        next_piece_ctx.lineWidth = 1;
        next_piece_ctx.rect(px, py, block_size, block_size);
        next_piece_ctx.fill();
        next_piece_ctx.stroke();
    }

}

collision = function(i, j) {
    // Boolean: Is this index a "wall" (block or out of bounds)
    // Note: It is ok to be above the ceiling
    return (i < 0 || i >= board.length || j >= board[0].length
            || (j > 0 && board[i][j] != 0))
}

const LANDING_DELAY = 10 // frames
let frames_landed = 0
update = function() {
    // Piece descends
    y = y + Math.floor(block_size / 20)

    // See if landed
    i = Math.floor(x / block_size);
    j = Math.floor(y / block_size);
    if (piece.some(offset => collision(i + offset[0], j + offset[1] + 1))) { // Landed
        frames_landed++;
        y = j * block_size; // Move back out to above ground
    }
    else {
        frames_landed = 0
    }

    // After being landed for a while, fix the piece and start a new one
    if (frames_landed >= LANDING_DELAY) {
        for (offset of piece) {
            if(j + offset[1] < 0) gameOver();
            board[i + offset[0]][j + offset[1]] = color_idx;
        }
        initializePiece()
    }

    // Clear lines if needed
    for (let row = 0; row < board[0].length; row++) {
        let clear_row = true;
        for (let col = 0; col < board.length; col++) {
            if (board[col][row] == 0) clear_row = false;
        }
        if (!clear_row) continue;
        // Found full row. Move everything down (killng that row)

        for (let tmp_row = row; tmp_row > 0; tmp_row--) {
            console.log(tmp_row)
            for (let col = 0; col < board.length; col++) {
                board[col][tmp_row] = board[col][tmp_row - 1];
            }
        }
        // New empty row at top
        for (let col = 0; col < board.length; col++) {
            board[col][0] = 0;
        }

        score++;
        document.getElementById("score").innerHTML = "Score: " + score
    }

}

let stepFrameID;
stepFrame = function() {
    update()
    render()
}

document.addEventListener('keydown', function(event) {
    i = Math.floor(x / block_size);
    j = Math.floor(y / block_size);

    if(event.keyCode == 37) {
        // left
        if (!piece.some(offset => collision(i + offset[0] - 1, j + offset[1]))) { // Not blocked
            x = x - block_size;
        }
    }
    else if(event.keyCode == 39) {
        // right
        if (!piece.some(offset => collision(i + offset[0] + 1, j + offset[1]))) { // Not blocked
            x = x + block_size;
        }
    }
    else if(event.keyCode == 40) {
        // down
        if (!piece.some(offset => collision(i + offset[0], j + offset[1] + 1))){ // Not blocked
            if (!piece.some(offset => collision(i + offset[0], j + offset[1] + 2))) { // Can move a full block_size
                y = y + block_size;
            }
            else { // Only move until landed
                y = (j + 1) * block_size
            }
        }
    }
    else if(event.keyCode == 38) {
        // up
        // Rotate piece. But only if doing so wouldn't cause collision
        for (let idx in piece) {
            piece[idx] = [-piece[idx][1], piece[idx][0]]
        }
        if (piece.some(offset => collision(i + offset[0], j + offset[1]))) { // If collides, rotate back
            for (let idx in piece) {
                piece[idx] = [piece[idx][1], -piece[idx][0]]
            }
        }
    }
});

function gameOver() {
    clearInterval(stepFrameID);
    document.getElementById("score").innerHTML = "GAME OVER! Final Score: " + score
}

window.onload = function() {
    document.getElementById("score").innerHTML = "Score: " + score
    initializeCanvas()
    initializeBoard()
    initializePiece()
    stepFrameID = setInterval(stepFrame, 16); // ~60 FPS
};
