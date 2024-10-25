import React from "react";
import s from "./style.module.css";

const Button = ({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) => {
  return (
    <button
      {...props}
      className={[s.button, className].filter(Boolean).join(" ")}
    />
  );
};

export default Button;
