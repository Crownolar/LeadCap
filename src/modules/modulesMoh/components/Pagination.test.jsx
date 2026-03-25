import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect } from "vitest";
import { Pagination } from "./Pagination";

// mock useTheme
vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({
    border: "border-gray-200",
  }),
}));

describe("Pagination", () => {
  test("renders current page text", () => {
    render(<Pagination page={2} setPage={vi.fn()} totalPages={5} />);

    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  test("renders all page numbers when totalPages is 7 or less", () => {
    render(<Pagination page={1} setPage={vi.fn()} totalPages={5} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("renders ellipsis when totalPages is greater than 7", () => {
    render(<Pagination page={1} setPage={vi.fn()} totalPages={10} />);

    expect(screen.getByText("…")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("calls setPage with previous page when previous is clicked", () => {
    const setPage = vi.fn();
    render(<Pagination page={3} setPage={setPage} totalPages={5} />);

    fireEvent.click(screen.getByText("‹"));
    expect(setPage).toHaveBeenCalledWith(2);
  });

  test("does not go below page 1", () => {
    const setPage = vi.fn();
    render(<Pagination page={1} setPage={setPage} totalPages={5} />);

    fireEvent.click(screen.getByText("‹"));
    expect(setPage).not.toHaveBeenCalled();
  });

  test("calls setPage with next page when next is clicked", () => {
    const setPage = vi.fn();
    render(<Pagination page={3} setPage={setPage} totalPages={5} />);

    fireEvent.click(screen.getByText("›"));
    expect(setPage).toHaveBeenCalledWith(4);
  });

  test("does not go beyond totalPages", () => {
    const setPage = vi.fn();
    render(<Pagination page={5} setPage={setPage} totalPages={5} />);

    fireEvent.click(screen.getByText("›"));
    expect(setPage).not.toHaveBeenCalled();
  });

  test("calls setPage when a page number is clicked", () => {
    const setPage = vi.fn();
    render(<Pagination page={1} setPage={setPage} totalPages={5} />);

    fireEvent.click(screen.getByText("3"));
    expect(setPage).toHaveBeenCalledWith(3);
  });
});