// export const createContextInner = async ({ auth }: AuthContextProps) => {
//   return { auth, prisma };
// };

// const parseJwt = (req: CreateExpressContextOptions["req"]) => {
//   const headerToken = req.headers.authorization?.replace("Bearer ", "");
//   return decodeJwt(headerToken || "");
// };

// export const createContext = ({ req }: CreateExpressContextOptions) => {
//   const options = {
//     secretKey: process.env.SECRET_KEY,
//     apiUrl: "https://api.clerk.com",
//     apiVersion: "v1",
//     authStatus: req.headers["authStatus"],
//     authMessage: req.headers["authMessage"],
//     authReason: req.headers["authReason"],
//   };

//   let auth: SignedInAuthObject | SignedOutAuthObject;

//   try {
//     const jwt = parseJwt(req);
//     auth = signedInAuthObject(jwt.payload, { ...options, token: jwt.raw.text });
//   } catch (error) {
//     auth = signedOutAuthObject(options);
//   }

//   return createContextInner({ auth });
// };
