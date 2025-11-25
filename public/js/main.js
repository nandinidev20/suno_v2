document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.querySelector(".generator .btn");
  const textarea = document.querySelector(".generator textarea");

  if (generateBtn && textarea) {
    generateBtn.addEventListener("click", () => {
      if (textarea.value.trim() === "") {
        alert("Please describe your song first!");
      } else {
        alert("🎶 Generating song for: " + textarea.value);
      }
    });
  }

  // Reveal on Scroll Animation
  const reveals = document.querySelectorAll(".reveal, .step, .feature, .plan");

  window.addEventListener("scroll", () => {
    for (let i = 0; i < reveals.length; i++) {
      const windowHeight = window.innerHeight;
      const elementTop = reveals[i].getBoundingClientRect().top;
      const elementVisible = 100;

      if (elementTop < windowHeight - elementVisible) {
        reveals[i].classList.add("active");
      }
    }
  });
});


/******************/


  var swiper = new Swiper(".mySwiper", {
    spaceBetween: 20,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 1000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      // Mobile screens
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      // Small tablets
      576: {
        slidesPerView: 1,
        spaceBetween: 15,
      },
      // Tablets
      768: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      // Laptops & desktops
      1024: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
    },
  });
/************************* */
// Check if jQuery and owlCarousel are available before using them
if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
  $(document).ready(function(){
    // First slider
    if ($(".slider-one").length) {
      $(".slider-one").owlCarousel({
        loop:true,
        margin:20,
        nav:true,
        dots:true,
        autoplay:true,
        autoplayTimeout:3000,
        responsive:{
            0:{ items:2 },
            600:{ items:3 },
            1000:{ items:6 }
        }
      });
    }

    // Second slider
    if ($(".slider-two").length) {
      $(".slider-two").owlCarousel({
        loop:true,
        margin:15,
        nav:true,
        dots:false,  // 👈 this one has no dots
        autoplay:false, // 👈 manual slide
        responsive:{
            0:{ items:1 },
           300:{ items:2 },
            400:{ items:3 },
            600:{ items:4 },
            1000:{ items:6 }
        }
      });
    }
  });
}

// Add functionality for the "Filter" button
const filterBtn = document.querySelector('.filter-btn');
if (filterBtn) {
  filterBtn.addEventListener('click', function() {
    alert('Filter clicked');
  });
}

// Add functionality for the "Upload" button
const uploadBtn = document.querySelector('.upload-btn');
if (uploadBtn) {
  uploadBtn.addEventListener('click', function() {
    alert('Upload clicked');
  });
}

//tabs section

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');
    
    // Hide all content sections
    contents.forEach(content => content.style.display = 'none');
    
    // Remove active class from all tabs
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show the selected content section
    document.getElementById(tabName).style.display = 'block';
    
    // Set active class on the clicked tab
    const activeTab = document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`);
    activeTab.classList.add('active');
}

//dropdown
