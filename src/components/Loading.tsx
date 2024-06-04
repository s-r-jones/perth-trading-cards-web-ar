import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onStartButtonClick: () => void;
  camKitLoaded: boolean;
}

export const Loading = ({ onStartButtonClick, camKitLoaded }: Props) => {
  const [view, setView] = useState(0);
  return (
    <div className="loading">
      <AnimatePresence>
        <motion.div
          className="container"
          key={0}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AnimatePresence mode="wait">
            {view === 0 && (
              <motion.section
                key={0}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2>How to use AR</h2>

                <ol type="1">
                  <li>
                    <span>1</span>
                    <img src="magnifying-glass.png" />
                    <p>Allow permissions & Aim your phone at a flat surface</p>
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
              </motion.section>
            )}
            {view === 1 && (
              <motion.section
                key={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2>Prizes</h2>
                <h3>Collect cards to win these prizes</h3>

                <ol
                  type="1"
                  className="prize-list"
                >
                  <li>
                    <img src="voucher-10.png" />
                    <div>
                      <h4>$10 Gift Voucher</h4>
                      <span>5 players</span>
                    </div>
                  </li>

                  <li>
                    <img src="voucher-25.png" />
                    <div>
                      <h4>$25 Gift Voucher</h4>
                      <span>15 players</span>
                    </div>
                  </li>
                  <li>
                    <img src="jersey.png" />
                    <div>
                      <h4>2024 Perth Redbacks Signed Singlet</h4>
                      <span>30 players</span>
                    </div>
                  </li>
                  <li>
                    <img src="training.png" />
                    <div>
                      <h4>1 Hour Player Training Session</h4>
                      <span>grand prize draw</span>
                    </div>
                  </li>
                </ol>
              </motion.section>
            )}

            <motion.button
              key={2}
              disabled={!camKitLoaded && view === 1}
              onClick={() => {
                if (view === 1) {
                  onStartButtonClick();
                  return;
                }

                setView(1);
              }}
            >
              {view === 1 ? "Start" : "Next"}
            </motion.button>
            <div className="loading-instruction-step">
              <span className={view === 0 ? "active" : ""} />
              <span className={view === 1 ? "active" : ""} />
            </div>
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
