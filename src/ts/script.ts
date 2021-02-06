declare namespace Nonogram {
    interface Config {
        height: number;
        scale: number;
        width: number;
        xOffset: number;
        yOffset: number;
    }
    interface Status {
        cols: number[];
        rows: number[];
        global: number;
    }
    interface Game {
        cols: number[][];
        config: Config;
        grid: colorIndexMay[][];
        rows: number[][];
        status: Status;
    }
    interface Range {
        end: number;
        start: number;
    }
    interface Interval {
        max: number;
        min: number;
    }
    interface RangeInterval {
        end: Interval;
        start: Interval;
    }

    interface Block extends RangeInterval {
        length: Interval;
        next: Block|null;
        prev: Block|null;
        type: 0|1;
        possibilities: Range[];
    }
    // 0: white, 1: black
    type colorIndexReal = 0|1;
    // -1: gray
    type colorIndexMay = -1|colorIndexReal;
}

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
            const game = JSON.parse(gameRaw) as Nonogram.Game;
            load(game);
        }
    };

    let game: Nonogram.Game|null = null;
    const load = (newGame: Nonogram.Game) => {
        introView.hidden = true;
        gridView.hidden = false;
        game = newGame;
        statusAll();
        redraw(true);
        // debug:
        window['game'] = game;
    };
    const save = (modifiedGame: Nonogram.Game) => {
        localStorage.setItem('game', JSON.stringify(modifiedGame));
    };
    const reset = (modifiedGame: Nonogram.Game) => {
        modifiedGame.grid = [];
        modifiedGame.status = {
                cols: [],
                rows: [],
                global: 0,
            };
        for (let x = 0; x < modifiedGame.config.width; x++) {
            modifiedGame.status.cols[x] = 0;
        }
        for (let y = 0; y < modifiedGame.config.height; y++) {
            modifiedGame.status.rows[y] = 0;
            modifiedGame.grid[y] = [];
            for (let x = 0; x < modifiedGame.config.width; x++) {
                modifiedGame.grid[y][x] = -1;
            }
        }
        return modifiedGame;
    }

    const gameMainStatus = () => {
        let noErrors = true;
        let allDone = true;
        for(const status of game.status.cols) {
            if (status < 0) {
                noErrors = false;
                allDone = false;
                break;
            }
            if (status !== 0xFFFF) {
                allDone = false;
            }
        }
        for(const status of game.status.rows) {
            if (status < 0) {
                noErrors = false;
                allDone = false;
                break;
            }
            if (status !== 0xFFFF) {
                allDone = false;
            }
        }
        if (noErrors) {
            game.status.global = allDone ? 0xFFFF : 0;
        } else {
            game.status.global = -0xFFFF;
        }
        return game.status.global;
    }

    const statusAll = () => {
        for (let x = 0; x < game.config.width; x++) {
            game.status.cols[x] = statusCol(x);
        }
        for (let y = 0; y < game.config.height; y++) {
            game.status.rows[y] = statusRow(y);
        }
        gameMainStatus();
    };
    window['nano'] = window['nano'] || {};
    window['nano']['statusAll'] = statusAll;

    const statusBoxSyncNextChain = (startBlock: Nonogram.Block) => {
        let block = startBlock;
        while(block.next) {
            statusBoxPossibleUpdates(block);
            if (block.next.start.min <= block.end.min) {
                block.next.start.min = block.end.min + 1;
            }
            if (block.next.start.max > block.end.max + 1) {
                block.next.start.max = block.end.max + 1;
            }
            block = block.next;
        }
        statusBoxPossibleUpdates(block);
    };
    const statusBoxSyncPrevChain = (startBlock: Nonogram.Block) => {
        let block = startBlock;
        while(block.prev) {
            statusBoxPossibleUpdates(block);
            if (block.prev.end.max >= block.start.max) {
                block.prev.end.max = block.start.max - 1;
            }
            if (block.prev.end.min < block.start.min - 1) {

                block.prev.end.min = block.start.min - 1;
            }
            block = block.prev;
        }
        statusBoxPossibleUpdates(block);
    };
    const statusBoxSetBlock = (position: number, type: Nonogram.colorIndexMay, block: Nonogram.Block) => {
        // Undefined type / gray
        if (type === -1) {
            return;
        }

        // Same type
        if (block.type === type) {
            const possibilities: Nonogram.Range[] = [];
            for (const possibility of block.possibilities) {
                // Cant start on a position after a position with the same type/color
                if (position === possibility.start - 1) {
                    continue;
                }
                // Cant end on a position before a position with the same type/color
                if (position === possibility.end + 1) {
                    continue;
                }
                possibilities.push(possibility);
            }
            if (possibilities.length < block.possibilities.length) {
                block.possibilities = possibilities;
            }
            return;
        }

        // Other type
        const possibilities: Nonogram.Range[] = [];
        for (const possibility of block.possibilities) {
            // All positions between start and end most be of the type of the block
            if (possibility.start <= position && position <= possibility.end) {
                continue;
            }
            possibilities.push(possibility);
        }
        if (possibilities.length < block.possibilities.length) {
            block.possibilities = possibilities;
        }
    };
    const statusBoxPossibleUpdates = (block: Nonogram.Block) => {
        const lengthInterval: Nonogram.Interval = {
            max: -Infinity,
            min: Infinity,
        };
        const limits: Nonogram.RangeInterval = {
            end: {
                max: -Infinity,
                min: Infinity,
            },
            start: {
                max: -Infinity,
                min: Infinity,
            },
        };
        const newList: Nonogram.Range[] = [];
        for (const range of block.possibilities) {
            const length = range.end + 1 - range.start;
            if (range.start < block.start.min) {
                continue;
            }
            if (range.start > block.start.max) {
                continue;
            }
            if (range.end < block.end.min) {
                continue;
            }
            if (range.end > block.end.max) {
                continue;
            }
            if (length < block.length.min) {
                continue;
            }
            if (length > block.length.max) {
                continue;
            }
            newList.push(range);
            if (range.start < limits.start.min) {
                limits.start.min = range.start;
            }
            if (range.start > limits.start.max) {
                limits.start.max = range.start;
            }
            if (range.end < limits.end.min) {
                limits.end.min = range.end;
            }
            if (range.end > limits.end.max) {
                limits.end.max = range.end;
            }
            if (length < lengthInterval.min) {
                lengthInterval.min = length;
            }
            if (length > lengthInterval.max) {
                lengthInterval.max = length;
            }
        }
        if (newList.length < block.possibilities.length) {
            block.possibilities = newList;
        }
        if (block.possibilities.length > 0) {
            block.start = limits.start;
            block.end = limits.end;
            block.length = lengthInterval;
        }
    };

    const statusBoxes = (rules: number[], boxes: Nonogram.colorIndexMay[]) => {
        const blocks = [] as Nonogram.Block[];
        let sum = 0;
        for(const length of rules) {
            sum += length;
        }

        let margin = boxes.length - sum - rules.length + 1;

        const firstWhite: Nonogram.Block = {
            end: {
                max: margin - 1,
                min: -1,
            },
            length: {
                max: margin,
                min: 0,
            },
            next: null,
            possibilities: [],
            prev: null,
            start: {
                max: 0,
                min: 0,
            },
            type: 0,
        };
        blocks.push(firstWhite);
        let lastWhite = firstWhite;
        let lastBlack = firstWhite;

        for(const length of rules) {
            const blackStart = lastWhite.start.min + lastWhite.length.min;
            lastBlack = {
                end: {
                    max: blackStart + length - 1 + margin,
                    min: blackStart + length - 1,
                },
                length: {
                    max: length,
                    min: length,
                },
                next: null,
                possibilities: [],
                prev: lastWhite,
                start: {
                    max: blackStart + margin,
                    min: blackStart,
                },
                type: 1,
            };
            lastWhite.next = lastBlack;
            blocks.push(lastBlack);

            const whiteStart = lastBlack.end.min + 1;
            lastWhite = {
                end: {
                    max: whiteStart + margin,
                    min: whiteStart,
                },
                length: {
                    max: 1 + margin,
                    min: 1,
                },
                next: null,
                possibilities: [],
                prev: lastBlack,
                start: {
                    max: whiteStart + margin,
                    min: whiteStart,
                },
                type: 0,
            };
            lastBlack.next = lastWhite;
            blocks.push(lastWhite);
        }
        lastWhite.length.min--;
        lastWhite.length.max--;
        lastWhite.end.max--;
        lastWhite.end.min = lastWhite.end.max;

        for (const block of blocks) {
            for (let start = block.start.min; start <= block.start.max; start++) {
                for (let length = block.length.min; length <= block.length.max; length++) {
                    const end = start + length - 1;
                    if (block.end.min <= end && end <= block.end.max) {
                        block.possibilities.push({end, start});
                    }
                }
            }
        }

        statusBoxSyncNextChain(firstWhite);
        statusBoxSyncPrevChain(lastWhite);

        for (const block of blocks) {
            for (let pos = 0; pos < boxes.length; pos++) {
                statusBoxSetBlock(pos, boxes[pos], block)
            }
        }

        statusBoxSyncNextChain(firstWhite);
        statusBoxSyncPrevChain(lastWhite);

        let bitMask = 1;
        let bits = 0;
        let allGood = true;
        for (const block of blocks) {
            const possibilities = block.possibilities.length;
            if (possibilities < 1) {
                return -0xFFFF;
            }
            if (block.type === 0) {
                continue;
            }
            let good = possibilities === 1;
            if (good) {
                const solved = block.possibilities[0];
                for (let position = solved.start; position <= solved.end; position++) {
                    if (boxes[position] !== block.type) {
                        good = false;
                        break;
                    }
                }
            }
            if (good) {
                bits = bits | bitMask;
            } else {
                allGood = false;
            }
            bitMask *= 2;
        }

        return allGood ? 0xFFFF: bits;
    };

    const statusCol = (x: number) => {
        if (game.cols[x].length < 1) {
            return 0;
        }

        const boxes = [];
        for (const row of game.grid) {
            boxes.push(row[x]);
        }

        return statusBoxes(game.cols[x], boxes);
    }
    const statusRow = (y: number) => {
        if (game.rows[y].length < 1) {
            return 0;
        }

        return statusBoxes(game.rows[y], game.grid[y]);
    }

    const start = (width: number, height: number) => {
        const scale = 10;
        const newGame: Nonogram.Game = {
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
        redrawHead();
        for (let x = 0; x < game.config.width; x++) {
            redrawCol(x);
        }
        for (let y = 0; y < game.config.height; y++) {
            redrawRow(y);
        }
        redrawGrid();
    };
    window['nano'] = window['nano'] || {};
    window['nano']['redraw'] = redraw;
    const redrawHead = () => {
        if (game.status.global) {
            gameGrid.fillStyle = game.status.global < 0 ? '#FCC' : '#CFC';
        } else {
            gameGrid.fillStyle = 'white';
        }
        gameGrid.fillRect(0, 0, game.config.xOffset, game.config.yOffset);
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

    const draw = (x: number, y: number, type: Nonogram.colorIndexMay) => {
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

    const gridClick = (x: number, y: number, reverse: boolean) => {
        const oldType = game.grid[y][x];
        // Normal: gray(-1) => black(1) => white(0), Reverse: gray(-1) <= black(1) <= white(0)
        const typeDelta = reverse ? 1 : 2;
        const newType = (1 + oldType+ typeDelta) % 3 - 1 as Nonogram.colorIndexMay;
        game.grid[y][x] = newType;
        save(game);
        draw(x, y, newType);
        const oldGlobal = game.status.global;
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
        if (oldGlobal !== gameMainStatus()) {
            redrawHead();
        }
    }

    const colClick = (x: number, force: boolean) => {
        if (game.cols[x].length > 0 && !force) {
            return;
        }
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

    const rowClick = (y: number, force: boolean) => {
        if (game.rows[y].length > 0 && !force) {
            return;
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

    const headerClick = (event: MouseEvent) => {
        if (event.ctrlKey && confirm('Delete game?')) {
            localStorage.removeItem('game');
            location.reload();
        } else if (event.shiftKey && confirm('Reset game?')) {
            save(reset(game));
            location.reload();
        } else {
            load(game);
        }
    }

    const gridHandler = (event: MouseEvent) => {
        const x = Math.floor((event.clientX - game.config.xOffset) / game.config.scale);
        const y = Math.floor((event.clientY - game.config.yOffset) / game.config.scale);
        if (x < 0) {
            if (y < 0) {
                return headerClick(event);
            }
            return rowClick(y, event.shiftKey || event.ctrlKey);
        }
        if (y < 0) {
            return colClick(x, event.shiftKey || event.ctrlKey);
        }

        return gridClick(x, y, event.button > 0 || event.shiftKey);
    };

    init();
    connectListeners();
}, {once: true, passive: true});