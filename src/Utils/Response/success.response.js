const successResponse = (res,statusCode=200,message="Success",data={})=>{
  return res.status(statusCode).json({
    statusCode,
    message,
    data
  })
}

export default successResponse;