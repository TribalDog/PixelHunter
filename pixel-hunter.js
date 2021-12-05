WORLD_WIDTH = 512;
WORLD_HEIGHT = 512;
TICK_INTERVAL = 30;

MAX_PREY_CAP = 10000;
MAX_PREDATOR_CAP = 10000;

INITIAL_PREY = 500;
INITIAL_PREDATORS = 400;

MAX_PREY_LITTER = 2;
MAX_PREDATOR_LITTER = 8;

MAX_PREY_AGE = 70000;
MAX_PREDATOR_AGE = 300000;

MAX_PREDATOR_WALK_SPEED = 1;
MAX_PREY_WALK_SPEED = 1;

MAX_PREDATOR_RUN_SPEED = 5;
MAX_PREY_RUN_SPEED = 4;

MAX_PREDATOR_DISTANCE_FROM_HOME = 80;
MAX_PREY_DISTANCE_FROM_HOME = 220;

predators = Array();
prey = Array();
grass = Array();

maxPredatorAge = MAX_PREDATOR_AGE;
maxPreyAge = MAX_PREY_AGE;

statusMessage = '';
tick = 0;
spawnIndex = 0;
canvas = null;
ctx = null;

function setupCanvas() {
    canvas = window.document.getElementById('world');
    ctx = canvas.getContext('2d');
}

function getCSSColor(red, green, blue) {
    var color = '#' + Math.trunc(red).toString(16).padStart(2, '0') +
        Math.trunc(green).toString(16).padStart(2, '0') +
        Math.trunc(blue).toString(16).padStart(2, '0');
    return color;
}

function clampAgeShade(age, maxAgeSpan) {
    var vitallity = Math.abs(age / maxAgeSpan);
    var shade = 255 - (vitallity * 255);
    if (shade > 255) {
        shade = 255;
    }  
    if (shade < 0) {
        shade = 0;
    }
    return shade;
}

function renderCreature(creature) {
    var shade;
    if (creature.type === 'predator') {
        shade = clampAgeShade(creature.age, maxPredatorAge);
        ctx.fillStyle = getCSSColor(shade, shade, 255);
        ctx.fillRect(creature.x, creature.y, 5, 5);
    } else if (creature.type === 'prey') {
        shade = clampAgeShade(creature.age, maxPreyAge);
        ctx.fillStyle = getCSSColor(shade, 0, shade);
        ctx.fillRect(creature.x, creature.y, 3, 3);
    }

    ctx.fillStyle = '#000000';  // facing direction dot
    switch (creature.direction) {
        case 0:
            ctx.fillRect(creature.x + 1, creature.y, 1, 1);
            break;
        case 1:
            ctx.fillRect(creature.x + 2, creature.y, 1, 1);
            break;
        case 2:
            ctx.fillRect(creature.x + 2, creature.y + 1, 1, 1);
            break;
        case 3:
            ctx.fillRect(creature.x + 2, creature.y + 2, 1, 1);
            break;
        case 4:
            ctx.fillRect(creature.x + 1, creature.y + 2, 1, 1);
            break;
        case 5:
            ctx.fillRect(creature.x, creature.y + 2, 1, 1);
            break;
        case 6:
            ctx.fillRect(creature.x, creature.y + 1, 1, 1);
            break;
        case 7:
            ctx.fillRect(creature.x, creature.y, 1, 1);
            break;
    }
}

function renderPredator(predator) {
    renderCreature(predator, 'predator');
}

function renderPrey(prey) {
    renderCreature(prey, 'prey');
}

function spawnCreature(type, x, y) {
    if (type === 'predator') {
        walkingStep = Math.trunc(Math.random() * MAX_PREDATOR_WALK_SPEED) + 1;
        runningStep = Math.trunc(Math.random() * MAX_PREDATOR_RUN_SPEED) + 1;
        startAge = Math.trunc(Math.random() * maxPredatorAge);
    } else if (type === 'prey') {
        walkingStep = Math.trunc(Math.random() * MAX_PREY_WALK_SPEED) + 1;
        runningStep = Math.trunc(Math.random() * MAX_PREY_RUN_SPEED) + 1;
        startAge = Math.trunc(Math.random() * maxPreyAge);
    }
    if (!x) {
        x = Math.random() * WORLD_WIDTH;
    }
    if (!y) {
        y = Math.random() * WORLD_HEIGHT;
    }
    return {
        type: type,
        id: spawnIndex++,
        x: x,
        y: y,
        walkingStep: walkingStep,
        runningStep: runningStep,
        prevX: -1,
        prevY: -1,
        homeX: x,
        homeY: y,
        direction: Math.trunc(Math.random() * 8),
        status: 'passive',
        age: startAge,
        energy: 10000,
        lastMateTime: tick
    };
}

function spawnPredators(spawnAmount) {
    for (var i = 0; i < spawnAmount; i++) {
        predators.push(spawnCreature('predator'));
    }
}

function spawnPrey(spawnAmount) {
    for (var i = 0; i < spawnAmount; i++) {
        prey.push(spawnCreature('prey'));
    }
}

function setupPredators(count) {
    spawnPredators(count);
}

function setupPrey(count) {
    spawnPrey(count);
}
 
function drawPredators() {
    for (var i = 0; i < predators.length; i++) {
        renderPredator(predators[i]);
    } 
}
 
function drawPrey() {
    for (var i = 0; i < prey.length; i++) {
        renderPrey(prey[i]);
    } 
}

function moveCreature(creature) {
    if (!creature) {
        return;
    }

    creature.prevX = creature.x;
    creature.prevY = creature.y;

    var step = creature.walkingStep;
    if (creature.status === 'running') {
        step = creature.runningStep;
    }

    switch (creature.direction) {
        case 0:
            creature.y -= step;
            break;
        case 1:
            creature.y -= step;
            creature.x += step;
            break;
        case 2:
            creature.x += step;
            break;
        case 3:
            creature.y += step;
            creature.x += step;
            break;
        case 4:
            creature.y += step;
            break;
        case 5:
            creature.y += step;
            creature.x -= step;
            break;
        case 6:
            creature.x -= step;
            break;
        case 7:
            creature.y -= step;
            creature.x -= step;
            break;
    }

    if ((creature.x < 0) || 
        (creature.x >= WORLD_WIDTH) ||
        (creature.y < 0) ||
        (creature.y >= WORLD_HEIGHT)) {
        if (Math.random() > 0.5) {  // chance of turning right or left
            creature.direction--;
            if (creature.direction < 0) {
                creature.direction = 7;
            }
        } else {
            creature.direction++;
            if (creature.direction > 7) {
                creature.direction = 0;
            } 
        }

        creature.x = creature.prevX;
        creature.y = creature.prevY;

        moveCreature(creature);
    }

    var distanceFromHomeX = Math.abs(creature.x - creature.homeX);
    var distanceFromHomeY = Math.abs(creature.y - creature.homeY);
    if (creature.type === 'predator') {
        if ((distanceFromHomeX >= MAX_PREDATOR_DISTANCE_FROM_HOME) ||
            (distanceFromHomeY >= MAX_PREDATOR_DISTANCE_FROM_HOME)) {
            if (Math.random() > 0.5) { // chance of turning right or left
                creature.direction--;
                if (creature.direction < 0) {
                    creature.direction = 7;
                }
            } else {
                creature.direction++;
                if (creature.direction > 7) {
                    creature.direction = 0;
                } 
            }
        }
    } else if (creature.type === 'prey') {
        if ((distanceFromHomeX >= MAX_PREY_DISTANCE_FROM_HOME) ||
            (distanceFromHomeY >= MAX_PREY_DISTANCE_FROM_HOME)) {
            if (Math.random() > 0.5) { // chance of turning right or left
                creature.direction--;
                if (creature.direction < 0) {
                    creature.direction = 7;
                }
            } else {
                creature.direction++;
                if (creature.direction > 7) {
                    creature.direction = 0;
                } 
            }
        }
    }
}

function movePredators() {
    for (var i = 0; i < predators.length; i++) {
        moveCreature(predators[i]);

        for (var j = 0; j < prey.length; j++) {
            if (predators[i]) {
                var deltaX = predators[i].x - prey[j].x;
                var deltaY = predators[i].y - prey[j].y;
                var distanceFromPreyX = Math.abs(deltaX);
                var distanceFromPreyY = Math.abs(deltaY);

                if ((distanceFromPreyX < 4) && (distanceFromPreyY < 4)) {
                    predators[i].energy = 10000;
                    predators[i].age--;
                    predators[i].status = 'passive';
                    killPrey(prey[j]);
                } else if ((distanceFromPreyX < 64) && (distanceFromPreyY < 64)) {
                    predators[i].status = 'running';
                    predators[i].energy--;
                    if (deltaX >= 0) {
                        predators[i].direction = 6;
                    } else {
                        predators[i].direction = 2;
                    }
                    if (deltaY >= 0) {
                        predators[i].direction--;
                    } else {
                        predators[i].direction++;
                    }
                } else {
                    predators[i].status = 'passive';
                    predators[i].energy--;
                }
            }
        } 

        if (predators.length <= MAX_PREDATOR_CAP) {
            var spawn = 0;
            for (var k = 0; k <predators.length; k++) {
                if ((predators[i]) && (predators[k]) && (i !== k)) {
                    var distanceFromMateX = Math.abs(predators[i].x - predators[k].x);
                    var distanceFromMateY = Math.abs(predators[i].y - predators[k].y);
                    if ((distanceFromMateX < 2) && (distanceFromMateY < 2)) {
                        if ((tick - 1) > predators[i].lastMateTime) {
                            predators[i].lastMateTime = tick;
                            predators[k].lastMateTime = tick;
                            spawn++;
                        }
                    }
                }
            }
    
            if (spawn > 0) {
                var spawned = Math.trunc(Math.random() * MAX_PREDATOR_LITTER * spawn);
                // console.log('>>> predators born', spawned);
                spawnPredators(spawned, predators[i].x, predators[i].y);
            }
        }
    } 
}

function movePrey() {
    for (var i = 0; i < prey.length; i++) {
        moveCreature(prey[i]);

        for (var j = 0; j < predators.length; j++) {
            if (prey[i]) {
                var deltaX = prey[i].x - predators[j].x;
                var deltaY = prey[i].y - predators[j].y;
                var distancesToPredatorX = Math.abs(deltaX);
                var distancesToPredatorY = Math.abs(deltaY);

                if ((distancesToPredatorX < 16) && (distancesToPredatorY < 16)) {
                    prey[i].status = 'running';
                    prey[i].energy--;

                    if (deltaX >= 0) {
                        prey[i].direction = 2;
                    } else {
                        prey[i].direction = 6;
                    }
                    if (deltaY >= 0) {
                        prey[i].direction++;
                    } else {
                        prey[i].direction--;
                    }
                } else {
                    prey[i].status = 'passive';
                    prey[i].energy += 10;
                    if (prey[i].energy > 100) {
                        prey[i].energy = 100;
                    }
                }
            }
        } 

        // flocking causes too much CPU pressure, need to be able to find prey within local vicinity
        // for (var j = 0; j < prey.length; j++) {
        //     if (prey[i]) {
        //         deltaPreyX = prey[i].x - prey[j].x;
        //         deltaPreyY = prey[i].y - prey[j].y;
        //         var distancesToPreyX = Math.abs(deltaPreyX);
        //         var distancesToPreyY = Math.abs(deltaPreyY);

        //         if ((distancesToPreyX < 16) && (distancesToPreyY < 16)) {
        //             if (deltaPreyX >= 0) {
        //                 prey[i].direction = 6;
        //             } else {
        //                 prey[i].direction = 2;
        //             }
        //             if (deltaPreyX >= 0) {
        //                 prey[i].direction--;
        //             } else {
        //                 prey[i].direction++;
        //             }
        //         }
        //     }
        // } 

        if (prey.length <= MAX_PREY_CAP) {
            var spawn = 0;
            for (var k = 0; k <prey.length; k++) {
                if ((prey[i]) && (prey[k]) && (i !== k)) {
                    var distanceFromMateX = Math.abs(prey[i].x - prey[k].x);
                    var distanceFromMateY = Math.abs(prey[i].y - prey[k].y);
                    if ((distanceFromMateX < 4) && (distanceFromMateY < 4)) {
                        if ((tick - 2) > prey[i].lastMateTime) {
                            prey[i].lastMateTime = tick;
                            prey[k].lastMateTime = tick;
                            spawn++;
                        }
                    }
                }
            }

            if (spawn > 0) {
                var spawned = Math.trunc(Math.random() * MAX_PREY_LITTER * spawn);
                // console.log('>>> prey born', spawned);
                spawnPrey(spawned, prey[i].x, prey[i].y);
            }
        }
    } 
}

function findPredatorIndex(search) {
    index = -1;
    for (var i = 0; i < predators.length; i++) {
        if (predators[i].spawnIndex === search.index) {
            return i;
        }
    }
}

function findPreyIndex(search) {
    index = -1;
    for (var i = 0; i < prey.length; i++) {
        if (prey[i].spawnIndex === search.index) {
            return i;
        }
    }
}

function killPredator(search) {
    predators.splice(findPredatorIndex(search), 1);
    // console.log('>>>> predator killed');
}

function killPrey(search) {
    prey.splice(findPreyIndex(search), 1);
    // console.log('>>>> prey killed');
}

function agePredator(predator) {
    if (predator) {
        predator.age++;
        if (predator.age > maxPredatorAge + (Math.trunc(Math.random() * 20) - 10)) {
            // console.log('>>>> predator died of old age');
            killPredator(predator);
        }
    }
}

function killExaustedPredator(predator) {
    if (predator.energy <= 0) {
        killPredator(predator);
    }
}

function ageAllPredators() {
    for (var i = 0; i < predators.length; i++) {
        killExaustedPredator(predators[i]);
        agePredator(predators[i]);
    }
}

function agePrey(prey) {
    if (prey) {
        prey.age++;
        if (prey.age > maxPreyAge + (Math.trunc(Math.random() * 20) - 10)) {
            // console.log('>>>> prey died of old age');
            killPrey(prey);
            return;
        }
    }
}

function killExaustedPrey(prey) {
    if (prey.energy <= 0) {
        killPrey(prey);
    }
}

function ageAllPrey() {
    for (var i = 0; i < prey.length; i++) {
        if (prey[i]) {
            killExaustedPrey(prey[i]);
            agePrey(prey[i]);
        }
    }
}

function hasSimulationFailed() {
    var failed = false;

    if (predators.length >= MAX_PREDATOR_CAP) {
        failed = true;
        statusMessage = 'Too many predators';
    }
    if (prey.length >= MAX_PREY_CAP) {
        failed = true;
        statusMessage = 'Too much prey';
    }
    if (predators.length === 0) {
        failed = true;
        statusMessage = 'Not enough predators';
    }
    if (prey.length === 0) {
        failed = true;
        statusMessage = 'Not enough prey';
    }

    return failed;
}

function updateConsole() {
    window.document.getElementById('statusMessage').innerHTML = statusMessage;
    window.document.getElementById('tick').innerHTML = tick;
    window.document.getElementById('preyCount').innerHTML = prey.length;
    window.document.getElementById('predatorCount').innerHTML = predators.length;
}

function setInputs() {
    window.document.getElementById('initialPredatorCount').value = INITIAL_PREDATORS;
    window.document.getElementById('initialPreyCount').value = INITIAL_PREY;
    window.document.getElementById('maxPredatorAge').value = MAX_PREDATOR_AGE;
    window.document.getElementById('maxPreyAge').value = MAX_PREY_AGE;
}

setupCanvas();
setInputs();

function runSimulation() {
    predators = Array();
    prey = Array();
    grass = Array();

    tick = 0;
    spawnIndex = 0;

    statusMessage = 'Running...';

    updateConsole();

    setupPredators(parseInt(window.document.getElementById('initialPredatorCount').value));
    setupPrey(parseInt(window.document.getElementById('initialPreyCount').value));

    maxPredatorAge = parseInt(window.document.getElementById('initialPredatorCount').value);
    maxPreyAge = parseInt(window.document.getElementById('initialPreyCount').value);

    var interval = setInterval(function () {    
        if (hasSimulationFailed()) {
            clearInterval(interval);
            statusMessage += '. Simulation has stopped';
        }
    
        tick++;
    
        ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
        movePredators();
        movePrey();
    
        drawPredators();
        drawPrey();
    
        ageAllPredators();
        ageAllPrey();

        updateConsole();
    
    }, TICK_INTERVAL);
}
