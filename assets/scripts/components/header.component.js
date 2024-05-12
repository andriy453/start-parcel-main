const headerComponent = document.getElementsByClassName('header')[0];

// Header scroll
const scrollContainer = () => document.documentElement || document.body;

document.addEventListener('scroll', () => {
  if (scrollContainer().scrollTop > 200) {
    headerComponent.classList.add('scrolled');
  } else if (scrollContainer().scrollTop == 0) {
    headerComponent.classList.remove('scrolled');
  }
});

// menu handlers

// check mobile menu show/hide condition
const mobileMenuStartPoint = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue(
    '--mobile-menu-start-point'
  )
);
let isMobileMenuEnable =
  window.outerWidth <= mobileMenuStartPoint ||
  document.querySelector('.header-mobile');

const dropdownToggle = document.querySelectorAll('.dropdown-toggle');

dropdownToggle.forEach((toggle) => {
  toggle.addEventListener('click', function (e) {
    if (isMobileMenuEnable) {
      const menuItem = this.closest('.menu-item.dropdown');
      const dropdownMenu = this.nextElementSibling;

      // close all opened sub menu
      const activeDropdowns = document.querySelectorAll(
        '.menu-item.dropdown.active .dropdown-menu'
      );
      activeDropdowns.forEach((menu) => {
        menu.style.display = 'none';
        menu.closest('.dropdown').classList.remove('active');
      });

      // open current submenu
      menuItem.classList.toggle('active');
      if (menuItem.classList.contains('active')) {
        e.preventDefault();
        dropdownMenu.style.display = 'block';
      }
    }
  });
});

// toggle menu handler
function menuToggleFunc() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navbarNav = document.querySelector('.navbar-nav');
  const headerCloseWrapper = document.querySelector('.header-close-wrapper');

  menuToggle.classList.toggle('active');
  navbarNav.classList.toggle('active');
  headerCloseWrapper.classList.toggle('active');

  // LockScroll when burger open and enable when closed and enable scroll on menu
  if (scrollLock.getScrollState()) {
    scrollLock.disablePageScroll(document.querySelector('.navbar-nav .menu'));
    scrollLock.addScrollableSelector('.simplebar-content-wrapper');
  } else {
    scrollLock.enablePageScroll();
  }
}

// menu update function
function updateMenu() {
  isMobileMenuEnable =
    window.outerWidth <= mobileMenuStartPoint ||
    document.querySelector('.mobile-header');

  if (!isMobileMenuEnable) {
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    dropdownMenus.forEach((menu) => {
      menu.style.display = '';
    });

    const headerCloseWrapper = document.querySelector('.header-close-wrapper');
    headerCloseWrapper.classList.remove('active');

    const activeMenuItems = document.querySelectorAll('.menu-item.active');
    activeMenuItems.forEach((item) => {
      item.classList.remove('active');
    });

    const navbarNav = document.querySelector('.navbar-nav');
    navbarNav.classList.remove('active');

    const menuToggle = document.querySelector('.menu-toggle');
    menuToggle.classList.remove('active');

    // LockScroll when burger open and enable when closed
    scrollLock.enablePageScroll();
  }
}

window.addEventListener('resize', updateMenu);
window.addEventListener('orientationchange', updateMenu);

// end of toggle menu handler

const menuToggle = document.querySelector('.menu-toggle');
const headerCloseWrapper = document.querySelector('.header-close-wrapper');

menuToggle.addEventListener('click', menuToggleFunc);
headerCloseWrapper.addEventListener('click', menuToggleFunc);

// Hide and show Header when scroll up
function headerSticky() {
  let prevScrollPos = window.pageYOffset;

  window.onscroll = () => {
    const currentScrollPos = window.pageYOffset;
    const headerHeight = headerComponent.scrollHeight;

    if (window.scrollY > 0) {
      if (prevScrollPos > currentScrollPos) {
        headerComponent.style.top = 0;
        headerComponent.classList.add('scrolled');
      } else {
        headerComponent.style.top = `-${headerHeight + 3}px`;
      }
    }

    if (window.scrollY === 0) {
      headerComponent.classList.remove('scrolled');
    }

    prevScrollPos = currentScrollPos;
  };

  if (window.scrollY !== 0) {
    headerComponent.classList.add('scrolled');
  }
}

headerSticky();
