document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. 메뉴 토글 기능
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const menuList = document.getElementById('menu-list');

    // 토글 버튼 클릭 이벤트
    menuToggle.addEventListener('click', (e) => {
        // 리스트 보이기/숨기기
        menuList.classList.toggle('active');
        // ⭐ 버튼 아이콘 회전을 위해 버튼에도 active 클래스 추가/제거
        menuToggle.classList.toggle('active');
        
        e.stopPropagation(); 
    });

    // 화면 아무 곳이나 누르면 메뉴 닫기
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !menuList.contains(e.target)) {
            menuList.classList.remove('active');
            menuToggle.classList.remove('active'); // 버튼 회전도 원상복구
        }
    });


    // ==========================================
    // 2. 텍스트 중력 효과 (기존 코드 유지)
    // ==========================================
    const textContainer = document.getElementById('text-container');
    const originalText = "서사, 위기 속에서"; 
    const jamoElements = [];
    
    const GRAVITY = 0.4; 
    const FRICTION = 0.99; 
    const INITIAL_SCATTER = 10; 
    const BOUNCE = 0.7; 
    
    const MOUSE_RADIUS = 150; 
    const MOUSE_STRENGTH = 2.0; 
    let isSeparated = false; 
    let mousePos = { x: 0, y: 0 }; 
    
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    window.addEventListener('resize', () => {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    });

    function setupJamo(text) {
        const characters = text.split('');
        textContainer.classList.add('ready-to-click'); 

        characters.forEach((char) => {
            const jamoSpan = document.createElement('span');
            jamoSpan.textContent = char === ' ' ? '\u00A0' : char;
            jamoSpan.className = 'jamo';
            jamoSpan.style.position = 'relative'; 
            
            jamoSpan.jamoData = {
                x: 0, y: 0, vx: 0, vy: 0, 
                initialVX: (Math.random() - 0.5) * INITIAL_SCATTER, 
                initialVY: (Math.random() - 0.5) * INITIAL_SCATTER - 5,
                isStopped: false,
                width: 0, height: 0
            };
            
            textContainer.appendChild(jamoSpan);
            jamoElements.push(jamoSpan);
        });

        setTimeout(() => {
            jamoElements.forEach(span => {
                const rect = span.getBoundingClientRect();
                span.jamoData.width = rect.width;
                span.jamoData.height = rect.height;
            });
        }, 100);
    }

    function trackMouse(event) {
        mousePos.x = event.clientX;
        mousePos.y = event.clientY;
    }

    function updateGravity() {
        if (!isSeparated) {
            requestAnimationFrame(updateGravity);
            return;
        }

        const containerRect = textContainer.getBoundingClientRect();

        jamoElements.forEach(jamo => {
            const data = jamo.jamoData;
            
            const currentAbsX = containerRect.left + jamo.offsetLeft + data.x;
            const currentAbsY = containerRect.top + jamo.offsetTop + data.y;
            
            const jamoCenterX = currentAbsX + data.width / 2;
            const jamoCenterY = currentAbsY + data.height / 2;

            const dx = jamoCenterX - mousePos.x;
            const dy = jamoCenterY - mousePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < MOUSE_RADIUS && distance > 0) {
                const angle = Math.atan2(dy, dx);
                const force = MOUSE_STRENGTH * (1 - distance / MOUSE_RADIUS);
                data.vx += Math.cos(angle) * force;
                data.vy += Math.sin(angle) * force;
                data.isStopped = false;
            }

            if (!data.isStopped) {
                data.vy += GRAVITY; 
                if (data.initialVX !== null) { 
                    data.vx += data.initialVX;
                    data.vy += data.initialVY;
                    data.initialVX = null; data.initialVY = null;
                }
                
                data.vx *= FRICTION;
                data.vy *= FRICTION;
                data.x += data.vx;
                data.y += data.vy;

                // 벽 충돌 처리
                if (currentAbsX < 0) {
                    data.x = - (containerRect.left + jamo.offsetLeft);
                    data.vx *= -BOUNCE;
                } 
                else if (currentAbsX + data.width > viewportWidth) {
                    data.x = viewportWidth - (containerRect.left + jamo.offsetLeft) - data.width;
                    data.vx *= -BOUNCE;
                }

                if (currentAbsY + data.height > viewportHeight) {
                    data.y = viewportHeight - (containerRect.top + jamo.offsetTop) - data.height;
                    data.vy *= -BOUNCE; 
                    if (Math.abs(data.vy) < 1.0) data.vx *= 0.9; 
                }
            }
            
            jamo.style.transform = `translate(${data.x}px, ${data.y}px)`;
        });

        requestAnimationFrame(updateGravity);
    }

    function startSeparation() {
        if (!isSeparated) {
            isSeparated = true;
            updateGravity();
            document.addEventListener('mousemove', trackMouse);
            textContainer.classList.remove('ready-to-click'); 
        }
    }

    setupJamo(originalText);
    textContainer.addEventListener('click', startSeparation);
});