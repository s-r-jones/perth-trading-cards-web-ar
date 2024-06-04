import { useState } from "react";

interface Props {
  onStartButtonClick: () => void;
  camKitLoaded: boolean;
}

export const Loading = ({ onStartButtonClick, camKitLoaded }: Props) => {
  const [view, setView] = useState(0);
  return (
    <div className="loading">
      <div className="container">
        {view === 0 && (
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
          </section>
        )}
        {view === 1 && (
          <section>
            <h2>Prizes</h2>
            <h3>Collect cards to win these prices</h3>

            <ol
              type="1"
              className="prize-list"
            >
              <li>
                <img src="voucher-10.png" />
                <h4>$10 Gift Voucher</h4>
                <span>5 players</span>
              </li>

              <li>
                <img src="voucher-25.png" />
                <h4>$25 Gift Voucher</h4>
                <span>15 players</span>
              </li>
              <li>
                <img src="jersey.png" />
                <h4>2024 Perth Redbacks Signed Singlet</h4>
                <span>30 players</span>
              </li>
              <li>
                <img src="training.png" />
                <h4>1 Hour Player Training Session</h4>
                <span>grand prize draw</span>
              </li>
            </ol>
          </section>
        )}
        <button
          //disabled={!camKitLoaded}
          onClick={() => {
            if (view === 1) {
              onStartButtonClick();
              return;
            }

            setView(1);
          }}
        >
          {view === 1 ? "Start" : "Next"}
        </button>
        <div className="loading-instruction-step">
          <span className={view === 0 ? "active" : ""} />
          <span className={view === 1 ? "active" : ""} />
        </div>
      </div>
    </div>
  );
};
