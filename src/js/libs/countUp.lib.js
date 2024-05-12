import { CountUp } from 'countup.js';

/**
 * CountUp Metamorfosi function
 * (just add .count-up class anywhere and setup unique option in data attributes)
 * **/
/**
 * CountUp Metamorfosi function
 * (just add .count-up class anywhere and setup unique option in data attributes)
 * **/
const counts = Array.from(document.getElementsByClassName('count-up'));
if (counts) {
  const defaultOptions = {
    separator: '',
    enableScrollSpy: true,
    scrollSpyRunOnce: true,
  };

  let idNumber = 1;

  counts.forEach((count) => {
    const id = `count-up-${idNumber}`,
      value = parseFloat(count.innerHTML);

    let optionsFromDataAttr = { ...count.dataset };

    for (const key in optionsFromDataAttr) {
      if (optionsFromDataAttr[key] === '') {
        optionsFromDataAttr[key] = true;
      }
    }

    count.id = id;
    new CountUp(
      id,
      value,
      Object.assign(Object.assign({}, defaultOptions), optionsFromDataAttr)
    );
    idNumber++;
  });
}
