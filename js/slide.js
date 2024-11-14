import debounce from "./debounce.js";

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.distance = { finalPosition: 0, startX: 0, movement: 0 };
    this.activeClass = "active";
    this.changeEvent = new Event("changeEvent");
  }

  transition(active) {
    this.slide.style.transition = active ? "transform .3s" : "";
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
    // passive: true ->  "Pode ficar tranquilo, eu NÃO vou usar preventDefault() neste evento". Isso permite que o navegador comece a rolagem imediatamente, sem esperar seu código terminar. (não aparece mensagem de warning no console)
    this.wrapper.addEventListener(movetype, this.onMove, { passive: true });
    this.transition(false);
  }

  onMove(event) {
    const pointerPosition = event.type === "mousemove" ? event.clientX : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  onEnd(event) {
    const moveType = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.distance.finalPosition = this.distance.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
  }

  changeSlideOnEnd() {
    if (this.distance.movement > 120 && this.index.next !== undefined) this.activeNextSlide();
    else if (this.distance.movement < -120 && this.index.prev !== undefined) this.activePrevSlide();
    else this.changeSlide(this.index.active);
  }

  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);

    this.wrapper.addEventListener("touchstart", this.onStart, { passive: true }); // passive: true ->  "Pode ficar tranquilo, eu NÃO vou usar preventDefault() neste evento". Isso permite que o navegador comece a rolagem imediatamente, sem esperar seu código terminar. (não aparece mensagem de warning no console)
    this.wrapper.addEventListener("touchend", this.onEnd, { passive: true }); // passive: true ->  "Pode ficar tranquilo, eu NÃO vou usar preventDefault() neste evento". Isso permite que o navegador comece a rolagem imediatamente, sem esperar seu código terminar. (não aparece mensagem de warning no console)
  }

  // Slides config

  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { position, element };
    });
  }

  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    };
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);
    this.distance.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  changeActiveClass() {
    this.slideArray.forEach((item) => item.element.classList.remove(this.activeClass));
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }

  activeNextSlide() {
    if (this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 1000);
  }

  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    // SlideNav
    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);

    //Resize Debounce
    this.onResize = debounce(this.onResize.bind(this), 200);
  }

  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent();
    this.changeSlide(0); // slide começa do index 0
    return this;
  }
}

export default class SlideNav extends Slide {
  constructor(slide, wrapper) {
    super(slide, wrapper);
    this.bindControlEvents();
  }

  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();
  }

  addArrowEvent() {
    this.prevElement.addEventListener("click", this.activePrevSlide);
    this.nextElement.addEventListener("click", this.activeNextSlide);
  }

  createControl() {
    const control = document.createElement("ul");
    control.dataset.control = "slide";
    this.slideArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`;
    });
    this.wrapper.appendChild(control);
    return control;
  }

  eventControl(item, index) {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      this.changeSlide(index);
    });
    this.wrapper.addEventListener("changeEvent", this.activeControlItem);
  }

  activeControlItem() {
    this.controlArray.forEach((item) => item.classList.remove(this.activeClass));
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  addControl(customControl) {
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];
    this.activeControlItem();
    this.controlArray.forEach(this.eventControl);
  }

  //outra função de bind para organizar melhor
  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
