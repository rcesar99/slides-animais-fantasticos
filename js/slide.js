export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);

    this.distance = { finalPosition: 0, startX: 0, movement: 0 };
  }

  moveSlide(distX) {
    this.distance.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  updatePosition(clientX) {
    this.distance.movement = (this.distance.startX - clientX) * 1.4;
    return this.distance.finalPosition - this.distance.movement;
  }

  onStart(event) {
    let movetype;

    if (event.type === "mousedown") {
      event.preventDefault();
      this.distance.startX = event.clientX;
      movetype = "mousemove";
    } else {
      this.distance.startX = event.changedTouches[0].clientX;
      movetype = "touchmove";
    }

    this.wrapper.addEventListener(movetype, this.onMove, { passive: true });  // passive: true ->  "Pode ficar tranquilo, eu NÃO vou usar preventDefault() neste evento". Isso permite que o navegador comece a rolagem imediatamente, sem esperar seu código terminar. (não aparece mensagem de warning no console)
  }

  onMove(event) {
    const pointerPosition =
       event.type === "mousemove"
        ? event.clientX 
        : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  onEnd(event) {
    const moveType = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.distance.finalPosition = this.distance.movePosition;
  }

  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);

    this.wrapper.addEventListener("touchstart", this.onStart, { passive: true });// passive: true ->  "Pode ficar tranquilo, eu NÃO vou usar preventDefault() neste evento". Isso permite que o navegador comece a rolagem imediatamente, sem esperar seu código terminar. (não aparece mensagem de warning no console)
    this.wrapper.addEventListener("touchend", this.onEnd, { passive: true }); // passive: true ->  "Pode ficar tranquilo, eu NÃO vou usar preventDefault() neste evento". Isso permite que o navegador comece a rolagem imediatamente, sem esperar seu código terminar. (não aparece mensagem de warning no console)
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    return this;
  }
}
