"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Editor, EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";

import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";
import DOMPurify from "dompurify";

import { MAX_FILE_LIMIT, MAX_FILE_SIZE } from "@/constants";

import "@/components/tiptap-templates/simple/simple-editor.scss";
import { toast } from "sonner";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node";
import { Input } from "@/components/ui/input";
import { ConvexError } from "convex/values";
import useBlogEditorForm from "./hooks/useBlogEditorForm";
import { Field } from "@/components/ui/field";
import { GeneralFieldInfo } from "@/components/common/fieldInfo";
import { Toolbar } from "@/components/tiptap-ui-primitive/toolbar";
import { MainToolbar } from "./MainToolbar";
import { MobileToolbar } from "./MobileToolbar";
import { Button } from "@/components/ui/button";
import { BanIcon, Loader2 } from "lucide-react";
import { createBlogAction, removeBlogImageAction } from "@/app/api/posts/post";
import CustomDropZone from "@/components/web/CustomDropZone";
import { useUploadImg } from "./hooks/useUploadImg";
import { Id } from "@/convex/_generated/dataModel";
import { ImageResize } from "tiptap-extension-resize-image";
import { useRouter } from "next/navigation";

export function BlogEditor() {
  const editorRef = useRef<Editor | null>(null);
  const router = useRouter();
  const { uploadedImages, startUploading } = useUploadImg();
  const [tempUrls] = useState<{ tempUrl: string; newUrl: string }[]>([]);
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();

  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main",
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [toolbarHeight, setToolbarHeight] = useState(0);

  // observe changing in toolbar length
  useLayoutEffect(() => {
    if (!toolbarRef.current) return;
    const update = () => {
      setToolbarHeight(toolbarRef.current!.getBoundingClientRect().height);
    };
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(toolbarRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const currentMobileView = isMobile ? mobileView : "main";

  const { form } = useBlogEditorForm(onSubmit);

  async function onSubmit(title: string, thumbnail?: File) {
    const html = editorRef.current?.getHTML();

    if (!html) {
      toast.error("Your blog cannot be empty");
      return;
    }

    const sanitizedHTML = DOMPurify.sanitize(html);
    if (uploadedImages.size > 0) {
      await Promise.all(
        uploadedImages.values().map((v) => updateImgNode(v.tempUrl, v.url)),
      );
    }

    for (const [, img] of uploadedImages) {
      if (!html.includes(img.url)) {
        removeBlogImageAction(img.storageId as Id<"_storage">);
      }
      URL.revokeObjectURL(img.tempUrl);
    }

    form.setFieldValue("body", sanitizedHTML);

    try {
      await createBlogAction({
        title: title,
        body: html,
        thumbnail: thumbnail,
      });
      toast.success("Successfully created new post");
      router.replace("/");
    } catch (error) {
      if (error instanceof ConvexError || error instanceof Error) {
        toast.error("Couldn't upload your blog");
      }
    }
  }

  const updateImgNode = (tempUrl: string, uploadUrl: string) => {
    editorRef.current?.view.state.doc.descendants((node, pos) => {
      if (node.type.name === "image" && node.attrs.src === tempUrl) {
        editorRef.current?.commands.command(({ tr }) => {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            src: uploadUrl,
          });
          return true;
        });
      }
    });
  };

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),

      ImageResize,
      Image.configure({
        inline: true,
        resize: {
          enabled: true,
          directions: ["top", "bottom", "left", "right"],
          minWidth: 50,
          minHeight: 50,
          alwaysPreserveAspectRatio: true,
        },
      }),

      Typography,
      Superscript,
      Subscript,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: MAX_FILE_LIMIT,

        upload: (file: File) => {
          return new Promise<string>(async (resolve) => {
            const tempUrl = URL.createObjectURL(file);
            resolve(tempUrl);

            toast.promise(
              async () => {
                try {
                  await startUploading(file, tempUrl);
                } catch (e) {
                  URL.revokeObjectURL(tempUrl);
                  throw e;
                }
              },
              {
                success: `${file.name} uploaded!`,
                error: (error) => error,
                loading: `uploading ${file.name}...`,
              },
            );
          });
        },

        // onError: (error) =>
        //   toast.error(`Upload Failed: ${error.message ?? "Please Try  Again"}`),
      }),
    ],
    content: "<h1>Start Your Blog Here</h1>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (tempUrls.length > 0) {
        tempUrls.map((urls) => updateImgNode(urls.tempUrl, urls.newUrl));
      }
      form.setFieldValue("body", html);
    },
  });

  const rect = useCursorVisibility({
    editor: editor,
    overlayHeight: toolbarHeight ?? 0,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  return (
    <form className="relative space-y-3 py-5 md:py-10">
      <form.Subscribe
        selector={(state) => [
          state.canSubmit,
          state.isSubmitting,
          state.isDefaultValue,
          state.isPristine,
        ]}
      >
        {([canSubmit, isSubmitting, isDefaultValue, isPristine]) => (
          <Button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              await form.handleSubmit();
            }}
            disabled={!canSubmit || isDefaultValue || isPristine}
            className={`absolute right-0 w-25 ${(!canSubmit || isPristine) && "cursor-not-allowed"}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : !canSubmit || isPristine ? (
              <BanIcon className="animate-bounce" />
            ) : (
              "Submit"
            )}
          </Button>
        )}
      </form.Subscribe>

      <form.Field name="title">
        {(field) => (
          <Field>
            <Input
              id={field.name}
              aria-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
              name={field.name}
              placeholder="Post Title..."
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <GeneralFieldInfo field={field} />
          </Field>
        )}
      </form.Field>

      <form.Field name="thumbnail">
        {(field) => (
          <Field>
            <CustomDropZone field={field} />
            <GeneralFieldInfo field={field} />
          </Field>
        )}
      </form.Field>

      <br />
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {currentMobileView === "main" ? (
            <MainToolbar
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbar
              type={
                currentMobileView === "highlighter" ? "highlighter" : "link"
              }
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <form.Field name="body">
          {(field) => (
            <>
              <EditorContent
                editor={editor}
                role="presentation"
                className="simple-editor-content bg-card border rounded-md mt-2"
              />

              <GeneralFieldInfo field={field} />
            </>
          )}
        </form.Field>
      </EditorContext.Provider>
    </form>
  );
}
