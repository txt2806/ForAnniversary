document.addEventListener('DOMContentLoaded', () => {
    // 1. Audio Handler
    const audio = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const musicHint = document.querySelector('.music-hint');
    const volumeSlider = document.getElementById('volumeSlider');
    let isPlaying = false;

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            musicToggle.innerHTML = '<i data-feather="volume-x"></i>';
            isPlaying = false;
        } else {
            audio.play().then(() => {
                musicToggle.innerHTML = '<i data-feather="volume-2"></i>';
                isPlaying = true;
                if(musicHint) {
                    musicHint.style.transition = 'opacity 1s';
                    musicHint.style.opacity = '0';
                    setTimeout(() => musicHint.style.display = 'none', 1000);
                }
            }).catch(e => {
                console.log("Audio play failed:", e);
                alert("Hãy tương tác với trang trước (click bất kỳ đâu) để có thể bật nhạc nhé! Trình duyệt yêu cầu vậy nè ^^");
            });
        }
        feather.replace();
    }

    musicToggle.addEventListener('click', togglePlay);
    if(musicHint) musicHint.addEventListener('click', togglePlay);

    if(volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });
    }

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

    // 5. Checklist Logic (Standard behavior)

    // 6. Flip Card Logic (Open When letters)
    document.querySelectorAll('.flip-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't toggle if the "Read more" button was clicked
            if (e.target.classList.contains('read-more-btn')) return;
            card.classList.toggle('open');
        });
    });

    // 6.b Modal Logic for Big Letters
    const modal = document.getElementById('letterModal');
    const modalContent = document.getElementById('modalLetterContent');
    const closeModal = document.querySelector('.close-modal');
    
    const letterData = {
        "1": {
            title: "Gửi công chúa của anh...",
            body: "Anh biết đôi khi áp lực cuộc sống và công việc khiến em cảm thấy kiệt sức. Những lúc như vậy, hãy nhớ rằng ở một nơi xa, vẫn có một người luôn sẵn sàng lắng nghe và là chỗ dựa vững chắc cho em. Em đã làm rất tốt rồi, hãy tự hào về bản thân mình nhé. Nghỉ ngơi một chút, rồi chúng mình lại cùng cố gắng tiếp. Thương em rất nhiều!"
        },
        "2": {
            title: "Gửi em khi hai đứa dỗi nhau...",
            body: "Cãi nhau một chút cho hiểu nhau hơn đúng không nè? Anh xin lỗi vì đôi khi sự vụng về của anh làm em buồn lòng. Dù có chuyện gì xảy ra, tình cảm anh dành cho em vẫn không thay đổi. Đừng giận anh lâu quá nhé, anh nhớ nụ cười của em lắm rồi. Mau làm hòa để anh còn được nghe giọng em nũng nịu nào!"
        },
        "3": {
            title: "Kỷ niệm 1 năm của chúng mình...",
            body: "Thấm thoát đã một năm kể từ ngày định mệnh ấy, ngày mà chúng ta chính thức thành 1 đôi. Trong suốt khoảng thời gian đó, chúng ta có vui có buồn, có giận hờn, có những lúc gần như đã không thể cùng nhau đi tiếp nhưng thật may mắn chúng ta mỗi người đã nhịn nhau một chút, và dành tình yêu thực sự cho nhau nên chúng ta vẫn có thể đi được đến giờ.  Cảm ơn em đã kiên trì,đã chấp nhận mọi thiệt thòi, đã chấp nhận mọi tính xấu của anh để yêu thương anh và cùng anh đi tới tận bây giờ. Cảm ơn em vì mọi thứ, cảm ơn em đã đến bên anh và cho anh cái cảm giác được yêu đó. Anh yêu em nhiều lắm! Chúc mừng ngày kỷ niệm được 1 năm nhé!"
        }
    };

    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const letterId = btn.getAttribute('data-letter');
            const data = letterData[letterId];
            
            if(data) {
                document.querySelector('.letter-header').innerText = data.title;
                modalContent.innerText = data.body;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scroll
            }
        });
    });

    if(closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // 6.c Image Lightbox Logic
    const imageModal = document.getElementById('imageModal');
    const enlargedImg = document.getElementById('enlargedImg');
    const closeImageModal = document.querySelector('.close-image-modal');

    document.querySelectorAll('.timeline-img').forEach(img => {
        img.addEventListener('click', () => {
            enlargedImg.src = img.src;
            imageModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    if(closeImageModal) {
        closeImageModal.addEventListener('click', () => {
            imageModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // 6.d Coser Gallery Dynamic Loader
    const coserFiles = [
        "481177401_630493889939981_7744281885461033899_n.jpg", "481184361_630493726606664_611185744932569088_n.jpg",
        "481336554_630513473271356_4347022344481671571_n.jpg", "481462818_630493739939996_7321852523027388467_n.jpg",
        "482004338_631339839855386_2053555232622549365_n.jpg", "482227922_636285129360857_5602807392893849151_n.jpg",
        "482327617_636345379354832_5566069890151428802_n.jpg", "482350254_636284092694294_918467676413602307_n.jpg",
        "482840955_635909169398453_1667271022643677073_n.jpg", "483598745_636297766026260_398551015109797591_n.jpg",
        "483662274_636345296021507_1449876771678426079_n.jpg", "484025276_636285042694199_731622110503778117_n.jpg",
        "484081835_636358822686821_4274434835241934517_n.jpg", "484294858_636355572687146_8053902606396724861_n.jpg",
        "484332153_636368629352507_7693710824879451885_n.jpg", "502724393_702980232691346_3179351410879552818_n.jpg",
        "502734794_702980289358007_2194089643722330378_n.jpg", "505392153_707850945537608_895705417623752932_n.jpg",
        "511086662_719280781061291_3384657836702837335_n.jpg", "511119133_719280337728002_314009861633208930_n.jpg",
        "521955370_743440911978611_9222163184770638479_n.jpg", "522678404_743472045308831_8274672768622909742_n.jpg",
        "528332635_755902330732469_1405112298533567571_n.jpg", "528585791_755905367398832_1581645004202654629_n.jpg",
        "528627207_755902024065833_7371554190267893405_n.jpg", "578979225_838710932451608_1889362444215969380_n.jpg",
        "579564351_838714149117953_3341278556214966730_n.jpg", "580748050_838714079117960_665499848519326172_n.jpg",
        "581858110_838710922451609_4177404040429324310_n.jpg", "586442342_848914881431213_7133082585058494205_n.jpg",
        "598557168_864374066551961_6920854609917073924_n.jpg", "599939847_867458012910233_9020329573112085554_n.jpg",
        "607090832_878631508459550_3179041521414644980_n.jpg", "608159576_878631471792887_482712242794628270_n.jpg",
        "608504383_878631481792886_506244171884785322_n.jpg", "656355861_945008175155216_6475175635833107496_n.jpg",
        "656459317_945008261821874_4497278813480107880_n.jpg", "657305971_945008118488555_5096324981907923910_n.jpg",
        "658150689_945008191821881_4233270101053717227_n.jpg", "658211164_945008238488543_2842350422103746010_n.jpg"
    ];

    const track1 = document.getElementById('coserTrack1');
    const track2 = document.getElementById('coserTrack2');

    if(track1 && track2) {
        // Split files for two tracks
        const mid = Math.floor(coserFiles.length / 2);
        const set1 = coserFiles.slice(0, mid);
        const set2 = coserFiles.slice(mid);

        // Function to create img and add to lightbox
        const createImg = (file) => {
            const img = document.createElement('img');
            img.src = `img/cos/${file}`;
            img.className = 'coser-img';
            img.addEventListener('click', () => {
                enlargedImg.src = img.src;
                imageModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
            return img;
        };

        // Fill track 1 (duplicate for seamless scroll)
        [...set1, ...set1].forEach(file => track1.appendChild(createImg(file)));
        // Fill track 2 (duplicate for seamless scroll)
        [...set2, ...set2].forEach(file => track2.appendChild(createImg(file)));
    }

    // 6.e Bucket List Submit
    const submitBtn = document.getElementById('submitBucketList');
    const promiseMsg = document.getElementById('promiseMessage');

    if(submitBtn && promiseMsg) {
        submitBtn.addEventListener('click', () => {
            promiseMsg.textContent = "Đợi anh nhé, nhất định mọi thứ trong list này, anh sẽ làm cho em, anh hứa với em, Anh yêu em!";
            promiseMsg.classList.remove('hidden');
            promiseMsg.style.opacity = '0';
            setTimeout(() => promiseMsg.style.opacity = '1', 10);
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.textContent = "Lời hứa đã được gửi đi ❤️";
        });
    }

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
