document.addEventListener('DOMContentLoaded', function() {
    const gameWindow = document.getElementById('gameWindow1');
    const windowHeader = document.getElementById('windowHeader1');
    
    if (!gameWindow || !windowHeader) return;
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // 윈도우의 초기 위치 설정
    const rect = gameWindow.getBoundingClientRect();
    xOffset = rect.left;
    yOffset = rect.top;

    windowHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // 터치 이벤트 지원 (모바일)
    windowHeader.addEventListener('touchstart', dragStartTouch);
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        isDragging = true;
        if (typeof bringWindowToFront === 'function') {
            bringWindowToFront('gameWindow1');
        }
        gameWindow.classList.add('dragging');
    }

    function dragStartTouch(e) {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
        isDragging = true;
        if (typeof bringWindowToFront === 'function') {
            bringWindowToFront('gameWindow1');
        }
        gameWindow.classList.add('dragging');
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            // 화면 경계 내에서만 이동하도록 제한
            const maxX = window.innerWidth - gameWindow.offsetWidth;
            const maxY = window.innerHeight - gameWindow.offsetHeight;
            
            xOffset = Math.max(0, Math.min(xOffset, maxX));
            yOffset = Math.max(0, Math.min(yOffset, maxY));

            setTranslate(xOffset, yOffset, gameWindow);
        }
    }

    function dragTouch(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            const maxX = window.innerWidth - gameWindow.offsetWidth;
            const maxY = window.innerHeight - gameWindow.offsetHeight;
            
            xOffset = Math.max(0, Math.min(xOffset, maxX));
            yOffset = Math.max(0, Math.min(yOffset, maxY));

            setTranslate(xOffset, yOffset, gameWindow);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        gameWindow.classList.remove('dragging');
    }

    function setTranslate(xPos, yPos, el) {
        el.style.left = xPos + 'px';
        el.style.top = yPos + 'px';
        el.style.transform = 'none';
    }
});