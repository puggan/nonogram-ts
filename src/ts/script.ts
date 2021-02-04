interface GameConfig {
    height: number;
    scale: number;
    width: number;
    xOffset: number;
    yOffset: number;
}
interface GameStatus {
    cols: number[];
    rows: number[];
    global: number;
}
interface Game {
    cols: number[][];
    config: GameConfig;
    grid: colorIndex[][];
    rows: number[][];
    status: GameStatus;
}
type colorIndex = -1|0|1;

document.addEventListener('DOMContentLoaded', () => {
    const introView = document.getElementById('introView') as HTMLDivElement;
    const solverView = document.getElementById('solverView') as HTMLDivElement;
    const gridView = document.getElementById('gridView') as HTMLCanvasElement;
    const gameGrid = gridView.getContext("2d");

    const startButton = document.getElementById('startButton') as HTMLInputElement;
    const widthInput = document.getElementById('width') as HTMLInputElement;
    const heightInput = document.getElementById('height') as HTMLInputElement;

    const init = () => {
        const gameWidth = localStorage.getItem('width');
        const gameHeight = localStorage.getItem('height');
        const gameRaw = localStorage.getItem('game');
        if (gameWidth) {
            widthInput.value = gameWidth;
        }
        if (gameHeight) {
            heightInput.value = gameHeight;
        }
        if (gameRaw) {
            const game = JSON.parse(gameRaw) as Game;
            load(game);
        }
    };

    let game: Game|null = null;
    const load = (newGame: Game) => {
        introView.hidden = true;
        gridView.hidden = false;
        game = newGame;
        statusAll();
        redraw(true);
    };
    const save = (modifedGame: Game) => {
        localStorage.setItem('game', JSON.stringify(modifedGame));
    };

    const statusAll = () => {
        for (let x = 0; x < game.config.width; x++) {
            game.status.cols[x] = statusCol(x);
        }
        for (let y = 0; y < game.config.height; y++) {
            game.status.rows[y] = statusRow(y);
        }
    };

    const statusCol = (x: number) => {
        if (game.cols[x].length < 1) {
            return 0;
        }
        let colSum = 0;
        let gridSum = 0;
        let gridColGroups = [];

        for (const status of game.cols[x]) {
            if (status > 0) {
                colSum += status;
            }
        }

        let connected = false;
        let groupSize = 0;

        for (const row of game.grid) {
            if (row[x] === 1) {
                connected = true;
                groupSize++;
                gridSum++;
            } else if (connected) {
                gridColGroups.push(groupSize);
                groupSize = 0;
                connected = false;
            }
        }
        if (connected) {
            gridColGroups.push(groupSize);
        }


        if (gridSum > colSum) {
            return -0xFFFF;
        }

        if (gridSum < colSum) {
            return 0;
        }

        if (gridColGroups.join('-') === game.cols[x].join('-')) {
            return 0xFFFF;
        }

        return -0xFFFF;
    };

    const statusRow = (y: number) => {
        if (game.rows[y].length < 1) {
            return 0;
        }
        let rowSum = 0;
        let gridSum = 0;
        let gridRowGroups = [];

        for (const status of game.rows[y]) {
            if (status > 0) {
                rowSum += status;
            }
        }

        let connected = false;
        let groupSize = 0;

        for (const status of game.grid[y]) {
            if (status === 1) {
                connected = true;
                groupSize++;
                gridSum++;
            } else if (connected) {
                gridRowGroups.push(groupSize);
                groupSize = 0;
                connected = false;
            }
        }
        if (connected) {
            gridRowGroups.push(groupSize);
        }

        if (gridSum > rowSum) {
            return -0xFFFF;
        }

        if (gridSum < rowSum) {
            return 0;
        }

        if (gridRowGroups.join('-') === game.rows[y].join('-')) {
            return 0xFFFF;
        }

        return -0xFFFF;
    };

    const start = (width: number, height: number) => {
        const scale = 10;
        const newGame: Game = {
            cols: [],
            config: {
                height,
                scale,
                width,
                xOffset: scale,
                yOffset: scale,
            },
            grid: [],
            rows: [],
            status: {
                cols: [],
                rows: [],
                global: 0,
            },
        };
        for (let x = 0; x < width; x++) {
            newGame.cols[x] = [];
            newGame.status.cols[x] = 0;
        }
        for (let y = 0; y < height; y++) {
            newGame.rows[y] = [];
            newGame.status.rows[y] = 0;
            newGame.grid[y] = [];
            for (let x = 0; x < width; x++) {
                newGame.grid[y][x] = -1;
            }
        }
        save(newGame);
        load(newGame);
    };
    const startButtonAction = () => {
        const gameWidth = widthInput.value;
        localStorage.setItem('width', gameWidth);

        const gameHeight = heightInput.value;
        localStorage.setItem('height', gameHeight);

        start(+gameWidth, +gameHeight);
    };
    const connectListeners = () => {
        startButton.addEventListener('click', startButtonAction, {once: false, passive: true});
        gridView.addEventListener('click', gridHandler, {once: false, passive: true});
    };

    const reCalculateOffset = (rescale: boolean) => {
        let maxColRulesCount = 1;
        let maxRowRulesCount = 1;
        for(const col of game.cols) {
            if (col.length > maxColRulesCount) {
                maxColRulesCount = col.length;
            }
        }
        for(const row of game.rows) {
            if (row.length > maxRowRulesCount) {
                maxRowRulesCount = row.length;
            }
        }
        if (rescale) {
            const widthScale = (window.innerWidth - 10) / (maxRowRulesCount + game.config.width);
            const heightScale = (window.innerHeight - 10) / (maxColRulesCount + game.config.height);
            game.config.scale = Math.floor(widthScale < heightScale ? widthScale : heightScale);
            if (game.config.scale < 5) {
                game.config.scale = 5;
            }
        }

        game.config.xOffset = game.config.scale * maxRowRulesCount;
        game.config.yOffset = game.config.scale * maxColRulesCount;
    };

    const redraw = (rescale: boolean) => {
        reCalculateOffset(rescale);
        gridView.width = game.config.xOffset + game.config.width * game.config.scale;
        gridView.height = game.config.yOffset + game.config.height * game.config.scale;
        gameGrid.clearRect(0, 0, gridView.width, gridView.height);
        for (let x = 0; x < game.config.width; x++) {
            redrawCol(x);
        }
        for (let y = 0; y < game.config.height; y++) {
            redrawRow(y);
        }
        redrawGrid();
    };
    const redrawGrid = () => {
        for (let y = 0; y < game.config.height; y++) {
            for (let x = 0; x < game.config.width; x++) {
                draw(x, y, game.grid[y][x]);
            }
        }
    };
    const redrawCol = (x: number) => {
        const halfBox = game.config.scale / 2;
        let top = game.config.yOffset - game.cols[x].length * game.config.scale + halfBox;
        const left = game.config.xOffset + x * game.config.scale + halfBox;
        gameGrid.fillStyle = x & 1 ? '#FFF' : '#CCC';
        gameGrid.fillRect(left - halfBox, 0, game.config.scale, game.config.yOffset);
        gameGrid.font = game.config.scale * .8 + "px Monospace";
        gameGrid.textAlign = "center";
        gameGrid.textBaseline = 'middle';
        const color2 = game.status.cols[x] > 0 ? 'gray' : 'red';
        const status = game.status.cols[x] > 0 ? game.status.cols[x] : -game.status.cols[x];
        let bitMask = 1;
        for (let size of game.cols[x]) {
            gameGrid.fillStyle = status & bitMask ? color2 : 'black';
            gameGrid.fillText('' + size, left, top);
            bitMask *= 2;
            top += game.config.scale;
        }
    };
    const redrawRow = (y: number) => {
        const halfBox = game.config.scale / 2;
        const top = game.config.yOffset + y * game.config.scale + halfBox;
        let left = game.config.xOffset - game.rows[y].length * game.config.scale + halfBox;
        gameGrid.fillStyle = y & 1 ? '#FFF' : '#CCC';
        gameGrid.fillRect(0, top - halfBox, game.config.xOffset, game.config.scale);
        gameGrid.font = game.config.scale * .8 + "px Monospace";
        gameGrid.textAlign = "center";
        gameGrid.textBaseline = 'middle';
        const color2 = game.status.rows[y] > 0 ? 'gray' : 'red';
        const status = game.status.rows[y] > 0 ? game.status.rows[y] : -game.status.rows[y];
        let bitMask = 1;
        for (let size of game.rows[y]) {
            gameGrid.fillStyle = status & bitMask ? color2 : 'black';
            gameGrid.fillText('' + size, left, top);
            bitMask *= 2;
            left += game.config.scale;
        }
    };

    const draw = (x: number, y: number, type: colorIndex) => {
        if (x < 0 || y < 0 || x >= game.config.width || y >= game.config.height) {
            throw new Error('Outside game-grid: ' + JSON.stringify({x, y, type}));
        }
        const xPos = game.config.xOffset + x * game.config.scale;
        const yPos = game.config.yOffset + y * game.config.scale;

        // fill with gray, north-east and south-west corner keeps this gray color
        gameGrid.fillStyle = '#808080';
        gameGrid.fillRect(xPos, yPos, game.config.scale, game.config.scale);

        // fill north and west border with an light gray
        gameGrid.fillStyle = '#C0C0C0';
        gameGrid.fillRect(xPos, yPos, game.config.scale - 1, game.config.scale - 1);

        // fill south and east border with an darker gray
        gameGrid.fillStyle = '#404040';
        gameGrid.fillRect(xPos + 1, yPos + 1, game.config.scale - 1, game.config.scale - 1);

        // select color for this position
        if (type < 0) {
            gameGrid.fillStyle = '#808080';
        } else {
            gameGrid.fillStyle = type ? 'black' : 'white';
        }

        // draw selected color inside of the border
        gameGrid.fillRect(xPos + 1, yPos + 1, game.config.scale - 2, game.config.scale - 2);
    };

    const gridHandler = (event: MouseEvent) => {
        const x = Math.floor((event.clientX - game.config.xOffset) / game.config.scale);
        const y = Math.floor((event.clientY - game.config.yOffset) / game.config.scale);
        if (x < 0) {
            if (y < 0) {
                if (confirm('Reset game?')) {
                    redraw(true);
                    return;
                }
            }
            const oldRow = game.rows[y].join(' ');
            const newRow = prompt('Config row ' + (1 + y), oldRow);
            if (newRow === null || oldRow === newRow) {
                return;
            }
            if (newRow === '') {
                game.rows[y].length = 0;
                save(game);
                return;
            }
            const newListStr = newRow.split(/[ ,]+/g);
            const newList = [];
            let sum = 0;
            for(const valueStr of newListStr) {
                const value = Math.floor(+valueStr);
                if (value > 0) {
                    newList.push(value);
                }
                sum += value;
            }
            if (newList.length < 1) {
                console.error('Invalid row: ' + newRow);
                alert('Invalid row: ' + newRow);
                return;
            }
            if (sum + newList.length > game.config.width + 1) {
                console.error('Invalid row-size: ' + newRow);
                console.error({newList, width: game.config.width, sum, length: newList.length, max: sum + newList.length - 1});
                alert('Invalid row-size: ' + newRow);
                return;
            }
            game.rows[y] = newList;
            save(game);
            game.status.rows[y] = statusRow(y);
            redrawRow(y);
            return;
        }
        if (y < 0) {
            const oldCol = game.cols[x].join(' ');
            const newCol = prompt('Config col ' + (1 + x), oldCol);
            if (newCol === null || oldCol === newCol) {
                return;
            }
            if (newCol === '') {
                game.cols[x].length = 0;
                save(game);
                return;
            }
            const newListStr = newCol.split(/[ ,]+/g);
            const newList = [];
            let sum = 0;
            for(const valueStr of newListStr) {
                const value = Math.floor(+valueStr);
                if (value > 0) {
                    newList.push(value);
                }
                sum += value;
            }
            if (newList.length < 1) {
                console.error('Invalid col: ' + newCol);
                alert('Invalid col: ' + newCol);
                return;
            }
            if (sum + newList.length > game.config.height + 1) {
                console.error('Invalid col-size: ' + newCol);
                console.error(newList);
                alert('Invalid col-size: ' + newCol);
                return;
            }
            game.cols[x] = newList;
            save(game);
            game.status.cols[x] = statusCol(x);
            redrawCol(x);
            return;
        }

        const oldType = game.grid[y][x];
        // Normal: gray(-1) => black(1) => white(0), Other: gray(-1) <= black(1) <= white(0)
        const typeDelta = event.button > 0 ? 1 : 2;
        const newType = (1 + oldType+ typeDelta) % 3 - 1 as colorIndex;
        game.grid[y][x] = newType;
        save(game);
        draw(x, y, newType);
        const newColStatus = statusCol(x);
        if (game.status.cols[x] !== newColStatus) {
            game.status.cols[x] = newColStatus;
            redrawCol(x);
        }
        const newRowStatus = statusRow(y);
        if (game.status.rows[y] !== newRowStatus) {
            game.status.rows[y] = newRowStatus;
            redrawRow(y);
        }
    };

    init();
    connectListeners();
}, {once: true, passive: true});