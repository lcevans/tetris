
// Global vars
let canvas
let ctx
let board
const block_size = 20;

let COLORS = {
    // 0 is used for empty
    1 : 'rgb(200, 0, 0)', // RED
    2 : 'rgb(0, 200, 0)', // GREEN
    3 : 'rgb(0, 0, 200)', // BLUE
    4 : 'rgb(100, 100, 0)', // YELLOW
    5 : 'rgb(100, 0, 100)', // PURPLE
    6 : 'rgb(0, 100, 100)', // TEAL?
}

let PIECES = {
    // Offsets of the 4 squares which make up the tetris piece
    0 : [[0, 0], [1, 0], [0, 1], [0, -1]],   // T block
    1 : [[0, 0], [-1, 0], [1, 0], [2, 0]],   // I block
    2 : [[0, 0], [1, 0], [0, 1], [1, 1]],    // Square block
    3 : [[0, 0], [-1, 0], [0, 1], [1, 1]],   // S block
    4 : [[0, 0], [-1, 0], [0, -1], [1, -1]], // S block
    5 : [[0, 0], [1, 0], [0, 1], [0, 2]],    // L block
    6 : [[0, 0], [-1, 0], [0, 1], [0, 2]],   // L block
}

// Current piece
let x;
let y = 0;
let color_idx;
let piece;

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
}

initializePiece = function() {
    do
    {
        i = Math.floor(Math.random() * canvas.width / block_size);
        j = 0;
        x = i * block_size;
        y = j * block_size;
        color_idx = 1 + Math.floor(Math.random() * 6);
        piece = PIECES[Math.floor(Math.random() * 7)]; // TODO: Deep copy? Maybe doesn't matter...

        // TODO: Random rotation
    }
    while (!piece.some(offset => collision(i + offset[0], j + offset[1]))) // Make sure piece is not already blocked

}

render = function() {
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw board
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] != 0) {
                ctx.fillStyle = COLORS[board[i][j]];
                ctx.fillRect(i * block_size, j * block_size, block_size, block_size);
            }
        }
    }

    // draw current piece
    for (let offset of piece) {
        px = x + offset[0] * block_size;
        py = y + offset[1] * block_size;
        ctx.fillStyle = COLORS[color_idx];
        ctx.fillRect(px, py, block_size, block_size);
    }
}

collision = function(i, j) {
    // Boolean: Is this index a "wall" (block or out of bounds)
    return (i < 0 || i > board.length || j < 0 || j > board[0].length
            || board[i][j] != 0)
}

update = function() {
    // Update current piece
    y = Math.min(Math.max((y + Math.floor(block_size / 20)), 0), canvas.height - block_size);

    // See if landed on floor or another block
    i = Math.floor(x / block_size);
    j = Math.floor(y / block_size);
    if (piece.some(offset => collision(i + offset[0], j + offset[1] + 1))) { // check block below each block of piece
        for (offset of piece) {
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
    }
}



gameLoop = function() {
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
        if (!piece.some(offset => collision(i + offset[0], j + offset[1] + 1))) { // Not blocked
            y = y + block_size;
        }
    }
    else if(event.keyCode == 38) {
        // up
        // Rotate piece
        for (let idx in piece) {
            piece[idx] = [-piece[idx][1], piece[idx][0]]
        }
    }
});

window.onload = function() {
    initializeCanvas()
    initializeBoard()
    initializePiece()
    setInterval(gameLoop, 16); // ~60 FPS
};
