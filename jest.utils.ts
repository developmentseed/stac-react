export function makeMockResponse(responseData: string, url: string, init?: ResponseInit): Response {
  const response = new Response(responseData, init);
  Object.defineProperty(response, 'url', { value: url });
  return response;
}
