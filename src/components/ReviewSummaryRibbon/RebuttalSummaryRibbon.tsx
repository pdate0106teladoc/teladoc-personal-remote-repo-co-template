import { useState } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import useReviewStore from "@/store/useReviewStore";
import ReviewSummaryModal from "./ReviewSummaryModal";
import "./ReviewSummaryRibbon.scss";

/** Shown to the reviewer while a rebuttal is pending or in progress. */
const RebuttalSummaryRibbon: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const latestRebuttalSummary = useReviewStore((s) => s.latestRebuttalSummary);

  if (!latestRebuttalSummary) return null;

  return (
    <>
      <div
        className="validate-ribbon validate-idle"
        data-testid="rebuttal-summary-ribbon"
      >
        <div className="validate-ribbon prompt review-summary-ribbon">
          <div className="message">
            <FaTriangleExclamation />
            <strong>{latestRebuttalSummary.message}</strong>
            <button
              type="button"
              className="view-details"
              onClick={() => setShowModal(true)}
            >
              View rebuttal
            </button>
          </div>
        </div>
      </div>
      <ReviewSummaryModal
        show={showModal}
        variant="rebuttal"
        summary={latestRebuttalSummary}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default RebuttalSummaryRibbon;
