// ========================================
// BEAUTY STRUCTURE CHECKER - 앱 로직
// ========================================

// 앱 상태 관리
const AppState = {
    currentQuestion: 0,
    answers: [],
    userType: null,
    trackerDay: 1,
    trackerAnswers: [],
    userId: null
};

// DOM 요소 캐싱
const DOM = {};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    initializeApp();
});

function initializeDOM() {
    DOM.loadingScreen = document.getElementById('loading-screen');
    DOM.app = document.getElementById('app');
    DOM.progressContainer = document.getElementById('progress-container');
    DOM.progressFill = document.getElementById('progress-fill');
    DOM.progressText = document.getElementById('progress-text');
    DOM.mainContent = document.getElementById('main-content');

    // 섹션들
    DOM.introSection = document.getElementById('intro-section');
    DOM.diagnosisSection = document.getElementById('diagnosis-section');
    DOM.analyzingSection = document.getElementById('analyzing-section');
    DOM.resultSection = document.getElementById('result-section');
    DOM.trackerSection = document.getElementById('tracker-section');
    DOM.ctaSection = document.getElementById('cta-section');

    // 진단 관련
    DOM.questionCategory = document.getElementById('question-category');
    DOM.questionNumber = document.getElementById('question-number');
    DOM.questionText = document.getElementById('question-text');
    DOM.answersContainer = document.getElementById('answers-container');
    DOM.btnPrev = document.getElementById('btn-prev');

    // 결과 관련
    DOM.resultType = document.getElementById('result-type');
    DOM.resultSubtitle = document.getElementById('result-subtitle');
    DOM.resultSummary = document.getElementById('result-summary');
    DOM.resultWarning = document.getElementById('result-warning');
    DOM.resultCanDo = document.getElementById('result-can-do');
    DOM.resultCantDo = document.getElementById('result-cant-do');
    DOM.resultTip = document.getElementById('result-tip');

    // 트래커 관련
    DOM.trackerDays = document.getElementById('tracker-days');
    DOM.trackerCurrent = document.getElementById('tracker-current');
    DOM.trackerComplete = document.getElementById('tracker-complete');
    DOM.currentDayBadge = document.getElementById('current-day-badge');
    DOM.currentDayTitle = document.getElementById('current-day-title');
    DOM.currentDayQuestion = document.getElementById('current-day-question');
    DOM.dayAnswer = document.getElementById('day-answer');

    // 관리자 패널
    DOM.adminPanel = document.getElementById('admin-panel');
}

function initializeApp() {
    // 사용자 ID 생성 또는 복구
    AppState.userId = localStorage.getItem('bsc_user_id') || generateUserId();
    localStorage.setItem('bsc_user_id', AppState.userId);

    // 이전 진행 상태 복구
    const savedState = localStorage.getItem('bsc_state');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(AppState, parsed);
    }

    // 로딩 애니메이션 후 앱 표시
    setTimeout(() => {
        DOM.loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            DOM.loadingScreen.classList.add('hidden');
            DOM.app.classList.remove('hidden');

            // 이전 상태에 따라 적절한 화면 표시
            if (AppState.userType && AppState.trackerDay > 1) {
                showTracker();
            } else if (AppState.userType) {
                showResult();
            } else if (AppState.answers.length > 0) {
                showDiagnosis();
                showQuestion(AppState.currentQuestion);
            }
        }, 500);
    }, 2000);

    // 관리자 접근 단축키 (Ctrl + Shift + A)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            showAdmin();
        }
    });
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveState() {
    localStorage.setItem('bsc_state', JSON.stringify(AppState));
}

// ========================================
// 진단 시작
// ========================================
function startDiagnosis() {
    DOM.introSection.classList.add('hidden');
    DOM.diagnosisSection.classList.remove('hidden');
    DOM.progressContainer.classList.remove('hidden');

    AppState.currentQuestion = 0;
    AppState.answers = [];
    showQuestion(0);
    saveState();
}

function showQuestion(index) {
    if (index < 0 || index >= QUESTIONS.length) return;

    const question = QUESTIONS[index];
    const category = CATEGORIES.find(c => c.id === question.category);

    // 카테고리 및 번호 업데이트
    DOM.questionCategory.textContent = category.name;
    DOM.questionNumber.textContent = `Q${index + 1}`;
    DOM.questionText.textContent = question.text;

    // 진행률 업데이트
    const progress = ((index + 1) / QUESTIONS.length) * 100;
    DOM.progressFill.style.width = `${progress}%`;
    DOM.progressText.textContent = `${index + 1} / ${QUESTIONS.length}`;

    // 이전 버튼 표시/숨김
    if (index > 0) {
        DOM.btnPrev.classList.remove('hidden');
    } else {
        DOM.btnPrev.classList.add('hidden');
    }

    // 답변 옵션 렌더링
    DOM.answersContainer.innerHTML = '';
    question.answers.forEach((answer, answerIndex) => {
        const option = document.createElement('div');
        option.className = 'answer-option';
        if (AppState.answers[index] === answerIndex) {
            option.classList.add('selected');
        }
        option.innerHTML = `
            <div class="answer-radio"></div>
            <span class="answer-text">${answer.text}</span>
        `;
        option.addEventListener('click', () => selectAnswer(index, answerIndex));
        DOM.answersContainer.appendChild(option);
    });

    // 애니메이션
    DOM.diagnosisSection.querySelector('.diagnosis-container').style.opacity = '0';
    DOM.diagnosisSection.querySelector('.diagnosis-container').style.transform = 'translateY(20px)';
    setTimeout(() => {
        DOM.diagnosisSection.querySelector('.diagnosis-container').style.transition = 'all 0.3s ease';
        DOM.diagnosisSection.querySelector('.diagnosis-container').style.opacity = '1';
        DOM.diagnosisSection.querySelector('.diagnosis-container').style.transform = 'translateY(0)';
    }, 50);
}

function selectAnswer(questionIndex, answerIndex) {
    AppState.answers[questionIndex] = answerIndex;
    AppState.currentQuestion = questionIndex;
    saveState();

    // 선택 상태 업데이트
    const options = DOM.answersContainer.querySelectorAll('.answer-option');
    options.forEach((opt, idx) => {
        opt.classList.toggle('selected', idx === answerIndex);
    });

    // 잠시 후 다음 질문으로
    setTimeout(() => {
        if (questionIndex < QUESTIONS.length - 1) {
            AppState.currentQuestion = questionIndex + 1;
            showQuestion(AppState.currentQuestion);
            saveState();
        } else {
            // 진단 완료 - 분석 화면으로
            showAnalyzing();
        }
    }, 400);
}

function prevQuestion() {
    if (AppState.currentQuestion > 0) {
        AppState.currentQuestion--;
        showQuestion(AppState.currentQuestion);
        saveState();
    }
}

// ========================================
// 분석 중 화면
// ========================================
function showAnalyzing() {
    DOM.diagnosisSection.classList.add('hidden');
    DOM.progressContainer.classList.add('hidden');
    DOM.analyzingSection.classList.remove('hidden');

    // 단계별 애니메이션
    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3')
    ];

    setTimeout(() => {
        steps[1].classList.add('active');
        steps[1].querySelector('.step-icon').textContent = '✓';
    }, 1500);

    setTimeout(() => {
        steps[2].classList.add('active');
        steps[2].querySelector('.step-icon').textContent = '✓';
    }, 3000);

    setTimeout(() => {
        // 유형 계산
        AppState.userType = determineOwnerType(AppState.answers);
        saveState();

        // 데이터 저장 (관리자용)
        saveUserData();

        // 결과 화면으로
        showResult();
    }, 4000);
}

// ========================================
// 결과 화면
// ========================================
function showResult() {
    DOM.analyzingSection.classList.add('hidden');
    DOM.introSection.classList.add('hidden');
    DOM.diagnosisSection.classList.add('hidden');
    DOM.progressContainer.classList.add('hidden');
    DOM.resultSection.classList.remove('hidden');

    const typeData = OWNER_TYPES[AppState.userType];

    DOM.resultType.textContent = typeData.name;
    DOM.resultSubtitle.textContent = typeData.subtitle;
    DOM.resultSummary.textContent = typeData.summary;
    DOM.resultWarning.textContent = typeData.warning;

    // 할 수 있는 것 리스트
    DOM.resultCanDo.innerHTML = '';
    typeData.canDo.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        DOM.resultCanDo.appendChild(li);
    });

    // 하면 안 되는 것 리스트
    DOM.resultCantDo.innerHTML = '';
    typeData.cantDo.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        DOM.resultCantDo.appendChild(li);
    });

    DOM.resultTip.textContent = typeData.tip;

    // 스크롤 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// 7일 트래커
// ========================================
function startTracker() {
    DOM.resultSection.classList.add('hidden');
    DOM.trackerSection.classList.remove('hidden');

    renderTrackerDays();
    showTrackerDay(AppState.trackerDay);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTracker() {
    DOM.introSection.classList.add('hidden');
    DOM.diagnosisSection.classList.add('hidden');
    DOM.resultSection.classList.add('hidden');
    DOM.trackerSection.classList.remove('hidden');

    renderTrackerDays();

    if (AppState.trackerDay > 7) {
        showTrackerComplete();
    } else {
        showTrackerDay(AppState.trackerDay);
    }
}

function renderTrackerDays() {
    DOM.trackerDays.innerHTML = '';

    for (let i = 1; i <= 7; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-indicator';

        if (i === AppState.trackerDay && AppState.trackerDay <= 7) {
            dayDiv.classList.add('active');
        }
        if (i < AppState.trackerDay || AppState.trackerAnswers[i - 1]) {
            dayDiv.classList.add('completed');
        }

        dayDiv.innerHTML = `
            <div class="day-dot">${i < AppState.trackerDay || AppState.trackerAnswers[i - 1] ? '✓' : i}</div>
            <span class="day-label">Day ${i}</span>
        `;

        if (i <= AppState.trackerDay || AppState.trackerAnswers[i - 1]) {
            dayDiv.addEventListener('click', () => {
                if (i <= AppState.trackerDay) {
                    showTrackerDay(i);
                }
            });
        }

        DOM.trackerDays.appendChild(dayDiv);
    }
}

function showTrackerDay(day) {
    if (day > 7) {
        showTrackerComplete();
        return;
    }

    DOM.trackerCurrent.classList.remove('hidden');
    DOM.trackerComplete.classList.add('hidden');

    const task = TRACKER_TASKS[day - 1];

    DOM.currentDayBadge.textContent = `DAY ${day}`;
    DOM.currentDayTitle.textContent = task.title;
    DOM.currentDayQuestion.textContent = task.question;
    DOM.dayAnswer.value = AppState.trackerAnswers[day - 1] || '';

    // 활성 상태 업데이트
    const dayIndicators = DOM.trackerDays.querySelectorAll('.day-indicator');
    dayIndicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index + 1 === day);
    });
}

function submitDayAnswer() {
    const answer = DOM.dayAnswer.value.trim();

    if (!answer) {
        // 간단한 알림
        DOM.dayAnswer.style.borderColor = '#A65D57';
        setTimeout(() => {
            DOM.dayAnswer.style.borderColor = '';
        }, 2000);
        return;
    }

    // 답변 저장
    AppState.trackerAnswers[AppState.trackerDay - 1] = answer;

    // 답변 밀도 계산 및 저장
    const answerDensity = calculateAnswerDensity(answer);

    // 다음 날로
    AppState.trackerDay++;
    saveState();
    saveUserData();

    // UI 업데이트
    renderTrackerDays();

    if (AppState.trackerDay > 7) {
        showTrackerComplete();
    } else {
        showTrackerDay(AppState.trackerDay);
        DOM.dayAnswer.value = '';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function calculateAnswerDensity(answer) {
    const length = answer.length;
    if (length < 20) return 'short';
    if (length < 100) return 'normal';
    return 'detailed';
}

function showTrackerComplete() {
    DOM.trackerCurrent.classList.add('hidden');
    DOM.trackerComplete.classList.remove('hidden');
}

function showCTA() {
    DOM.trackerSection.classList.add('hidden');
    DOM.ctaSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// 데이터 저장 (로컬 스토리지 + 관리자용)
// ========================================
function saveUserData() {
    const userData = {
        id: AppState.userId,
        type: AppState.userType,
        answers: AppState.answers,
        trackerDay: AppState.trackerDay,
        trackerAnswers: AppState.trackerAnswers,
        completionRate: (AppState.trackerDay - 1) / 7 * 100,
        answerDensity: calculateOverallDensity(),
        lastActivity: new Date().toISOString(),
        status: determineUserStatus()
    };

    // 로컬 스토리지에 저장
    const allUsers = JSON.parse(localStorage.getItem('bsc_all_users') || '[]');
    const existingIndex = allUsers.findIndex(u => u.id === userData.id);

    if (existingIndex >= 0) {
        allUsers[existingIndex] = userData;
    } else {
        allUsers.push(userData);
    }

    localStorage.setItem('bsc_all_users', JSON.stringify(allUsers));
}

function calculateOverallDensity() {
    if (AppState.trackerAnswers.length === 0) return 'N/A';

    const densities = AppState.trackerAnswers.map(a => {
        if (!a) return 0;
        if (a.length < 20) return 1;
        if (a.length < 100) return 2;
        return 3;
    });

    const avg = densities.reduce((a, b) => a + b, 0) / densities.filter(d => d > 0).length;

    if (avg < 1.5) return '짧음';
    if (avg < 2.5) return '보통';
    return '성실';
}

function determineUserStatus() {
    const completionRate = (AppState.trackerDay - 1) / 7 * 100;
    const density = calculateOverallDensity();

    if (completionRate >= 100 && density === '성실') return 'VIP';
    if (completionRate >= 70) return 'potential';
    if (completionRate < 30 && density === '짧음') return 'emotional';
    return 'potential';
}

// ========================================
// 관리자 패널
// ========================================
function showAdmin() {
    DOM.adminPanel.classList.remove('hidden');
    loadAdminData();
}

function closeAdmin() {
    DOM.adminPanel.classList.add('hidden');
}

function loadAdminData() {
    const allUsers = JSON.parse(localStorage.getItem('bsc_all_users') || '[]');

    // 통계 업데이트
    document.getElementById('total-users').textContent = allUsers.length;
    document.getElementById('tracker-users').textContent = allUsers.filter(u => u.trackerDay > 1).length;
    document.getElementById('complete-users').textContent = allUsers.filter(u => u.trackerDay > 7).length;

    // 테이블 업데이트
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';

    allUsers.forEach(user => {
        const tr = document.createElement('tr');

        const typeNames = {
            intuitive: '감각형',
            overworked: '노력 과다형',
            adDependent: '광고 의존형',
            stagnant: '성장 정체형',
            noSystem: '시스템 미구축형'
        };

        const statusLabels = {
            VIP: { text: 'VIP 후보', class: 'vip' },
            potential: { text: '잠재 고객', class: 'potential' },
            emotional: { text: '감정 소비형', class: 'emotional' }
        };

        const status = statusLabels[user.status] || statusLabels.potential;

        tr.innerHTML = `
            <td>${user.id.slice(0, 12)}...</td>
            <td>${typeNames[user.type] || '-'}</td>
            <td>${Math.round(user.completionRate || 0)}%</td>
            <td>${user.answerDensity || 'N/A'}</td>
            <td>${user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('ko-KR') : '-'}</td>
            <td><span class="status-badge ${status.class}">${status.text}</span></td>
        `;

        tbody.appendChild(tr);
    });
}

// ========================================
// 유틸리티
// ========================================

// URL 파라미터로 관리자 접근
if (window.location.search.includes('admin=true')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(showAdmin, 2500);
    });
}

// 디버그용 상태 리셋
function resetApp() {
    localStorage.removeItem('bsc_state');
    localStorage.removeItem('bsc_user_id');
    location.reload();
}

// 콘솔에서 접근 가능하도록
window.BSC = {
    state: AppState,
    reset: resetApp,
    showAdmin: showAdmin
};
