import tailwind from '~/tailwind.config.cjs';

export function initAnimationOnView(options = {}) {
  const defaultOptions = {
    animateOnce: true,
    speed: 600,
    threshold: 0.5,
    delay: 0,
    easing: 'ease',
    disableMutationObserver: false,

    breakpoints: {},
  };

  // Export breakpoints from tailwind
  if (Object.keys(tailwind.theme.screens).length) {
    defaultOptions.breakpoints = tailwind.theme.screens;
  }

  /* --- Merge all options --- */
  const { breakpoints } = defaultOptions;

  const mergedBreakpoints = Object.assign(breakpoints, options.breakpoints);
  const mainOptions = Object.assign(defaultOptions, options);

  mainOptions.breakpoints = mergedBreakpoints;

  /* --- Set global properties --- */
  function setGlobalProperty(name, value, isTimeUnit) {
    if (isTimeUnit) {
      value += 'ms';
    }

    document.documentElement.style.setProperty(`--view-${name}`, `${value}`);
  }

  const { speed, easing } = mainOptions;

  setGlobalProperty('speed', speed, true);
  setGlobalProperty('easing', easing);

  // Setup of Intersection Observer
  const intesectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Show element
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
        // Hide element
        else if (!entry.isIntersecting && !mainOptions.animateOnce) {
          entry.target.classList.remove('animated');
        }
      });
    },
    { threshold: mainOptions.threshold }
  );

  // Change animation of element on breakpoints
  function changeEffectOnResize(element, breakpoint, effect) {
    const initialEffect = element.dataset.view;

    let fixedBreakpoint =
      typeof breakpoint === 'string'
        ? breakpoint.replace(/\D/g, '')
        : breakpoint;

    if (window.innerWidth >= fixedBreakpoint) {
      element.dataset.view = effect;
    } else {
      element.dataset.view = initialEffect;
    }
  }

  // Main function to observe element
  function intersectElement(element, isMutation = false) {
    element.classList.add('in-view');

    const dataset = element.dataset;

    // Set speed to current element
    if (dataset.viewSpeed) {
      element.style.transitionDuration = `${dataset.viewSpeed}ms`;
    }

    // Set easing to current element
    if (dataset.viewEasing) {
      element.style.transitionTimingFunction = dataset.viewEasing;
    }

    for (const key in dataset) {
      const property = key.toLowerCase();

      let dataViewValue = property.match(/view(.*)/)[1].replace(/^-/, '');

      // Check if dataset value equal to breakpoint
      if (dataViewValue && dataViewValue in breakpoints) {
        changeEffectOnResize(element, breakpoints[dataViewValue], dataset[key]);
      }
    }

    if (!isMutation) {
      window.addEventListener('load', () => {
        // Observe element with delay
        if (dataset.viewDelay) {
          setTimeout(
            () => intesectionObserver.observe(element),
            dataset.viewDelay
          );
        }
        // Observe element
        else {
          intesectionObserver.observe(element);
        }
      });
    } else {
      intesectionObserver.observe(element);
    }
  }

  /* --- Intersect elements on init --- */
  const targetElements = document.querySelectorAll('[data-view]');

  if (targetElements.length) {
    targetElements.forEach((target) => intersectElement(target));
  }

  /* --- Intersect dynamically added elements in DOM --- */
  if (!mainOptions.disableMutationObserver) {
    // Callback function to handle the mutations
    const handleMutations = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.addedNodes.length) {
          // Check if any added node has the desired class
          const addedNodes = mutation.addedNodes;

          addedNodes.forEach((target) => {
            if (target.dataset && 'view' in target.dataset) {
              intersectElement(target, true);
            }
          });
        }
      }
    };

    // Create a MutationObserver instance
    const mutationObserver = new MutationObserver(handleMutations);

    const mutationObserverOptions = {
      childList: true,
      subtree: true,
      characterData: false,
    };

    mutationObserver.observe(document.body, mutationObserverOptions);
  }
}

// Test call
initAnimationOnView();
