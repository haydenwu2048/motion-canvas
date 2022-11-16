import {Gradient, Pattern} from '../partials';
import {property} from '../decorators';
import {Signal} from '@motion-canvas/core/lib/utils';
import {Rect} from '@motion-canvas/core/lib/types';
import {Layout, LayoutProps} from './Layout';

export type CanvasStyle = null | string | Gradient | Pattern;

export interface ShapeProps extends LayoutProps {
  fill?: CanvasStyle;
  stroke?: CanvasStyle;
  strokeFirst?: boolean;
  lineWidth?: number;
  lineJoin?: CanvasLineJoin;
  lineCap?: CanvasLineCap;
  lineDash?: number[];
  lineDashOffset?: number;
}

export abstract class Shape extends Layout {
  @property(null)
  public declare readonly fill: Signal<CanvasStyle, this>;
  @property(null)
  public declare readonly stroke: Signal<CanvasStyle, this>;
  @property(false)
  public declare readonly strokeFirst: Signal<boolean, this>;
  @property(0)
  public declare readonly lineWidth: Signal<number, this>;
  @property('miter')
  public declare readonly lineJoin: Signal<CanvasLineJoin, this>;
  @property('butt')
  public declare readonly lineCap: Signal<CanvasLineCap, this>;
  @property([])
  public declare readonly lineDash: Signal<number[], this>;
  @property(0)
  public declare readonly lineDashOffset: Signal<number, this>;

  public constructor(props: ShapeProps) {
    super(props);
  }

  protected parseCanvasStyle(
    style: CanvasStyle,
    context: CanvasRenderingContext2D,
  ): string | CanvasGradient | CanvasPattern {
    if (style === null) {
      return '';
    }
    if (typeof style === 'string') {
      return style;
    }
    if (style instanceof Gradient) {
      return style.canvasGradient(context);
    }
    return style.canvasPattern(context) ?? '';
  }

  protected applyStyle(context: CanvasRenderingContext2D) {
    context.fillStyle = this.parseCanvasStyle(this.fill(), context);
    context.strokeStyle = this.parseCanvasStyle(this.stroke(), context);
    context.lineWidth = this.lineWidth();
    context.lineJoin = this.lineJoin();
    context.lineCap = this.lineCap();
    context.setLineDash(this.lineDash());
    context.lineDashOffset = this.lineDashOffset();
  }

  protected override draw(context: CanvasRenderingContext2D) {
    const path = this.getPath();
    context.save();
    this.applyStyle(context);
    if (this.lineWidth() <= 0) {
      context.fill(path);
    } else if (this.strokeFirst()) {
      context.stroke(path);
      context.fill(path);
    } else {
      context.fill(path);
      context.stroke(path);
    }

    context.restore();

    super.draw(context);
  }

  protected override getCacheRect(): Rect {
    return super.getCacheRect().expand(this.lineWidth() / 2);
  }

  protected getPath(): Path2D {
    return new Path2D();
  }
}