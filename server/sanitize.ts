export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    return input
      .trim()
      .replace(/<script.*?>.*?<\/script>/gi, "")
      .replace(/[<>]/g, "")
      .replace(/['";]/g, "")
      .replace(/--/g, "")
      .replace("=", "")
      ;
      
  } else if (typeof input === "object" && input !== null) {
    const sanitizedObj: any = {};
    for (const key in input) {
      sanitizedObj[key] = sanitizeInput(input[key]);
    }
    return sanitizedObj;
  } else {
    return input;
  }
}