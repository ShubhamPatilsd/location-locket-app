import express from "express";
import { SignJWT, importJWK } from "jose";

const router = express.Router();

/**
 * Get the JWT token that PowerSync will use to authenticate the user
 */
router.get("/token", async (req, res) => {
  try {
    if (!req.headers.authorization) return res.status(401);
    // Here, we assume the Authorization header format is: Bearer YOUR_TOKEN
    const userToken = req.headers.authorization.split(" ")[1];
    if (!userToken) return res.status(401);

    // TODO: Verify the token with Clerk
    // const decodedToken = await appAuth.verifyIdToken(userToken);

    // TODO: Get the user ID from the decoded token, send it to PowerSync
    //   if (decodedToken) {
    //     // If token is valid, decodedToken has all the user info
    //     const uid = decodedToken.uid;

    //     const decodedPrivateKey = new Buffer.from(config.powersync.privateKey, "base64");
    //     const powerSyncPrivateKey = JSON.parse(new TextDecoder().decode(decodedPrivateKey));
    //     const powerSyncKey = await importJWK(powerSyncPrivateKey);
    //     const token = await new SignJWT({})
    //       .setProtectedHeader({
    //         alg: powerSyncPrivateKey.alg,
    //         kid: powerSyncPrivateKey.kid,
    //       })
    //       .setSubject(uid)
    //       .setIssuedAt()
    //       .setIssuer(config.powersync.jwtIssuer)
    //       .setAudience(config.powersync.url)
    //       .setExpirationTime("5m")
    //       .sign(powerSyncKey);

    //     const responseBody = {
    //       token: token,
    //       powerSyncUrl: config.powersync.url,
    //       expiresAt: null,
    //       userId: uid,
    //     };

    //     return res.json(responseBody);
    //   } else {
    //     return res.status(401).send({ message: "Unable to verify Firebase idToken" });
    //   }
  } catch (err: any) {
    console.log("[ERROR] Unexpected error", err);
    res.status(500).send({ message: err.message });
  }
});

/**
 * This is the JWKS endpoint PowerSync uses to handle authentication
 */
router.get("/keys", (req, res) => {
  try {
    const decodedPublicKey = Buffer.from(process.env.POWERSYNC_PUBLIC_KEY as string, "base64");
    const powerSyncPublicKey = JSON.parse(new TextDecoder().decode(decodedPublicKey));
    return res.json({ keys: [powerSyncPublicKey] });
  } catch (err: any) {
    console.log("[ERROR] Unexpected error", err);
    return res.status(500).json({ message: err.message });
  }
});

export { router as authRouter };
