// 그리드 설정
const GRID_COLS = 15;
const GRID_ROWS = 10;
let cells = [];
let spreadQueue = [];
let isSpreading = false;
let hasStarted = false;

// 페이지 로드 시 상태 리셋
function resetState() {
    cells = [];
    spreadQueue = [];
    isSpreading = false;
    hasStarted = false;
}

// 그리드 초기화
function initGrid() {
    const gridContainer = document.getElementById('gridContainer');
    if (!gridContainer) return;
    
    // 기존 그리드 완전히 제거
    gridContainer.innerHTML = '';
    
    gridContainer.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
    
    cells = [];
    
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleCellClick(row, col));
            gridContainer.appendChild(cell);
            cells.push({ element: cell, row, col, active: false });
        }
    }
}

// 셀 클릭 처리
function handleCellClick(row, col) {
    if (hasStarted || isSpreading) return;
    
    hasStarted = true;
    const clickedCell = cells.find(c => c.row === row && c.col === col);
    if (!clickedCell) return;
    
    // 파동 시작 시 그리드 컨테이너에 클래스 추가하여 호버 효과 비활성화
    const gridContainer = document.getElementById('gridContainer');
    if (gridContainer) {
        gridContainer.classList.add('wave-started');
    }
    
    // 클릭된 셀 활성화 (파동의 시작점)
    clickedCell.active = true;
    clickedCell.element.classList.add('active');
    clickedCell.element.classList.add('spread');
    
    // 클릭한 셀에 텍스트 추가
    addTaskText(clickedCell.element);
    
    // 퍼지기 시작
    spreadQueue = [{ row, col, level: 0 }];
    isSpreading = true;
    
    setTimeout(() => {
        spreadFromCell(row, col);
    }, 100);
}

// 텍스트 목록
const taskTexts = ['메일 보내기', '문서 작성', '메신저 응답', '자료 수집'];

// 원형 파동처럼 퍼지는 효과 (더 원형처럼 보이게)
function spreadFromCell(startRow, startCol) {
    // 모든 셀의 거리 계산 (유클리드 거리 - 원형 효과)
    const cellsWithDistance = cells.map(cell => {
        const rowDiff = cell.row - startRow;
        const colDiff = cell.col - startCol;
        // 유클리드 거리 사용 (원형 파동 효과)
        const distance = Math.sqrt(rowDiff * rowDiff + colDiff * colDiff);
        // 거리를 반올림하여 그룹화 (명확한 레벨 구분으로 중심에서 퍼지는 느낌 강화)
        const roundedDistance = Math.round(distance * 3) / 3; // 명확한 레벨 구분
        return { ...cell, distance: roundedDistance, originalDistance: distance };
    });
    
    // 거리별로 정렬 및 그룹화
    cellsWithDistance.sort((a, b) => a.distance - b.distance);
    
    // 거리별로 그룹화
    const distanceGroups = {};
    cellsWithDistance.forEach(cell => {
        if (!distanceGroups[cell.distance]) {
            distanceGroups[cell.distance] = [];
        }
        distanceGroups[cell.distance].push(cell);
    });
    
    // 각 거리 그룹을 순차적으로 활성화
    const distances = Object.keys(distanceGroups).map(Number).sort((a, b) => a - b);
    const levelDelay = 40; // 각 레벨 간 지연 시간 (ms) - 빠른 파동 효과
    
    let currentIndex = 0;
    
    function activateNextLevel() {
        if (currentIndex >= distances.length) {
            // 모든 셀이 퍼졌으면 잠시 후 index.html로 이동
            setTimeout(() => {
                goToMain();
            }, 500);
            return;
        }
        
        const currentDistance = distances[currentIndex];
        const currentGroup = distanceGroups[currentDistance];
        
        // 현재 거리의 셀들을 랜덤하게 섞고 일부만 활성화 (중심에서 퍼지는 효과)
        const shuffled = currentGroup.sort(() => Math.random() - 0.5);
        // 거리에 따라 활성화 비율 조정 (가까울수록 더 많이, 멀수록 적게) - 중심에서 퍼지는 느낌
        const baseRatio = Math.max(0.2, 0.6 - (currentDistance * 0.04)); // 거리에 따른 비율 차이 증가
        const activationRatio = baseRatio + (Math.random() - 0.5) * 0.1; // 약간의 랜덤성
        const numToActivate = Math.ceil(shuffled.length * Math.max(0.15, Math.min(0.6, activationRatio)));
        const cellsToActivate = shuffled.slice(0, numToActivate);
        
        // 선택된 셀들을 활성화 (파동) - 클릭한 셀은 제외
        cellsToActivate.forEach(cellData => {
            // 클릭한 시작점 셀은 이미 활성화되어 있으므로 건너뛰기
            if (cellData.row === startRow && cellData.col === startCol) {
                return;
            }
            
            if (!cellData.active) {
                cellData.active = true;
                cellData.element.classList.add('spread');
                
                // 채워진 부분에는 모두 텍스트 추가
                addTaskText(cellData.element);
            }
        });
        
        currentIndex++;
        setTimeout(activateNextLevel, levelDelay);
    }
    
    activateNextLevel();
}

// 작업 텍스트 추가 (떨어질 때까지 유지)
function addTaskText(cellElement) {
    const text = taskTexts[Math.floor(Math.random() * taskTexts.length)];
    const textElement = document.createElement('span');
    textElement.className = 'task-text';
    textElement.textContent = text;
    
    cellElement.appendChild(textElement);
    
    // 텍스트 나타나기
    setTimeout(() => {
        textElement.classList.add('visible');
    }, 10);
    
    // 떨어질 때까지 텍스트 유지 (사라지지 않음)
}

// 메인 페이지로 이동
function goToMain() {
    sessionStorage.setItem('introShown', 'true');
    sessionStorage.setItem('showIntroText', 'true');
    window.location.href = 'index.html';
}

// 전역 함수로 노출
window.goToMain = goToMain;

// 페이지 로드 시 그리드 초기화
window.addEventListener('DOMContentLoaded', () => {
    resetState();
    initGrid();
});
