/* ========== Particles connected (network neon) ========== */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let w = canvas.width = innerWidth;
let h = canvas.height = innerHeight;

const colors = ['#00ffff','#ff00ff','#ffcc00','#00ff99'];
class Particle {
  constructor(){
    this.x = Math.random()*w;
    this.y = Math.random()*h;
    this.vx = (Math.random()-0.5)*0.6;
    this.vy = (Math.random()-0.5)*0.6;
    this.r = Math.random()*2+1;
    this.c = colors[Math.floor(Math.random()*colors.length)];
  }
  update(){
    this.x += this.vx;
    this.y += this.vy;
    if(this.x < 0 || this.x > w) this.vx *= -1;
    if(this.y < 0 || this.y > h) this.vy *= -1;
  }
  draw(){
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.c;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fill();
  }
}

const parts = [];
const PCOUNT = Math.min(160, Math.floor((w*h)/40000)); // adaptive count
for(let i=0;i<PCOUNT;i++) parts.push(new Particle());

function connect(){
  for(let a=0;a<parts.length;a++){
    for(let b=a+1;b<parts.length;b++){
      const dx = parts[a].x - parts[b].x;
      const dy = parts[a].y - parts[b].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 140){
        ctx.beginPath();
        const alpha = 1 - dist/140;
        // blend color: use parts[a] color with alpha
        ctx.strokeStyle = parts[a].c.replace(')', `,${alpha})`).replace('rgb','rgba').replace('rgba(','rgba(') || `rgba(0,255,255,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(parts[a].x, parts[a].y);
        ctx.lineTo(parts[b].x, parts[b].y);
        ctx.stroke();
      }
    }
  }
}

function loop(){
  ctx.clearRect(0,0,w,h);
  for(const p of parts){ p.update(); p.draw(); }
  connect();
  requestAnimationFrame(loop);
}
loop();

window.addEventListener('resize', ()=>{
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
});

/* ========== Parallax for elements with data-speed ========== */
const parallaxElems = document.querySelectorAll('[data-speed]');
window.addEventListener('scroll', ()=>{
  const sc = window.scrollY;
  parallaxElems.forEach(el=>{
    const speed = parseFloat(el.getAttribute('data-speed')) || 0;
    el.style.transform = `translateY(${sc * speed}px)`;
  });
});

/* ========== Skills progress animation on intersect ========= */
const progressEls = document.querySelectorAll('.progress');
const obs = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const wval = entry.target.style.getPropertyValue('--w') || entry.target.getAttribute('style') || entry.target.dataset.w;
      // if set via inline css (--w variable) or via style attr
      const computed = entry.target.style.getPropertyValue('--w') || entry.target.getAttribute('style');
      // try to extract --w or style width
      let width = entry.target.style.getPropertyValue('--w');
      if(!width){
        // fallback read the inline style value (e.g. "--w:90%")
        const s = entry.target.getAttribute('style') || '';
        const m = s.match(/--w\s*:\s*([0-9]+%)/);
        width = m ? m[1] : '70%';
      }
      entry.target.style.width = width;
      obs.unobserve(entry.target);
    }
  });
},{threshold:0.45});
progressEls.forEach(p=>obs.observe(p));

/* ========== Carousel controls and drag ========== */
const carousel = document.getElementById('carousel');
const leftBtn = document.getElementById('carousel-left');
const rightBtn = document.getElementById('carousel-right');

if(carousel){
  // button scroll
  leftBtn.addEventListener('click', ()=> {
    carousel.scrollBy({left: -360, behavior:'smooth'});
  });
  rightBtn.addEventListener('click', ()=> {
    carousel.scrollBy({left: 360, behavior:'smooth'});
  });

  // drag to scroll
  let isDown = false, startX, scrollLeft;
  carousel.addEventListener('mousedown', (e)=>{
    isDown = true; carousel.classList.add('dragging'); startX = e.pageX - carousel.offsetLeft; scrollLeft = carousel.scrollLeft;
  });
  carousel.addEventListener('mouseleave', ()=>{ isDown = false; carousel.classList.remove('dragging'); });
  carousel.addEventListener('mouseup', ()=>{ isDown = false; carousel.classList.remove('dragging'); });
  carousel.addEventListener('mousemove', (e)=>{
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1; // scroll-fast
    carousel.scrollLeft = scrollLeft - walk;
  });

  // touch support
  let touchStartX = 0, touchScrollLeft = 0;
  carousel.addEventListener('touchstart',(e)=>{ touchStartX = e.touches[0].pageX; touchScrollLeft = carousel.scrollLeft; }, {passive:true});
  carousel.addEventListener('touchmove',(e)=>{ const x = e.touches[0].pageX; const dx = (x - touchStartX); carousel.scrollLeft = touchScrollLeft - dx; }, {passive:true});
}

/* ========== Smooth highlight active nav on scroll ========== */
const navLinks = document.querySelectorAll('.top-nav a');
window.addEventListener('scroll', ()=>{
  const fromTop = window.scrollY + 80;
  navLinks.forEach(link=>{
    const section = document.querySelector(link.getAttribute('href'));
    if(section){
      if(section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop){
        link.classList.add('active');
      } else link.classList.remove('active');
    }
  });
});

/* ========== Small floating animation for header icons (subtle) ========== */
document.querySelectorAll('.nav-item').forEach((it, i)=>{
  it.style.transitionDelay = `${i*30}ms`;
});

/* ========== Optional: keyboard arrows for carousel ========== */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowLeft') carousel && carousel.scrollBy({left:-360, behavior:'smooth'});
  if(e.key === 'ArrowRight') carousel && carousel.scrollBy({left:360, behavior:'smooth'});
});
