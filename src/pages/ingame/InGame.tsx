import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { UiPanel } from "../../contents/ui/UiPanel";
import { GameMain } from "../../core/engine/GameMain";

export const InGame = () => {
  const container = useRef<HTMLDivElement>(null);
  const world = useRef<GameMain>();

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (container.current && container.current.children.length > 0) return;
      world.current = new GameMain();
    }

    return () => {
      //world.current?.Dispose();
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Hausle</title>
      </Helmet>
      <div
        id="container"
        ref={container}
        className="absolute w-full h-full top-0 left-0"
      ></div>
      <UiPanel />
    </>
  );
};
