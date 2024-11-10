import { useOAuth, useSignIn, useSignUp } from "@clerk/clerk-expo";
import Button from "@ui/button";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as React from "react";

const OauthSignUp: React.FC = () => {
  const { signIn } = useSignIn();
  const { signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  if (!signIn || !signUp) return null;

  async function handleSignIn() {
    if (!signIn || !signUp) return null;

    // If the user has an account in your application, but does not yet
    // have an OAuth account connected to it, you can transfer the OAuth
    // account to the existing user account.
    const userExistsButNeedsToSignIn =
      signUp.verifications.externalAccount.status === "transferable" &&
      signUp.verifications.externalAccount.error?.code ===
        "external_account_exists";

    if (userExistsButNeedsToSignIn) {
      const res = await signIn.create({ transfer: true });

      if (res.status === "complete") {
        setActive({
          session: res.createdSessionId,
        });
      }
    }

    // If the user has an OAuth account but does not yet
    // have an account in your app, you can create an account
    // for them using the OAuth information.
    const userNeedsToBeCreated =
      signIn.firstFactorVerification.status === "transferable";

    if (userNeedsToBeCreated) {
      const res = await signUp.create({
        transfer: true,
      });

      if (res.status === "complete") {
        setActive({
          session: res.createdSessionId,
        });
      }
    } else {
      // If the user has an account in your application
      // and has an OAuth account connected to it, you can sign them in.
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/tabs"),
      });
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // In our clerk app we require username in order to sign in, so we have to extract it from the email.
        const response = await signUp.update({
          username: signUp.emailAddress!.split("@")[0],
        });
        if (response.status === "complete") {
          await setActive!({ session: signUp.createdSessionId });
        }
      }
      router.replace("/");
    }
  }

  return <Button title="Kontynuuj z Google" onPress={handleSignIn} />;
};

export default OauthSignUp;
