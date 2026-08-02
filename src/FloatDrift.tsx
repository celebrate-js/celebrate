import { clsx } from "./clsx";

export interface FloatDriftProps {
  /**
   * ふわふわ漂わせる文字（絵文字ではなく記号・テキストを想定）。
   * 省略時は CSS で描いた雲形（絵文字ではない）を漂わせる。
   */
  glyph?: string;
  className?: string;
}

/** 左右にゆらゆら揺れながら、ゆっくり浮かび上がって消える（⑤やわらかいナラティブ表現）。 */
export function FloatDrift({ glyph, className }: FloatDriftProps) {
  return (
    <span aria-hidden="true" data-float-drift={glyph ?? "cloud"} className={clsx("celebrate-float", className)}>
      {glyph ?? (
        <span className="celebrate-float-cloud">
          <span className="celebrate-float-puff celebrate-float-puff--1" />
          <span className="celebrate-float-puff celebrate-float-puff--2" />
          <span className="celebrate-float-puff celebrate-float-puff--3" />
          <span className="celebrate-float-puff celebrate-float-puff--4" />
        </span>
      )}
    </span>
  );
}
