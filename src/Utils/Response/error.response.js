export const errorResponse = ({message="Error",status=400,extra= undefined})=>{

  const error = new Error(
    typeof message === "string" ? message :message?.message
  )
  
  error.status = status
  error.extra = extra
   
  throw error
}

export const badRequest = ({message="Bad Request",extra})=>{
  return errorResponse({message,status:400,extra})
  
}
export const conflictException = ({message="Conflict Exception",extra})=>{
  return errorResponse({message,status:409,extra})
  
}
export const notFound = ({message="Not Found",extra})=>{
  return errorResponse({message,status:404,extra})
  
}
export const unauthorized = ({message="Unauthorized",extra})=>{
  return errorResponse({message,status:401,extra})
  
}
export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const extra = err.extra || undefined;
  const message = err.message || "Internal Server Error";
  const stack = err.stack || undefined;
    return res.status(statusCode).json({message, extra, stack});
  }