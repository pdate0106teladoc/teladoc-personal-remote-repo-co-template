import { describe, it, expect, beforeEach, vi } from "vitest";
import { sanitizeHtml } from "../sanitize";
import DOMPurify from "dompurify";

// Mock DOMPurify
vi.mock("dompurify", () => ({
  default: {
    sanitize: vi.fn((dirty: string) => dirty),
  },
}));

describe("sanitizeHtml", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== Basic Functionality Tests ====================
  describe("Basic Functionality", () => {
    it("should return empty string when input is empty", () => {
      const result = sanitizeHtml("");
      expect(result).toBe("");
    });

    it("should return empty string when input is null", () => {
      const result = sanitizeHtml(null as any);
      expect(result).toBe("");
    });

    it("should return empty string when input is undefined", () => {
      const result = sanitizeHtml(undefined as any);
      expect(result).toBe("");
    });

    it("should call DOMPurify.sanitize with correct config", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      sanitizeHtml("<p>Test</p>");
      
      expect(mockSanitize).toHaveBeenCalledWith(
        "<p>Test</p>",
        expect.objectContaining({
          ALLOWED_TAGS: expect.arrayContaining(["p", "b", "i", "strong"]),
          ALLOWED_ATTR: expect.arrayContaining(["href", "title", "target"]),
          FORBID_TAGS: expect.arrayContaining(["style", "script", "iframe"]),
        })
      );
    });

    it("should pass through plain text", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("Plain text");
      
      const result = sanitizeHtml("Plain text");
      expect(result).toBe("Plain text");
    });
  });

  // ==================== Allowed Tags Tests ====================
  describe("Allowed Tags", () => {
    it("should allow basic formatting tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<b>bold</b> <i>italic</i> <u>underline</u>");
      
      const result = sanitizeHtml("<b>bold</b> <i>italic</i> <u>underline</u>");
      expect(result).toBe("<b>bold</b> <i>italic</i> <u>underline</u>");
    });

    it("should allow paragraph tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<p>paragraph</p>");
      
      const result = sanitizeHtml("<p>paragraph</p>");
      expect(result).toBe("<p>paragraph</p>");
    });

    it("should allow list tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<ul><li>item</li></ul>");
      
      const result = sanitizeHtml("<ul><li>item</li></ul>");
      expect(result).toBe("<ul><li>item</li></ul>");
    });

    it("should allow div and span tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<div><span>text</span></div>");
      
      const result = sanitizeHtml("<div><span>text</span></div>");
      expect(result).toBe("<div><span>text</span></div>");
    });

    it("should allow anchor tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com">link</a>');
      expect(result).toContain('<a');
      expect(result).toContain('href="http://example.com"');
    });
  });

  // ==================== Anchor Tag Security Tests ====================
  describe("Anchor Tag Security", () => {
    it("should add rel='noopener noreferrer' to anchor tags without rel attribute", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com">link</a>');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it("should add noopener and noreferrer to existing rel attribute", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com" rel="external">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com" rel="external">link</a>');
      expect(result).toContain('rel="external noopener noreferrer"');
    });

    it("should not duplicate noopener if already present", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com" rel="noopener">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com" rel="noopener">link</a>');
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result.match(/noopener/g)?.length).toBe(1);
    });

    it("should not duplicate noreferrer if already present", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com" rel="noreferrer">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com" rel="noreferrer">link</a>');
      expect(result).toContain('rel="noreferrer noopener"');
      expect(result.match(/noreferrer/g)?.length).toBe(1);
    });

    it("should not duplicate if both noopener and noreferrer already present", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com" rel="noopener noreferrer">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com" rel="noopener noreferrer">link</a>');
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result.match(/noopener/g)?.length).toBe(1);
      expect(result.match(/noreferrer/g)?.length).toBe(1);
    });

    it("should handle multiple anchor tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com">link1</a> <a href="http://example2.com">link2</a>');
      
      const result = sanitizeHtml('<a href="http://example.com">link1</a> <a href="http://example2.com">link2</a>');
      const relMatches = result.match(/rel="[^"]*"/g);
      expect(relMatches?.length).toBe(2);
      relMatches?.forEach(rel => {
        expect(rel).toContain("noopener");
        expect(rel).toContain("noreferrer");
      });
    });

    it("should handle anchor tags with multiple attributes", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com" title="Example" target="_blank">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com" title="Example" target="_blank">link</a>');
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('href="http://example.com"');
      expect(result).toContain('title="Example"');
      expect(result).toContain('target="_blank"');
    });

    it("should handle anchor tags with class attribute", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com" class="link-class">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com" class="link-class">link</a>');
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('class="link-class"');
    });

    it("should handle case-insensitive anchor tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<A HREF="http://example.com">link</A>');
      
      const result = sanitizeHtml('<A HREF="http://example.com">link</A>');
      expect(result.toLowerCase()).toContain('rel="noopener noreferrer"');
    });

    it("should handle case-insensitive rel attribute", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com" REL="external">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com" REL="external">link</a>');
      expect(result.toLowerCase()).toContain("noopener");
      expect(result.toLowerCase()).toContain("noreferrer");
    });
  });

  // ==================== Custom Config Tests ====================
  describe("Custom Config", () => {
    it("should merge custom config with base config", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      const customConfig = { ALLOWED_TAGS: ["p", "span"] };
      
      sanitizeHtml("<p>test</p>", customConfig);
      
      expect(mockSanitize).toHaveBeenCalledWith(
        "<p>test</p>",
        expect.objectContaining({
          ALLOWED_TAGS: ["p", "span"],
          ALLOWED_ATTR: expect.arrayContaining(["href", "title"]),
          FORBID_TAGS: expect.arrayContaining(["style", "script"]),
        })
      );
    });

    it("should override base config with custom config", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      const customConfig = { FORBID_TAGS: ["div"] };
      
      sanitizeHtml("<div>test</div>", customConfig);
      
      expect(mockSanitize).toHaveBeenCalledWith(
        "<div>test</div>",
        expect.objectContaining({
          FORBID_TAGS: ["div"],
        })
      );
    });

    it("should allow empty custom config", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<p>test</p>");
      
      const result = sanitizeHtml("<p>test</p>", {});
      expect(result).toBe("<p>test</p>");
    });
  });

  // ==================== Forbidden Tags Tests ====================
  describe("Forbidden Tags", () => {
    it("should forbid script tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      
      sanitizeHtml("<script>alert('xss')</script>");
      
      expect(mockSanitize).toHaveBeenCalledWith(
        "<script>alert('xss')</script>",
        expect.objectContaining({
          FORBID_TAGS: expect.arrayContaining(["script"]),
        })
      );
    });

    it("should forbid style tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      
      sanitizeHtml("<style>body{display:none}</style>");
      
      expect(mockSanitize).toHaveBeenCalledWith(
        "<style>body{display:none}</style>",
        expect.objectContaining({
          FORBID_TAGS: expect.arrayContaining(["style"]),
        })
      );
    });

    it("should forbid iframe tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      
      sanitizeHtml('<iframe src="http://malicious.com"></iframe>');
      
      expect(mockSanitize).toHaveBeenCalledWith(
        '<iframe src="http://malicious.com"></iframe>',
        expect.objectContaining({
          FORBID_TAGS: expect.arrayContaining(["iframe"]),
        })
      );
    });

    it("should forbid object tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      
      sanitizeHtml('<object data="malicious.swf"></object>');
      
      expect(mockSanitize).toHaveBeenCalledWith(
        '<object data="malicious.swf"></object>',
        expect.objectContaining({
          FORBID_TAGS: expect.arrayContaining(["object"]),
        })
      );
    });

    it("should forbid embed tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      
      sanitizeHtml('<embed src="malicious.swf">');
      
      expect(mockSanitize).toHaveBeenCalledWith(
        '<embed src="malicious.swf">',
        expect.objectContaining({
          FORBID_TAGS: expect.arrayContaining(["embed"]),
        })
      );
    });
  });

  // ==================== Complex HTML Tests ====================
  describe("Complex HTML", () => {
    it("should handle nested tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<div><p><b>bold</b> <i>italic</i></p></div>");
      
      const result = sanitizeHtml("<div><p><b>bold</b> <i>italic</i></p></div>");
      expect(result).toBe("<div><p><b>bold</b> <i>italic</i></p></div>");
    });

    it("should handle mixed content", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<p>Text with <a href="http://example.com">link</a> and <b>bold</b></p>');
      
      const result = sanitizeHtml('<p>Text with <a href="http://example.com">link</a> and <b>bold</b></p>');
      expect(result).toContain("<p>");
      expect(result).toContain('<a');
      expect(result).toContain("<b>");
    });

    it("should handle multiple paragraphs", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<p>First</p><p>Second</p><p>Third</p>");
      
      const result = sanitizeHtml("<p>First</p><p>Second</p><p>Third</p>");
      expect(result).toBe("<p>First</p><p>Second</p><p>Third</p>");
    });

    it("should handle lists", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<ul><li>Item 1</li><li>Item 2</li></ul>");
      
      const result = sanitizeHtml("<ul><li>Item 1</li><li>Item 2</li></ul>");
      expect(result).toBe("<ul><li>Item 1</li><li>Item 2</li></ul>");
    });

    it("should handle ordered lists", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<ol><li>First</li><li>Second</li></ol>");
      
      const result = sanitizeHtml("<ol><li>First</li><li>Second</li></ol>");
      expect(result).toBe("<ol><li>First</li><li>Second</li></ol>");
    });
  });

  // ==================== Edge Cases Tests ====================
  describe("Edge Cases", () => {
    it("should handle HTML with line breaks", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("Line 1<br>Line 2<br>Line 3");
      
      const result = sanitizeHtml("Line 1<br>Line 2<br>Line 3");
      expect(result).toBe("Line 1<br>Line 2<br>Line 3");
    });

    it("should handle HTML with special characters", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<p>&lt;script&gt;alert('xss')&lt;/script&gt;</p>");
      
      const result = sanitizeHtml("<p>&lt;script&gt;alert('xss')&lt;/script&gt;</p>");
      expect(result).toBe("<p>&lt;script&gt;alert('xss')&lt;/script&gt;</p>");
    });

    it("should handle empty anchor tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com"></a>');
      
      const result = sanitizeHtml('<a href="http://example.com"></a>');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it("should handle anchor tags with newlines in attributes", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com">link</a>');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it("should handle whitespace in HTML", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("  <p>  text  </p>  ");
      
      const result = sanitizeHtml("  <p>  text  </p>  ");
      expect(result).toBe("  <p>  text  </p>  ");
    });

    it("should handle very long HTML strings", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      const longHtml = "<p>" + "a".repeat(10000) + "</p>";
      mockSanitize.mockReturnValue(longHtml);
      
      const result = sanitizeHtml(longHtml);
      expect(result).toBe(longHtml);
    });

    it("should handle HTML with unicode characters", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<p>Hello 世界 🌍</p>");
      
      const result = sanitizeHtml("<p>Hello 世界 🌍</p>");
      expect(result).toBe("<p>Hello 世界 🌍</p>");
    });

    it("should handle malformed HTML", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue("<p>Unclosed paragraph");
      
      const result = sanitizeHtml("<p>Unclosed paragraph");
      expect(result).toBe("<p>Unclosed paragraph");
    });

    it("should handle anchor with rel containing multiple spaces", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      mockSanitize.mockReturnValue('<a href="http://example.com" rel="external  sponsored">link</a>');
      
      const result = sanitizeHtml('<a href="http://example.com" rel="external  sponsored">link</a>');
      expect(result).toContain("noopener");
      expect(result).toContain("noreferrer");
    });
  });

  // ==================== Default Export Tests ====================
  describe("Default Export", () => {
    it("should export sanitizeHtml as default", async () => {
      const module = await import("../sanitize");
      expect(module.default).toBe(sanitizeHtml);
    });
  });

  // ==================== Integration-like Tests ====================
  describe("Integration-like Tests", () => {
    it("should handle real-world blog post HTML", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      const blogPost = `
        <h1>Blog Title</h1>
        <p>This is a <b>blog post</b> with a <a href="http://example.com">link</a>.</p>
        <ul>
          <li>Point 1</li>
          <li>Point 2</li>
        </ul>
      `;
      mockSanitize.mockReturnValue(blogPost.replace("<h1>Blog Title</h1>", "")); // h1 not in allowed tags
      
      const result = sanitizeHtml(blogPost);
      expect(result).toContain("<p>");
      expect(result).toContain("<ul>");
      expect(result).not.toContain("<h1>"); // h1 should be removed by DOMPurify
    });

    it("should handle comment HTML with potential XSS", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      const comment = '<p>Nice article! <script>alert("xss")</script></p>';
      mockSanitize.mockReturnValue('<p>Nice article! </p>'); // script removed
      
      const result = sanitizeHtml(comment);
      expect(result).not.toContain("<script>");
      expect(result).toContain("<p>");
    });

    it("should handle email template HTML", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      const email = `
        <div>
          <p>Dear User,</p>
          <p>Please click <a href="http://example.com/verify">here</a> to verify.</p>
          <p>Thanks!</p>
        </div>
      `;
      mockSanitize.mockReturnValue(email);
      
      const result = sanitizeHtml(email);
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain("<div>");
      expect(result).toContain("<p>");
    });
  });

  // ==================== Allowed Attributes Tests ====================
  describe("Allowed Attributes", () => {
    it("should allow href attribute on anchor tags", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      
      sanitizeHtml('<a href="http://example.com">link</a>');
      
      expect(mockSanitize).toHaveBeenCalledWith(
        '<a href="http://example.com">link</a>',
        expect.objectContaining({
          ALLOWED_ATTR: expect.arrayContaining(["href"]),
        })
      );
    });

    it("should allow title attribute", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      
      sanitizeHtml('<span title="tooltip">text</span>');
      
      expect(mockSanitize).toHaveBeenCalledWith(
        '<span title="tooltip">text</span>',
        expect.objectContaining({
          ALLOWED_ATTR: expect.arrayContaining(["title"]),
        })
      );
    });

    it("should allow target attribute", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      
      sanitizeHtml('<a href="http://example.com" target="_blank">link</a>');
      
      expect(mockSanitize).toHaveBeenCalledWith(
        '<a href="http://example.com" target="_blank">link</a>',
        expect.objectContaining({
          ALLOWED_ATTR: expect.arrayContaining(["target"]),
        })
      );
    });

    it("should allow class attribute", () => {
      const mockSanitize = vi.mocked(DOMPurify.sanitize);
      
      sanitizeHtml('<div class="container">content</div>');
      
      expect(mockSanitize).toHaveBeenCalledWith(
        '<div class="container">content</div>',
        expect.objectContaining({
          ALLOWED_ATTR: expect.arrayContaining(["class"]),
        })
      );
    });
  });
});
