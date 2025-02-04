import React, { useState } from "react";
import { Tooltip } from "@mui/material";
import { MdCopyAll } from "react-icons/md";

const CopyTextWithTooltip = ({ textToCopy }) => {
  const [tooltipText, setTooltipText] = useState("Copy");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setTooltipText("Copied!");
      setTimeout(() => setTooltipText("Copy"), 1500); // Revert to "Copy" after 1.5 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Tooltip
      title={tooltipText}
      arrow
      placement="top"
      sx={{
        fontFamily: "Inter",
      }}
    >
      <span>
        <MdCopyAll
          size={18}
          style={{ cursor: "pointer" }}
          onClick={handleCopy}
        />
      </span>
    </Tooltip>
  );
};

export default CopyTextWithTooltip;
