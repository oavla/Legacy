
        // Star background animation
        const STAR_COLOR = '#fff';
        const STAR_SIZE = 2;
        const STAR_MIN_SCALE = 0.2;
        const OVERFLOW_THRESHOLD = 50;
        const STAR_COUNT = ( window.innerWidth + window.innerHeight ) / 8;
        const canvas = document.querySelector('canvas');
        const context = canvas.getContext('2d');

        let scale = 1; // device pixel ratio
        let width, height;
        let stars = [];
        let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.01 };
        let pointerX, pointerY;
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
                context.arc(star.x, star.y, STAR_SIZE * star.z, 0, Math.PI * 2);
                context.fillStyle = STAR_COLOR;
                context.fill();
            });
        }

        function onMouseMove(event) {
            touchInput = false;

            velocity.tx = (event.clientX - width / 2) / 8;
            velocity.ty = (event.clientY - height / 2) / 8;
        }

        function onTouchMove(event) {
            touchInput = true;

            velocity.tx = (event.touches[0].clientX - width / 2) / 8;
            velocity.ty = (event.touches[0].clientY - height / 2) / 8;
        }

        function onMouseLeave() {
            velocity.tx = 0;
            velocity.ty = 0;
        }

        // Star explosion on button hover
        function explodeStars(event) {
            const button = event.currentTarget;
            const rect = button.getBoundingClientRect();
            const starsCount = 30; // Number of stars to create
            
            for (let i = 0; i < starsCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                
                // Position the star in the center of the button
                star.style.left = `${rect.left + rect.width / 2 - 4}px`; // Center horizontally
                star.style.top = `${rect.top + rect.height / 2 - 4}px`; // Center vertically
                
                // Set random x and y translations for explosion effect
                const angle = Math.random() * 2 * Math.PI; // Random angle
                const distance = Math.random() * 150 + 50; // Random distance from the center
                const x = Math.cos(angle) * distance; // X offset
                const y = Math.sin(angle) * distance; // Y offset

                star.style.setProperty('--x', `${x}px`);
                star.style.setProperty('--y', `${y}px`);
                
                // Set a random delay for each star
                star.style.animationDelay = `${Math.random() * 0.2}s`;
                
                // Append the star to the body
                document.body.appendChild(star);
                
                // Remove the star after animation completes
                star.addEventListener('animationend', () => {
                    star.remove();
                });
            }
        }
