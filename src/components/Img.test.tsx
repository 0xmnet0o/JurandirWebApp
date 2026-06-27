import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Img } from "./Img";

describe("<Img>", () => {
  it("mostra o emoji de fallback quando não há src", () => {
    const { container } = render(<Img emoji="🍹" />);
    expect(screen.getByText("🍹")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("renderiza a imagem quando há src", () => {
    // O <img> é decorativo (alt=""), então consultamos pelo DOM em vez de getByRole.
    const { container } = render(<Img src="https://example.com/foto.jpg" emoji="🍹" />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://example.com/foto.jpg");
  });
});
