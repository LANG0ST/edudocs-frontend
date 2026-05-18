"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"

export function LoginForm({
  className,
  hideHeader = false,
  ...props
}: React.ComponentProps<"div"> & { hideHeader?: boolean }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/post-login`,
      })
    } catch (error) {
      console.error("Google sign-in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>

        {!hideHeader && (
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold text-[#1B2B4B]">EduDocs</h1>
            <FieldDescription>
              Plateforme de certification des documents universitaires
            </FieldDescription>
          </div>
        )}

        <Field>
          <Button
            aria-label="login-google"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="h-16 w-full rounded-2xl bg-[#132447] hover:bg-[#1B2B4B] text-lg font-semibold flex items-center justify-center gap-4 relative"
          >
            {isLoading ? (
              "Connexion en cours..."
            ) : (
              <>
                <div className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-12 w-12 scale-150"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-4 5.5-7.5 6.5l6.2 5.2C39.6 36.1 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z"
                    />
                  </svg>
                </div>

                <span>Continuer avec Google</span>
              </>
            )}
          </Button>
        </Field>
      </FieldGroup>

    </div>
  )
}
