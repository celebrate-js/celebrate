import { useCallback, useEffect, useRef } from "react";
import { activateContainerModifier } from "./containerModifier";

export interface ContainerModifierSpec {
  /** <html> に付け外しする class 名。CSS 側の @keyframes をこの class から参照する。 */
  className: string;
  durationMs: number;
}

/**
 * 構造テンプレート（軸A=container-modifier）をcelebrate()を経由せず直接使うためのフック。
 * shake/hitstop/vignette は自分のDOMを持たず既存の表示に作用するだけなので、
 * コンポーネントではなくフックとして提供する（celebrate()経由のshake/hitstop/vignetteも
 * 内部的には同じ activateContainerModifier を使っており、二重実装ではない）。
 *
 *   const trigger = useContainerModifier();
 *   trigger({ className: "my-shake", durationMs: 400 });
 */
export function useContainerModifier(): (spec: ContainerModifierSpec) => void {
  const releasers = useRef(new Set<() => void>());

  useEffect(() => {
    const set = releasers.current;
    return () => {
      for (const release of set) release();
      set.clear();
    };
  }, []);

  return useCallback((spec: ContainerModifierSpec) => {
    const release = activateContainerModifier(spec.className, spec.durationMs);
    releasers.current.add(release);
  }, []);
}
