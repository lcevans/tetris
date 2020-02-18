
// Global vars
let canvas
let ctx
let board
const block_size = 20;

// curr piece
let x = 0;
let y = 0;
let color_idx = 2;

let COLORS = {
    // 0 is used for empty
    1 : 'rgb(200, 0, 0)', // RED
    2 : 'rgb(0, 200, 0)', // GREEN
    3 : 'rgb(0, 0, 200)', // BLUE
    4 : 'rgb(100, 100, 0)', // YELLOW
    5 : 'rgb(100, 0, 100)', // PURPLE
    6 : 'rgb(0, 100, 100)', // TEAL?
}

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
    ctx.fillStyle = COLORS[color_idx];
    ctx.fillRect(x, y, block_size, block_size);
}

update = function() {
    // Update current piece
    y = Math.min(Math.max((y + Math.floor(block_size / 10)), 0), canvas.height - block_size);

    // See if landed on floor or another block
    curr_i = Math.floor(x / block_size);
    curr_j = Math.floor(y / block_size);
    if (curr_j >= board[0].length - 1 // Hit bottom of board
        || board[curr_i][curr_j + 1] != 0) { // Landed on block
        board[curr_i][curr_j] = color_idx;
        x = Math.floor((Math.random() * canvas.width) / block_size) * block_size
        y = 0
        color_idx = 1 + Math.floor(Math.random() * 6)
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
    curr_i = Math.floor(x / block_size);
    curr_j = Math.floor(y / block_size);

    if(event.keyCode == 37) {
        // left
        if (curr_i - 1 >= 0                      // Not at edge
            && board[curr_i - 1][curr_j] == 0) { // No block blocking the way
            x = x - block_size;
        }
    }
    else if(event.keyCode == 39) {
        // right
        if (curr_i + 1 <= board.length - 1       // Not at edge
            && board[curr_i + 1][curr_j] == 0) { // No block blocking the way
            x = x + block_size;
        }
    }
    else if(event.keyCode == 40) {
        // down
        if (curr_j + 1 <= board[0].length - 1    // Not at edge
            && board[curr_i][curr_j + 1] == 0) { // No block blocking the way
            y = y + block_size;
        }
    }
});

window.onload = function() {
    initializeCanvas()
    initializeBoard()
    setInterval(gameLoop, 16); // ~60 FPS
};
