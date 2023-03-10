export const DefaultUi = () => {
  return (
    <div className="absolute bottom-4 left-4">
      <div className="flex flex-col items-center w-32">
        <div className="text-white p-2">이동</div>
        <div className="mb-2 text-center">
          <kbd className="keyboard-button">W</kbd>
        </div>
        <div className="flex flex-row text-center mb-2 gap-1">
          <kbd className="keyboard-button">A</kbd>
          <kbd className="keyboard-button">S</kbd>
          <kbd className="keyboard-button">D</kbd>
        </div>
        <div className="text-white p-2">점프</div>
        <div className="text-center mb-2">
          <kbd className="keyboard-button">Space</kbd>
        </div>
        <div className="text-white p-2">시야 조정</div>
        <div className="flex flex-row mb-2 gap-1">
          <kbd className="keyboard-button">Click</kbd>
          <span className="text-white">+</span>
          <kbd className="keyboard-button">Move</kbd>
        </div>
        <div className="text-white p-2">채팅</div>
        <div className="flex flex-row gap-1">
          <kbd className="keyboard-button">ESC</kbd>
          <span className="text-white">+</span>
          <kbd className="keyboard-button">Input</kbd>
        </div>
      </div>
    </div>
  );
};
