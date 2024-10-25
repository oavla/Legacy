// Star background animation
const STAR_COLOR = '#fff';
const STAR_SIZE = 2;
const STAR_MIN_SCALE = 0.2;
const OVERFLOW_THRESHOLD = 50;
const STAR_COUNT = (window.innerWidth + window.innerHeight) / 8;
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

let scale = 1; // device pixel ratio
let width, height;
let stars = [];
let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.01 };
let touchInput = false;

generate();
resize();
step();

window.onresize = resize;
canvas.onmousemove = onMouseMove;
canvas.ontouchmove = onTouchMove;
canvas.ontouchend = onMouseLeave;
document.onmouseleave = onMouseLeave;

function generate() {
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: 0,
            y: 0,
            z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE)
        });
    }
}

function placeStar(star) {
    star.x = Math.random() * width;
    star.y = Math.random() * height;
}

function recycleStar(star) {
    let direction = 'z';
    let vx = Math.abs(velocity.x),
        vy = Math.abs(velocity.y);

    if (vx > 1 || vy > 1) {
        let axis = vx > vy ? (Math.random() < vx / (vx + vy) ? 'h' : 'v') : (Math.random() < vy / (vx + vy) ? 'v' : 'h');
        direction = axis === 'h' ? (velocity.x > 0 ? 'l' : 'r') : (velocity.y > 0 ? 't' : 'b');
    }

    star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

    if (direction === 'z') {
        star.z = 0.1;
        star.x = Math.random() * width;
        star.y = Math.random() * height;
    } else if (direction === 'l') {
        star.x = -OVERFLOW_THRESHOLD;
        star.y = height * Math.random();
    } else if (direction === 'r') {
        star.x = width + OVERFLOW_THRESHOLD;
        star.y = height * Math.random();
    } else if (direction === 't') {
        star.x = width * Math.random();
        star.y = -OVERFLOW_THRESHOLD;
    } else if (direction === 'b') {
        star.x = width * Math.random();
        star.y = height + OVERFLOW_THRESHOLD;
    }
}

function resize() {
    scale = window.devicePixelRatio || 1;
    width = window.innerWidth * scale;
    height = window.innerHeight * scale;
    canvas.width = width;
    canvas.height = height;
    stars.forEach(placeStar);
}

function step() {
    context.clearRect(0, 0, width, height);
    update();
    render();
    requestAnimationFrame(step);
}

function update() {
    velocity.tx *= 0.96;
    velocity.ty *= 0.96;
    velocity.x += (velocity.tx - velocity.x) * 0.8;
    velocity.y += (velocity.ty - velocity.y) * 0.8;

    stars.forEach((star) => {
        star.x += velocity.x * star.z;
        star.y += velocity.y * star.z;
        star.x += (star.x - width / 2) * velocity.z * star.z;
        star.y += (star.y - height / 2) * velocity.z * star.z;
        star.z += velocity.z;

        if (star.x < -OVERFLOW_THRESHOLD || star.x > width + OVERFLOW_THRESHOLD || star.y < -OVERFLOW_THRESHOLD || star.y > height + OVERFLOW_THRESHOLD) {
            recycleStar(star);
        }
    });
}

function render() {
    stars.forEach((star) => {
        context.beginPath();
        context.lineCap = 'round';
        context.lineWidth = STAR_SIZE * star.z * scale;
        context.strokeStyle = STAR_COLOR;
        context.globalAlpha = 0.5 + 0.5 * Math.random();
        context.beginPath();
        context.moveTo(star.x, star.y);

        let tailX = velocity.x * 2;
        let tailY = velocity.y * 2;

        if (Math.abs(tailX) < 0.1) tailX = 0.5;
        if (Math.abs(tailY) < 0.1) tailY = 0.5;

        context.lineTo(star.x + tailX, star.y + tailY);
        context.stroke();
    });
}

// Mouse and touch event handlers
function onMouseMove(event) {
    touchInput = false;
    velocity.tx = event.clientX - width / 2;
    velocity.ty = event.clientY - height / 2;
}

function onTouchMove(event) {
    touchInput = true;
    velocity.tx = event.touches[0].clientX - width / 2;
    velocity.ty = event.touches[0].clientY - height / 2;
    event.preventDefault();
}

function onMouseLeave() {
    velocity.tx = 0;
    velocity.ty = 0;
}

// Button star explosion effect
function explodeStars(event) {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        document.body.appendChild(star);

        const size = Math.random() * 8 + 4;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        const x = event.clientX - buttonRect.left - size / 2;
        const y = event.clientY - buttonRect.top - size / 2;

        const destinationX = (Math.random() - 0.5) * 200;
        const destinationY = (Math.random() - 0.5) * 200;

        star.style.setProperty('--x', `${destinationX}px`);
        star.style.setProperty('--y', `${destinationY}px`);

        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        setTimeout(() => {
            star.remove();
        }, 600);
    }
}
