/**
 * Function to getPosition of element in DOM
 * **/
export function getPosition(element) {
  var xPosition = 0;
  var yPosition = 0;

  while (element) {
    xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft;
    yPosition += element.offsetTop - element.scrollTop + element.clientTop;
    element = element.offsetParent;
  }

  return { x: xPosition, y: yPosition };
}

/** returns true if the element or one of its parents has the class classname **/
export function hasSomeParentTheClass(element, classname) {
  if (element.className.split(' ').indexOf(classname) >= 0) return true;
  return (
    element.parentNode && hasSomeParentTheClass(element.parentNode, classname)
  );
}

/** find the closest number in array [first is arr, second is needed number] **/
export function closest(arr, needle) {
  return arr.reduce((a, b) => {
    return Math.abs(b - needle) < Math.abs(a - needle) ? b : a;
  });
}

export const valueObserver = (
  defaultValue,
  callback,
  callAfterInit = false
) => {
  const proxyHandler = {
    set(obj, prop, value) {
      if (prop === 'value') {
        obj[prop] = value;
        callback(value);

        return true;
      }
      return true;
    },
  };

  if (callAfterInit) callback(defaultValue);

  return new Proxy({ value: defaultValue }, proxyHandler);
};
