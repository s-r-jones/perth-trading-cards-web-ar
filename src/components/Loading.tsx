import { useState } from "react";

interface Props {
  onStartButtonClick: () => void;
  camKitLoaded: boolean;
}

export const Loading = ({ onStartButtonClick, camKitLoaded }: Props) => {
  const [view, setView] = useState(0);
  return (
    <div className="loading">
      <section>
        <h2>How to use AR</h2>
        <ol type="1">
          <li>
            <span>1</span>
            <img src="magnifying-glass.png" />
            <p>Allow permissions & Aim your phone at the ground</p>
          </li>

          <li>
            <span>2</span>
            <img src="camera.png" />
            <p>Aim your camera at the trading card</p>
          </li>
          <li>
            <span>3</span>
            <img src="tap.png" />
            <p>Tap the trading card to collect!</p>
          </li>
        </ol>
        <br />

        <button
          disabled={!camKitLoaded}
          onClick={() => {
            if (view === 1) {
              onStartButtonClick();
              return;
            }

            setView(1);
          }}
        >
          `{view === 1 ? "Start" : "Next"}`
        </button>
      </section>
    </div>
  );
};
