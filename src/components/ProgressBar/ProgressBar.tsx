import React from "react";
import "./ProgressBar.scss";

type ProgressBarProps = {
    progress: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
        <div className="progress-container">
            <div className="progress-bar-wrapper">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-text">{`Uploading... ${progress}%`}</span>
        </div>
    );
};

export default ProgressBar;
