import { Slide, SlideNav } from "./slide.js";

const slide = new SlideNav(".slide", ".slide-wrapper");
slide.init();
slide.addArrow(".prev", ".next");

// slide.changeSlide(3); Rascunho
// slide.activePrevSlide(); Rascunho
