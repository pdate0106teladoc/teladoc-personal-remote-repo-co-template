import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUpload from "./FileUpload";
import { waitFor } from "@testing-library/react";
import { ApiReturnedFile } from "@/types/edit";

vi.mock("@/assets/add-icon.svg", () => ({
    default: "add-icon.svg",
}));

vi.mock("@/assets/close_icon.svg", () => ({
    default: "close-icon.svg",
}));

vi.mock("@/api/apiService", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
    },
}));

import api from "@/api/apiService";

// Mock URL.createObjectURL since JSDOM doesn't implement it
global.URL.createObjectURL = vi.fn((file) => `blob:${file.name}`);

describe("FileUpload", () => {
    const file1 = new File(["file1"], "file1.txt", { type: "text/plain", lastModified: 1 });
    const file2 = new File(["file2"], "file2.txt", { type: "text/plain", lastModified: 2 });

    const uploadedFile1: ApiReturnedFile = {
        apiReturnedFileName: "file1.txt",
        size: file1.size,
        url: `blob:file1.txt`,
        status: "success"
    };

    const uploadedFile2: ApiReturnedFile = {
        apiReturnedFileName: "file2.txt",
        size: file2.size,
        url: `blob:file2.txt`,
        status: "success"
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders choose file button and label", () => {
        render(<FileUpload onUpload={vi.fn()} />);
        expect(screen.getByText("File (Implementation Acknowledgment Form, etc.)")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /choose file/i })).toBeInTheDocument();
    });

    it("opens file picker on button click", () => {
        render(<FileUpload onUpload={vi.fn()} />);
        const button = screen.getByRole("button", { name: /choose file/i });
        const input = screen.getByTestId("file-input") as HTMLInputElement;

        const clickSpy = vi.spyOn(input, "click");

        fireEvent.click(button);
        expect(clickSpy).toHaveBeenCalled();
    });

    it("adds files when selected", async () => {
        const onUpload = vi.fn();
        vi.mocked(api.post).mockResolvedValue({
            successes: [
                { filename: "file1.txt", url: "blob:file1.txt", sizeBytes: file1.size },
                { filename: "file2.txt", url: "blob:file2.txt", sizeBytes: file2.size },
            ],
            failures: [],
        });

        render(<FileUpload onUpload={onUpload} />);

        const input = screen.getByTestId("file-input") as HTMLInputElement;

        fireEvent.change(input, {
            target: { files: [file1, file2] },
        });

        await waitFor(() => {
            expect(onUpload).toHaveBeenCalledTimes(1);
        });

        expect(onUpload).toHaveBeenCalledWith([
            `file1.txt:${file1.size}`,
            `file2.txt:${file2.size}`,
        ]);

        // Files are listed in UI
        expect(screen.getByText("file1.txt")).toBeInTheDocument();
        expect(screen.getByText("file2.txt")).toBeInTheDocument();
    });

    test("removes a file after selecting it", async () => {
        const onUpload = vi.fn();
        const file1 = new File(["data"], "file1.txt", { type: "text/plain" });
        const file2 = new File(["data"], "file2.txt", { type: "text/plain" });

        vi.mocked(api.post).mockResolvedValue({
            successes: [
                { filename: "file1.txt", url: "blob:file1.txt", sizeBytes: file1.size },
                { filename: "file2.txt", url: "blob:file2.txt", sizeBytes: file2.size },
            ],
            failures: [],
        });
        vi.mocked(api.delete).mockResolvedValue({});

        render(<FileUpload onUpload={onUpload} />);

        const input = screen.getByTestId("file-input");

        fireEvent.change(input, {
            target: { files: [file1, file2] },
        });

        await waitFor(() => {
            expect(onUpload).toHaveBeenCalledTimes(1);
        });

        // Remove first file
        const closeButtons = screen.getAllByRole("button", { name: /close/i });
        await userEvent.click(closeButtons[0]);

        await waitFor(() => {
            expect(onUpload).toHaveBeenCalledTimes(2);
        });

        expect(onUpload).toHaveBeenLastCalledWith(
            expect.arrayContaining([
                expect.stringContaining("file2.txt"),
            ])
        );
    });


    test("calls onUpload when files are selected", async () => {
        const onUpload = vi.fn();
        const file = new File(["dummy content"], "file2.txt", { type: "text/plain" });

        vi.mocked(api.post).mockResolvedValue({
            successes: [
                { filename: "file2.txt", url: "blob:file2.txt", sizeBytes: file.size },
            ],
            failures: [],
        });

        render(<FileUpload onUpload={onUpload} />);

        const fileInput = screen.getByTestId("file-input");

        fireEvent.change(fileInput, {
            target: { files: [file] },
        });

        await waitFor(() => {
            expect(onUpload).toHaveBeenCalledTimes(1);
        });

        expect(onUpload).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.stringContaining("file2.txt"),
            ])
        );
    });


    it("updates uploadedFiles state when fileList prop changes", () => {
        const { rerender } = render(<FileUpload onUpload={vi.fn()} fileList={[uploadedFile1]} />);
        expect(screen.getByText("file1.txt")).toBeInTheDocument();

        rerender(<FileUpload onUpload={vi.fn()} fileList={[uploadedFile1, uploadedFile2]} />);
        expect(screen.getByText("file2.txt")).toBeInTheDocument();
    });

    it("does nothing if no files selected on input change", () => {
        const onUpload = vi.fn();
        render(<FileUpload onUpload={onUpload} />);
        const input = screen.getByTestId("file-input") as HTMLInputElement;

        fireEvent.change(input, { target: { files: null } });

        expect(onUpload).not.toHaveBeenCalled();
    });
});

