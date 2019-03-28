Number.prototype.countDecimals = function () {
  if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
  return this.toString().split(".")[1].length || 0;
}
var roundValueByStep = function (value, step) {
  var result;
  var value = value;
  var step = step;
  if (value % step < step / 2) {
    result = step * Math.floor(value / step);
  } else {
    result = step * Math.ceil(value / step);
  }
  return result.toFixed(step.countDecimals());
}

Vue.component('slider-2d', {
  template: '#slider-2d-template',
  props: {
    axes: {
      type: Array,
      default: function () {
        return [{
            tag: 'wght',
            name: 'Weight',
            minValue: 400,
            defaultValue: 400,
            maxValue: 700
          },
          {
            tag: 'wdth',
            name: 'Width',
            minValue: 0,
            defaultValue: 5,
            maxValue: 10
          }
        ]
      }
    },
  },
  data: function () {
    return {
      step: {
        x: 0.01,
        y: 0.01
      },
      maxPos: {
        left: 200,
        top: 200
      },
      handleCenter: {
        x: 8,
        y: 8
      }
    }
  },
  computed: {
    min() {
      return {
        x: this.axes[0].minValue,
        y: this.axes[1].minValue
      };
    },
    max() {
      return {
        x: this.axes[0].maxValue,
        y: this.axes[1].maxValue
      };
    },
    val() {
      return {
        x: this.axes[0].defaultValue,
        y: this.axes[1].defaultValue
      };
    },
    left() {
      var left = (this.val.x - this.min.x) / (this.max.x - this.min.x) * this.maxPos.left;
      return left;
    },
    top() {
      var top = (this.val.y - this.min.y) / (this.max.y - this.min.y) * this.maxPos.top;
      return top;
    }
  },
  methods: {
    updateValueByPosition: function (left, top) {
      var left = left,
        top = top;
      this.axes[0].defaultValue = (left * (this.max.x - this.min.x) / this.maxPos.left + this.min.x);
      this.axes[0].defaultValue = roundValueByStep(this.val.x, this.step.x);
      this.axes[1].defaultValue = (top * (this.max.y - this.min.y) / this.maxPos.top + this.min.y);
      this.axes[1].defaultValue = roundValueByStep(this.val.y, this.step.y);
      this.$emit('input', this.axes);
    },
    initDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.doDrag);
        document.body.addEventListener('mouseup', this.stopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.doDrag);
        document.body.addEventListener('touchend', this.stopDrag);
      }
      var targetLeft = e.clientX - this.$el.getBoundingClientRect().left - this.handleCenter.x;
      var targetTop = e.clientY - this.$el.getBoundingClientRect().top - this.handleCenter.y;
      if (targetLeft < 0) targetLeft = 0;
      if (targetLeft > this.maxPos.left) targetLeft = this.maxPos.left;
      if (targetTop < 0) targetTop = 0;
      if (targetTop > this.maxPos.top) targetTop = this.maxPos.top;
      this.updateValueByPosition(targetLeft, targetTop);
    },
    doDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetLeft = e.clientX - this.$el.getBoundingClientRect().left - this.handleCenter.x;
      var targetTop = e.clientY - this.$el.getBoundingClientRect().top - this.handleCenter.y;
      if (targetLeft < 0) targetLeft = 0;
      if (targetLeft > this.maxPos.left) targetLeft = this.maxPos.left;
      if (targetTop < 0) targetTop = 0;
      if (targetTop > this.maxPos.top) targetTop = this.maxPos.top;
      this.updateValueByPosition(targetLeft, targetTop);
    },
    stopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.stopDrag);
        document.body.removeEventListener('mousemove', this.doDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.stopDrag);
        document.body.removeEventListener('touchmove', this.doDrag);
      }
    },
  }
})
Vue.component('point-type-frame', {
  template: '#point-type-frame-template',
  props: {
    cobject: Object,
  },
  data: function () {
    return {
      step: 0.01,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      startFontSize: 0,
      startLeft: 0,
      startTop: 0,
      startSkewXHeight: 0,
      supportedTags: {
        opticalSize: 'opsz',
        width: 'wdth',
        xHeight: 'XHGT',
        slant: 'slnt',
        italic: 'ital'
      },
      states: {
        isEditable: false
      }
    };
  },
  watch: {
    cobject: function () {
      this.$el.querySelector('.text-span').innerText = this.cobject.properties.text;
    }
  },
  computed: {
    textFrameStyles() {
      if (this.cobject.type == "area type") {
        var textFrameStyles = {
          width: this.cobject.properties.width + 'px',
          height: this.cobject.properties.height + 'px',
          left: this.cobject.properties.left + 'px',
          top: this.cobject.properties.top + 'px'
        }
      } else if (this.cobject.type == "point type") {
        var textFrameStyles = {
          left: this.cobject.properties.left + 'px',
          top: this.cobject.properties.top + 'px'
        }
      }
      return textFrameStyles;
    },
    textStyles() {
      var axes = this.cobject.properties.variableOptions.axes;
      var cssString = '';
      for (var i = 0; i < axes.length; i++) {
        if (i < axes.length - 1) {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue + ',';
        } else {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue;
        }
      }
      return {
        fontSize: this.cobject.properties.fontSize + 'px',
        fontFamily: this.cobject.properties.cssCodeName,
        fontVariationSettings: cssString
      };
    },
    slantnessControlStyles() {
      var defaultValue;
      var axes = this.cobject.properties.variableOptions.axes;
      var maxAngle, minAngle, maxValue, minValue, defaultValue, skew, left;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.italic || axes[i].tag == this.supportedTags.slant) {
          maxAngle = axes[i].maxAngle;
          minAngle = axes[i].minAngle;
          maxValue = axes[i].maxValue;
          minValue = axes[i].minValue;
          defaultValue = parseFloat(axes[i].defaultValue);
        }
      }
      skew = -(defaultValue - minValue) / (maxValue - minValue) * (maxAngle - minAngle);
      left = Math.round(Math.tan((defaultValue - minValue) / (maxValue - minValue) * (maxAngle - minAngle) * Math.PI / 180) * 50);

      return {
        left: left + 'px',
        skew: 'skew(' + skew + 'deg)',
      };
    },
    xHeightControlStyles() {
      var defaultValue;
      var axes = this.cobject.properties.variableOptions.axes;
      var maxPositionY, minPositionY, baselinePostionY, maxValue, minValue, defaultValue, xHeightTop, baselineTop;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.xHeight) {
          maxPositionY = axes[i].maxPositionY;
          minPositionY = axes[i].minPositionY;
          baselinePostionY = axes[i].baselinePostionY;
          maxValue = axes[i].maxValue;
          minValue = axes[i].minValue;
          defaultValue = parseFloat(axes[i].defaultValue);
        }
      }
      xHeightTop = minPositionY + (defaultValue - minValue) / (maxValue - minValue) * (maxPositionY - minPositionY);
      baselineTop = baselinePostionY;

      return {
        xHeightTop: xHeightTop + 'em',
        baselineTop: baselineTop + 'em',
      };
    },
    isVFOpticalSizeSupported() {
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.opticalSize) return true;
      }
      return false;
    },
    isVFWidthSupported() {
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          return true;
        }
      }
      return false;
    },
    isVFSlantSupported() {
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.italic || axes[i].tag == this.supportedTags.slant) return true;
      }
      return false;
    },
    isVFXHeightSupported() {
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.xHeight) return true;
      }
      return false;
    }
  },
  mounted: function () {
    this.$el.querySelector('.text-span').innerText = this.cobject.properties.text;
  },
  methods: {
    updateContent: function (event) {
      this.$emit('update', event.target.innerText);
    },
    captureKeydown: function (event) {
      // this is to capture bubbling keydown event of Backspace or Delete in editing mode
      event.stopPropagation();
      event.target.removeEventListener('keydown', this.captureKeydown);
    },
    selectTextFrame: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.cobject.isSelected == false) {
        this.cobject.isSelected = true;
        this.emitValueChangeEvent();
      }
    },
    editTextFrame: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.cobject.isSelected == false) {
        this.cobject.isSelected = true;
      }
      if (this.states.isEditable == false) {
        this.states.isEditable = true;
      }
      var el = this.$el;
      setTimeout(function () {
        el.querySelector('[contenteditable]').focus();
      }, 0);
    },
    deactivateStates: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.states.isEditable == true) {
        this.states.isEditable = false;
      } else {
        this.cobject.isSelected = false;
      }
    },
    emitValueChangeEvent: function () {
      this.$emit('change', this.cobject);
    },
    //  Cancel canvas click when mouseup event fires on controls
    cancelCanvasClick: function () {
      document.body.addEventListener('click', this.captureClick, true);
    },
    captureClick: function (e) {
      e.stopPropagation();
      document.body.removeEventListener('click', this.captureClick, true);
    },
    //  Event Handlers for moving text frame
    moveTextFrameInitDrag: function (event) {
      event.stopPropagation();
      if (!this.states.isEditable) {
        var e;
        if (event.type == 'mousedown') {
          e = event;
          document.body.addEventListener('mousemove', this.moveTextFrameDoDrag);
          document.body.addEventListener('mouseup', this.moveTextFrameStopDrag);
        } else if (event.type == 'touchstart') {
          e = event.touches[0];
          document.body.addEventListener('touchmove', this.moveTextFrameDoDrag);
          document.body.addEventListener('touchend', this.moveTextFrameStopDrag);
        }

        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startTop = parseFloat(document.defaultView.getComputedStyle(this.$el).top);
        this.startLeft = parseFloat(document.defaultView.getComputedStyle(this.$el).left);
      }
    },
    moveTextFrameDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }

      this.cobject.properties.left = this.startLeft + e.clientX - this.startX;
      this.cobject.properties.top = this.startTop + e.clientY - this.startY;

      this.emitValueChangeEvent();
    },
    moveTextFrameStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.moveTextFrameStopDrag);
        document.body.removeEventListener('mousemove', this.moveTextFrameDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.moveTextFrameStopDrag);
        document.body.removeEventListener('touchmove', this.moveTextFrameDoDrag);
      }
    },
    // Event Handlers for Font Size Control
    controlFontSizeInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.controlFontSizeDoDrag);
        document.body.addEventListener('mouseup', this.controlFontSizeStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.controlFontSizeDoDrag);
        document.body.addEventListener('touchend', this.controlFontSizeStopDrag);
      }
      this.startY = e.clientY;

      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.cobject.properties.fontSize;
    },
    controlFontSizeDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.cobject.properties.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.cobject.properties.fontSize = this.cobject.properties.fontSize.toFixed(0);
      if (this.cobject.properties.fontSize < 1) this.cobject.properties.fontSize = 1;
      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlFontSizeStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.controlFontSizeStopDrag);
        document.body.removeEventListener('mousemove', this.controlFontSizeDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.controlFontSizeStopDrag);
        document.body.removeEventListener('touchmove', this.controlFontSizeDoDrag);
      }
      this.cancelCanvasClick();
    },
    // Event Handlers for Variable Optical Size Control
    controlVFOpticalSizeInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.controlVFOpticalSizeDoDrag);
        document.body.addEventListener('mouseup', this.controlVFOpticalSizeStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.controlVFOpticalSizeDoDrag);
        document.body.addEventListener('touchend', this.controlVFOpticalSizeStopDrag);
      }
      this.startY = e.clientY;
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.cobject.properties.fontSize;
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.opticalSize) {
          this.opticalSizeAxis = axes[i];
        }
      }
    },
    controlVFOpticalSizeDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.cobject.properties.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.cobject.properties.fontSize = this.cobject.properties.fontSize.toFixed(0);
      if (this.cobject.properties.fontSize < 1) this.cobject.properties.fontSize = 1;

      if (this.cobject.properties.fontSize > this.opticalSizeAxis.maxValue) {
        this.opticalSizeAxis.defaultValue = this.opticalSizeAxis.maxValue;
      } else if (this.cobject.properties.fontSize < this.opticalSizeAxis.minValue) {
        this.opticalSizeAxis.defaultValue = this.opticalSizeAxis.minValue;
      } else {
        this.opticalSizeAxis.defaultValue = this.cobject.properties.fontSize;
      }

      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlVFOpticalSizeStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.controlVFOpticalSizeStopDrag);
        document.body.removeEventListener('mousemove', this.controlVFOpticalSizeDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.controlVFOpticalSizeStopDrag);
        document.body.removeEventListener('touchmove', this.controlVFOpticalSizeDoDrag);
      }
      this.cancelCanvasClick();
    },

    //  Event Handlers for Variable Width Control
    controlVFWidthInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.controlVFWidthDoDrag);
        document.body.addEventListener('mouseup', this.controlVFWidthStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.controlVFWidthDoDrag);
        document.body.addEventListener('touchend', this.controlVFWidthStopDrag);
      }

      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.cobject.properties.fontSize;
      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          this.widthAxis = axes[i];
        }
      }
    },
    controlVFWidthDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetWidth = this.startWidth + e.clientX - this.startX;
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.$el.style.width = targetWidth + "px";
      this.$el.style.height = targetHeight + "px";
      this.cobject.properties.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.cobject.properties.fontSize = this.cobject.properties.fontSize.toFixed(0);
      if (this.cobject.properties.fontSize < 1) this.cobject.properties.fontSize = 1;


      this.widthAxis.defaultValue = this.fitVFWidth(this.$el, targetWidth);

      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlVFWidthStopDrag: function (event) {
      this.$el.style.width = "";
      this.$el.style.height = "";

      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.controlVFWidthStopDrag);
        document.body.removeEventListener('mousemove', this.controlVFWidthDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.controlVFWidthStopDrag);
        document.body.removeEventListener('touchmove', this.controlVFWidthDoDrag);
      }
      this.cancelCanvasClick();
    },
    generateVFCSS: function (axes) {
      var cssString = 'font-variation-settings: ';
      for (var i = 0; i < axes.length; i++) {
        if (i < axes.length - 1) {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue + ',';
        } else {
          cssString += "'" + axes[i].tag + "' " + axes[i].defaultValue + '; ';
        }
      }
      cssString += "font-size: " + this.cobject.properties.fontSize + 'px; ';
      cssString += "font-family: " + this.cobject.properties.cssCodeName + '; ';
      return cssString;
    },
    fitVFWidth: function (el, nwidth) {
      var el = el;
      var nwidth = nwidth;

      var axes = this.cobject.properties.variableOptions.axes;

      var axesClone = JSON.parse(JSON.stringify(axes));

      var widthAxis;
      for (var i = 0; i < axesClone.length; i++) {
        if (axesClone[i].tag == this.supportedTags.width) widthAxis = axesClone[i];
      }

      widthAxis.defaultValue = parseFloat(widthAxis.defaultValue);
      var maxVFWidth = widthAxis.maxValue;
      var minVFWidth = widthAxis.minValue;

      var dupEl = el.cloneNode(true);
      el.parentNode.insertBefore(dupEl, el.nextSibling);
      var dupTextEl = dupEl.querySelector('.text');
      var dupTextSpanEl = dupEl.querySelector('.text-span');

      dupEl.style.visibility = "hidden";
      dupEl.style.width = "";
      while (maxVFWidth - minVFWidth > 1) {
        dupTextEl.setAttribute("style", this.generateVFCSS(axesClone));
        var currentWidth = dupEl.clientWidth;
        if (currentWidth >= nwidth) {
          maxVFWidth = widthAxis.defaultValue;
          widthAxis.defaultValue = (widthAxis.defaultValue + minVFWidth) / 2;
        } else {
          minVFWidth = widthAxis.defaultValue;
          widthAxis.defaultValue = (widthAxis.defaultValue + maxVFWidth) / 2;
        }
      }
      dupEl.parentNode.removeChild(dupEl);
      return roundValueByStep(minVFWidth, this.step);
    },

    //  Event Handlers for Variable Width X axis Control
    controlVFWidthXInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.controlVFWidthXDoDrag);
        document.body.addEventListener('mouseup', this.controlVFWidthXStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.controlVFWidthXDoDrag);
        document.body.addEventListener('touchend', this.controlVFWidthXStopDrag);
      }

      this.startX = e.clientX;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.cobject.properties.fontSize;

      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          this.widthAxis = axes[i];
        }
      }
    },
    controlVFWidthXDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetWidth = this.startWidth + e.clientX - this.startX;
      this.$el.style.width = targetWidth + "px";

      this.widthAxis.defaultValue = this.fitVFWidth(this.$el, targetWidth);
      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlVFWidthXStopDrag: function (event) {
      this.$el.style.width = "";
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.controlVFWidthXStopDrag);
        document.body.removeEventListener('mousemove', this.controlVFWidthXDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.controlVFWidthXStopDrag);
        document.body.removeEventListener('touchmove', this.controlVFWidthXDoDrag);
      }
      this.cancelCanvasClick();
    },

    //  Event Handlers for Variable Width Y axis Control
    controlVFWidthYInitDrag: function (e) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.controlVFWidthYDoDrag);
        document.body.addEventListener('mouseup', this.controlVFWidthYStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.controlVFWidthYDoDrag);
        document.body.addEventListener('touchend', this.controlVFWidthYStopDrag);
      }

      this.startY = e.clientY;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
      this.startFontSize = this.cobject.properties.fontSize;

      this.$el.style.width = this.startWidth + "px";

      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.width) {
          this.widthAxis = axes[i];
        }
      }
    },
    controlVFWidthYDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetHeight = this.startHeight + e.clientY - this.startY;
      this.$el.style.height = targetHeight + "px";
      this.cobject.properties.fontSize = targetHeight / this.startHeight * this.startFontSize;
      this.cobject.properties.fontSize = this.cobject.properties.fontSize.toFixed(0);
      if (this.cobject.properties.fontSize < 1) this.cobject.properties.fontSize = 1;

      this.widthAxis.defaultValue = this.fitVFWidth(this.$el, this.startWidth);
      this.$emit('fzchange', this.cobject.properties.fontSize);
      this.emitValueChangeEvent();
    },
    controlVFWidthYStopDrag: function (event) {
      this.$el.style.width = "";
      this.$el.style.height = "";
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.controlVFWidthYStopDrag);
        document.body.removeEventListener('mousemove', this.controlVFWidthYDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.controlVFWidthYStopDrag);
        document.body.removeEventListener('touchmove', this.controlVFWidthYDoDrag);
      }
      this.cancelCanvasClick();
    },

    //  Event Handlers for Variable Slant Control
    controlVFSlantInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.controlVFSlantDoDrag);
        document.body.addEventListener('mouseup', this.controlVFSlantStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.controlVFSlantDoDrag);
        document.body.addEventListener('touchend', this.controlVFSlantStopDrag);
      }

      this.handleSlantness = this.$el.querySelector(".vf-slantness-handle");
      this.lineSlantness = this.$el.querySelector(".vf-slantness-line");
      this.startX = e.clientX;
      this.startLeft = parseInt(document.defaultView.getComputedStyle(this.handleSlantness).left, 10);

      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.italic || axes[i].tag == this.supportedTags.slant) {
          this.slantAxis = axes[i];
        }
      }

      var maxLeft = Math.tan(this.slantAxis.maxAngle * Math.PI / 180) * 50;
      var minLeft = Math.tan(this.slantAxis.minAngle * Math.PI / 180) * 50;
      this.maxHandleSlantnessLeft = maxLeft > minLeft ? maxLeft : minLeft;
      this.minHandleSlantnessLeft = maxLeft > minLeft ? minLeft : maxLeft;
    },
    controlVFSlantDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }

      var targetLeft = this.startLeft + e.clientX - this.startX;

      if (targetLeft > this.maxHandleSlantnessLeft) {
        targetLeft = this.maxHandleSlantnessLeft;
      } else if (targetLeft < this.minHandleSlantnessLeft) {
        targetLeft = this.minHandleSlantnessLeft;
      }
      var targetAngle = Math.atan(targetLeft / 50) / Math.PI * 180;
      this.slantAxis.defaultValue = roundValueByStep(targetAngle / this.slantAxis.maxAngle * this.slantAxis.maxValue, this.step);
      this.emitValueChangeEvent();
    },
    controlVFSlantStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.controlVFSlantStopDrag);
        document.body.removeEventListener('mousemove', this.controlVFSlantDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.controlVFSlantStopDrag);
        document.body.removeEventListener('touchmove', this.controlVFSlantDoDrag);
      }
      this.cancelCanvasClick();
    },

    //  Event Handlers for Variable xHeight Control
    controlVFxHeightInitDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.controlVFxHeightDoDrag);
        document.body.addEventListener('mouseup', this.controlVFxHeightStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.controlVFxHeightDoDrag);
        document.body.addEventListener('touchend', this.controlVFxHeightStopDrag);
      }
      this.handleXHeight = this.$el.querySelector(".vf-xheight-line");
      this.startY = e.clientY;
      this.startTop = parseFloat(document.defaultView.getComputedStyle(this.handleXHeight).top);

      var axes = this.cobject.properties.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].tag == this.supportedTags.xHeight) {
          this.xHeightAxis = axes[i];
        }
      }
    },
    controlVFxHeightDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      var targetTop = (e.clientY - this.startY + this.startTop) / this.cobject.properties.fontSize;

      if (targetTop > this.xHeightAxis.minPositionY) {
        targetTop = this.xHeightAxis.minPositionY;
      } else if (targetTop < this.xHeightAxis.maxPositionY) {
        targetTop = this.xHeightAxis.maxPositionY;
      }

      var targetXHeight = this.xHeightAxis.minValue + (targetTop - this.xHeightAxis.minPositionY) / (this.xHeightAxis.maxPositionY - this.xHeightAxis.minPositionY) * (this.xHeightAxis.maxValue - this.xHeightAxis.minValue);
      this.xHeightAxis.defaultValue = roundValueByStep(targetXHeight, this.step);
      this.emitValueChangeEvent();
    },
    controlVFxHeightStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.controlVFxHeightStopDrag);
        document.body.removeEventListener('mousemove', this.controlVFxHeightDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.controlVFxHeightStopDrag);
        document.body.removeEventListener('touchmove', this.controlVFxHeightDoDrag);
      }
      this.cancelCanvasClick();
    },

    //  Event Handlers for Area Size Control
    controlAreaSizeInitDrag: function (event, handle) {
      this.handle = handle;
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.controlAreaSizeDoDrag);
        document.body.addEventListener('mouseup', this.controlAreaSizeStopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.controlAreaSizeDoDrag);
        document.body.addEventListener('touchend', this.controlAreaSizeStopDrag);
      }

      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startLeft = this.cobject.properties.left;
      this.startTop = this.cobject.properties.top;
      // this.startWidth = this.cobject.properties.width;
      // this.startHeight = this.cobject.properties.height;
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10);
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10);
    },
    controlAreaSizeDoDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
      // use handle array to decide which handle is being moved, [-1, 1] is top right for example
      this.cobject.properties.left = this.startLeft + (e.clientX - this.startX) * (1 - this.handle[0]) / 2;
      this.cobject.properties.top = this.startTop + (e.clientY - this.startY) * (1 - this.handle[1]) / 2;
      this.cobject.properties.width = this.startWidth + (e.clientX - this.startX) * this.handle[0];
      this.cobject.properties.height = this.startHeight + (e.clientY - this.startY) * this.handle[1];
    },
    controlAreaSizeStopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.controlAreaSizeStopDrag);
        document.body.removeEventListener('mousemove', this.controlAreaSizeDoDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.controlAreaSizeStopDrag);
        document.body.removeEventListener('touchmove', this.controlAreaSizeDoDrag);
      }
      this.cancelCanvasClick();
    },

    //  Event Handlers Templates
    initDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      var e;
      if (event.type == 'mousedown') {
        e = event;
        document.body.addEventListener('mousemove', this.doDrag);
        document.body.addEventListener('mouseup', this.stopDrag);
      } else if (event.type == 'touchstart') {
        e = event.touches[0];
        document.body.addEventListener('touchmove', this.doDrag);
        document.body.addEventListener('touchend', this.stopDrag);
      }
    },
    doDrag: function (event) {
      event.stopPropagation();
      var e;
      if (event.type == 'mousemove') {
        e = event;
      } else if (event.type == 'touchmove') {
        e = event.touches[0];
      }
    },
    stopDrag: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type == 'mouseup') {
        document.body.removeEventListener('mouseup', this.stopDrag);
        document.body.removeEventListener('mousemove', this.doDrag);
      } else if (event.type == 'touchend') {
        document.body.removeEventListener('touchend', this.stopDrag);
        document.body.removeEventListener('touchmove', this.doDrag);
      }
      this.cancelCanvasClick();
    },
  }
})

var app = new Vue({
  el: '#font-playground-app',
  data: {
    search: '',
    fontFamilies: [{
      "fontFamilyName": "GRADUATE",
      "isActive": true,
      "fontFileName": "GRADUATE.ttf",
      "cssCodeName": "GRADUATE",
      "previewText": {
        "isCustom": false,
        "customText": ""
      },
      "isVariableFont": true,
      "variableOptions": {
        "axes": [{
            "tag": "XOPQ",
            "name": "x opaque",
            "minValue": 40,
            "defaultValue": 40,
            "maxValue": 200,
            "isSelected": 1
          },
          {
            "tag": "XTRA",
            "name": "x transparent",
            "minValue": 100,
            "defaultValue": 400,
            "maxValue": 800,
            "isSelected": 0
          },
          {
            "tag": "OPSZ",
            "name": "Optical Size",
            "minValue": 8,
            "defaultValue": 16,
            "maxValue": 16,
            "isSelected": 0
          },
          {
            "tag": "GRAD",
            "name": "Grade",
            "minValue": 0,
            "defaultValue": 0,
            "maxValue": 20,
            "isSelected": 0
          },
          {
            "tag": "YTRA",
            "name": "y transparent",
            "minValue": 750,
            "defaultValue": 750,
            "maxValue": 850,
            "isSelected": 0
          },
          {
            "tag": "CNTR",
            "name": "Contrast",
            "minValue": 0,
            "defaultValue": 0,
            "maxValue": 100,
            "isSelected": 2
          },
          {
            "tag": "YOPQ",
            "name": "y opaque",
            "minValue": 100,
            "defaultValue": 100,
            "maxValue": 800,
            "isSelected": 0
          },
          {
            "tag": "SERF",
            "name": "Serif",
            "minValue": 0,
            "defaultValue": 0,
            "maxValue": 30,
            "isSelected": 0
          },
          {
            "tag": "YTAS",
            "name": "y transparent ascender",
            "minValue": 0,
            "defaultValue": 0,
            "maxValue": 50,
            "isSelected": 0
          },
          {
            "tag": "YTLC",
            "name": "lc y transparent",
            "minValue": 650,
            "defaultValue": 650,
            "maxValue": 750,
            "isSelected": 0
          },
          {
            "tag": "YTDE",
            "name": "y transparent descender",
            "minValue": 0,
            "defaultValue": 0,
            "maxValue": 50,
            "isSelected": 0
          },
          {
            "tag": "SELE",
            "name": "Largo Serif",
            "minValue": -20,
            "defaultValue": 0,
            "maxValue": 0,
            "isSelected": 0
          }
        ],
        "instances": []
      },
      "fontInfo": {
        "designer": "Eduardo Tunni",
        "publisher": "Eduardo Tunni",
        "urlText": "Github",
        "url": "https://github.com/etunni/Graduate-Variable-Font",
        "license": "OFL 1.1"
      }
    }, {
      "fontFamilyName": "Adobe VF Prototype",
      "isActive": false,
      "fontFileName": "AdobeVFPrototype.woff2",
      "cssCodeName": "AdobeVFPrototype",
      "previewText": {
        "isCustom": false,
        "customText": ""
      },
      "isVariableFont": true,
      "variableOptions": {
        "axes": [{
            "tag": "wght",
            "name": "Weight",
            "minValue": 200,
            "defaultValue": 389,
            "maxValue": 900,
            "isSelected": 1
          },
          {
            "tag": "CNTR",
            "name": "Contrast",
            "minValue": 0,
            "defaultValue": 0,
            "maxValue": 100,
            "isSelected": 2
          }
        ],
        "instances": [{
            "name": "Black High Contrast",
            "isActive": false,
            "coordinates": {
              "wght": 900,
              "CNTR": 100
            }
          },
          {
            "name": "Black Medium Contrast",
            "isActive": false,
            "coordinates": {
              "wght": 900,
              "CNTR": 50
            }
          },
          {
            "name": "Black",
            "isActive": false,
            "coordinates": {
              "wght": 900,
              "CNTR": 0
            }
          },
          {
            "name": "Bold",
            "isActive": false,
            "coordinates": {
              "wght": 700,
              "CNTR": 0
            }
          },
          {
            "name": "Semibold",
            "isActive": false,
            "coordinates": {
              "wght": 600,
              "CNTR": 0
            }
          },
          {
            "name": "Regular",
            "isActive": false,
            "coordinates": {
              "wght": 400,
              "CNTR": 0
            }
          },
          {
            "name": "Light",
            "isActive": false,
            "coordinates": {
              "wght": 300,
              "CNTR": 0
            }
          },
          {
            "name": "ExtraLight",
            "isActive": false,
            "coordinates": {
              "wght": 200,
              "CNTR": 0
            }
          }
        ]
      },
      "fontInfo": {
        "designer": "Frank Grießhammer",
        "publisher": "Adobe",
        "urlText": "github.com",
        "url": "https://github.com/adobe-fonts/adobe-variable-font-prototype",
        "license": "Open source"
      }
    }],
    canvasObjects: [{
        "type": "point type",
        "isSelected": false,
        "id": "text1",
        "properties": {
          "left": 10,
          "top": 10,
          "cssCodeName": "GRADUATE",
          "isVariableFont": true,
          "text": "Graduate",
          "fontSize": 148,
          "variableOptions": {
            "axes": [{
                "tag": "XOPQ",
                "name": "x opaque",
                "minValue": 40,
                "defaultValue": 83,
                "maxValue": 200,
                "isSelected": 1
              },
              {
                "tag": "XTRA",
                "name": "x transparent",
                "minValue": 100,
                "defaultValue": 400,
                "maxValue": 800,
                "isSelected": 0
              },
              {
                "tag": "OPSZ",
                "name": "Optical Size",
                "minValue": 8,
                "defaultValue": 16,
                "maxValue": 16,
                "isSelected": 0
              },
              {
                "tag": "GRAD",
                "name": "Grade",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 20,
                "isSelected": 0
              },
              {
                "tag": "YTRA",
                "name": "y transparent",
                "minValue": 750,
                "defaultValue": 750,
                "maxValue": 850,
                "isSelected": 0
              },
              {
                "tag": "CNTR",
                "name": "Contrast",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 100,
                "isSelected": 2
              },
              {
                "tag": "YOPQ",
                "name": "y opaque",
                "minValue": 100,
                "defaultValue": 100,
                "maxValue": 800,
                "isSelected": 0
              },
              {
                "tag": "SERF",
                "name": "Serif",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 30,
                "isSelected": 0
              },
              {
                "tag": "YTAS",
                "name": "y transparent ascender",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 50,
                "isSelected": 0
              },
              {
                "tag": "YTLC",
                "name": "lc y transparent",
                "minValue": 650,
                "defaultValue": 650,
                "maxValue": 750,
                "isSelected": 0
              },
              {
                "tag": "YTDE",
                "name": "y transparent descender",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 50,
                "isSelected": 0
              },
              {
                "tag": "SELE",
                "name": "Largo Serif",
                "minValue": -20,
                "defaultValue": 0,
                "maxValue": 0,
                "isSelected": 0
              }
            ],
            "instances": []
          },
        }
      },
      {
        "type": "point type",
        "isSelected": false,
        "id": "text2",
        "properties": {
          "left": 10,
          "top": 150,
          "text": "MODERN?",
          "fontSize": "140",
          "cssCodeName": "GRADUATE",
          "isVariableFont": true,
          "variableOptions": {
            "axes": [{
                "tag": "XOPQ",
                "name": "x opaque",
                "minValue": 40,
                "defaultValue": 200,
                "maxValue": 200,
                "isSelected": 1
              },
              {
                "tag": "XTRA",
                "name": "x transparent",
                "minValue": 100,
                "defaultValue": 400,
                "maxValue": 800,
                "isSelected": 0
              },
              {
                "tag": "OPSZ",
                "name": "Optical Size",
                "minValue": 8,
                "defaultValue": 16,
                "maxValue": 16,
                "isSelected": 0
              },
              {
                "tag": "GRAD",
                "name": "Grade",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 20,
                "isSelected": 0
              },
              {
                "tag": "YTRA",
                "name": "y transparent",
                "minValue": 750,
                "defaultValue": 750,
                "maxValue": 850,
                "isSelected": 0
              },
              {
                "tag": "CNTR",
                "name": "Contrast",
                "minValue": 0,
                "defaultValue": 100,
                "maxValue": 100,
                "isSelected": 2
              },
              {
                "tag": "YOPQ",
                "name": "y opaque",
                "minValue": 100,
                "defaultValue": 100,
                "maxValue": 800,
                "isSelected": 0
              },
              {
                "tag": "SERF",
                "name": "Serif",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 30,
                "isSelected": 0
              },
              {
                "tag": "YTAS",
                "name": "y transparent ascender",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 50,
                "isSelected": 0
              },
              {
                "tag": "YTLC",
                "name": "lc y transparent",
                "minValue": 650,
                "defaultValue": 650,
                "maxValue": 750,
                "isSelected": 0
              },
              {
                "tag": "YTDE",
                "name": "y transparent descender",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 50,
                "isSelected": 0
              },
              {
                "tag": "SELE",
                "name": "Largo Serif",
                "minValue": -20,
                "defaultValue": 0,
                "maxValue": 0,
                "isSelected": 0
              }
            ],
            "instances": []
          },
        }
      },
      {
        "type": "area type",
        "isSelected": false,
        "id": "text3",
        "properties": {
          "width": 750,
          "height": 150,
          "left": 25,
          "top": 300,
          "text": "Graduate is a high quality example of the classic college block style of lettering used across very campus in the USA.",
          "fontSize": "27",
          "cssCodeName": "GRADUATE",
          "isVariableFont": true,
          "variableOptions": {
            "axes": [{
                "tag": "XOPQ",
                "name": "x opaque",
                "minValue": 40,
                "defaultValue": 40,
                "maxValue": 200,
                "isSelected": 1
              },
              {
                "tag": "XTRA",
                "name": "x transparent",
                "minValue": 100,
                "defaultValue": 400,
                "maxValue": 800,
                "isSelected": 0
              },
              {
                "tag": "OPSZ",
                "name": "Optical Size",
                "minValue": 8,
                "defaultValue": 16,
                "maxValue": 16,
                "isSelected": 0
              },
              {
                "tag": "GRAD",
                "name": "Grade",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 20,
                "isSelected": 0
              },
              {
                "tag": "YTRA",
                "name": "y transparent",
                "minValue": 750,
                "defaultValue": 750,
                "maxValue": 850,
                "isSelected": 0
              },
              {
                "tag": "CNTR",
                "name": "Contrast",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 100,
                "isSelected": 2
              },
              {
                "tag": "YOPQ",
                "name": "y opaque",
                "minValue": 100,
                "defaultValue": 100,
                "maxValue": 800,
                "isSelected": 0
              },
              {
                "tag": "SERF",
                "name": "Serif",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 30,
                "isSelected": 0
              },
              {
                "tag": "YTAS",
                "name": "y transparent ascender",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 50,
                "isSelected": 0
              },
              {
                "tag": "YTLC",
                "name": "lc y transparent",
                "minValue": 650,
                "defaultValue": 650,
                "maxValue": 750,
                "isSelected": 0
              },
              {
                "tag": "YTDE",
                "name": "y transparent descender",
                "minValue": 0,
                "defaultValue": 0,
                "maxValue": 50,
                "isSelected": 0
              },
              {
                "tag": "SELE",
                "name": "Largo Serif",
                "minValue": -20,
                "defaultValue": 0,
                "maxValue": 0,
                "isSelected": 0
              }
            ],
            "instances": []
          },
        }
      },
    ],
    canvasObjectsCounter: 0,
    fontSize: 100,
    appStates: {
      drawer: {
        fontMenu: {
          isActive: false
        },
      },
      tabs: {
        design: {
          name: 'Design',
          isActive: true
        },
        code: {
          name: 'Code',
          isActive: false
        },
        about: {
          name: 'About',
          isActive: false
        },
      },
      recentFiles: [],
    }
  },
  computed: {
    filteredFontFamilies() {
      return this.fontFamilies.filter(fontFamily => {
        var isIncluded = false;
        if (fontFamily.fontFamilyName.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if (fontFamily.cssCodeName.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if (fontFamily.fontInfo.designer.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if (fontFamily.fontInfo.publisher.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if (fontFamily.fontInfo.license.toLowerCase().includes(this.search.toLowerCase())) {
          isIncluded = true;
        } else if (fontFamily.hasOwnProperty('variableOptions')) {
          axes = fontFamily.variableOptions.axes;
          for (var i = 0; i < axes.length; i++) {
            if (axes[i]['tag'].toLowerCase().includes(this.search.toLowerCase())) {
              isIncluded = true;
            } else if (axes[i]['name'].toLowerCase().includes(this.search.toLowerCase())) {
              isIncluded = true;
            }
          }
        }
        return isIncluded;
      })
    },
    activeFont: function () {
      var activeFont;
      for (var i = 0; i < this.fontFamilies.length; i++) {
        if (this.fontFamilies[i].isActive == true) {
          activeFont = this.fontFamilies[i];

          return activeFont;
        }
      }
    },
    selectedAxes: function () {
      var selectedAxes = [];
      var axes = this.activeFont.variableOptions.axes;
      for (var i = 0; i < axes.length; i++) {
        if (axes[i].isSelected > 0) {
          selectedAxes.push(axes[i])
        }
      }
      return selectedAxes;
    },
    selectedCanvasObjects: function () {
      var selectedCanvasObjects = [];
      for (var i = 0; i < this.canvasObjects.length; i++) {
        if (this.canvasObjects[i].isSelected == true) {
          selectedCanvasObjects.push(this.canvasObjects[i]);
        }
      }
      return selectedCanvasObjects;
    },
    isSlider2dActive: function () {
      if (this.selectedAxes.length >= 2) {
        return true;
      } else {
        return false;
      }
    },
    cssFontFaces: function () {
      var fontFaces = [];
      var cssFontFaces = "";
      for (var i = 0; i < this.canvasObjects.length; i++) {
        if (!fontFaces.includes(this.canvasObjects[i].properties.cssCodeName)) {
          fontFaces.push(this.canvasObjects[i].properties.cssCodeName);
        }
      }
      for (var k = 0; k < fontFaces.length; k++) {
        cssFontFaces += "@font-face {\n";
        cssFontFaces += "  src: url('[Your url to woff2 file here.]');\n";
        cssFontFaces += "  font-family:'" + fontFaces[k] + "';\n";
        cssFontFaces += "  font-style: normal;\n";
        cssFontFaces += "}\n";
      }
      return cssFontFaces;
    },
    codepenJSON: function () {
      var tags = ["Variable_Font", "Font_Playground"];
      var html = '<!-- This pen is created via Font Playground. After saving this pen, you can use its URL to reopen this composition in Font Playground. This feature depends on this pen’s javascript, don’t edit or delete it. --> \n';
      var css = '/* Fonts are embedded through external CSS and for testing purpose on Codepen only. Please consult each font’s licensing info for other usages. */ \n\n' +
        'body { \n' +
        '  -webkit-font-smoothing: antialiased; \n' +
        '  -moz-osx-font-smoothing: grayscale; \n' +
        '  font-smoothing: antialiased; \n' +
        '} \n';
      var js = JSON.stringify(this.canvasObjects);

      for (var i = 0; i < this.canvasObjects.length; i++) {
        cobject = this.canvasObjects[i];
        if (cobject.properties.text.length > 16) {
          css += "/* text: " + cobject.properties.text.substring(0, 15) + "… */\n";
        } else {
          css += "/* text: " + cobject.properties.text + " */\n";
        }
        css += "#" + cobject.id + " {\n";
        css += "  font-family: '" + cobject.properties.cssCodeName + "';\n";
        css += "  font-size: " + cobject.properties.fontSize + "px; \n";
        css += "  position: absolute; \n";
        if (cobject.type == "area type") {
          css += "  width: " + cobject.properties.width + "px; \n";
          css += "  height: " + cobject.properties.height + "px; \n";
        }
        css += "  left: " + cobject.properties.left + "px; \n";
        css += "  top: " + cobject.properties.top + "px; \n";
        css += "  font-variation-settings:\n";
        if (cobject.properties.isVariableFont) {
          var axes = cobject.properties.variableOptions.axes;
          for (var j = 0; j < axes.length; j++) {
            if (j < axes.length - 1) {
              css += "    '" + axes[j].tag + "' " + axes[j].defaultValue + ",\n";
            } else {
              css += "    '" + axes[j].tag + "' " + axes[j].defaultValue + "; \n";
            }
          }
        }
        css += "}\n";
        html += '<div id="' + cobject.id + '">' + cobject.properties.text + '</div> \n';
        tags.push(cobject.properties.cssCodeName.replace(/ /g, "_"));
      }

      var data = {
        title: "Exported Composition via Font Playground",
        description: "This composition is created via [Font Playground](https://play.typedetail.com/). \n\n In order to open this composition in Font Playground: go to https://play.typedetail.com/, go to `File` > `Open…`, copy & paste in the URL of this CodePen, click `OK`. \n\n Browse more compositions created via Font Playground, visit https://codepen.io/tag/font_playground/.",
        tags: tags,
        editors: "111",
        layout: "right", // top | left | right
        html: html,
        css: css,
        js: js,
        css_external: "https://twardoch.github.io/Graduate-Variable-Font/fonts.css;https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css",
      }
      // return JSON.stringify(data).replace(/"/g, "&​quot;").replace(/'/g, "&apos;");
      return JSON.stringify(data);
    },
    allFontFacesDebugOnly: function () {
      var fontFamilies = this.fontFamilies;
      // var assetAddress = 'https://s3.us-east-2.amazonaws.com/font-playground/';
      // var assetAddress = '../fonts/';
      // var assetAddress = 'https://fonts.typedetail.com/';
      var assetAddress = '#{$assetPath}';
      var cssString = '';
      for (var i = 0; i < this.fontFamilies.length; i++) {
        cssString += "@font-face {\n";
        cssString += "  src: url('" + assetAddress + this.fontFamilies[i].fontFileName + "');\n";
        cssString += "  font-family:'" + this.fontFamilies[i].cssCodeName + "';\n";
        cssString += "  font-style: normal;\n";
        cssString += "}\n";
      }
      return cssString;
    },
  },
  mounted: function () {
    this.loadFileByURLSearchParams();

    if ("recentFiles" in localStorage) {
      this.appStates.recentFiles = JSON.parse(localStorage.recentFiles);
    }

    if (this.selectedCanvasObjects.length > 0) {
      for (var i = 0; i < this.fontFamilies.length; i++) {
        if (this.fontFamilies[i].cssCodeName == this.selectedCanvasObjects[0].properties.cssCodeName) {
          this.fontFamilies[i].isActive = true;
          if (this.selectedCanvasObjects[0].properties.isVariableFont) {
            this.fontFamilies[i].variableOptions.axes = this.selectedCanvasObjects[0].properties.variableOptions.axes;
          }
        } else {
          this.fontFamilies[i].isActive = false;
        }
      }
    }

    this.scrollIntoView(this.activeFont);

    this.canvasObjectsCounter = this.canvasObjects.length;

    // keyboard short-cuts
    const self = this;
    document.body.addEventListener('keydown', function (e) {
      switch (e.key) {
      case "Backspace":
      case "Delete":
        e.preventDefault();
        for (var i = self.canvasObjects.length - 1; i >= 0; i--) {
          if (self.canvasObjects[i].isSelected) {
            self.canvasObjects.splice(i, 1);
          }
        }
        break;
      case "ArrowUp":
        if (e.shiftKey) {
          for (var i = 0; i < self.selectedCanvasObjects.length; i++) {
            self.selectedCanvasObjects[i].properties.top = self.selectedCanvasObjects[i].properties.top - 10;
          }
        } else {
          for (var i = 0; i < self.selectedCanvasObjects.length; i++) {
            self.selectedCanvasObjects[i].properties.top--;
          }
        }
        break;
      case "ArrowDown":
        if (e.shiftKey) {
          for (var i = 0; i < self.selectedCanvasObjects.length; i++) {
            self.selectedCanvasObjects[i].properties.top = self.selectedCanvasObjects[i].properties.top + 10;
          }
        } else {
          for (var i = 0; i < self.selectedCanvasObjects.length; i++) {
            self.selectedCanvasObjects[i].properties.top++;
          }
        }
        break;
      case "ArrowLeft":
        if (e.shiftKey) {
          for (var i = 0; i < self.selectedCanvasObjects.length; i++) {
            self.selectedCanvasObjects[i].properties.left = self.selectedCanvasObjects[i].properties.left - 10;
          }
        } else {
          for (var i = 0; i < self.selectedCanvasObjects.length; i++) {
            self.selectedCanvasObjects[i].properties.left--;
          }
        }
        break;
      case "ArrowRight":
        if (e.shiftKey) {
          for (var i = 0; i < self.selectedCanvasObjects.length; i++) {
            self.selectedCanvasObjects[i].properties.left = self.selectedCanvasObjects[i].properties.left + 10;
          }
        } else {
          for (var i = 0; i < self.selectedCanvasObjects.length; i++) {
            self.selectedCanvasObjects[i].properties.left++;
          }
        }
        break;
      }
    });

    var allClipboard = new ClipboardJS('.button-copy-all', {
      text: function () {
        var copyString = document.querySelector('.section-code code').innerText;
        return copyString;
      }
    });

    allClipboard.on('success', function (e) {
      e.trigger.classList.add('copied');
      setTimeout(function () {
        e.trigger.classList.remove('copied');
      }, 500)
    });

    var selectedClipboard = new ClipboardJS('.button-copy-selected', {
      text: function () {
        var copyString = '';
        var copyTarget = document.querySelectorAll('.section-code code .css-for-canvas-object.highlight');
        for (var i = 0; i < copyTarget.length; i++) {
          copyString += copyTarget[i].innerText;
        }
        return copyString;
      }
    });

    selectedClipboard.on('success', function (e) {
      e.trigger.classList.add('copied');
      setTimeout(function () {
        e.trigger.classList.remove('copied');
      }, 500)
    });
  },
  methods: {
    loadFileByURLSearchParams: function () {
      const self = this;
      var searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('openFile')) {
        var pureUrl = searchParams.get('openFile');
        jsURL = pureUrl + '.js';
        var oReq = new XMLHttpRequest();
        oReq.onload = function reqListener() {
          var data = JSON.parse(this.responseText);
          self.canvasObjects = data;

          if (self.appStates.recentFiles.indexOf(pureUrl) == -1) {
            self.appStates.recentFiles.unshift(pureUrl);
            if (self.appStates.recentFiles.length > 10) {
              self.appStates.recentFiles.pop();
            }
            localStorage.recentFiles = JSON.stringify(self.appStates.recentFiles);
          }
        };
        oReq.open('get', jsURL, true);
        oReq.send();
      }

    },
    newFile: function () {
      this.canvasObjects = [];
    },
    openFile: function (paramURL) {
      var pureUrl;
      if (paramURL == 'prompt') {
        var codepenURL = prompt("Please enter CodePen URL", "https://codepen.io/wentin/pen/wxOoWN");
        if (codepenURL != null) {
          pureUrl = codepenURL.split('?')[0]
          var jsURL = pureUrl + '.js';
          var newPageUrl = window.location.href.split('?')[0] + '?openFile=' + pureUrl;
        } else {
          return;
        }
      } else {
        pureUrl = paramURL;
      }
      var newPageUrl = window.location.href.split('?')[0] + '?openFile=' + pureUrl;
      window.location.href = newPageUrl;
    },
    saveFileToCodepen: function () {
      document.getElementById("form-export").submit();
    },
    activateTab: function (tab) {
      for (var key in this.appStates.tabs) {
        this.appStates.tabs[key].isActive = false;
      }
      tab.isActive = true;
    },
    toggleDrawer: function (drawer) {
      drawer.isActive = !drawer.isActive;
    },
    scrollIntoView: function (activeFont) {
      var id = activeFont.cssCodeName.replace(/ /g, '-');
      if (document.getElementById(id) != null) {
        document.getElementById(id).scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    },
    activateFamily: function (fontFamily) {
      for (var i = 0; i < this.fontFamilies.length; i++) {
        this.fontFamilies[i].isActive = false;
      }
      fontFamily.isActive = true;
      for (var i = 0; i < this.selectedCanvasObjects.length; i++) {
        var newFontFamily = JSON.parse(JSON.stringify(fontFamily));
        this.selectedCanvasObjects[i].properties.cssCodeName = newFontFamily.cssCodeName;
        if (newFontFamily.isVariableFont) {
          this.selectedCanvasObjects[i].properties.variableOptions.axes = newFontFamily.variableOptions.axes;
        }
      }
    },
    activateAxis: function (axis) {
      if (axis.isSelected == 0) {
        var axes = this.activeFont.variableOptions.axes;
        for (var i = 0; i < axes.length; i++) {
          if (axes[i].isSelected == 2) {
            axes[i].isSelected = 0;
          }
          if (axes[i].isSelected == 1) {
            axes[i].isSelected = 2;
          }
        }
        axis.isSelected = 1;
      }
    },
    activateInstance: function (instance) {
      var axes = this.activeFont.variableOptions.axes;
      for (var tag in instance.coordinates) {
        if (instance.coordinates.hasOwnProperty(tag)) {
          for (var i = 0; i < axes.length; i++) {
            if (axes[i]['tag'] == tag) {
              axes[i]['defaultValue'] = instance.coordinates[tag];
            }
          }
        }
      }
      var instances = this.activeFont.variableOptions.instances;
      for (var i = 0; i < instances.length; i++) {
        instances[i].isActive = 0;
      }
      instance.isActive = 1;
      this.handleActiveFontChange();
    },
    handleCSSCanvasObjectClick: function (canvasObject) {
      if (canvasObject.isSelected) {
        canvasObject.isSelected = false;
        if (this.selectedCanvasObjects.length > 0) {
          var lastCanvasObject = this.selectedCanvasObjects[this.selectedCanvasObjects.length - 1];
          this.handleCanvasObjectChange(lastCanvasObject);
        }
      } else {
        canvasObject.isSelected = true;
        this.handleCanvasObjectChange(canvasObject);
      }
    },
    handleCanvasObjectChange: function (canvasObject) {
      let newCanvasObject = JSON.parse(JSON.stringify(canvasObject));
      this.fontSize = newCanvasObject.properties.fontSize;
      for (var i = 0; i < this.fontFamilies.length; i++) {
        if (this.fontFamilies[i].cssCodeName == newCanvasObject.properties.cssCodeName) {
          this.fontFamilies[i].isActive = true;
          this.fontFamilies[i].variableOptions.axes = newCanvasObject.properties.variableOptions.axes
        } else {
          this.fontFamilies[i].isActive = false;
        }
      }
      this.scrollIntoView(this.activeFont);
    },
    handleActiveFontChange: function () {
      for (var i = 0; i < this.selectedCanvasObjects.length; i++) {
        var newActiveFont = JSON.parse(JSON.stringify(this.activeFont));
        this.selectedCanvasObjects[i].properties.cssCodeName = newActiveFont.cssCodeName;
        if (newActiveFont.isVariableFont) {
          this.selectedCanvasObjects[i].properties.variableOptions.axes = newActiveFont.variableOptions.axes;
        }
      }
    },
    handleFontSizeChange: function () {
      for (var i = 0; i < this.selectedCanvasObjects.length; i++) {
        this.selectedCanvasObjects[i].properties.fontSize = this.fontSize;
      }
    },
    selectCanvasObject: function (canvasObject) {
      for (var i = 0; i < this.canvasObjects.length; i++) {
        this.canvasObjects[i].isSelected = false;
      }
      canvasObject.isSelected = true;
      this.handleCanvasObjectChange(canvasObject);
    },
    deselectAllCanvasObject: function () {
      var canvasObjects = this.canvasObjects;
      for (var i = 0; i < canvasObjects.length; i++) {
        canvasObjects[i].isSelected = false;
      }
    },
    instanceStyles: function (instance) {
      var fontVariationSettings = [];
      for (var tag in instance.coordinates) {
        if (instance.coordinates.hasOwnProperty(tag)) {
          fontVariationSettings.push("'" + tag + "' " + instance.coordinates[tag]);
        }
      }
      return {
        fontFamily: this.activeFont.cssCodeName,
        fontVariationSettings: fontVariationSettings.join()
      };
    },
    addCanvasObject: function (type) {
      var left, top;
      var newActiveFont = JSON.parse(JSON.stringify(this.activeFont));
      var anchorCanvasObject;
      if (this.selectedCanvasObjects.length > 0) {
        anchorCanvasObject = this.selectedCanvasObjects[this.selectedCanvasObjects.length - 1];
      } else if (this.canvasObjects.length > 0) {
        anchorCanvasObject = this.canvasObjects[this.canvasObjects.length - 1];
      }

      if (anchorCanvasObject) {
        left = anchorCanvasObject.properties.left;
        if (anchorCanvasObject.type == "point type") {
          top = 20 + parseInt(anchorCanvasObject.properties.fontSize, 10) + anchorCanvasObject.properties.top;
        } else {
          top = 20 + anchorCanvasObject.properties.height + anchorCanvasObject.properties.top;
        }
      } else {
        left = 0;
        top = 0;
      }

      var canvasObject = {
        type: type,
        isSelected: true,
        id: "text" + (++this.canvasObjectsCounter),
        properties: {
          "left": left,
          "top": top,
          "cssCodeName": newActiveFont.cssCodeName,
          "isVariableFont": newActiveFont.isVariableFont,
        }
      };
      if (type == "point type") {
        canvasObject.properties.text = "Lorem Ipsum";
        canvasObject.properties.fontSize = 100;
      } else if (type == "area type") {
        canvasObject.properties.text = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Modi dignissimos molestias, repellendus sequi incidunt itaque eligendi esse ab odio perspiciatis, eveniet libero est aliquid ipsam facilis blanditiis tenetur. Et ducimus dolorum illo dolor praesentium nisi quo magnam cumque quis ad repellendus fugit corporis velit sunt, laborum voluptatibus soluta blanditiis iusto recusandae reprehenderit quas fuga natus exercitationem dolore iste! Sequi, modi?";
        canvasObject.properties.fontSize = 20;
        canvasObject.properties.width = 560;
        canvasObject.properties.height = 160;
      }
      if (newActiveFont.isVariableFont) {
        canvasObject.properties.variableOptions = {
          "axes": newActiveFont.variableOptions.axes
        }
      }
      this.canvasObjects.push(canvasObject);
    },
    generateCSSForCanvasObject: function (cobject) {
      var cssString = "";
      if (cobject.properties.text.length > 16) {
        cssString += "/* text: " + cobject.properties.text.substring(0, 15) + "… */\n";
      } else {
        cssString += "/* text: " + cobject.properties.text + " */\n";
      }
      cssString += "#" + cobject.id + " {\n";
      cssString += "  font-family: '" + cobject.properties.cssCodeName + "';\n";
      cssString += "  font-size: " + cobject.properties.fontSize + "px; \n";
      cssString += "  position: absolute; \n";
      if (cobject.type == "area type") {
        cssString += "  width: " + cobject.properties.width + "px; \n";
        cssString += "  height: " + cobject.properties.height + "px; \n";
      }
      cssString += "  left: " + cobject.properties.left + "px; \n";
      cssString += "  top: " + cobject.properties.top + "px; \n";
      cssString += "  font-variation-settings:\n";
      if (cobject.properties.isVariableFont) {
        var axes = cobject.properties.variableOptions.axes;
        for (var j = 0; j < axes.length; j++) {
          if (j < axes.length - 1) {
            cssString += "    '" + axes[j].tag + "' " + axes[j].defaultValue + ",\n";
          } else {
            cssString += "    '" + axes[j].tag + "' " + axes[j].defaultValue + "; \n";
          }
        }
      }
      cssString += "}\n";
      return cssString;
    },
    highLightCanvasObject: function (cobject) {
      document.getElementById(cobject.id).classList.add('highlight');
    },
    unHighLightCanvasObject: function (cobject) {
      document.getElementById(cobject.id).classList.remove('highlight');
    },
    captureKeydown: function (event) {
      // this is to capture bubbling keydown event of Backspace or Delete in editing mode
      event.stopPropagation();
      event.target.removeEventListener('keydown', this.captureKeydown);
    }
  }
})