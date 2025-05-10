document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let gameConfig = {};
    let foundDifferences = [];
    let score = 0;
    let currentSetIndex = 0;
    let timeRemaining = 0;
    let timerInterval = null;
    let gameStarted = false;
    
    // DOM elements
    const gameTitle = document.getElementById('game-title');
    let image1 = document.getElementById('image1');
    let image2 = document.getElementById('image2');
    const canvas1 = document.getElementById('canvas1');
    const canvas2 = document.getElementById('canvas2');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    const scoreElement = document.getElementById('score');
    const totalDifferencesElement = document.getElementById('total-differences');
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    const imagesContainer = document.querySelector('.images-container');

    // Audio elements
    const clickSound = new Audio('assets/sounds/click.mp3');
    const successSound = new Audio('assets/sounds/success.mp3');
    const failSound = new Audio('assets/sounds/fail.mp3');
    
    // Create start/restart UI elements
    const startContainer = document.createElement('div');
    startContainer.className = 'start-container';
    
    const startButton = document.createElement('button');
    startButton.className = 'game-button start-button';
    startButton.textContent = 'Start Game';
    
    const restartButton = document.createElement('button');
    restartButton.className = 'game-button restart-button';
    restartButton.textContent = 'Play Again';
    restartButton.style.display = 'none';
    
    const gameMessage = document.createElement('div');
    gameMessage.className = 'game-message';
    
    startContainer.appendChild(startButton);
    startContainer.appendChild(restartButton);
    startContainer.appendChild(gameMessage);
    imagesContainer.parentNode.insertBefore(startContainer, imagesContainer);

    // Create flip containers
    const createFlipContainers = () => {
        const flipContainer1 = document.createElement('div');
        const flipContainer2 = document.createElement('div');
        flipContainer1.className = 'flip-container';
        flipContainer2.className = 'flip-container';
        
        image1.parentNode.insertBefore(flipContainer1, image1);
        image2.parentNode.insertBefore(flipContainer2, image2);
        flipContainer1.appendChild(image1);
        flipContainer2.appendChild(image2);
        
        return { flipContainer1, flipContainer2 };
    };

    const { flipContainer1, flipContainer2 } = createFlipContainers();

    // Initialize canvas
    function setupCanvas(canvas, img) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
    }

    // Draw a difference marker
    function drawFoundCircle(centerX, centerY, radius = 25) {
        const fillColor = 'rgba(255, 0, 0, 0.3)';
        const strokeColor = '#FF0000';
        const lineWidth = 3;
        
        [ctx1, ctx2].forEach(ctx => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        });
    }

    // Enhanced image loader with flip transition
    function loadImageWithFlip(imgElement, newSrc, flipContainer, isInitialLoad = false) {
        return new Promise((resolve) => {
            if (isInitialLoad) {
                imgElement.src = newSrc;
                imgElement.onload = () => {
                    setupCanvas(imgElement === image1 ? canvas1 : canvas2, imgElement);
                    resolve();
                };
                return;
            }

            const newImg = document.createElement('img');
            newImg.className = imgElement.className;
            newImg.style.position = 'absolute';
            newImg.style.top = '0';
            newImg.style.left = '0';
            newImg.style.width = '100%';
            newImg.style.height = 'auto';
            newImg.style.backfaceVisibility = 'hidden';
            newImg.style.transform = 'rotateY(180deg)';
            
            flipContainer.appendChild(newImg);
            
            flipContainer.style.transition = 'transform 0.8s ease-in-out';
            flipContainer.style.transform = 'rotateY(180deg)';
            
            newImg.onload = () => {
                setTimeout(() => {
                    imgElement.remove();
                    newImg.style.transform = 'rotateY(0deg)';
                    newImg.style.position = 'static';
                    
                    if (flipContainer === flipContainer1) {
                        image1 = newImg;
                    } else {
                        image2 = newImg;
                    }
                    
                    setupCanvas(flipContainer === flipContainer1 ? canvas1 : canvas2, newImg);
                    
                    setTimeout(() => {
                        flipContainer.style.transition = 'none';
                        flipContainer.style.transform = 'rotateY(0deg)';
                        setTimeout(() => {
                            flipContainer.style.transition = 'transform 0.8s ease-in-out';
                        }, 50);
                    }, 10);
                    
                    resolve();
                }, 400);
            };
            newImg.src = newSrc;
        });
    }

    // Load image set with optional transition
    function loadImageSet(index, isInitialLoad = false) {
        if (index >= gameConfig.imageSets.length) {
            endGame(true);
            return;
        }

        const set = gameConfig.imageSets[index];
        foundDifferences = [];
        score = 0;
        scoreElement.textContent = '0';
        totalDifferencesElement.textContent = set.differences.length;

        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

        Promise.all([
            loadImageWithFlip(image1, set.image1, flipContainer1, isInitialLoad)
                .catch(() => loadImageWithFlip(image1, 'https://via.placeholder.com/800x600?text=Image1+Missing', flipContainer1, isInitialLoad)),
            loadImageWithFlip(image2, set.image2, flipContainer2, isInitialLoad)
                .catch(() => loadImageWithFlip(image2, 'https://via.placeholder.com/800x600?text=Image2+Missing', flipContainer2, isInitialLoad))
        ]).then(() => {
            gameTitle.textContent = `${gameConfig.gameTitle} (${index + 1}/${gameConfig.imageSets.length})`;
            
            if (gameStarted) {
                image1.addEventListener('click', handleImageClick);
                image2.addEventListener('click', handleImageClick);
            }
        });
    }

    // Point-in-polygon algorithm
    function isPointInPolygon(x, y, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // Handle image click
    function handleImageClick(e) {
        if (!gameStarted) return;
        
        // Play click sound
        clickSound.currentTime = 0;
        clickSound.play().catch(console.error);
        
        const imgElement = e.target;
        const rect = imgElement.getBoundingClientRect();
        const scaleX = imgElement.naturalWidth / rect.width;
        const scaleY = imgElement.naturalHeight / rect.height;
        
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        const currentSet = gameConfig.imageSets[currentSetIndex];
        currentSet.differences.forEach((diff, index) => {
            if (!foundDifferences.includes(index)) {
                const { topLeft, topRight, bottomLeft, bottomRight } = diff;
                const polygon = [
                    [topLeft.x, topLeft.y],
                    [topRight.x, topRight.y],
                    [bottomRight.x, bottomRight.y],
                    [bottomLeft.x, bottomLeft.y]
                ];
                
                if (isPointInPolygon(clickX, clickY, polygon)) {
                    foundDifferences.push(index);
                    score++;
                    scoreElement.textContent = score;
                    
                    const centerX = (topLeft.x + topRight.x + bottomLeft.x + bottomRight.x) / 4;
                    const centerY = (topLeft.y + topRight.y + bottomLeft.y + bottomRight.y) / 4;
                    drawFoundCircle(centerX, centerY);
                    
                    if (foundDifferences.length === currentSet.differences.length) {
                        if (currentSetIndex < gameConfig.imageSets.length - 1) {
                            setTimeout(() => {
                                currentSetIndex++;
                                loadImageSet(currentSetIndex);
                            }, 1000);
                        } else {
                            endGame(true);
                        }
                    }
                }
            }
        });
    }

    // Timer functions
    function startTimer() {
        timeRemaining = gameConfig.timerDuration;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                endGame(false);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const percentage = (timeRemaining / gameConfig.timerDuration) * 100;
        timerBar.style.width = `${percentage}%`;
        
        if (percentage < 20) {
            timerBar.style.backgroundColor = '#f44336';
        } else if (percentage < 50) {
            timerBar.style.backgroundColor = '#ff9800';
        }
    }

    function endGame(success) {
        gameStarted = false;
        clearInterval(timerInterval);
        
        // Show restart button and message
        startButton.style.display = 'none';
        restartButton.style.display = 'block';
        startContainer.style.display = 'flex';
        
        if (success) {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            gameMessage.textContent = `
                ${gameConfig.successMessage} 
                ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}
            `;
            gameMessage.className = 'game-message';
            
            // Play success sound
            successSound.currentTime = 0;
            successSound.play().catch(console.error);
        } else {
            gameMessage.textContent = "Time's up! Try again!";
            gameMessage.className = 'game-message';
            
            // Play fail sound
            failSound.currentTime = 0;
            failSound.play().catch(console.error);
        }
        
        image1.removeEventListener('click', handleImageClick);
        image2.removeEventListener('click', handleImageClick);
    }

    // Start game function
    function startGame() {
        gameStarted = true;
        startContainer.style.display = 'none';
        gameMessage.textContent = '';
        startTimer();
        
        // Attach event listeners
        image1.addEventListener('click', handleImageClick);
        image2.addEventListener('click', handleImageClick);
    }

    // Restart game function
    function restartGame() {
        currentSetIndex = 0;
        startGame();
        loadImageSet(currentSetIndex, true);
    }

    // Button event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);

    // Initialize game (without starting)
    function initializeGame() {
        loadImageSet(currentSetIndex, true);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (image1.complete && image2.complete) {
            setupCanvas(canvas1, image1);
            setupCanvas(canvas2, image2);
        }
    });

    // Load game configuration
    fetch('config.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(config => {
            gameConfig = config;
            initializeGame();
        })
        .catch(error => {
            console.error('Error loading game configuration:', error);
            gameConfig = {
                gameTitle: "Spot the Difference",
                timerDuration: 120,
                imageSets: [{
                    image1: "https://via.placeholder.com/800x600?text=Image+1",
                    image2: "https://via.placeholder.com/800x600?text=Image+2",
                    differences: [
                        { topLeft: {x:100,y:100}, topRight: {x:150,y:100}, bottomLeft: {x:100,y:150}, bottomRight: {x:150,y:150} }
                    ]
                }],
                successMessage: "Congratulations! You found all differences with time remaining: "
            };
            initializeGame();
        });
});