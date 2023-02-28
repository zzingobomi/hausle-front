import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { UiPanel } from "../../contents/ui/UiPanel";
import { GameMain } from "../../core/engine/GameMain";
import { useMe } from "../../hooks/useMe";

export const InGame = () => {
  const { data: userData } = useMe();
  const location = useLocation();
  const container = useRef<HTMLDivElement>(null);
  const world = useRef<GameMain>();

  useEffect(() => {
    const nickname = location.state?.nickname ?? userData?.me.nickname;
    let isMounted = true;
    if (nickname && isMounted) {
      if (container.current && container.current.children.length > 0) return;
      world.current = new GameMain(nickname);
    }

    return () => {
      world.current?.Dispose();
      isMounted = false;
    };
  }, [location.state, userData]);

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
