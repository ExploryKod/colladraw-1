"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Shape_1 = __importDefault(require("./canvas_elements/Shape"));
const CanvasElementType_1 = require("./enums/CanvasElementType");
const Rectangle_1 = __importDefault(require("./canvas_elements/Rectangle"));
const Ellipse_1 = __importDefault(require("./canvas_elements/Ellipse"));
const Triangle_1 = __importDefault(require("./canvas_elements/Triangle"));
const AnchorConditions_1 = __importDefault(require("./utils/AnchorConditions"));
const kebabize_1 = __importDefault(require("./utils/kebabize"));
const Polygon_1 = __importDefault(require("./canvas_elements/Polygon"));
const CanvasEvents_1 = __importDefault(require("./events/CanvasEvents"));
const CanvasText_1 = __importDefault(require("./canvas_elements/CanvasText"));
const Line_1 = __importDefault(require("./canvas_elements/Line"));
const ResizeFunctions_1 = __importDefault(require("./utils/ResizeFunctions"));
class Colladraw {
    constructor(canvas) {
        this.state = {
            variables: {},
        };
        this.onClickLocker = false;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.elements = [];
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('click', this.onClick.bind(this));
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initGrid();
    }
    initGrid() {
        this.grid = [];
        for (let i = 0; i < this.canvas.width; i++) {
            this.grid.push([]);
            for (let j = 0; j < this.canvas.height; j++) {
                this.grid[i].push(null);
            }
        }
    }
    draw() {
        var _a;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.elements.concat(this.state.drawing && (this.state.drawing.shape || this.state.drawing.line) ? (_a = this.state.drawing.shape) !== null && _a !== void 0 ? _a : this.state.drawing.line : []).forEach(element => {
            if (element instanceof Shape_1.default) {
                if (this.state.variables.fillColor) {
                    element.fillColor = this.state.variables.fillColor;
                }
                if (this.state.variables.strokeColor) {
                    element.strokeColor = this.state.variables.strokeColor;
                }
                if (this.state.variables.strokeWidth) {
                    element.strokeWidth = this.state.variables.strokeWidth;
                }
            }
            else if (element instanceof CanvasText_1.default) {
                if (this.state.variables.fillColor) {
                    element.color = this.state.variables.fillColor;
                }
                if (this.state.variables.font) {
                    element.font = this.state.variables.font;
                }
            }
            element.draw(this.context, this.grid);
        });
    }
    addElement(element) {
        this.canvas.dispatchEvent(CanvasEvents_1.default.CanvasElementCreated(element));
        this.elements.push(element);
    }
    onMouseDown(event) {
        var _a, _b, _c;
        const clickedShape = this.grid[event.offsetY][event.offsetX];
        if (!clickedShape && !this.state.selectedElement) {
            this.onClickLocker = true;
            const x = event.clientX - this.canvas.offsetLeft;
            const y = event.clientY - this.canvas.offsetTop;
            // const toolType: CanvasElementType = CanvasElementType.TEXT;
            const toolType = (_a = this.state.variables.toolType) !== null && _a !== void 0 ? _a : CanvasElementType_1.CanvasElementType.LINE;
            this.state = Object.assign(Object.assign({}, this.state), { variables: { toolType }, 
                // @ts-ignore
                typing: toolType === CanvasElementType_1.CanvasElementType.TEXT ? Object.assign(Object.assign({}, this.state.typing), { text: 'Hello World', font: '20px Arial' }) : false, 
                // @ts-ignore
                drawing: toolType != CanvasElementType_1.CanvasElementType.TEXT ? Object.assign(Object.assign({}, this.state.drawing), { color: '#000', strokeWidth: 1, startPoint: {
                        x: event.offsetX,
                        y: event.offsetY,
                    } }) : false });
            if (this.state.variables.toolType) {
                let element;
                switch (this.state.variables.toolType) {
                    case CanvasElementType_1.CanvasElementType.RECTANGLE:
                        element = new Rectangle_1.default(x, y, 0, 0);
                        break;
                    case CanvasElementType_1.CanvasElementType.ELLIPSE:
                        element = new Ellipse_1.default(x, y, 0, 0);
                        break;
                    case CanvasElementType_1.CanvasElementType.TRIANGLE:
                        element = new Triangle_1.default(x, y, 0, 0);
                        break;
                    case CanvasElementType_1.CanvasElementType.LINE:
                        element = new Line_1.default(x, y, 0, 0);
                        break;
                    case CanvasElementType_1.CanvasElementType.TEXT:
                        element = new CanvasText_1.default('Hello world', x, y, (_b = this.state.variables.font) !== null && _b !== void 0 ? _b : '12px Arial');
                        element.y += parseInt((_c = element.font.match(/\d+/)[0]) !== null && _c !== void 0 ? _c : '20');
                        break;
                    default:
                        element = new Rectangle_1.default(x, y, 0, 0);
                        break;
                }
                if (element instanceof Shape_1.default || element instanceof Line_1.default) {
                    if (element instanceof Shape_1.default) {
                        element.strokeColor = '#000';
                    }
                    else if (element instanceof Line_1.default) {
                        element.color = '#000';
                    }
                    this.state = Object.assign(Object.assign({}, this.state), { drawing: Object.assign(Object.assign({}, this.state.drawing), { shape: element instanceof Shape_1.default ? element : undefined, line: element instanceof Line_1.default ? element : undefined }) });
                }
                else if (element instanceof CanvasText_1.default) {
                    element.color = '#000';
                    this.state = Object.assign(Object.assign({}, this.state), { typing: Object.assign(Object.assign({}, this.state.typing), { text: element.text, textElement: element }) });
                    this.draw();
                }
            }
        }
        else {
            const gripMargin = 10;
            let anchorFound = false;
            Object.entries(AnchorConditions_1.default).forEach(([anchorConditionName, anchorCondition]) => {
                if (!anchorFound && !(this.state.selectedElement instanceof CanvasText_1.default) && anchorCondition(this.grid, gripMargin, event)) {
                    this.state = Object.assign(Object.assign({}, this.state), { selectionTransform: {
                            resize: {
                                grip: (0, kebabize_1.default)(anchorConditionName),
                            }
                        } });
                    anchorFound = true;
                }
            });
            if (!anchorFound && this.grid[event.offsetY][event.offsetX] === this.state.selectedElement) {
                this.state = Object.assign(Object.assign({}, this.state), { selectionTransform: {
                        translate: {
                            grip: {
                                x: event.offsetX - this.state.selectedElement.x,
                                y: event.offsetY - this.state.selectedElement.y,
                            },
                        },
                    } });
            }
        }
    }
    onMouseMove(event) {
        if (!this.state.selectedElement) {
            if (this.state.drawing) {
                const x = event.clientX - this.canvas.offsetLeft;
                const y = event.clientY - this.canvas.offsetTop;
                this.state = Object.assign(Object.assign({}, this.state), { drawing: Object.assign(Object.assign({}, this.state.drawing), { endPoint: { x, y } }) });
                if (this.state.drawing && this.state.drawing.shape) {
                    this.state.drawing.shape.width = this.state.drawing.endPoint.x - this.state.drawing.startPoint.x;
                    this.state.drawing.shape.height = this.state.drawing.endPoint.y - this.state.drawing.startPoint.y;
                    this.canvas.dispatchEvent(CanvasEvents_1.default.CanvasElementMoved(this.state.drawing.shape, event));
                    //   if (this.state.drawing.shape.width < 0) {
                    //     this.state.drawing.shape.width = Math.abs(this.state.drawing.shape.width);
                    //     [this.state.drawing.startPoint.x, this.state.drawing.endPoint.x] = [this.state.drawing.endPoint.x, this.state.drawing.startPoint.x];
                    //     this.state.drawing.shape.x = this.state.drawing.startPoint.x;
                    //   }
                    //
                    //   if (this.state.drawing.shape.height < 0) {
                    //     this.state.drawing.shape.height = Math.abs(this.state.drawing.shape.height);
                    //     [this.state.drawing.startPoint.y, this.state.drawing.endPoint.y] = [this.state.drawing.endPoint.y, this.state.drawing.startPoint.y];
                    //     this.state.drawing.shape.y = this.state.drawing.startPoint.y;
                    //   }
                }
                else if (this.state.drawing && this.state.drawing.line) {
                    this.state.drawing.line.endX = this.state.drawing.endPoint.x;
                    this.state.drawing.line.endY = this.state.drawing.endPoint.y;
                    this.canvas.dispatchEvent(CanvasEvents_1.default.CanvasElementMoved(this.state.drawing.line, event));
                }
            }
        }
        else if (this.state.selectionTransform) {
            if (this.state.selectionTransform.translate) {
                const oldX = this.state.selectedElement.x;
                const oldY = this.state.selectedElement.y;
                this.state.selectedElement.x = event.offsetX - this.state.selectionTransform.translate.grip.x;
                this.state.selectedElement.y = event.offsetY - this.state.selectionTransform.translate.grip.y;
                if (this.state.selectedElement instanceof Line_1.default) {
                    this.state.selectedElement.endX = this.state.selectedElement.endX + (this.state.selectedElement.x - oldX);
                    this.state.selectedElement.endY = this.state.selectedElement.endY + (this.state.selectedElement.y - oldY);
                }
                this.canvas.dispatchEvent(CanvasEvents_1.default.CanvasElementMoved(this.state.selectedElement, event));
                this.canvas.dispatchEvent(CanvasEvents_1.default.CanvasElementTransformed(this.state.selectedElement, {
                    type: 'translate',
                    x: this.state.selectionTransform.translate.grip.x,
                    y: this.state.selectionTransform.translate.grip.y,
                    oldX,
                    oldY,
                }));
            }
            else if (this.state.selectionTransform.resize) {
                const oldX = this.state.selectedElement.x;
                const oldY = this.state.selectedElement.y;
                const oldWidth = this.state.selectedElement.width;
                const oldHeight = this.state.selectedElement.height;
                if (this.state.selectionTransform.resize.grip === 'top-left') {
                    ResizeFunctions_1.default.topLeft(this.state, event);
                }
                else if (this.state.selectionTransform.resize.grip === 'top-right') {
                    ResizeFunctions_1.default.topRight(this.state, event);
                }
                else if (this.state.selectionTransform.resize.grip === 'bottom-left') {
                    ResizeFunctions_1.default.bottomLeft(this.state, event);
                }
                else if (this.state.selectionTransform.resize.grip === 'bottom-right') {
                    ResizeFunctions_1.default.bottomRight(this.state, event);
                }
                else if (this.state.selectionTransform.resize.grip === 'top') {
                    ResizeFunctions_1.default.top(this.state, event);
                }
                else if (this.state.selectionTransform.resize.grip === 'right') {
                    ResizeFunctions_1.default.right(this.state, event);
                }
                else if (this.state.selectionTransform.resize.grip === 'bottom') {
                    ResizeFunctions_1.default.bottom(this.state, event);
                }
                else if (this.state.selectionTransform.resize.grip === 'left') {
                    ResizeFunctions_1.default.left(this.state, event);
                }
                this.canvas.dispatchEvent((CanvasEvents_1.default.CanvasElementTransformed(this.state.selectedElement, {
                    type: 'resize',
                    x: this.state.selectedElement.x,
                    y: this.state.selectedElement.y,
                    width: this.state.selectedElement.width,
                    height: this.state.selectedElement.height,
                    oldX,
                    oldY,
                    oldWidth,
                    oldHeight,
                })));
            }
        }
        // if (this.state.selectionTransform || this.state.selectedShape || this.state.typing || this.state.typing) {
        if (Object.values(this.state).some(value => value)) {
            this.draw();
        }
    }
    onMouseUp(_event) {
        if (this.state.drawing && this.state.drawing.shape && this.state.drawing.shape.width !== 0 && this.state.drawing.shape.height !== 0) {
            this.addElement(this.state.drawing.shape);
        }
        else if (this.state.drawing && this.state.drawing.line) {
            this.addElement(this.state.drawing.line);
        }
        else if (this.state.typing) {
            this.addElement(this.state.typing.textElement);
        }
        else if (this.state.selectionTransform) {
            this.initGrid();
            this.elements.forEach(shape => {
                shape.generateGrid(this.grid);
            });
        }
        this.state.drawing = false;
        this.state.typing = false;
        this.state.selectionTransform = false;
        this.onClickLocker = false;
    }
    onClick(event) {
        const clickedElement = this.grid[event.offsetY][event.offsetX];
        if (clickedElement) {
            this.canvas.dispatchEvent(CanvasEvents_1.default.CanvasElementClicked(clickedElement, event));
        }
        if (!this.state.drawing && !this.state.typing && !this.onClickLocker) {
            if (clickedElement && (!this.state.selectedElement || this.state.selectedElement == clickedElement)) {
                clickedElement.select();
                this.canvas.dispatchEvent(CanvasEvents_1.default.CanvasElementSelected(clickedElement));
                this.state.selectedElement = clickedElement;
                this.draw();
            }
            else {
                if (this.state.selectedElement) {
                    this.state.selectedElement.deselect();
                    this.canvas.dispatchEvent(CanvasEvents_1.default.CanvasElementDeselected(this.state.selectedElement));
                }
                this.state.selectedElement = false;
                this.draw();
            }
        }
    }
    changeFillColor(color) {
        this.state.variables.fillColor = color;
    }
    changeStrokeColor(color) {
        this.state.variables.strokeColor = color;
    }
    changeStrokeWidth(width) {
        this.state.variables.strokeWidth = width;
    }
    changeToolType(type) {
        this.state.variables.toolType = type;
    }
    toJSON() {
        return {
            timestamp: new Date().getTime(),
            data: {
                shapes: this.elements.map(shape => shape.toJSON()),
            }
        };
    }
    load(json) {
        this.elements = json.data.shapes.map(shape => {
            if (shape.type === 'Rectangle') {
                return Rectangle_1.default.fromJSON(shape);
            }
            else if (shape.type === 'Ellipse') {
                return Ellipse_1.default.fromJSON(shape);
            }
            else if (shape.type === 'Triangle') {
                return Triangle_1.default.fromJSON(shape);
            }
            else if (shape.type.match(/Polygon\[\d+]/)) {
                return Polygon_1.default.fromJSON(shape);
            }
            else if (shape.type === 'Text') {
                return CanvasText_1.default.fromJSON(shape);
            }
            return Shape_1.default.fromJSON(shape);
        });
        this.draw();
    }
    savePNG(name) {
        const image = this.canvas.toDataURL();
        const aDownloadLink = document.createElement('a');
        aDownloadLink.download = name !== null && name !== void 0 ? name : 'canvas.png';
        aDownloadLink.href = image;
        aDownloadLink.click();
    }
}
exports.default = Colladraw;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sbGFkcmF3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9Db2xsYWRyYXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvRUFBNEM7QUFDNUMsaUVBQTREO0FBQzVELDRFQUFvRDtBQUVwRCx3RUFBZ0Q7QUFDaEQsMEVBQWtEO0FBRWxELGdGQUF3RDtBQUN4RCxnRUFBd0M7QUFFeEMsd0VBQWdEO0FBQ2hELHlFQUFpRDtBQUVqRCw4RUFBc0Q7QUFDdEQsa0VBQTBDO0FBQzFDLDhFQUFzRDtBQUV0RCxNQUFxQixTQUFTO0lBVTVCLFlBQVksTUFBeUI7UUFMN0IsVUFBSyxHQUFVO1lBQ3JCLFNBQVMsRUFBRSxFQUFFO1NBQ2QsQ0FBQztRQUNNLGtCQUFhLEdBQVksS0FBSyxDQUFDO1FBR3JDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVuQixJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMs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