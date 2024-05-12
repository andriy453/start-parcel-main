import { getPosition } from './base.utils';

export const followingSidebar = ({
  sidebar,
  contentSticky,
  sidebarInnerSelector = '.following-sidebar-inner',
  // calc header height for top side gap
  isHeaderCalc = false,
  // gap on top and bottom of sticky sidebar
  gap = 30,
}) => {
  console.log(sidebar);
  const sidebarInner = sidebar.querySelector(sidebarInnerSelector);
  const sidebarBuffer = document.createElement('DIV');
  sidebarBuffer.classList.add('following-sidebar-buffer');
  sidebarInner.style.position = 'sticky';

  const header = document.querySelector('header');

  sidebar.insertAdjacentElement('afterbegin', sidebarBuffer);

  const headerHeight = isHeaderCalc && header ? header.offsetHeight : 0;

  let lastScrollTop = 0;

  // if flag true === scrolling down else scrolling up
  let isScrollingDown = null;

  // if isSidebarHigherViewport true === sidebar is higher than viewport height
  let isSidebarHigherViewport =
    sidebarInner.getBoundingClientRect().height >
    window.innerHeight - headerHeight;

  function calcHeightOfSidebar(isScrollingDown) {
    const contentStickyTop = getPosition(contentSticky).y;
    const sidebarInnerTop = getPosition(sidebarInner).y;

    sidebarBuffer.style.height = `${sidebarInnerTop - contentStickyTop}px`;

    if (isScrollingDown) {
      // scroll down
      sidebarInner.style.top = '';
      sidebarInner.style.bottom = `${
        -headerHeight -
        gap +
        window.innerHeight -
        sidebarInner.getBoundingClientRect().height
      }px`;
    } else {
      // scroll up
      sidebarInner.style.bottom = '';
      sidebarInner.style.top = `${
        Math.min(
          window.innerHeight - sidebarInner.getBoundingClientRect().height,
          headerHeight
        ) - gap
      }px`;
    }
    isSidebarHigherViewport =
      sidebarInner.getBoundingClientRect().height >
      window.innerHeight - headerHeight;
  }

  function resetSticky() {
    sidebarInner.style.bottom = '';
    sidebarInner.style.top = `${headerHeight + gap}px`;
    sidebarBuffer.style.height = '0';
  }

  if (!isSidebarHigherViewport) {
    resetSticky();
  } else {
    calcHeightOfSidebar(false);
  }

  window.addEventListener('scroll', function () {
    let st = window.scrollY || document.documentElement.scrollTop;

    if (!isSidebarHigherViewport) {
      resetSticky();
    }

    if (st > lastScrollTop && !isScrollingDown) {
      // scroll down
      calcHeightOfSidebar(isScrollingDown);
      isScrollingDown = true;
    } else if (st < lastScrollTop && isScrollingDown) {
      // scroll up
      calcHeightOfSidebar(isScrollingDown);
      isScrollingDown = false;
    }
    lastScrollTop = st <= 0 ? 0 : st;
  });

  const updateSidebar = () => {
    if (!isSidebarHigherViewport) {
      resetSticky();
    }

    calcHeightOfSidebar(true);
    calcHeightOfSidebar(false);
  };

  let windowWidth = window.innerWidth;

  window.addEventListener('resize', () => {
    if (windowWidth !== window.innerWidth) {
      windowWidth = window.innerWidth;
      updateSidebar();
    }
  });
};
