document.addEventListener('DOMContentLoaded', () => {
    // 1. Audio Handler
    const audio = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const musicHint = document.querySelector('.music-hint');
    let isPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            musicToggle.innerHTML = '<i data-feather="volume-x"></i>';
            isPlaying = false;
        } else {
            audio.play().then(() => {
                musicToggle.innerHTML = '<i data-feather="volume-2"></i>';
                isPlaying = true;
                if(musicHint) musicHint.style.display = 'none';
            }).catch(e => {
                console.log("Audio play failed:", e);
                alert("Hãy tương tác với trang trước (click bất kỳ đâu) để có thể bật nhạc nhé! Trình duyệt yêu cầu vậy nè ^^");
            });
        }
        feather.replace();
    });

    setTimeout(() => {
        if(musicHint) {
            musicHint.style.transition = 'opacity 1s';
            musicHint.style.opacity = '0';
            setTimeout(() => musicHint.style.display = 'none', 1000);
        }
    }, 5000);

    // 2. Distance Counter Animation & Real-time Location
    const distanceEl = document.querySelector('.distance-counter');
    const hanoiLat = 21.0285;
    const hanoiLon = 105.8542;

    function animateCounter(el, target) {
        if(!el) return;
        const duration = 2500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOutProgress * target);
            el.innerText = current.toLocaleString() + '+';

            if (progress < 1) requestAnimationFrame(update);
            else el.innerText = target.toLocaleString();
        }
        requestAnimationFrame(update);
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2-lat1) * (Math.PI/180);  
        const dLon = (lon2-lon1) * (Math.PI/180); 
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return Math.round(R * c);
    }

    if ("geolocation" in navigator && distanceEl) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                const distanceKm = getDistanceFromLatLonInKm(hanoiLat, hanoiLon, userLat, userLon);
                
                setTimeout(() => animateCounter(distanceEl, distanceKm), 500);

                // Try to get city name via reverse geocoding
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLon}&zoom=10&addressdetails=1`)
                .then(res => res.json())
                .then(data => {
                    let city = data.address.city || data.address.state || data.address.country || "TP. HCM";
                    const emLocation = document.getElementById("emLocation");
                    const emStoryLocation = document.getElementById("emStoryLocation");
                    if(emLocation) emLocation.innerText = city;
                    if(emStoryLocation) emStoryLocation.innerText = city;
                }).catch(err => console.log("Geocoding error", err));
            },
            (error) => {
                const target = +distanceEl.getAttribute('data-target') || 1135;
                setTimeout(() => animateCounter(distanceEl, target), 500);
            }
        );
    } else {
        const target = distanceEl ? +distanceEl.getAttribute('data-target') || 1135 : 1135;
        setTimeout(() => animateCounter(distanceEl, target), 500);
    }

    // 3. Time Counter Logic (Days since start)
    const startDate = new Date(2025, 3, 1); // VD: 01/04/2025

    function updateCounter() {
        const now = new Date();
        const diffTotal = now - Math.min(now, startDate); 
        
        const d = Math.floor(diffTotal / (1000 * 60 * 60 * 24));
        const h = Math.floor((diffTotal / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diffTotal / 1000 / 60) % 60);
        const s = Math.floor((diffTotal / 1000) % 60);

        if(document.getElementById('daysVal')) document.getElementById('daysVal').innerText = d;
        if(document.getElementById('hoursVal')) document.getElementById('hoursVal').innerText = h;
        if(document.getElementById('minsVal')) document.getElementById('minsVal').innerText = m;
        if(document.getElementById('secsVal')) document.getElementById('secsVal').innerText = s;
    }
    updateCounter();
    setInterval(updateCounter, 1000);

    // 4. Scroll Intersections 
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, observerOptions);
    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));

    // 5. Checklist Interactive Logic
    const listItems = document.querySelectorAll('.check-item');
    listItems.forEach(item => {
        item.addEventListener('click', (e) => {
            item.classList.toggle('active');
            item.style.transform = 'scale(0.95)';
            setTimeout(() => item.style.transform = 'scale(1)', 150);
        });
    });

    // 6. Flip Card Logic (Open When letters)
    document.querySelectorAll('.flip-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('open');
            // Play a small sound or effect if you want when opening a card
        });
    });

    // 7. Gallery Meeting Countdown
    const meetingDate = new Date(2027, 0, 1).getTime(); // VD: ngày 1/1/2027

    function updateMeetingCountdown() {
        if(!document.getElementById("mDays")) return;
        const now = new Date().getTime();
        const distance = meetingDate - now;

        if (distance < 0) {
            document.getElementById("mDays").innerHTML = "00";
            document.getElementById("mHours").innerHTML = "00";
            document.getElementById("mMins").innerHTML = "00";
            document.getElementById("mSecs").innerHTML = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("mDays").innerHTML = days.toString().padStart(2, '0');
        document.getElementById("mHours").innerHTML = hours.toString().padStart(2, '0');
        document.getElementById("mMins").innerHTML = minutes.toString().padStart(2, '0');
        document.getElementById("mSecs").innerHTML = seconds.toString().padStart(2, '0');
    }
    
    updateMeetingCountdown();
    setInterval(updateMeetingCountdown, 1000);


    // 8. Final Surprise Button
    const surpriseBtn = document.getElementById('surpriseBtn');
    const surpriseContent = document.getElementById('surpriseContent');
    const starsCanvas = document.getElementById('stars');

    if(surpriseBtn) {
        surpriseBtn.addEventListener('click', () => {
            surpriseBtn.style.display = 'none';
            surpriseContent.style.display = 'block';
            speedUpStars();
        });
    }

    // 9. Starry Canvas Background Engine
    if(starsCanvas) {
        const ctx = starsCanvas.getContext('2d');
        let width, height;
        let stars = [];
        let speedMult = 1;

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            starsCanvas.width = width;
            starsCanvas.height = height;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Star {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.z = Math.random() * width;
                this.o = '0.' + Math.floor(Math.random() * 99) + 1;
                this.size = Math.random() * 1.5;
            }
            
            update() {
                this.y -= (0.5 * speedMult) * (this.size);
                if (this.y < 0) {
                    this.y = height;
                    this.x = Math.random() * width;
                }
            }
            
            draw() {
                let opacity = ((this.z / width) / 2) + 0.3;
                opacity += Math.sin(Date.now() * 0.001 * this.size) * 0.2;
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 200; i++) {
            stars.push(new Star());
        }

        function speedUpStars() {
            speedMult = 8; // warp speed effect
            setTimeout(() => {
                let slowDown = setInterval(() => {
                    speedMult -= 0.5;
                    if(speedMult <= 1) {
                        speedMult = 1;
                        clearInterval(slowDown);
                    }
                }, 100);
            }, 1000);
        }

        function animateStars() {
            ctx.clearRect(0, 0, width, height);
            stars.forEach(star => {
                star.update();
                star.draw();
            });
            requestAnimationFrame(animateStars);
        }
        
        animateStars();
    }
});
