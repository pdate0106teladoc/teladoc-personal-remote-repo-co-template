import { useState } from "react";
import { FaCircleXmark } from "react-icons/fa6";
import useReviewStore from "@/store/useReviewStore";
import ReviewSummaryModal from "./ReviewSummaryModal";
import "./ReviewSummaryRibbon.scss";

const ReviewSummaryRibbon: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const latestReviewSummary = useReviewStore((s) => s.latestReviewSummary);
  const rejectedUpdateCount = useReviewStore((s) => s.rejectedUpdateCount);

  if (!latestReviewSummary) return null;

  const updateLabel = rejectedUpdateCount === 1 ? "update" : "updates";

  return (
    <>
      <div className="validate-ribbon validate-idle" data-testid="review-summary-ribbon">
        <div className="validate-ribbon prompt review-summary-ribbon">
          <div className="message">
            <FaCircleXmark />
            <strong>
              {rejectedUpdateCount} {updateLabel} rejected by reviewer.
            </strong>
            <button
              type="button"
              className="view-details"
              onClick={() => setShowModal(true)}
            >
              View review summary
            </button>
          </div>
        </div>
      </div>
      <ReviewSummaryModal
        show={showModal}
        summary={latestReviewSummary}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ReviewSummaryRibbon;
