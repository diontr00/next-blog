"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BanIcon, Loader2, MessageSquare } from "lucide-react";
import useCommentForm from "./hook/useCommentForm";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GeneralFieldInfo } from "@/components/common/fieldInfo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Preloaded, useConvexAuth, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function CommentSection(props: {
  preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
  id: Id<"posts">;
}) {
  const { form } = useCommentForm(props.id);
  const data = usePreloadedQuery(props.preloadedComments);
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 border-b">
        <MessageSquare className="size-5" />
        <h2 className="text-xl font-bold">{data?.length || 0} Comments</h2>
      </CardHeader>

      <CardContent>
        {isAuthenticated ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field name="body">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Write Your Comment:
                  </FieldLabel>
                  <div className="flex flex-row gap-2 ">
                    <Input
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Wow that's so cool"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    <form.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                        state.isPristine,
                      ]}
                    >
                      {([canSubmit, isSubmitting, isPristine]) => (
                        <Button
                          type="submit"
                          // Disable if submitting OR if it's invalid/unmodified
                          disabled={isSubmitting || !canSubmit || isPristine}
                          className={`${(!canSubmit || isPristine) && "cursor-not-allowed"}`}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : !canSubmit || isPristine ? (
                            <BanIcon className="size-4" />
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      )}
                    </form.Subscribe>
                  </div>

                  <GeneralFieldInfo field={field} />
                </Field>
              )}
            </form.Field>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <p>Please login to comment</p>
            <button
              className={buttonVariants({ variant: "outline" })}
              onClick={() => {
                router.replace(`/auth/sign-in?rediect=/blog/${props.id}`);
              }}
            >
              Login
            </button>
          </div>
        )}

        {data === undefined ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            {data?.length > 0 && <Separator className="my-8" />}
            <section className="space-y-6">
              {data?.map((comment) => (
                <div key={comment._id} className="flex gap-4 items-center">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${comment.authorName}`}
                      alt={comment.authorName}
                    />
                    <AvatarFallback>
                      {comment.authorName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <div className="flex-1 space-y-1 flex items-center justify-between">
                      <p className="font-semibold text-sm">
                        {comment.authorName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(comment._creationTime).toLocaleString(
                          "en-US",
                        )}
                      </p>
                    </div>
                    <p>{comment.body}</p>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
