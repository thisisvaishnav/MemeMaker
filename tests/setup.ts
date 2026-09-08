import "fake-indexeddb/auto";

// Canvas mock for jsdom environment if not implemented
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = function (contextId: string) {
    if (contextId === "2d") {
      return {
        drawImage: () => {},
        fillText: () => {},
        strokeText: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        measureText: (text: string) => ({ width: text.length * 10 }),
        scale: () => {},
        translate: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        beginPath: () => {},
        closePath: () => {},
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  } as unknown as typeof HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.toDataURL = function () {
    return "data:image/png;base64,mockedDataUrl";
  };
}
