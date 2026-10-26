import connectDB from "./DB/connection.js";
import { AuthRouter, MessageRouter, UserRouter } from "./Modules/index.js";
import { badRequest, globalErrorHandler } from "./Utils/Response/error.response.js";
import successResponse from "./Utils/Response/success.response.js";
import cors from "cors"
const bootStrap = async (app, express) => {

  
  app.use(express.json(),cors());
  await connectDB();

  app.get("/",(req,res)=>{
    return successResponse(res,200,"Hello From Saraha Application");
  })
  app.use("/api/v1/users", UserRouter);
  app.use("/api/v1/messages", MessageRouter);
  app.use("/api/v1/auth", AuthRouter);

  app.all("/*dummy", (req, res) => {
    throw badRequest({ message: "Route Not Found"}) 
  });

  app.use(globalErrorHandler);
};


export default bootStrap;
